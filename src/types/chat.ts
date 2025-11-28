export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MarketingAnalysis {
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  targetInsights: string[];
  channelStrategy: string[];
}

