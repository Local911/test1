export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  subscription_tier?: string;
  primary_niche?: string;
  sub_niche?: string;
  connected_accounts?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface TrendData {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter';
  keyword: string;
  growth_rate: number;
  sentiment_score: number;
  volume: number;
  timestamp: string;
}

export interface CompetitorData {
  id: string;
  user_id?: string;
  platform: string;
  username: string;
  followers: number;
  engagement_rate: number;
  top_posts: Post[];
  last_updated?: string;
  created_at?: string;
}

export interface Post {
  id: string;
  platform: string;
  type: 'image' | 'video' | 'text';
  content: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  posted_at: string;
}

export interface AlertSettings {
  id: string;
  user_id?: string;
  keywords: string[];
  platforms: string[];
  threshold: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedContent {
  id: string;
  user_id: string;
  content_id: string;
  platform: string;
  content_data: {
    caption: string;
    thumbnailUrl: string;
    videoUrl: string;
    username: string;
    userAvatar: string;
    metrics: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      views: number;
    };
  };
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  platform: string;
  scheduled_time: string;
  caption: string;
  media_url?: string;
  status: 'pending' | 'published' | 'failed';
  created_at?: string;
  updated_at?: string;
}
