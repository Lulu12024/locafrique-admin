// ========================================
// Fichier: supabase/functions/send-equipment-approval-email/index.ts
// SOLUTION OPTIMALE: Encodage base64 du contenu HTML
// ========================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Envoi email approbation équipement');

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { equipment_id } = await req.json();

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
        type: 'equipment_approved',
        title: 'Équipement approuvé',
        message: `Félicitations ! Votre équipement "${equipment.title}" a été approuvé et est maintenant visible sur la plateforme.`,
        equipment_id: equipment_id,
        read: false
      });

    if (notifError) {
      console.error('⚠️ Erreur création notification:', notifError);
    } else {
      console.log('✅ Notification créée avec succès');
    }

    const ownerFirstName = equipment.owner.first_name || 'Propriétaire';
    const equipmentTitle = equipment.title;

    // Email HTML au propriétaire (IDENTIQUE AU MAIL DE REJET)
    const emailHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
</head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;background-color:#f5f5f5;">
<div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);">

<div style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;padding:40px 30px;text-align:center;">
<h1 style="margin:0;font-size:28px;font-weight:700;">✅ Équipement approuvé !</h1>
<p style="margin:10px 0 0 0;font-size:16px;">Votre annonce est maintenant en ligne</p>
</div>

<div style="padding:30px;">
<p style="font-size:18px;">Bonjour <strong>${ownerFirstName}</strong>,</p>
<p>Excellente nouvelle ! Votre équipement <strong>"${equipmentTitle}"</strong> a été approuvé par notre équipe et est maintenant visible sur la plateforme 3W-LOC ! 🎉</p>

<div style="background-color:#f0fdf4;padding:25px;margin:25px 0;border-radius:10px;border-left:5px solid #10b981;">
<h3 style="margin:0 0 20px 0;color:#059669;font-size:20px;">📋 Informations de votre annonce</h3>

<table style="width:100%;border-collapse:collapse;">
<tr style="border-bottom:1px solid #d1fae5;">
<td style="padding:12px 0;color:#6b7280;font-size:14px;">📦 Équipement</td>
<td style="padding:12px 0;text-align:right;font-weight:600;color:#111827;">${equipmentTitle}</td>
</tr>
<tr style="border-bottom:1px solid #d1fae5;">
<td style="padding:12px 0;color:#6b7280;font-size:14px;">💰 Prix journalier</td>
<td style="padding:12px 0;text-align:right;font-weight:700;color:#10b981;font-size:18px;">${equipment.daily_price.toLocaleString()} FCFA</td>
</tr>
<tr style="border-bottom:1px solid #d1fae5;">
<td style="padding:12px 0;color:#6b7280;font-size:14px;">📍 Localisation</td>
<td style="padding:12px 0;text-align:right;font-weight:600;color:#111827;">${equipment.city}, ${equipment.country}</td>
</tr>
<tr>
<td style="padding:12px 0;color:#6b7280;font-size:14px;">📂 Catégorie</td>
<td style="padding:12px 0;text-align:right;font-weight:600;color:#111827;text-transform:capitalize;">${equipment.category}</td>
</tr>
</table>
</div>

<div style="background-color:#fef3c7;padding:30px;margin:25px 0;border-radius:10px;text-align:center;border:2px solid #f59e0b;">
<div style="font-size:40px;margin-bottom:15px;">🚀</div>
<h2 style="margin:0 0 10px 0;color:#92400e;font-size:22px;">Prochaines étapes</h2>
<p style="margin:0 0 20px 0;color:#78350f;font-size:15px;">
Votre équipement est maintenant visible par des milliers d'utilisateurs. Assurez-vous de :
</p>
<ul style="text-align:left;color:#78350f;line-height:1.8;">
<li>Répondre rapidement aux demandes de location</li>
<li>Maintenir votre équipement en bon état</li>
<li>Respecter les conditions de location</li>
<li>Fournir un service de qualité</li>
</ul>
</div>

<div style="background-color:#dbeafe;padding:20px;margin:25px 0;border-radius:8px;border-left:5px solid #3b82f6;">
<h4 style="margin:0 0 10px 0;color:#1e40af;">💡 Conseil pour maximiser vos locations</h4>
<p style="margin:0;color:#1e3a8a;">Les équipements avec des photos de qualité et des descriptions détaillées reçoivent 3x plus de demandes de location !</p>
</div>

<p style="margin-top:25px;">Merci de faire confiance à 3W-LOC pour partager votre équipement ! 🙏</p>

<div style="text-align:center;margin-top:30px;">
<a href="https://locafrique.onrender.com/my-equipment" style="display:inline-block;background-color:#10b981;color:#ffffff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:600;">Voir mon équipement</a>
</div>

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

    // 🔧 SOLUTION: Utiliser la même structure que le mail de rejet
    await client.send({
      from: gmailUser,
      to: equipment.owner.email,
      subject: `✅ Votre équipement "${equipmentTitle}" est approuvé !`,
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