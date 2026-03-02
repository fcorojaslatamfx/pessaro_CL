import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

// Helper function to determine from email
function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) {
    return `send@${domain}`;
  }
  return 'onboarding@resend.dev'; // Default fallback
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== RESEND API TEST ===')
    
    // Check if RESEND_API_KEY exists
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    console.log('RESEND_API_KEY exists:', !!resendApiKey)
    console.log('RESEND_API_KEY length:', resendApiKey?.length || 0)
    
    // Check if RESEND_DOMAIN exists
    const resendDomain = Deno.env.get('RESEND_DOMAIN')
    console.log('RESEND_DOMAIN exists:', !!resendDomain)
    console.log('RESEND_DOMAIN value:', resendDomain || 'Not set')
    
    // Determine from email
    const fromEmail = getFromEmail()
    console.log('From email will be:', fromEmail)
    
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RESEND_API_KEY not configured',
          details: {
            resend_api_key_exists: false,
            resend_domain_exists: !!resendDomain,
            from_email: fromEmail
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get test email from request body
    const { testEmail } = await req.json()
    const targetEmail = testEmail || 'test@pessaro.cl'
    
    console.log('Sending test email to:', targetEmail)

    // Test Resend API call
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: targetEmail,
        subject: 'Test de Integración Resend - Pessaro Capital',
        html: `
          <h2>✅ Test de Integración Resend Exitoso</h2>
          <p>Este es un email de prueba para verificar que la integración con Resend API está funcionando correctamente.</p>
          <p><strong>Detalles de la configuración:</strong></p>
          <ul>
            <li>From Email: ${fromEmail}</li>
            <li>API Key configurada: ✅</li>
            <li>Dominio personalizado: ${resendDomain ? '✅ ' + resendDomain : '❌ Usando dominio por defecto'}</li>
            <li>Fecha de prueba: ${new Date().toLocaleString('es-CL')}</li>
          </ul>
          <p>Si recibió este email, la integración está funcionando perfectamente.</p>
          <hr>
          <p><em>Pessaro Capital - Sistema de Emails</em></p>
        `,
        text: `
          Test de Integración Resend Exitoso
          
          Este es un email de prueba para verificar que la integración con Resend API está funcionando correctamente.
          
          Detalles de la configuración:
          - From Email: ${fromEmail}
          - API Key configurada: Sí
          - Dominio personalizado: ${resendDomain || 'Usando dominio por defecto'}
          - Fecha de prueba: ${new Date().toLocaleString('es-CL')}
          
          Si recibió este email, la integración está funcionando perfectamente.
          
          Pessaro Capital - Sistema de Emails
        `
      })
    })

    console.log('Resend API response status:', emailResponse.status)
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error en Resend API',
          details: {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error_response: errorText,
            resend_api_key_exists: true,
            resend_domain_exists: !!resendDomain,
            from_email: fromEmail
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de prueba enviado exitosamente',
        details: {
          email_id: emailResult.id,
          to_email: targetEmail,
          from_email: fromEmail,
          resend_api_key_exists: true,
          resend_domain_exists: !!resendDomain,
          resend_domain_value: resendDomain || 'onboarding@resend.dev (default)',
          api_response: emailResult
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Test error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno durante la prueba',
        details: {
          error_message: error.message,
          error_stack: error.stack
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})