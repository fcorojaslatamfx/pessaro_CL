import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { formType, formData } = await req.json()

    console.log('Contact form submission:', { formType, formData })

    // Validate required fields
    if (!formData || !formData.fullName || !formData.email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Datos requeridos faltantes' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store contact in database
    const { data: contactData, error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile || '',
        investment_capital: formData.investmentCapital || 0,
        management_type: formData.managementType || '',
        comments: formData.comments || '',
        form_type: formType || 'popup',
        button_type: formData.buttonType || 'contact',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue with email sending even if DB fails
    }

    // Prepare email content based on form type
    let emailSubject = 'Nueva Solicitud de Contacto - Pessaro Capital'
    let emailBody = ''

    switch (formData.buttonType) {
      case 'account':
        emailSubject = 'Solicitud de Cuenta Real - Pessaro Capital'
        emailBody = `
          <h2>Nueva Solicitud de Cuenta Real</h2>
          <p><strong>Nombre:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.mobile || 'No proporcionado'}</p>
          <p><strong>Capital de Inversión:</strong> USD ${formData.investmentCapital || 'No especificado'}</p>
          <p><strong>Tipo de Gestión:</strong> ${formData.managementType || 'No especificado'}</p>
          <p><strong>Comentarios:</strong> ${formData.comments || 'Ninguno'}</p>
          <hr>
          <p><em>Solicitud enviada desde: Pessaro Capital - Popup de Cuenta Real</em></p>
        `
        break
      case 'demo':
        emailSubject = 'Solicitud de Cuenta Demo - Pessaro Capital'
        emailBody = `
          <h2>Nueva Solicitud de Cuenta Demo</h2>
          <p><strong>Nombre:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.mobile || 'No proporcionado'}</p>
          <p><strong>Comentarios:</strong> ${formData.comments || 'Ninguno'}</p>
          <hr>
          <p><em>Solicitud enviada desde: Pessaro Capital - Popup de Cuenta Demo</em></p>
        `
        break
      case 'guide':
        emailSubject = 'Solicitud de Guía de Trading - Pessaro Capital'
        emailBody = `
          <h2>Nueva Solicitud de Guía de Trading</h2>
          <p><strong>Nombre:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.mobile || 'No proporcionado'}</p>
          <p><strong>Comentarios:</strong> ${formData.comments || 'Ninguno'}</p>
          <hr>
          <p><em>Solicitud enviada desde: Pessaro Capital - Popup de Guía de Trading</em></p>
        `
        break
      default:
        emailBody = `
          <h2>Nueva Solicitud de Contacto</h2>
          <p><strong>Nombre:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.mobile || 'No proporcionado'}</p>
          <p><strong>Capital de Inversión:</strong> USD ${formData.investmentCapital || 'No especificado'}</p>
          <p><strong>Tipo de Gestión:</strong> ${formData.managementType || 'No especificado'}</p>
          <p><strong>Comentarios:</strong> ${formData.comments || 'Ninguno'}</p>
          <hr>
          <p><em>Solicitud enviada desde: Pessaro Capital</em></p>
        `
    }

    // Send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuración de email no disponible' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: 'info@pessaro.cl', // Email de destino
        subject: emailSubject,
        html: emailBody,
        text: emailBody.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', emailResponse.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error al enviar email de notificación' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult.id)

    // Send confirmation email to user
    const confirmationEmailBody = `
      <h2>¡Gracias por contactar a Pessaro Capital!</h2>
      <p>Estimado/a ${formData.fullName},</p>
      <p>Hemos recibido su solicitud y nos pondremos en contacto con usted en las próximas 24 horas.</p>
      <p><strong>Detalles de su solicitud:</strong></p>
      <ul>
        <li>Tipo: ${formData.buttonType === 'account' ? 'Cuenta Real' : formData.buttonType === 'demo' ? 'Cuenta Demo' : formData.buttonType === 'guide' ? 'Guía de Trading' : 'Contacto General'}</li>
        <li>Email: ${formData.email}</li>
        <li>Fecha: ${new Date().toLocaleDateString('es-CL')}</li>
      </ul>
      <p>Para consultas urgentes, puede contactarnos al +56 9 22 07 15 11</p>
      <hr>
      <p><em>Atentamente,<br>Equipo Pessaro Capital</em></p>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: formData.email,
        subject: 'Confirmación de Solicitud - Pessaro Capital',
        html: confirmationEmailBody,
        text: confirmationEmailBody.replace(/<[^>]*>/g, '')
      })
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Solicitud enviada exitosamente',
        contact_id: contactData?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})