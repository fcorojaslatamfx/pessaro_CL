// supabase/functions/didit-webhook/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Recibe eventos de Didit v3 y actualiza la tabla kyc_verifications
// Didit envía X-Signature-Simple para verificar autenticidad
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature-v2, x-signature-simple, x-timestamp, x-didit-test-webhook',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Verificar firma de Didit ──────────────────────────────────────────
    const signatureSimple = req.headers.get('x-signature-simple');
    const webhookSecret   = Deno.env.get('DIDIT_WEBHOOK_SECRET') ?? '';

    // Leer body como text para verificar firma
    const bodyText = await req.text();

    // Verificar HMAC-SHA256
    const encoder  = new TextEncoder();
    const keyData  = encoder.encode(webhookSecret);
    const msgData  = encoder.encode(bodyText);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Permitir test webhooks de Didit (X-Didit-Test-Webhook: true)
    const isTestWebhook = req.headers.get('x-didit-test-webhook') === 'true';

    if (!isTestWebhook && signatureSimple !== expectedSignature) {
      console.error('[didit-webhook] Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. Parsear payload ───────────────────────────────────────────────────
    const payload = JSON.parse(bodyText);
    console.log('[didit-webhook] Received:', JSON.stringify(payload));

    const session_id  = payload.session_id  || payload.decision?.session_id;
    const status      = payload.status      || payload.decision?.status;
    const vendor_data = payload.vendor_data;
    const workflow_id = payload.workflow_id || payload.decision?.workflow_id;

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
    const { error } = await supabase
      .from('kyc_verifications')
      .upsert({
        didit_session_id: session_id,
        status,
        user_id:     vendor_data?.user_id ?? null,
        workflow_id: workflow_id ?? null,
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'didit_session_id' });

    if (error) {
      console.error('[didit-webhook] DB error:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[didit-webhook] ✅ Updated session ${session_id} → ${status}`);

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
