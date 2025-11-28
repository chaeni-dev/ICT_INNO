export type Tone = 'seoul-instagram' | 'busan-dialect' | 'friendly' | 'professional' | 'humorous' | 'emotional';
export type Timing = 'today' | 'weekend' | 'payday' | 'festival' | 'weekday' | 'evening' | 'lunch' | 'specific-date';
export type Channel = 'instagram_feed' | 'instagram_story' | 'map_review' | 'sms' | 'facebook' | 'blog' | 'kakao-channel';
export type TargetAudience = 'all' | 'young' | 'family' | 'office-worker' | 'student' | 'elderly';
export type PromotionPurpose = 'new-opening' | 'event' | 'regular' | 'seasonal' | 'emergency';

export interface PromotionRequest {
  storeName: string;
  category: string;
  location: string;
  intro: string;
  menus: string[];
  event: string;
  tone: Tone;
  timing: Timing;
  channels: Channel[];
  useLocalContext: boolean;
  photoDescription?: string;
  targetAudience?: TargetAudience;
  promotionPurpose?: PromotionPurpose;
  priceRange?: string;
  operatingHours?: string;
  specialRequest?: string;
}

export interface ChannelResult {
  text: string;
  hashtags?: string[];
}

export interface PromotionResponse {
  contextSummary?: string;
  results: {
    instagram_feed?: ChannelResult;
    instagram_story?: ChannelResult;
    map_review?: ChannelResult;
    sms?: ChannelResult;
  };
}
