import { InstagramEthicalScraper } from './InstagramEthicalScraper';
import { supabase } from '../../lib/supabase';

interface ReelData {
  id: string;
  shortcode: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  thumbnailUrl: string;
  videoUrl: string;
  username: string;
  userAvatar: string;
  timestamp: string;
}

const mockReels: Record<string, ReelData[]> = {
  comedy: [
    {
      id: 'comedy1',
      shortcode: 'abc123',
      caption: '🤣 When your code finally works but you don\'t know why! #coding #programming #techjokes',
      likes: 125000,
      comments: 3200,
      shares: 15000,
      saves: 8500,
      views: 450000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      videoUrl: 'https://instagram.com/p/abc123',
      username: 'techhumor',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
      timestamp: new Date().toISOString()
    },
    {
      id: 'comedy2',
      shortcode: 'def456',
      caption: '😂 POV: Me explaining why I need another plant 🪴 #plantmom #houseplants',
      likes: 89000,
      comments: 2100,
      shares: 12000,
      saves: 6300,
      views: 320000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8',
      videoUrl: 'https://instagram.com/p/def456',
      username: 'planthumor',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      timestamp: new Date().toISOString()
    }
  ],
  dance: [
    {
      id: 'dance1',
      shortcode: 'ghi789',
      caption: '💃 New dance challenge alert! Try this combo #dancechallenge #viral',
      likes: 250000,
      comments: 5600,
      shares: 45000,
      saves: 22000,
      views: 890000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434',
      videoUrl: 'https://instagram.com/p/ghi789',
      username: 'dancepro',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
      timestamp: new Date().toISOString()
    }
  ],
  fashion: [
    {
      id: 'fashion1',
      shortcode: 'jkl012',
      caption: '✨ Spring outfit inspo! Which one is your favorite? 1, 2, or 3? #ootd #springfashion',
      likes: 156000,
      comments: 4200,
      shares: 18000,
      saves: 35000,
      views: 520000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      videoUrl: 'https://instagram.com/p/jkl012',
      username: 'fashionista',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      timestamp: new Date().toISOString()
    }
  ],
  food: [
    {
      id: 'food1',
      shortcode: 'mno345',
      caption: '🍝 The easiest 15-minute pasta recipe you\'ll ever make! #foodie #quickrecipes',
      likes: 98000,
      comments: 2800,
      shares: 25000,
      saves: 42000,
      views: 380000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
      videoUrl: 'https://instagram.com/p/mno345',
      username: 'chefsecrets',
      userAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f',
      timestamp: new Date().toISOString()
    }
  ],
  beauty: [
    {
      id: 'beauty1',
      shortcode: 'pqr678',
      caption: '💄 5-minute everyday makeup routine! Perfect for busy mornings #makeup #beauty',
      likes: 178000,
      comments: 4800,
      shares: 32000,
      saves: 55000,
      views: 620000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
      videoUrl: 'https://instagram.com/p/pqr678',
      username: 'beautyguru',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      timestamp: new Date().toISOString()
    }
  ],
  fitness: [
    {
      id: 'fitness1',
      shortcode: 'stu901',
      caption: '💪 10-minute ab workout you can do anywhere! No equipment needed #fitness #workout',
      likes: 145000,
      comments: 3600,
      shares: 28000,
      saves: 48000,
      views: 480000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      videoUrl: 'https://instagram.com/p/stu901',
      username: 'fitnesstrainer',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      timestamp: new Date().toISOString()
    }
  ],
  education: [
    {
      id: 'education1',
      shortcode: 'vwx234',
      caption: '📚 3 study hacks that will change your life! #studytips #education',
      likes: 82000,
      comments: 2400,
      shares: 19000,
      saves: 38000,
      views: 290000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
      videoUrl: 'https://instagram.com/p/vwx234',
      username: 'studyexpert',
      userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      timestamp: new Date().toISOString()
    }
  ],
  lifestyle: [
    {
      id: 'lifestyle1',
      shortcode: 'yz567',
      caption: '🌿 Morning routine for a productive day! #morningroutine #productivity',
      likes: 134000,
      comments: 3900,
      shares: 22000,
      saves: 41000,
      views: 450000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
      videoUrl: 'https://instagram.com/p/yz567',
      username: 'lifestyleblogger',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      timestamp: new Date().toISOString()
    }
  ]
};

export class InstagramService {
  private static instance: InstagramService;
  private scraper: InstagramEthicalScraper;

  private constructor() {
    this.scraper = InstagramEthicalScraper.getInstance();
  }

  static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService();
    }
    return InstagramService.instance;
  }

  async fetchTrendingReels(category: string, timeframe: string = '7d'): Promise<ReelData[]> {
    try {
      // Log the scraping attempt
      await this.logScrapingEvent('FETCH_START', category);

      // For demo purposes, return mock data
      const reels = mockReels[category.toLowerCase()] || [];
      
      // Add some randomization to make it more realistic
      const randomizedReels = reels.map(reel => ({
        ...reel,
        metrics: {
          likes: Math.floor(reel.likes * (0.9 + Math.random() * 0.2)),
          views: Math.floor(reel.views * (0.9 + Math.random() * 0.2)),
          shares: Math.floor(reel.shares * (0.9 + Math.random() * 0.2)),
          saves: Math.floor(reel.saves * (0.9 + Math.random() * 0.2)),
          comments: Math.floor(reel.comments * (0.9 + Math.random() * 0.2))
        },
        likes: Math.floor(reel.likes * (0.9 + Math.random() * 0.2)),
        views: Math.floor(reel.views * (0.9 + Math.random() * 0.2)),
        shares: Math.floor(reel.shares * (0.9 + Math.random() * 0.2)),
        saves: Math.floor(reel.saves * (0.9 + Math.random() * 0.2)),
        comments: Math.floor(reel.comments * (0.9 + Math.random() * 0.2)),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      // Store the results in Supabase for caching and analytics
      await this.storeResults(randomizedReels, category);

      // Log successful fetch
      await this.logScrapingEvent('FETCH_SUCCESS', category, { count: randomizedReels.length });

      return randomizedReels;
    } catch (error) {
      // Log error
      await this.logScrapingEvent('FETCH_ERROR', category, undefined, error as Error);
      throw error;
    }
  }

  private async storeResults(reels: ReelData[], category: string): Promise<void> {
    try {
      const { error } = await supabase.from('social_trends').insert(
        reels.map(reel => ({
          platform: 'instagram',
          trend_type: 'reel',
          content_id: reel.shortcode,
          title: reel.caption.split('\n')[0],
          description: reel.caption,
          category,
          metrics: {
            views: reel.views,
            likes: reel.likes,
            comments: reel.comments,
            shares: reel.shares,
            saves: reel.saves
          },
          creator_stats: {
            username: reel.username,
            avatar: reel.userAvatar
          },
          thumbnail_url: reel.thumbnailUrl,
          timestamp: reel.timestamp
        }))
      );

      if (error) throw error;
    } catch (error) {
      console.error('Error storing results:', error);
      throw error;
    }
  }

  private async logScrapingEvent(
    eventType: string,
    category: string,
    data?: any,
    error?: Error
  ): Promise<void> {
    try {
      const { error: logError } = await supabase.from('trend_logs').insert([{
        platform: 'instagram',
        event_type: eventType,
        status: error ? 'error' : 'success',
        request_data: { category, ...data },
        error_message: error?.message
      }]);

      if (logError) {
        console.error('Failed to log scraping event:', logError);
      }
    } catch (err) {
      console.error('Failed to log scraping event:', err);
    }
  }
}
