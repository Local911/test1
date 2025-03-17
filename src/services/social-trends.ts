import { supabase } from '../lib/supabase';
import type { SocialTrend, SocialPlatform, TrendType } from '../types/social-trends';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export class SocialTrendService {
  private static instance: SocialTrendService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private retryCount: Record<string, number> = {};

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): SocialTrendService {
    if (!SocialTrendService.instance) {
      SocialTrendService.instance = new SocialTrendService();
    }
    return SocialTrendService.instance;
  }

  async startMonitoring(): Promise<void> {
    await this.fetchAllTrends();
    this.refreshInterval = setInterval(() => {
      this.fetchAllTrends();
    }, REFRESH_INTERVAL);
  }

  stopMonitoring(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private async fetchAllTrends(): Promise<void> {
    try {
      await Promise.all([
        this.fetchTikTokTrends(),
        this.fetchInstagramTrends(),
        this.fetchYouTubeTrends(),
        this.fetchSnapchatTrends(),
        this.fetchTwitterTrends()
      ]);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  }

  private async retryWithBackoff(
    operation: () => Promise<any>,
    platform: string
  ): Promise<any> {
    try {
      return await operation();
    } catch (error) {
      const retryCount = this.retryCount[platform] || 0;
      
      if (retryCount >= MAX_RETRIES) {
        this.retryCount[platform] = 0;
        throw error;
      }

      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      this.retryCount[platform] = retryCount + 1;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, platform);
    }
  }

  private async saveTrend(trend: Omit<SocialTrend, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('social_trends')
        .insert([trend]);

      if (error) throw error;
    } catch (error) {
      console.error(`Error saving trend:`, error);
      throw error;
    }
  }

  async getTrends(options: {
    platform?: SocialPlatform;
    type?: TrendType;
    category?: string;
    timeRange?: {
      start: Date;
      end: Date;
    };
    limit?: number;
  } = {}): Promise<SocialTrend[]> {
    try {
      let query = supabase
        .from('social_trends')
        .select('*');

      if (options.platform) {
        query = query.eq('platform', options.platform);
      }

      if (options.type) {
        query = query.eq('trend_type', options.type);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.timeRange) {
        query = query
          .gte('timestamp', options.timeRange.start.toISOString())
          .lte('timestamp', options.timeRange.end.toISOString());
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data as SocialTrend[];
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  // Platform-specific implementations
  private async fetchTikTokTrends(): Promise<void> {
    // Implementation would use TikTok API
    // This is a placeholder for the actual implementation
  }

  private async fetchInstagramTrends(): Promise<void> {
    // Implementation would use Instagram Graph API
    // This is a placeholder for the actual implementation
  }

  private async fetchYouTubeTrends(): Promise<void> {
    // Implementation would use YouTube Data API
    // This is a placeholder for the actual implementation
  }

  private async fetchSnapchatTrends(): Promise<void> {
    // Implementation would use Snapchat API
    // This is a placeholder for the actual implementation
  }

  private async fetchTwitterTrends(): Promise<void> {
    // Implementation would use Twitter API v2
    // This is a placeholder for the actual implementation
  }
}
