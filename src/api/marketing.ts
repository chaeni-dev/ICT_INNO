import { apiClient } from './client';
import { PromotionRequest } from '../types/promotion';
import { MarketingAnalysis } from '../types/chat';

export interface ChatRequest {
  storeData: PromotionRequest;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
}

export interface ChatResponse {
  message: string;
  analysis?: MarketingAnalysis;
}

const buildMockAnalysis = (storeData: PromotionRequest): MarketingAnalysis => {
  return {
    strengths: [
      `${storeData.location} 지역의 ${storeData.category}로 명확한 위치 특화`,
      `${storeData.menus.length}개의 대표 메뉴로 차별화 포인트 존재`,
      `${storeData.tone === 'busan-dialect' ? '부산 지역 특색을 살린' : '세련된'} 톤앤매너로 고객 접근성 좋음`
    ],
    improvements: [
      'SNS 채널 활용도를 높여 고객 접점 확대 필요',
      '이벤트 기간을 명확히 하여 긴급성 조성',
      '고객 후기 수집 및 활용 전략 수립'
    ],
    recommendations: [
      `${storeData.channels.length}개 채널을 활용한 통합 마케팅 전략 수립`,
      `${storeData.timing} 시점에 맞춘 타겟팅 메시지 전달`,
      '지역 이슈와 연계한 이벤트 기획으로 관심도 상승'
    ],
    targetInsights: [
      `타겟 고객층: ${storeData.targetAudience || '전체'}에 최적화된 메시지 전략`,
      `${storeData.location} 지역 특성에 맞는 마케팅 접근 필요`,
      `${storeData.category} 업종 트렌드를 반영한 홍보 전략`
    ],
    channelStrategy: storeData.channels.map((channel) => {
      const channelNames: Record<string, string> = {
        instagram_feed: '인스타그램 피드',
        instagram_story: '인스타그램 스토리',
        map_review: '지도 리뷰',
        sms: '문자/알림톡',
        facebook: '페이스북',
        blog: '블로그',
        'kakao-channel': '카카오톡 채널'
      };
      return `${channelNames[channel]}: ${storeData.tone === 'busan-dialect' ? '친근한 지역 톤' : '세련된 톤'}으로 접근`;
    })
  };
};

const buildMockResponse = (request: ChatRequest): ChatResponse => {
  const { userMessage, storeData } = request;
  const lowerMessage = userMessage.toLowerCase();

  // 초기 분석 요청
  if (lowerMessage.includes('분석') || lowerMessage.includes('어떻게') || lowerMessage.includes('조언')) {
    return {
      message: `${storeData.storeName}의 마케팅 분석을 시작하겠습니다.`,
      analysis: buildMockAnalysis(storeData)
    };
  }

  // 채널 관련 질문
  if (lowerMessage.includes('채널') || lowerMessage.includes('어디에')) {
    return {
      message: `현재 ${storeData.channels.length}개의 채널을 활용 중이시네요. 각 채널별 특성에 맞는 콘텐츠 전략을 수립하시면 효과가 더 좋을 것 같습니다. 인스타그램은 시각적 콘텐츠, 지도 리뷰는 신뢰도 구축, 문자/알림톡은 직접적인 고객 접촉에 효과적입니다.`
    };
  }

  // 타겟 관련 질문
  if (lowerMessage.includes('타겟') || lowerMessage.includes('고객')) {
    return {
      message: `타겟 고객층(${storeData.targetAudience || '전체'})에 맞춘 메시지 톤과 콘텐츠를 제작하시면 전환율이 높아집니다. ${storeData.location} 지역의 특성을 고려한 마케팅 접근이 중요합니다.`
    };
  }

  // 기본 응답
  return {
    message: `${storeData.storeName}의 마케팅에 대해 더 구체적으로 알려드릴 수 있습니다. 어떤 부분이 궁금하신가요? 예를 들어 "채널 전략", "타겟 고객", "홍보 타이밍" 등에 대해 물어보실 수 있습니다.`
  };
};

export const askMarketingAssistant = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const { data } = await apiClient.post<ChatResponse>('/api/marketing/chat', request);
    return data;
  } catch (error) {
    console.warn('askMarketingAssistant: falling back to mock data', error);
    return buildMockResponse(request);
  }
};

export const getInitialAnalysis = async (storeData: PromotionRequest): Promise<MarketingAnalysis> => {
  try {
    const { data } = await apiClient.post<MarketingAnalysis>('/api/marketing/analysis', storeData);
    return data;
  } catch (error) {
    console.warn('getInitialAnalysis: falling back to mock data', error);
    return buildMockAnalysis(storeData);
  }
};

