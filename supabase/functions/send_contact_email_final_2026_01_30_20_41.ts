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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestBody = await req.json()
    const { formType, formData, type, ...directData } = requestBody
    
    if (!formType || !formData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let emailSubject = ''
    let emailBody = ''
    const recipientEmail = 'fcorojas.fx@gmail.com'

    // Generate email content based on form type
    if (formType === 'contact') {
      emailSubject = `Nuevo mensaje de contacto: ${formData.subject}`
      emailBody = `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Asunto:</strong> ${formData.subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Enviado desde: Pessaro Capital - Formulario de Contacto</small></p>
        <p><small>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Santiago' })}</small></p>
      `
    } else if (formType === 'popup') {
      const buttonTypeLabels = {
        'account': 'Abrir Cuenta',
        'demo': 'Prueba Demo',
        'start': 'Empezar Ahora',
        'guide': 'Guía de Trading'
      }
      
      const buttonLabel = buttonTypeLabels[formData.buttonType] || 'Contacto'
      emailSubject = `Nueva solicitud: ${buttonLabel} - ${formData.fullName}`
      
      emailBody = `
        <h2>Nueva solicitud desde botón de acción: ${buttonLabel}</h2>
        <p><strong>Nombre Completo:</strong> ${formData.fullName}</p>
        <p><strong>Teléfono Móvil:</strong> ${formData.mobile}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Capital a Invertir:</strong> USD ${formData.investmentCapital.toLocaleString()}</p>
        <p><strong>Tipo de Gestión:</strong> ${formData.managementType}</p>
        ${formData.comments ? `<p><strong>Comentarios:</strong> ${formData.comments}</p>` : ''}
        <hr>
        <p><strong>Tipo de Solicitud:</strong> ${buttonLabel}</p>
        <p><small>Enviado desde: Pessaro Capital - Popup de Acción</small></p>
        <p><small>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Santiago' })}</small></p>
      `
    } else if (formType === 'education_assessment') {
      const interestLabels = {
        'forex': 'Mercado de Divisas (Forex)',
        'stocks': 'Acciones',
        'indices': 'Índices Bursátiles',
        'crypto': 'Criptomonedas',
        'etf': 'ETFs'
      }
      
      const levelLabels = {
        'basico': 'Básico',
        'principiante-intermedio': 'Principiante-Intermedio',
        'intermedio': 'Intermedio',
        'intermedio-avanzado': 'Intermedio-Avanzado',
        'avanzado': 'Avanzado'
      }
      
      const interestsList = formData.interests.map(interest => interestLabels[interest] || interest).join(', ')
      const levelLabel = levelLabels[formData.knowledgeLevel] || formData.knowledgeLevel
      
      emailSubject = `Nueva Evaluación Educativa: ${formData.fullName} - ${formData.courseType}`
      
      emailBody = `
        <h2>Nueva Evaluación de Conocimientos Educativos</h2>
        <h3>Información Personal</h3>
        <p><strong>Nombre Completo:</strong> ${formData.fullName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Teléfono:</strong> ${formData.phone}</p>
        
        <h3>Intereses y Conocimientos</h3>
        <p><strong>Áreas de Interés:</strong> ${interestsList}</p>
        <p><strong>Nivel de Conocimientos:</strong> ${levelLabel}</p>
        
        <h3>Capital y Objetivos</h3>
        <p><strong>Capital Disponible:</strong> USD ${formData.investmentCapital.toLocaleString()}</p>
        ${formData.learningGoals ? `<p><strong>Objetivos de Aprendizaje:</strong> ${formData.learningGoals}</p>` : ''}
        
        <hr>
        <p><strong>Tipo de Curso:</strong> ${formData.courseType}</p>
        <p><small>Enviado desde: Pessaro Capital - Evaluación Educativa</small></p>
        <p><small>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Santiago' })}</small></p>
      `
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid form type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: recipientEmail,
        subject: emailSubject,
        html: emailBody,
        text: emailBody.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log('Email sent successfully:', result.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})