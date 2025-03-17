import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { AlertSettings } from '../types';

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const subscription = supabase
        .channel('alert_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchAlerts();
        })
        .subscribe();

      fetchAlerts();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function fetchAlerts() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAlerts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }

  async function createAlert(alert: Omit<AlertSettings, 'id' | 'user_id'>) {
    try {
      const { error } = await supabase
        .from('alerts')
        .insert([{ ...alert, user_id: user?.id }]);

      if (error) throw error;
      await fetchAlerts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create alert');
    }
  }

  async function updateAlert(id: string, updates: Partial<AlertSettings>) {
    try {
      const { error } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchAlerts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update alert');
    }
  }

  async function deleteAlert(id: string) {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchAlerts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete alert');
    }
  }

  async function toggleAlert(id: string, enabled: boolean) {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ enabled })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchAlerts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to toggle alert');
    }
  }

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    refetch: fetchAlerts
  };
}
