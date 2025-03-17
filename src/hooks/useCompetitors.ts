import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { CompetitorData } from '../types';

export function useCompetitors() {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalFollowers: 0,
    avgEngagement: 0,
    totalCompetitors: 0
  });

  useEffect(() => {
    if (user) {
      const subscription = supabase
        .channel('competitor_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'competitor_profiles',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchCompetitors();
        })
        .subscribe();

      fetchCompetitors();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function fetchCompetitors() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('competitor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setCompetitors(data || []);
      
      // Calculate statistics
      if (data) {
        const totalFollowers = data.reduce((sum, comp) => sum + comp.followers, 0);
        const avgEngagement = data.reduce((sum, comp) => sum + comp.engagement_rate, 0) / (data.length || 1);
        
        setStats({
          totalFollowers,
          avgEngagement,
          totalCompetitors: data.length
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competitors');
    } finally {
      setLoading(false);
    }
  }

  async function addCompetitor(competitor: Omit<CompetitorData, 'id' | 'user_id'>) {
    try {
      const { error } = await supabase
        .from('competitor_profiles')
        .insert([{ ...competitor, user_id: user?.id }]);

      if (error) throw error;
      await fetchCompetitors();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add competitor');
    }
  }

  async function updateCompetitor(id: string, updates: Partial<CompetitorData>) {
    try {
      const { error } = await supabase
        .from('competitor_profiles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchCompetitors();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update competitor');
    }
  }

  async function removeCompetitor(id: string) {
    try {
      const { error } = await supabase
        .from('competitor_profiles')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchCompetitors();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove competitor');
    }
  }

  return {
    competitors,
    loading,
    error,
    stats,
    addCompetitor,
    updateCompetitor,
    removeCompetitor,
    refetch: fetchCompetitors
  };
}
