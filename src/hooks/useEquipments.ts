// src/hooks/useEquipments.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Equipment {
  id: string;
  title: string;
  description: string;
  category: string;
  daily_price: number;
  deposit_amount: number;
  city: string;
  country: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  status: string;
  owner_id: string;
  owner_first_name?: string;
  owner_last_name?: string;
  created_at: string;
  rejection_reason?: string;
  images?: Array<{ image_url: string; is_primary: boolean }>;
}

export function useEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipments')
        .select(`
          *,
          owner:profiles!equipments_owner_id_fkey(
            first_name,
            last_name
          ),
          images:equipment_images(
            image_url,
            is_primary
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        daily_price: e.daily_price,
        deposit_amount: e.deposit_amount,
        city: e.city,
        country: e.country,
        moderation_status: e.moderation_status,
        status: e.status,
        owner_id: e.owner_id,
        owner_first_name: e.owner?.first_name,
        owner_last_name: e.owner?.last_name,
        created_at: e.created_at,
        rejection_reason: e.rejection_reason,
        images: e.images || []
      }));

      setEquipments(formatted);
    } catch (error: any) {
      console.error('Erreur lors du chargement des équipements:', error);
      alert('Erreur: Impossible de charger les équipements');
    } finally {
      setLoading(false);
    }
  };

  const updateEquipment = async (
    equipmentId: string,
    newStatus: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    try {
      // 1. Mettre à jour le statut de modération
      const updateData: any = {
        moderation_status: newStatus,
        moderated_at: new Date().toISOString()
      };

      // Si approuvé, changer le status à "disponible"
      if (newStatus === 'approved') {
        updateData.status = 'disponible';
        updateData.approved_at = new Date().toISOString();
      }

      // Si rejeté, changer le status à "retire"
      if (newStatus === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
        updateData.rejected_at = new Date().toISOString();
        updateData.status = 'retire';
      }

      const { error: updateError } = await supabase
        .from('equipments')
        .update(updateData)
        .eq('id', equipmentId);

      if (updateError) throw updateError;

      // 2. Envoyer l'email (approbation OU rejet)
      if (newStatus === 'approved') {
        try {
          console.log('📧 Envoi email approbation...');
          const { error: emailError } = await supabase.functions.invoke(
            'send-equipment-approval-email',
            {
              body: {
                equipment_id: equipmentId
              }
            }
          );

          if (emailError) {
            console.error('⚠️ Erreur envoi email approbation:', emailError);
          } else {
            console.log('✅ Email approbation envoyé');
          }
        } catch (emailErr) {
          console.error('⚠️ Erreur fonction email approbation:', emailErr);
        }
      }

      if (newStatus === 'rejected' && rejectionReason) {
        try {
          console.log('📧 Envoi email rejet...');
          const { error: emailError } = await supabase.functions.invoke(
            'send-equipment-rejection-email',
            {
              body: {
                equipment_id: equipmentId,
                rejection_reason: rejectionReason
              }
            }
          );

          if (emailError) {
            console.error('⚠️ Erreur envoi email rejet:', emailError);
          } else {
            console.log('✅ Email rejet envoyé');
          }
        } catch (emailErr) {
          console.error('⚠️ Erreur fonction email rejet:', emailErr);
        }
      }

      // 3. Rafraîchir la liste
      await fetchEquipments();

      alert(newStatus === 'approved' 
        ? '✅ Équipement approuvé ! Email envoyé au propriétaire' 
        : '✅ Équipement rejeté, email envoyé au propriétaire'
      );

    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      alert('❌ Erreur: Impossible de mettre à jour l\'équipement');
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  return {
    equipments,
    loading,
    updateEquipment,
    refetch: fetchEquipments
  };
}