import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchLocalContext, generatePromotion } from '../api/promotion';
import { PromotionRequest, PromotionResponse } from '../types/promotion';

type MutationError = unknown;

type UseGeneratePromotionParams = {
  onSuccess?: (data: PromotionResponse) => void;
};

export const useGeneratePromotion = (params?: UseGeneratePromotionParams) => {
  return useMutation<PromotionResponse, MutationError, PromotionRequest>({
    mutationFn: generatePromotion,
    onSuccess: params?.onSuccess
  });
};

export const useLocalContext = (location: string | null) => {
  return useQuery({
    queryKey: ['local-context', location],
    queryFn: () => fetchLocalContext(location ?? ''),
    enabled: Boolean(location)
  });
};
