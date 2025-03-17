import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TrendData } from '../types';

export function useTrends() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    timeRange: '24h',
    sortBy: 'growth_rate'
  });

  useEffect(() => {
    const subscription = supabase
      .channel('trends_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trends'
      }, () => {
        fetchTrends();
      })
      .subscribe();

    fetchTrends();

    return () => {
      subscription.unsubscribe();
    };
  }, [filters]);

  async function fetchTrends() {
    try {
      setLoading(true);
      let query = supabase
        .from('trends')
        .select('*');

      // Apply filters
      if (filters.platform !== 'all') {
        query = query.eq('platform', filters.platform);
      }

      // Apply time range filter
      const now = new Date();
      const timeRanges = {
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
      query = query.gte('timestamp', timeRanges[filters.timeRange as keyof typeof timeRanges].toISOString());

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setTrends(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
    } finally {
      setLoading(false);
    }
  }

  return { 
    trends, 
    loading, 
    error, 
    filters,
    setFilters,
    refetch: fetchTrends 
  };
}
