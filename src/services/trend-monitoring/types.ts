export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'snapchat' | 'twitter';
export type ContentType = 'video' | 'image' | 'text' | 'audio' | 'mixed';
export type TrendStatus = 'active' | 'inactive' | 'rising' | 'falling';

export interface TrendMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  engagementRate: number;
  growthRate: number;
  velocity: number;
  reach: number;
  impressions: number;
  sentimentScore: number;
}

export interface TrendAnalytics {
  correlationScore: number;
  viralityScore: number;
  predictionConfidence: number;
  relatedTrends: string[];
  geographicDistribution: Record<string, number>;
  demographicData: Record<string, any>;
  peakTimes: Record<string, string[]>;
}

export interface TrendData {
  platform: Platform;
  trendKey: string;
  title: string;
  description?: string;
  contentType: ContentType;
  status: TrendStatus;
  category: string;
  tags: string[];
  creatorId?: string;
  creatorUsername?: string;
  creatorMetrics: Record<string, any>;
  url?: string;
  thumbnailUrl?: string;
  metrics: TrendMetrics;
  analytics: TrendAnalytics;
}

export interface TrendEvent {
  platform: Platform;
  eventType: string;
  status: string;
  requestData?: any;
  responseData?: any;
  error?: Error;
}
