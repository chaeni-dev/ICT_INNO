import { NextResponse } from 'next/server';
import { getInsight } from '@/data/busanData';

const days = ['일', '월', '화', '수', '목', '금', '토'];
const weatherPresets = ['맑고 포근한 오후', '선선한 바람이 부는 저녁', '보슬비가 내리는 퇴근길', '후덥지근한 여름밤', '쌀쌀한 겨울 아침', '서늘한 가을바람'];
const crowdPresets = ['퇴근길 정체', '주말 나들이 인파', '데이트 코스 탐색', '모임 전 술자리를 찾는 무리', '가족 외식 분위기', '관광객 인증샷 대기열'];

const randomPick = (list) => list[Math.floor(Math.random() * list.length)];

const buildTrendContext = () => {
  const day = days[new Date().getDay()];
  return `${day}요일, ${randomPick(weatherPresets)} · ${randomPick(crowdPresets)}`;
};

const cleanJson = (text) => {
  if (!text) return null;
  const fenced = text.match(/```json\\s*([\\s\\S]*?)```/i);
  const target = fenced ? fenced[1] : text;
  try {
    return JSON.parse(target);
  } catch (error) {
    console.warn('JSON parse failed, using fallback', error);
    return null;
  }
};

export async function POST(req) {
  try {
    const { storeName, description, location, imageBase64, includeTrends } = await req.json();
    const { insight, exists, key } = getInsight(location);
    const mode = exists ? 'EXPERT' : 'GENERAL';
    const useTrends = includeTrends !== false;
    const trendLine = useTrends ? buildTrendContext() : null;

    if (!process.env.UPSTAGE_API_KEY) {
      return NextResponse.json({ error: 'UPSTAGE_API_KEY is not set' }, { status: 500 });
    }

    const systemPrompt = `
[역할] 당신은 부산 소상공인을 돕는 로컬 AI 마케팅 카피라이터입니다. 인스타그램/스토리/지도 리뷰/문자에 최적화된 문구를 한국어로 작성합니다.

[출력 형식] JSON만 반환하세요.
{
  "results": {
    "instagram_feed": {"text": "...", "hashtags": ["..."]},
    "instagram_story": {"text": "..."},
    "map_review": {"text": "..."},
    "sms": {"text": "..."}
  }
}

[작성 규칙]
- 채널별 길이/톤을 조절하고 중복 문장 피하기.
- 해시태그는 8~12개, 지역/타겟/메뉴 키워드를 섞어 작성.
- 이미지가 있으면 시각적 특징을 한두 문장에 녹여 설명.

${mode === 'EXPERT' ? `
[지역 전문가 모드]
- 지역: ${key}
- 타겟: ${insight.targetName}
- 페르소나: ${insight.persona}
- 마케팅 포인트: ${insight.marketingPoint}
- 권장 톤: ${insight.tone}
- 기본 해시태그: ${insight.hashTags.join(', ')}
` : `
[지역 탐색 모드]
- 주어진 위치 텍스트만으로 동네 특징/타겟/톤을 추론해라.
- 어떤 방문객이 많이 올지, 무엇을 기대할지 합리적으로 상상해 설득력 있게 작성.
`}

${useTrends ? `
[실시간 분위기/이슈 반영]
- 지금은 ${trendLine}.
- 현재 요일/시간/날씨를 기반으로 주변 분위기(퇴근길 정체, 주말 인파 등)를 상상해 문구에 녹여라.
- "오늘 같은 날씨엔 우리 가게!" 같은 공감 멘트를 자연스럽게 섞어라.
` : ''}
`.trim();

    const userContent = [
      {
        type: 'text',
        text: `가게명: ${storeName || '미정'}\n위치: ${location || '미정'}\n메뉴/이벤트: ${description || '메뉴 소개 미입력'}\n트렌드 반영: ${useTrends ? '예' : '아니오'}`
      }
    ];

    if (imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageBase64 }
      });
    }

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
      return NextResponse.json(
        { error: 'AI 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    const rawContent = data?.choices?.[0]?.message?.content ?? '';
    const parsed = cleanJson(rawContent);
    const fallbackResults = {
      instagram_feed: { text: rawContent || '생성된 문구가 없습니다.', hashtags: insight.hashTags },
      instagram_story: { text: rawContent || '생성된 문구가 없습니다.' },
      map_review: { text: rawContent || '생성된 문구가 없습니다.' },
      sms: { text: rawContent || '생성된 문구가 없습니다.' }
    };

    const results = parsed?.results || parsed || fallbackResults;

    return NextResponse.json({
      mode,
      contextSummary: useTrends
        ? `트렌드 반영: ${trendLine}`
        : `지역 모드: ${mode === 'EXPERT' ? `${key} 인사이트 적용` : '동네 추론 모드'}`,
      results
    });
  } catch (error) {
    console.error('generate route error', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  }
}
