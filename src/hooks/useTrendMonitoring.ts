import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Platform, TrendData } from '../services/trend-monitoring/types';

interface UseTrendMonitoringOptions {
  platform?: Platform;
  category?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  autoRefresh?: boolean;
}

export function useTrendMonitoring(options: UseTrendMonitoringOptions = {}) {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;

    const fetchTrends = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('platform_trends')
          .select(`
            *,
            trend_metrics (
              views,
              likes,
              shares,
              comments,
              saves,
              engagement_rate,
              growth_rate,
              velocity,
              reach,
              impressions,
              sentiment_score,
              timestamp
            ),
            trend_analytics (
              correlation_score,
              virality_score,
              prediction_confidence,
              related_trends,
              geographic_distribution,
              demographic_data,
              peak_times,
              analysis_timestamp
            )
          `);

        if (options.platform) {
          query = query.eq('platform', options.platform);
        }

        if (options.category) {
          query = query.eq('category', options.category);
        }

        if (options.timeRange) {
          query = query
            .gte('created_at', options.timeRange.start.toISOString())
            .lte('created_at', options.timeRange.end.toISOString());
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setTrends(data as TrendData[]);
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
    options.category,
    options.timeRange?.start,
    options.timeRange?.end,
    options.limit,
    options.autoRefresh
  ]);

  return { trends, loading, error };
}
