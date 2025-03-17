import { supabase } from '../../lib/supabase';

interface ScrapingConfig {
  maxRequestsPerHour: number;
  delayBetweenRequests: number;
  maxRetries: number;
  retryDelay: number;
  userAgent: string;
  maxHashtagsPerRequest: number;
  maxPostsPerHashtag: number;
}

interface ScrapedReel {
  id: string;
  shortcode: string;
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
  timestamp: string;
  isPublic: boolean;
}

export class InstagramEthicalScraper {
  private static instance: InstagramEthicalScraper;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  
  // Strict compliance with Instagram's guidelines
  private readonly config: ScrapingConfig = {
    maxRequestsPerHour: 60, // More conservative rate limit
    delayBetweenRequests: 3000, // 3 seconds between requests
    maxRetries: 2,
    retryDelay: 10000, // 10 seconds
    userAgent: 'OnlyViralAI/1.0 (Trend Analysis; https://onlyviral.ai/terms; support@onlyviral.ai)',
    maxHashtagsPerRequest: 5, // Limit hashtags per request
    maxPostsPerHashtag: 20 // Limit posts per hashtag
  };

  private constructor() {
    this.resetRequestCount();
  }

  static getInstance(): InstagramEthicalScraper {
    if (!InstagramEthicalScraper.instance) {
      InstagramEthicalScraper.instance = new InstagramEthicalScraper();
    }
    return InstagramEthicalScraper.instance;
  }

  private resetRequestCount(): void {
    setInterval(() => {
      this.requestCount = 0;
    }, 3600000);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    if (this.requestCount >= this.config.maxRequestsPerHour) {
      await this.logScrapingEvent('RATE_LIMIT_EXCEEDED', {
        requestCount: this.requestCount,
        maxRequests: this.config.maxRequestsPerHour
      });
      throw new Error('Hourly rate limit exceeded. Please try again later.');
    }

    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.delayBetweenRequests) {
      await this.delay(this.config.delayBetweenRequests - timeSinceLastRequest);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.config.maxRetries) {
        throw error;
      }

      const delay = this.config.retryDelay * Math.pow(2, retryCount);
      await this.delay(delay);

      return this.retryWithBackoff(operation, retryCount + 1);
    }
  }

  async fetchReels(
    category: string,
    timeframe: string = '7d',
    limit: number = 10
  ): Promise<ScrapedReel[]> {
    try {
      await this.logScrapingEvent('FETCH_START', {
        category,
        timeframe,
        limit
      });

      const reels: ScrapedReel[] = [];
      const hashtags = (await this.getCategoryHashtags(category))
        .slice(0, this.config.maxHashtagsPerRequest);

      for (const hashtag of hashtags) {
        if (reels.length >= limit) break;

        await this.enforceRateLimit();

        const hashtagReels = await this.retryWithBackoff(async () => {
          return this.fetchHashtagReels(hashtag, timeframe);
        });

        // Only add public reels
        reels.push(...hashtagReels.filter(reel => reel.isPublic));
      }

      // Sort by engagement and limit results
      const sortedReels = this.sortByEngagement(reels)
        .slice(0, Math.min(limit, this.config.maxPostsPerHashtag));

      await this.logScrapingEvent('FETCH_SUCCESS', {
        category,
        timeframe,
        reelsCount: sortedReels.length
      });

      return sortedReels;
    } catch (error) {
      await this.logScrapingEvent('FETCH_ERROR', {
        category,
        timeframe,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async fetchHashtagReels(
    hashtag: string,
    timeframe: string
  ): Promise<ScrapedReel[]> {
    // This would be implemented using Instagram's public GraphQL API
    // For demonstration, we'll return mock data
    return [
      {
        id: `mock_${hashtag}_1`,
        shortcode: `${hashtag}_123`,
        caption: `Amazing ${hashtag} content! 🔥 #trending`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1600096194534-95cf5b54e4e4',
        videoUrl: `https://instagram.com/reel/${hashtag}_123`,
        username: 'creator123',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        metrics: {
          likes: Math.floor(Math.random() * 50000),
          comments: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 5000),
          saves: Math.floor(Math.random() * 2000),
          views: Math.floor(Math.random() * 100000)
        },
        timestamp: new Date().toISOString(),
        isPublic: true
      }
    ];
  }

  private async isPublicAccount(username: string): Promise<boolean> {
    // This would check if an account is public using Instagram's API
    // For demonstration, always return true
    return true;
  }

  private async getCategoryHashtags(category: string): Promise<string[]> {
    const hashtagMap: Record<string, string[]> = {
      comedy: ['comedy', 'funny', 'humor', 'memes', 'jokes'],
      dance: ['dance', 'choreography', 'dancers', 'dancing'],
      fashion: ['fashion', 'style', 'ootd', 'outfits'],
      food: ['food', 'cooking', 'recipes', 'foodie'],
      beauty: ['beauty', 'makeup', 'skincare', 'cosmetics'],
      fitness: ['fitness', 'workout', 'gym', 'exercise'],
      education: ['education', 'learning', 'study', 'knowledge'],
      lifestyle: ['lifestyle', 'daily', 'life', 'motivation'],
      travel: ['travel', 'adventure', 'wanderlust', 'explore'],
      gaming: ['gaming', 'games', 'gamer', 'videogames']
    };

    return hashtagMap[category.toLowerCase()] || [category];
  }

  private sortByEngagement(reels: ScrapedReel[]): ScrapedReel[] {
    return reels.sort((a, b) => {
      const aEngagement = this.calculateEngagementScore(a.metrics);
      const bEngagement = this.calculateEngagementScore(b.metrics);
      return bEngagement - aEngagement;
    });
  }

  private calculateEngagementScore(metrics: ScrapedReel['metrics']): number {
    return (
      metrics.likes * 1 +
      metrics.comments * 2 +
      metrics.shares * 3 +
      metrics.saves * 4
    );
  }

  private async logScrapingEvent(
    eventType: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase.from('trend_logs').insert({
        platform: 'instagram',
        event_type: eventType,
        status: eventType.includes('ERROR') ? 'error' : 'success',
        request_data: data,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Failed to log scraping event:', error);
      }
    } catch (err) {
      console.error('Failed to log scraping event:', err);
    }
  }
}
