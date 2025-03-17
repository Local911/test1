import { useState, useEffect } from 'react';
import { SocialTrendService } from '../services/social-trends';
import type { SocialTrend, SocialPlatform, TrendType } from '../types/social-trends';

interface UseSocialTrendsOptions {
  platform?: SocialPlatform;
  type?: TrendType;
  category?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  autoRefresh?: boolean;
}

export function useSocialTrends(options: UseSocialTrendsOptions = {}) {
  const [trends, setTrends] = useState<SocialTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trendService = SocialTrendService.getInstance();
    let refreshInterval: NodeJS.Timeout | null = null;

    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await trendService.getTrends(options);
        setTrends(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();

    if (options.autoRefresh) {
      refreshInterval = setInterval(fetchTrends, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [
    options.platform,
    options.type,
    options.category,
    options.timeRange?.start,
    options.timeRange?.end,
    options.limit,
    options.autoRefresh
  ]);

  return { trends, loading, error };
}
