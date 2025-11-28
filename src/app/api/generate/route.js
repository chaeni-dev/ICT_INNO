import { NextResponse } from 'next/server';
import { BUSAN_SPOT_INSIGHTS } from '@/data/busanData';

// 해커톤 데모용: 현재 날씨와 요일을 랜덤/고정 생성 (실제론 날씨 API 연동 가능)
const getContextData = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const dayName = days[today.getDay()];
    // 데모 시연 효과를 위해 '비 오는 금요일 저녁'으로 가정하거나 랜덤 설정
    return { day: dayName, weather: "쌀쌀한 바람이 부는 초겨울 날씨" };
};

export async function POST(req) {
  try {
    const { shopName, menu, location, imageBase64 } = await req.json();
    const context = getContextData();

    // 1. 지역별 인사이트 데이터 로딩 (없으면 '기타(동네)'로 fallback)
    const insight = BUSAN_SPOT_INSIGHTS[location] || BUSAN_SPOT_INSIGHTS["기타(동네)"];
    const isNeighborhood = location === "기타(동네)" || !BUSAN_SPOT_INSIGHTS[location];

    // 2. 시스템 프롬프트 엔지니어링 (페르소나 주입)
    let systemPrompt = `
      당신은 부산/경남 소상공인을 위한 최고의 AI 마케팅 파트너입니다.
      아래 정보를 바탕으로 인스타그램 및 문자 발송용 홍보글을 작성해주세요.

      [가게 정보]
      - 상호명: ${shopName}
      - 메뉴: ${menu}
      - 지역: ${location}

      [타겟 고객 분석 데이터]
      - 주요 타겟: ${insight.targetName}
      - 페르소나 특징: ${insight.persona}
      - 작성 전략: ${insight.strategy}
    `;

    // 3. 상황별 추가 지시 (동네 vs 관광지 분기 처리)
    if (isNeighborhood) {
        systemPrompt += `
        [🚨 동네 상권 특별 지시 사항]
        이곳은 관광지가 아닌 주거 밀집 지역입니다. '화려함'보다는 '공감'이 중요합니다.
        - 현재 상황: ${context.weather}, ${context.day}요일.
        - 반드시 현재 날씨와 요일을 언급하며 "오늘 같은 날엔 우리 가게가 딱"이라는 뉘앙스를 풍기세요.
        - 말투: ${insight.tone} (이웃에게 말하듯 다정하게)
        `;
    } else {
        systemPrompt += `
        [🚨 관광지 핫플레이스 특별 지시 사항]
        이곳은 외부인 방문이 많은 핫플레이스입니다. '트렌드'와 '인증샷' 욕구를 자극하세요.
        - 말투: ${insight.tone} (타겟 페르소나가 매력을 느낄 수 있게)
        - 해시태그: ${insight.keywords.join(', ')} 를 포함하여 10개 이상 작성.
        `;
    }

    // 4. Solar API 호출
    const response = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'solar-pro', 
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: imageBase64 
              ? [{ type: "text", text: "이 사진을 보고 홍보글을 써줘." }, { type: "image_url", image_url: { url: imageBase64 } }]
              : "홍보글을 써줘."
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 에러 핸들링
    if (data.error) {
        console.error("Solar API Error:", data.error);
        return NextResponse.json({ result: "AI가 잠시 생각할 시간이 필요하대요. 다시 시도해주세요!" });
    }

    return NextResponse.json({ 
        result: data.choices[0].message.content,
        debug_insight: insight.targetName // 프론트에서 어떤 타겟이 잡혔는지 확인용
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  }
}