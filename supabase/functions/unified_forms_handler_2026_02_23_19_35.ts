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

    console.log('Form submission:', { formType, formData })

    // Handle different form types
    switch (formType) {
      case 'popup':
        return await handleContactPopup(supabaseClient, formData)
      case 'newsletter':
      case 'newsletter_update':
        return await handleNewsletter(supabaseClient, formData, formType)
      case 'risk_profile':
        return await handleRiskProfile(supabaseClient, formData)
      default:
        return await handleContactPopup(supabaseClient, formData)
    }

  } catch (error) {
    console.error('Form submission error:', error)
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

async function handleContactPopup(supabaseClient: any, formData: any): Promise<Response> {
  try {
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
        form_type: 'popup',
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

    // Send emails
    await sendEmails(emailSubject, emailBody, formData.email, formData.fullName, formData.buttonType)

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
    console.error('Contact popup error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error al procesar solicitud de contacto' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleNewsletter(supabaseClient: any, formData: any, formType: string): Promise<Response> {
  try {
    // Validate required fields
    if (!formData || !formData.email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email requerido' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const normalizedEmail = formData.email.toLowerCase().trim()

    // Check if subscription exists
    const { data: existingSubscription, error: checkError } = await supabaseClient
      .from('newsletter_subscriptions')
      .select('id, email')
      .eq('email', normalizedEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    let emailSubject = ''
    let emailBody = ''

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('newsletter_subscriptions')
        .update({
          name: formData.name || 'Usuario',
          phone: formData.phone || '',
          topics: formData.topics || [],
          source: formData.source || 'website',
          updated_at: new Date().toISOString(),
          is_active: true
        })
        .eq('email', normalizedEmail)

      if (updateError) throw updateError

      emailSubject = 'Suscripción Actualizada - Newsletter Pessaro Capital'
      emailBody = `
        <h2>¡Suscripción Actualizada!</h2>
        <p>Estimado/a ${formData.name || 'Usuario'},</p>
        <p>Su suscripción al newsletter de Pessaro Capital ha sido actualizada exitosamente.</p>
        <p><strong>Temas de interés:</strong> ${formData.topics?.join(', ') || 'Todos'}</p>
        <p>Recibirá nuestras últimas noticias financieras y análisis de mercado.</p>
        <hr>
        <p><em>Equipo Pessaro Capital</em></p>
      `
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseClient
        .from('newsletter_subscriptions')
        .insert({
          email: normalizedEmail,
          name: formData.name || 'Usuario',
          phone: formData.phone || '',
          topics: formData.topics || [],
          source: formData.source || 'website',
          is_active: true,
          subscribed_at: new Date().toISOString()
        })

      if (insertError) throw insertError

      emailSubject = '¡Bienvenido al Newsletter de Pessaro Capital!'
      emailBody = `
        <h2>¡Gracias por suscribirse!</h2>
        <p>Estimado/a ${formData.name || 'Usuario'},</p>
        <p>¡Bienvenido/a al newsletter de Pessaro Capital!</p>
        <p>Recibirá análisis exclusivos, noticias del mercado financiero y estrategias de inversión directamente en su bandeja de entrada.</p>
        <p><strong>Temas de interés:</strong> ${formData.topics?.join(', ') || 'Todos'}</p>
        <p>Para cancelar su suscripción en cualquier momento, responda a este email con "CANCELAR".</p>
        <hr>
        <p><em>Equipo Pessaro Capital</em></p>
      `
    }

    // Send confirmation email
    await sendEmails(emailSubject, emailBody, normalizedEmail, formData.name || 'Usuario', 'newsletter')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Suscripción procesada exitosamente' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Newsletter error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error al procesar suscripción' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleRiskProfile(supabaseClient: any, formData: any): Promise<Response> {
  try {
    // Send risk profile confirmation email
    const emailSubject = 'Perfil de Riesgo Completado - Pessaro Capital'
    const emailBody = `
      <h2>¡Perfil de Riesgo Completado!</h2>
      <p>Estimado/a ${formData.firstName} ${formData.lastName},</p>
      <p>Hemos recibido su perfil de riesgo de inversión.</p>
      <p><strong>Detalles:</strong></p>
      <ul>
        <li>Tolerancia al riesgo: ${formData.riskTolerance}</li>
        <li>Capital de inversión: ${formData.investmentCapital}</li>
        <li>Horizonte de inversión: ${formData.investmentHorizon}</li>
        <li>Experiencia: ${formData.tradingExperience}</li>
      </ul>
      <p>Nuestro equipo analizará su perfil y se pondrá en contacto con usted para ofrecerle las mejores opciones de inversión.</p>
      <hr>
      <p><em>Equipo Pessaro Capital</em></p>
    `

    await sendEmails(emailSubject, emailBody, formData.email, `${formData.firstName} ${formData.lastName}`, 'risk_profile')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Perfil de riesgo procesado exitosamente' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Risk profile error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error al procesar perfil de riesgo' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function sendEmails(subject: string, body: string, userEmail: string, userName: string, type: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found')
    return
  }

  try {
    // Send notification email to company
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: 'info@pessaro.cl',
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '')
      })
    })

    // Send confirmation email to user
    const confirmationBody = `
      <h2>¡Gracias por contactar a Pessaro Capital!</h2>
      <p>Estimado/a ${userName},</p>
      <p>Hemos recibido su ${type === 'newsletter' ? 'suscripción' : 'solicitud'} y ${type === 'newsletter' ? 'comenzará a recibir nuestro newsletter' : 'nos pondremos en contacto con usted en las próximas 24 horas'}.</p>
      <p><strong>Detalles:</strong></p>
      <ul>
        <li>Email: ${userEmail}</li>
        <li>Fecha: ${new Date().toLocaleDateString('es-CL')}</li>
        <li>Tipo: ${type}</li>
      </ul>
      ${type !== 'newsletter' ? '<p>Para consultas urgentes, puede contactarnos al +56 9 22 07 15 11</p>' : ''}
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
        to: userEmail,
        subject: `Confirmación - Pessaro Capital`,
        html: confirmationBody,
        text: confirmationBody.replace(/<[^>]*>/g, '')
      })
    })

  } catch (error) {
    console.error('Error sending emails:', error)
    // Don't throw error, just log it
  }
}