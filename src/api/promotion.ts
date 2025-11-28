import { apiClient } from './client';
import { PromotionRequest, PromotionResponse } from '../types/promotion';

type LocalContextResponse = { contextSummary: string };

const buildMockResponse = (payload: PromotionRequest): PromotionResponse => {
  const toneLabel = payload.tone === 'busan-dialect' ? '부산 사투리' : '세련된 톤';
  const base = `${payload.location || '부산'} ${payload.category}`;

  return {
    contextSummary: payload.useLocalContext
      ? `${payload.location || '부산'}에서 열리는 축제/행사를 반영한 목업 컨텍스트`
      : undefined,
    results: {
      instagram_feed: {
        text: `${toneLabel}로 ${base} 홍보 문구 예시입니다. ${payload.event || '오늘 방문 시 혜택이 있습니다.'}`,
        hashtags: ['#부산로컬', '#소상공인', '#마케팅', '#AI', '#해커톤']
      },
      instagram_story: {
        text: `${base} 스토리용 짧은 문구 예시입니다. 지금 방문해보세요!`
      },
      map_review: {
        text: `${payload.storeName} 지도 리뷰 예시 문구입니다. 친절하고 분위기 좋은 장소로 추천합니다.`
      },
      sms: {
        text: `${payload.storeName}에서 준비한 혜택을 확인해보세요!`
      }
    }
  };
};

export const generatePromotion = async (payload: PromotionRequest): Promise<PromotionResponse> => {
  try {
    const { data } = await apiClient.post<PromotionResponse>('/api/generate', payload);
    return data;
  } catch (error) {
    console.warn('generatePromotion: falling back to mock data', error);
    return buildMockResponse(payload);
  }
};

export const fetchLocalContext = async (location: string): Promise<LocalContextResponse> => {
  try {
    const { data } = await apiClient.get<LocalContextResponse>('/api/local-context', {
      params: { location }
    });
    return data;
  } catch (error) {
    console.warn('fetchLocalContext: using mock context', error);
    return { contextSummary: `${location} 인근 축제/이슈 목업 데이터` };
  }
};