import dotenv from 'dotenv';
import { BUSAN_SPOT_INSIGHTS, getInsight } from './busanData.js';
import { getActiveFestivals, getDistrictFromLocation } from './festivalUtils.js';
import { fetchWeather } from './weatherUtils.js';

// Ensure local dev loads .env.local (Vercel dev should also inject env)
dotenv.config({ path: '.env.local' });

const days = ['일', '월', '화', '수', '목', '금', '토'];

const getRealTimeContext = async (location) => {
  const now = new Date();
  const hour = now.getHours();
  const day = days[now.getDay()];

  let timeDesc = '낮';
  if (hour >= 6 && hour < 11) timeDesc = '상쾌한 아침';
  else if (hour >= 11 && hour < 14) timeDesc = '점심 시간';
  else if (hour >= 14 && hour < 17) timeDesc = '나른한 오후';
  else if (hour >= 17 && hour < 20) timeDesc = '퇴근길 저녁';
  else if (hour >= 20 || hour < 6) timeDesc = '감성 돋는 밤';

  // Special cases
  if (day === '금' && hour >= 18) timeDesc = '불금 저녁';
  if (day === '토' || day === '일') timeDesc = `여유로운 ${day}요일 ${timeDesc}`;

  const weather = await fetchWeather(location);
  return `${day}요일 ${timeDesc}, ${weather}`;
};

const parseJsonSafe = (text) => {
  if (!text) return null;
  try {
    const trimmed = text.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const target = fenced ? fenced[1] : trimmed;
    return JSON.parse(target);
  } catch (error) {
    console.warn('JSON parse failed', error);
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { storeName, description, location, imageBase64, includeTrends } = req.body;

    // 1. Centralized Location Resolution
    // Convert user input (e.g. "Centum") to District (e.g. "Haeundae-gu")
    const mappedDistrict = getDistrictFromLocation(location);
    const targetLocation = mappedDistrict || location; // Use mapped district if available, else raw input

    // 2. Insight Lookup
    // Try to get insight for the target location (District) first
    let insightData = getInsight(targetLocation);

    // If mapped district didn't return insight (rare if map is good), try raw input just in case
    if (!insightData.exists && mappedDistrict && targetLocation !== location) {
      insightData = getInsight(location);
    }

    const { insight, exists, key } = insightData;
    const mode = exists ? 'EXPERT' : 'GENERAL';
    const useTrends = includeTrends !== false;

    // 3. Real-time Context (Weather)
    // Pass the resolved targetLocation to ensure weather is fetched for the correct district
    const contextLine = useTrends ? await getRealTimeContext(targetLocation) : null;

    // 4. Festival Integration
    // Pass the resolved targetLocation
    const activeFestivals = getActiveFestivals(targetLocation);
    const festivalContext = activeFestivals.length > 0
      ? activeFestivals.map(f => `- [축제] ${f.name} (${f.period}): ${f.place}`).join('\n')
      : null;

    if (!process.env.UPSTAGE_API_KEY) {
      res.status(500).json({ error: 'UPSTAGE_API_KEY is not set' });
      return;
    }

    const systemPrompt = `
너는 부산/경남 골목상권 마케팅 전문가야. 입력된 가게 정보와 지역 인사이트를 바탕으로 글을 써.

[🚨 중요: 거짓 정보 작성 금지]
- **절대 입력된 정보에 없는 사실을 지어내지 마.**
- 특히 **주차장 유무, 가게 크기(넓다/좁다), 구체적인 영업시간** 등은 사용자가 입력하지 않았다면 언급하지 마.
- 오직 입력된 메뉴, 분위기, 그리고 아래의 지역 인사이트만 활용해.

[지역 인사이트]
- 지역: ${exists ? key : location || '미정'}
- 타겟: ${insight.targetName}
- 페르소나: ${insight.persona}
- 톤앤매너: ${insight.tone || '친근한 동네 사장님 톤'}
- 마케팅 포인트: ${insight.marketingPoint}
- 추천 해시태그 예시: ${insight.hashTags.join(', ')}

${festivalContext ? `
[현재 진행중/예정된 지역 축제]
${festivalContext}
- 위 축제가 열리고 있다면, 축제를 즐기러 온 손님들을 타겟팅하는 문구를 자연스럽게 포함해.
- 축제 관련 해시태그도 1~2개 추가해.
` : ''}

[채널별 작성 규칙을 반드시 준수]
1) 인스타그램 피드(feed)
 - 전략: 감성 & 정보, 사진과 어울리는 긴 호흡
 - 지시: 시선을 끄는 감성적 첫 문장, 메뉴/분위기 시각 묘사, 이모지 풍부
 - 주의: 가게 크기나 인테리어 디테일은 입력된 내용이 없으면 "아늑한 분위기" 정도로만 표현해.
 - 해시태그: 지역/메뉴/분위기 태그 10개 이상 필수
 2) 인스타그램 스토리(story)
 - 전략: 임팩트 & 유도, 3초 가독성
 - 지시: 2문장 이내, "오늘만/지금 바로" 같은 CTA 포함, 스티커용 짧은 문구
 3) 지도 리뷰 답글/소식(map)
 - 전략: 신뢰 & 정보
 - 지시: 정중한 말투(~습니다).
 - 주의: **주차/영업시간/길 안내는 입력된 정보에 있을 때만 언급해.** 정보가 없다면 맛과 정성에 대해서만 이야기해.
 4) 문자/알림톡(sms)
 - 전략: 친근 & 혜택, 스팸 느낌 금지
 - 지시: 날씨/계절 안부로 시작, 혜택 명확히, "(광고)" 느낌 제거

${useTrends ? `
[오늘 우리 동네 날씨/이슈 반영]
- 지금은 ${contextLine}.
- feed와 sms는 이 날씨/요일 정보를 반드시 포함해 작성.
- "비 오는 날엔 파전", "불금엔 치킨"처럼 상황 맞춤 멘트를 섞어라.
` : ''}

[출력만 순수 JSON으로 반환, 마크다운 금지]
{
  "feed": "내용...",
  "story": "내용...",
  "map": "내용...",
  "sms": "내용..."
}
`.trim();

    const imageNote = imageBase64 ? '\n(이미지 업로드됨: solar-pro가 이미지를 직접 읽을 수 없어 텍스트 설명만 참고)' : '';
    const userContent = [
      {
        type: 'text',
        text: `가게명: ${storeName || '미정'}\n위치: ${location || '미정'}\n메뉴/이벤트: ${description || '메뉴 소개 미입력'}\n트렌드 반영: ${useTrends ? '예' : '아니오'}${imageNote}`
      }
    ];

    const response = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.65
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Solar API error', data.error || data);
      res.status(500).json({ error: 'AI 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' });
      return;
    }

    const rawContent = (data?.choices?.[0]?.message?.content ?? '').trim();
    const parsed = parseJsonSafe(rawContent);

    const fallbackResults = {
      feed: rawContent || '생성된 문구가 없습니다.',
      story: rawContent || '생성된 문구가 없습니다.',
      map: rawContent || '생성된 문구가 없습니다.',
      sms: rawContent || '생성된 문구가 없습니다.'
    };

    const channelTexts = parsed || fallbackResults;

    res.status(200).json({
      mode,
      contextSummary: useTrends
        ? `트렌드 반영: ${contextLine}`
        : `지역 모드: ${mode === 'EXPERT' ? `${key} 인사이트 적용` : '동네 추론 모드'}`,
      feed: channelTexts.feed,
      story: channelTexts.story,
      map: channelTexts.map,
      sms: channelTexts.sms,
      results: {
        instagram_feed: { text: channelTexts.feed, hashtags: BUSAN_SPOT_INSIGHTS[key]?.hashTags || [] },
        instagram_story: { text: channelTexts.story },
        map_review: { text: channelTexts.map },
        sms: { text: channelTexts.sms }
      }
    });
  } catch (error) {
    console.error('generate api error', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
}
