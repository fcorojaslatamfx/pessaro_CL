import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    const payload  = JSON.parse(bodyText);
    console.log('[didit-webhook] Received:', JSON.stringify(payload));

    const session_id  = payload.session_id  || payload.decision?.session_id;
    const status      = payload.status      || payload.decision?.status;
    const workflow_id = payload.workflow_id || payload.decision?.workflow_id;

    if (!session_id || !status) {
      return new Response(JSON.stringify({ error: 'Missing fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error } = await supabase
      .from('kyc_verifications')
      .upsert({
        didit_session_id: session_id,
        status,
        workflow_id: workflow_id ?? null,
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'didit_session_id' });

    if (error) {
      console.error('[didit-webhook] DB error:', error.message);
      return new Response(JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, session_id, status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[didit-webhook] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
