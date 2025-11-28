// src/app/api/generate/route.js

export async function POST(req) {
  const { shopName, menu, location, imageBase64 } = await req.json();
  
  // 선택된 지역이 데이터에 없으면 '기타(동네)'를 기본값으로 사용
  const insight = BUSAN_SPOT_INSIGHTS[location] || BUSAN_SPOT_INSIGHTS["기타(동네)"];

  // [동네 상권 필살기] 날씨/요일 정보 생성 (하드코딩 or 간단한 로직)
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayInfo = days[today.getDay()] + "요일"; // 예: 금요일
  // ※ 해커톤 당일 날씨(예: 맑음/비)를 상황에 맞춰 박아넣으세요.
  const weatherInfo = "쌀쌀한 초겨울 날씨"; 

  const systemPrompt = `
    당신은 부산 소상공인을 돕는 다정한 AI 마케팅 매니저입니다.
    
    [타겟 분석]
    - 지역 특성: ${location} (${insight.persona})
    - 마케팅 포인트: ${insight.marketingPoint}
    
    [현재 상황]
    - 시간/요일: ${dayInfo}
    - 날씨: ${weatherInfo}
    
    [가게 정보]
    - 이름: ${shopName}
    - 메뉴: ${menu}
    
    [작성 미션]
    1. 지역이 유명 관광지라면 '화려함과 트렌드'를 강조하고,
       **일반 동네라면 '날씨와 요일'을 엮어서 "오늘 같은 날씨엔 우리 가게가 딱!"이라는 공감 멘트**를 작성하세요.
    2. 말투는 ${insight.tone} (예: 친근하게, 다정하게) 유지하세요.
    3. 해시태그: ${insight.hashTags.join(' ')}
  `;

  // ... (이후 Solar API 호출 코드는 동일)
}