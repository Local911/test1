export interface ScrapedPost {
  postId: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  username: string;
  userFollowers?: number;
}

export interface NicheData {
  name: string;
  hashtags: string[];
  relevantKeywords: string[];
  engagementThreshold: number;
}

export interface ScrapingStats {
  postsScraped: number;
  trendingPosts: number;
  failedRequests: number;
  totalEngagement: number;
  processingTime: number;
}
