import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVerifications() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      
      const { data: verificationsData, error: verError } = await supabase
        .from('identity_verifications')
        .select('id, user_id, document_type, document_url, verification_status, created_at, rejection_reason')
        .order('created_at', { ascending: false });

      if (verError) throw verError;

      if (verificationsData && verificationsData.length > 0) {
        const userIds = verificationsData.map(v => v.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, phone_number')
          .in('id', userIds);

        const enrichedData = verificationsData.map(v => {
          const profile = profiles?.find(p => p.id === v.user_id);
          return {
            ...v,
            user_email: profile?.email,
            user_first_name: profile?.first_name,
            user_last_name: profile?.last_name,
            user_phone: profile?.phone_number
          };
        });

        setVerifications(enrichedData);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVerification = async (id: string, status: string, reason?: string, userId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates: any = {
        verification_status: status,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
        verified_by: user?.id,
        rejection_reason: reason
      };

      const { error } = await supabase
        .from('identity_verifications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      if (status === 'approved' && userId) {
        await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', userId);
      }

      await loadVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  return { verifications, loading, refresh: loadVerifications, updateVerification };
}