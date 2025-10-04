import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useEquipments() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEquipments = async () => {
    try {
      setLoading(true);
      
      const { data: equipmentsData, error: eqError } = await supabase
        .from('equipments')
        .select('id, title, description, category, daily_price, deposit_amount, city, country, moderation_status, status, owner_id, created_at')
        .order('created_at', { ascending: false });

      if (eqError) throw eqError;

      if (equipmentsData && equipmentsData.length > 0) {
        const ownerIds = equipmentsData.map(e => e.owner_id);
        const { data: owners } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', ownerIds);

        const enrichedData = equipmentsData.map(e => {
          const owner = owners?.find(o => o.id === e.owner_id);
          return {
            ...e,
            owner_email: owner?.email,
            owner_first_name: owner?.first_name,
            owner_last_name: owner?.last_name
          };
        });

        setEquipments(enrichedData);
      } else {
        setEquipments([]);
      }
    } catch (error) {
      console.error('Error loading equipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEquipment = async (id: string, status: string, feedback?: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const updates = {
        moderation_status: status,
        moderated_at: new Date().toISOString(),
        moderated_by: user?.id,
        moderation_feedback: feedback ? { comment: feedback } : null,
        status: status === 'approved' ? 'disponible' : 'en_attente'  // ← Valeurs en français
        };

        const { error } = await supabase
        .from('equipments')
        .update(updates)
        .eq('id', id);

        if (error) throw error;
        await loadEquipments();
    } catch (error) {
        console.error('Error updating equipment:', error);
        throw error;
    }
    };

  useEffect(() => {
    loadEquipments();
  }, []);

  return { equipments, loading, refresh: loadEquipments, updateEquipment };
}