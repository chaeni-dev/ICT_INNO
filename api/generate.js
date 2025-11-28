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
    const { storeName, description, location, address, businessHours, category, customCategory, includeTrends } = req.body;

    // 위치 입력이 없어도 주소 기반으로 처리
    const baseLocation = location || address || '';

    // 1. District Extraction (Prioritize Address)
    // If address is available, try to extract district from it first.
    // Fallback to location if address doesn't yield a district.
    let mappedDistrict = getDistrictFromLocation(address);
    if (!mappedDistrict) {
      mappedDistrict = getDistrictFromLocation(location);
    }

    const targetLocation = mappedDistrict || baseLocation;

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
    const activeFestival = activeFestivals.length > 0 ? activeFestivals[0] : null;
    const festivalMode = !!activeFestival;

    if (!process.env.UPSTAGE_API_KEY) {
      res.status(500).json({ error: 'UPSTAGE_API_KEY is not set' });
      return;
    }

    const systemPrompt = `
[역할]
당신은 부산 최고의 핫플 소개 계정을 운영하는 전문 에디터 '단디'입니다.
광고 느낌이 나는 뻔한 멘트는 절대 쓰지 않습니다.
소비자가 "어? 여기 어디지?" 하고 멈추게 만드는 **후킹(Hooking)**과 **정보성(Info)**에 집중합니다.
**주의: 결과물에 절대 "단디입니다", "에디터 단디" 같은 자기소개를 포함하지 마세요. 당신의 이름은 내부 설정일 뿐입니다.**

[🚨 중요: 거짓 정보 작성 금지 (Fact-Check)]
- **입력되지 않은 사실 날조 금지**: 입력 데이터에 없는 내용(웨이팅 여부, 라스트 오더 시간, 주차 정보, '킹왕짱' 같은 과한 수식어)은 절대 덧붙이지 마세요. 모르는 정보는 아예 언급하지 마세요.
- **제공된 키워드만 확장**: 사용자가 '땅콩크림 라떼'라고 했으면 그 맛을 묘사하는 건 좋지만, '줄 서서 먹는다'는 상황을 가정하지 마세요.
- **분위기/인테리어 날조 금지**: 입력값에 '빈티지', '모던' 등의 단어가 없다면 절대 "빈티지한 감성", "모던한 디테일" 같은 표현을 쓰지 마세요. 그냥 "아늑한 분위기" 정도로만 표현하세요.

[주소/위치 표기 규칙 (Layout)]
- **본문(Body)에는 전체 주소 금지**: 글 중간에 "북구 낙동대로 1750에 있는~" 처럼 도로명 주소를 통째로 넣지 마세요. 부자연스럽습니다.
- **자연스러운 위치 언급**: "부산 북구 덕천동에서" 처럼 행정구역을 나열하지 말고, "덕천동 골목에", "구포역 근처에" 처럼 자연스럽게 말하세요.
- **상세 주소는 Footer에만**: 정확한 도로명 주소는 반드시 글 맨 마지막 **[Info Box]**에만 넣으세요.

[출력 형식: JSON Only]
{
  "results": {
    "instagram_feed": {"text": "...", "hashtags": ["..."]},
    "instagram_story": {"text": "..."},
    "map_review": {"text": "..."},
    "sms": {"text": "..."}
  }
}

[채널별 작성 가이드 - 인스타 핫플 공식 적용]

1. 📸 인스타그램 피드 (엄격 준수)
   **[Step 1: Hook - 첫 줄로 사로잡기]**
   - "안녕하세요" 같은 인사 금지.
   - 질문, 부정문, 숫자를 활용해 궁금증을 유발할 것.
   - 예: "아직도 여기 안 가보셨나요?", "사장님이 미쳤어요, 고기 두께 실화?", "부산 토박이만 아는 비밀 맛집 3대장"
   
   **[Step 2: Body - 감각적 묘사 + 꿀팁]**
   - 줄글 금지. 문단 사이 공백 필수.
   - 맛이나 분위기를 생생하게 묘사 (TMI 방출).
   - ✨, 📍, 🚨, 💡 같은 이모지를 글머리 기호로 사용해 가독성 높이기.
   - ${festivalMode ? `🚨 지금 '${activeFestival.name}' 기간이라 웨이팅 있을 수 있음! 오픈런 추천!` : ''}

   **[Step 3: Footer - 정보 박스 (핵심)]**
   - 본문 맨 마지막에 아래 양식 그대로 정보를 깔끔하게 정리.
     ━━━━━━━━━━━━━━━
     📍 ${storeName || '업체명'}
     🏡 ${address || targetLocation}
     💡 ${description ? description.substring(0, 15) : '부산 핫플'}...
     📞 예약/문의 환영
     ━━━━━━━━━━━━━━━

2. 📱 인스타그램 스토리
   - 3줄 이내. 배경 사진을 가리지 않는 짧고 강렬한 문구.
   - 예: "오늘 ${festivalMode ? '축제 보고' : '퇴근하고'} 여기 어때요? 🍺"

3. 🗺️ 지도/플레이스 업체 소개 (네이버 스마트플레이스 등)
   - **목적**: 가게를 검색한 손님에게 보여주는 **'공식 업체 소개글'**.
   - **화자**: 사장님 또는 가게를 대표하는 관리자. (손님인 척하는 후기 말투 절대 금지)
   - **내용**: 우리 가게만의 철학, 대표 메뉴의 차별점, 재료에 대한 자부심, 매장 분위기 등을 진정성 있게 전달.
   - **톤앤매너**: 정중하고 신뢰감 있는 '해요체' 또는 '습니다체'. 방문을 환영하는 따뜻한 어조.
   - **예시**: "매일 아침 직접 공수해온 신선한 재료로 정성을 다해 요리합니다. 아늑한 분위기 속에서 소중한 사람들과 특별한 추억을 만들어보세요."

4. 📩 문자 (SMS)
   - 스팸처럼 보이지 않게 단골 손님에게 보내는 안부 문자처럼.
   - 핵심 혜택(이벤트)은 앞부분에 두괄식으로 배치.

[톤앤매너]
- 부산 사투리: 과하지 않게, 친근한 '동네 형/누나' 느낌 (~예, ~입니데이).
- 이모지: 적재적소에 배치하여 시각적 즐거움 제공.
`.trim();

    const userContent = [
      {
        type: 'text',
        text: `가게명: ${storeName || '미정'}\n위치: ${targetLocation || '미정'}\n주소: ${address || '주소 미입력'}\n업종: ${category === '기타' ? customCategory || '기타' : category || '기타'}\n영업시간: ${businessHours || '영업시간 미입력'}\n메뉴 및 특징: ${description || '메뉴 소개 미입력'}\n트렌드 반영: ${useTrends ? '예' : '아니오'}`
      }
    ];

    const response = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTAGE_API_KEY} `,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.75
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

    // 안전장치 (Fallback)
    const baseHashtags = [
      `#${targetLocation.split(' ')[0]} 맛집`,
      `#${(storeName || '').replace(/\s/g, '')} `,
      festivalMode ? `#${activeFestival.name} ` : '',
      '#부산핫플',
      '#먹스타그램'
    ].filter(Boolean);

    const fallbackResults = {
      instagram_feed: { text: rawContent, hashtags: baseHashtags },
      instagram_story: { text: rawContent },
      map_review: { text: rawContent },
      sms: { text: rawContent }
    };

    const finalResults = parsed?.results || parsed || fallbackResults;

    res.status(200).json({
      mode,
      contextSummary: festivalMode ? `🎉 축제 감지: ${activeFestival.name} ` : (useTrends
        ? `트렌드 반영: ${contextLine} `
        : `지역 모드: ${mode === 'EXPERT' ? `${key} 인사이트 적용` : '동네 추론 모드'} `),
      results: finalResults
    });
  } catch (error) {
    console.error('generate api error', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
}
