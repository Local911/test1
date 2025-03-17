export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'snapchat' | 'twitter';

export type TrendType = 'hashtag' | 'sound' | 'video' | 'reel' | 'short' | 'spotlight' | 'tweet';

export interface Metrics {
  views?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  growth_rate?: number;
  velocity?: number;
}

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  reactions?: Record<string, number>;
}

export interface CreatorStats {
  id: string;
  username: string;
  followers: number;
  engagement_rate: number;
  verified?: boolean;
}

export interface SocialTrend {
  id: string;
  platform: SocialPlatform;
  trend_type: TrendType;
  content_id: string;
  title: string;
  description?: string;
  category: string;
  metrics: Metrics;
  engagement: Engagement;
  creator_stats?: CreatorStats;
  timestamp: string;
  created_at: string;
  updated_at: string;
}
