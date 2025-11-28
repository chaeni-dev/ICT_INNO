export type Tone = 'seoul-instagram' | 'busan-dialect';
export type Timing = 'today' | 'weekend' | 'payday' | 'festival';
export type Channel = 'instagram_feed' | 'instagram_story' | 'map_review' | 'sms';

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
