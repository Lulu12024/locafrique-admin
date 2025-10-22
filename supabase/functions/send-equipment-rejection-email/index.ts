// ========================================
// Fichier: supabase/functions/send-equipment-rejection-email/index.ts
// Fonction Edge pour envoyer un email quand un équipement est rejeté
// ========================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Envoi email rejet équipement');

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { equipment_id, rejection_reason } = await req.json();

    // Récupérer les données de l'équipement et du propriétaire
    const { data: equipment, error } = await supabaseService
      .from('equipments')
      .select(`
        *,
        owner:profiles!equipments_owner_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', equipment_id)
      .single();

    if (error || !equipment) {
      console.error('❌ Erreur récupération équipement:', error);
      throw new Error(`Équipement non trouvé: ${error?.message}`);
    }

    console.log('✅ Équipement trouvé:', {
      title: equipment.title,
      owner: equipment.owner.email
    });

    // 🔔 CRÉER LA NOTIFICATION
    const { error: notifError } = await supabaseService
      .from('notifications')
      .insert({
        user_id: equipment.owner.id,
        type: 'equipment_rejected',
        title: 'Équipement rejeté',
        message: `Votre équipement "${equipment.title}" a été rejeté. Raison: ${rejection_reason}`,
        read: false
      });

    if (notifError) {
      console.error('⚠️ Erreur création notification:', notifError);
    } else {
      console.log('✅ Notification créée avec succès');
    }

    const ownerFirstName = equipment.owner.first_name || 'Propriétaire';
    const equipmentTitle = equipment.title;

    // Email HTML au propriétaire
    const emailHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
</head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;background-color:#f5f5f5;">
<div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);">

<div style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#ffffff;padding:40px 30px;text-align:center;">
<h1 style="margin:0;font-size:28px;font-weight:700;">❌ Équipement rejeté</h1>
<p style="margin:10px 0 0 0;font-size:16px;">Action requise sur votre annonce</p>
</div>

<div style="padding:30px;">
<p style="font-size:18px;">Bonjour <strong>${ownerFirstName}</strong>,</p>
<p>Nous vous informons que votre équipement <strong>"${equipmentTitle}"</strong> a été rejeté par notre équipe de modération.</p>

<div style="background-color:#fef2f2;padding:25px;margin:25px 0;border-radius:10px;border-left:5px solid #ef4444;">
<h3 style="margin:0 0 15px 0;color:#dc2626;font-size:20px;">📋 Raison du rejet</h3>
<p style="margin:0;color:#991b1b;font-size:16px;font-weight:600;">${rejection_reason}</p>
</div>

<div style="background-color:#f0fdf4;padding:25px;margin:25px 0;border-radius:10px;border-left:5px solid #22c55e;">
<h3 style="margin:0 0 15px 0;color:#16a34a;font-size:18px;">✅ Que faire maintenant ?</h3>
<ul style="margin:0;padding-left:20px;color:#166534;">
<li style="margin-bottom:10px;">Vérifiez et corrigez les informations de votre annonce</li>
<li style="margin-bottom:10px;">Assurez-vous que les photos sont de bonne qualité</li>
<li style="margin-bottom:10px;">Vérifiez que la description est claire et complète</li>
<li style="margin-bottom:10px;">Soumettez à nouveau votre équipement</li>
</ul>
</div>

<div style="background-color:#dbeafe;padding:20px;margin:25px 0;border-radius:8px;border-left:5px solid #3b82f6;">
<h4 style="margin:0 0 10px 0;color:#1e40af;">💡 Conseils pour une approbation rapide</h4>
<p style="margin:0;color:#1e3a8a;font-size:14px;">
- Utilisez des photos nettes et bien éclairées<br>
- Décrivez précisément l'état de l'équipement<br>
- Indiquez les conditions de location clairement<br>
- Assurez-vous que le prix est cohérent avec le marché
</p>
</div>

<p style="margin-top:25px;">Si vous avez des questions sur ce rejet, n'hésitez pas à nous contacter.</p>


</div>

<div style="text-align:center;padding:25px;color:#6b7280;font-size:13px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
<p style="margin:5px 0;"><strong>3W-LOC</strong> - Plateforme de location de matériel</p>
<p style="margin:5px 0;">© 2025 3W-LOC. Tous droits réservés.</p>
</div>

</div>
</body>
</html>`;

    // Configuration Gmail
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      throw new Error("Gmail non configuré");
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    await client.send({
      from: gmailUser,
      to: equipment.owner.email,
      subject: `❌ Votre équipement "${equipmentTitle}" a été rejeté`,
      html: emailHTML,
    });

    await client.close();

    console.log('✅ Email envoyé avec succès');

    return new Response(
      JSON.stringify({ success: true, message: "Email envoyé" }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }}
    );

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});