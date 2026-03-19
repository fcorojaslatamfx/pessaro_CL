// supabase/functions/didit-webhook/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Recibe eventos de Didit y actualiza la tabla kyc_verifications
// URL a configurar en Didit Console:
//   https://ldlflxujrjihiybrcree.supabase.co/functions/v1/didit-webhook
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Verificar webhook secret ──────────────────────────────────────────
    const webhookSecret = req.headers.get('x-webhook-secret') ||
                          req.headers.get('authorization')?.replace('Bearer ', '');

    const expectedSecret = Deno.env.get('DIDIT_WEBHOOK_SECRET');

    if (!expectedSecret || webhookSecret !== expectedSecret) {
      console.error('[didit-webhook] Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. Parsear payload ───────────────────────────────────────────────────
    const payload = await req.json();
    console.log('[didit-webhook] Received:', JSON.stringify(payload));

    const { session_id, status, vendor_data } = payload;

    if (!session_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing session_id or status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 3. Conectar a Supabase con service role ──────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ── 4. Upsert en kyc_verifications ──────────────────────────────────────
    // vendor_data puede traer el user_id si se configuró al crear la sesión
    const { error } = await supabase
      .from('kyc_verifications')
      .upsert({
        didit_session_id: session_id,
        status,
        user_id:    vendor_data?.user_id ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'didit_session_id' });

    if (error) {
      console.error('[didit-webhook] DB error:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[didit-webhook] Updated session ${session_id} → ${status}`);

    return new Response(
      JSON.stringify({ success: true, session_id, status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[didit-webhook] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
