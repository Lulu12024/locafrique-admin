import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    pendingEquipments: 0,
    totalEquipments: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [users, verifications, equipments, pendingEquipments] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('identity_verifications').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('equipments').select('*', { count: 'exact', head: true }),
        supabase.from('equipments').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending')
      ]);

      setStats({
        totalUsers: users.count || 0,
        pendingVerifications: verifications.count || 0,
        totalEquipments: equipments.count || 0,
        pendingEquipments: pendingEquipments.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, refresh: loadStats };
}