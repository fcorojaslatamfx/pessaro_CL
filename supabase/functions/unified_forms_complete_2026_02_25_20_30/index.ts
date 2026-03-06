import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) return `send@${domain}`;
  return 'onboarding@resend.dev';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { formType, formData } = await req.json()
    console.log('Processing form:', formType, 'with data:', formData)

    let response: Response

    switch (formType) {
      case 'popup':
        response = await handleContactPopup(supabaseClient, formData)
        break
      case 'newsletter':
        response = await handleNewsletter(supabaseClient, formData)
        break
      case 'otp_verification':
        response = await handleOtpVerification(formData)
        break
      case 'risk_profile':
        response = await handleRiskProfile(supabaseClient, formData)
        break
      case 'work_with_us':
        response = await handleWorkWithUs(supabaseClient, formData)
        break
      case 'educational_advisor':
        response = await handleEducationalAdvisor(supabaseClient, formData)
        break
      case 'education_assessment':
        response = await handleEducationAssessment(supabaseClient, formData)
        break
      default:
        response = new Response(
          JSON.stringify({ success: false, error: 'Tipo de formulario no soportado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return response

  } catch (error) {
    console.error('Form submission error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// OTP VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
async function handleOtpVerification(formData: any): Promise<Response> {
  try {
    if (!formData?.email || !formData?.otpCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email y código OTP requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found')
      return new Response(
        JSON.stringify({ success: false, error: 'Configuración de email no disponible' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <div style="background: linear-gradient(135deg, #1e3a8a, #4c1d95); padding: 28px 32px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Pessaro Capital</h1>
            <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Verificación de identidad</p>
          </div>

          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">
              Hola <strong>${formData.name || 'Usuario'}</strong>,
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
              Usa el siguiente código para completar tu suscripción al Newsletter de Pessaro Capital.
              El código es válido por <strong>10 minutos</strong>.
            </p>

            <div style="text-align: center; margin: 0 0 28px;">
              <div style="display: inline-block; background: #f0f4ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px 40px;">
                <p style="margin: 0 0 4px; font-size: 11px; color: #6b7280; letter-spacing: 2px; text-transform: uppercase;">Tu código</p>
                <p style="margin: 0; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1e3a8a;">${formData.otpCode}</p>
              </div>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 24px;">
              Si no solicitaste este código, ignora este mensaje.
            </p>

            ${formData.topics && formData.topics.length > 0 ? `
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Temas seleccionados</p>
                <p style="margin: 0; font-size: 13px; color: #374151;">${formData.topics.join(' · ')}</p>
              </div>
            ` : ''}
          </div>

          <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center;">
              © 2026 Pessaro Capital ·
              <a href="https://pessaro.cl" style="color: #3b82f6; text-decoration: none;">pessaro.cl</a> ·
              info@pessaro.cl
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: formData.email,
        subject: `${formData.otpCode} es tu código de verificación — Pessaro Capital`,
        html: emailBody,
        text: `Tu código de verificación: ${formData.otpCode}. Expira en 10 minutos.`
      })
    })

    const resendBody = await resendRes.json()
    console.log('Resend OTP response:', JSON.stringify(resendBody))

    if (!resendRes.ok) {
      console.error('Resend OTP error:', JSON.stringify(resendBody))
      return new Response(
        JSON.stringify({ success: false, error: `Error Resend: ${resendBody?.message || resendRes.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Código OTP enviado exitosamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('OTP verification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al enviar el código de verificación' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT POPUP
// ─────────────────────────────────────────────────────────────────────────────
async function handleContactPopup(supabaseClient: any, formData: any): Promise<Response> {
  try {
    if (!formData || !formData.fullName || !formData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Datos requeridos faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: dbError } = await supabaseClient
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

    if (dbError) console.error('Database error:', dbError)

    const buttonTypeMap: Record<string, string> = {
      'account': 'Abrir Cuenta Real',
      'demo': 'Cuenta Demo',
      'guide': 'Guía de Trading',
      'start': 'Comenzar a Invertir'
    }
    const buttonLabel = buttonTypeMap[formData.buttonType] || 'Contacto General'
    const subject = `Nueva Solicitud: ${buttonLabel} - Pessaro Capital`
    const emailBody = `
      <h2>📋 Nueva Solicitud de Cliente - ${buttonLabel}</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <ul>
        <li><strong>Nombre Completo:</strong> ${formData.fullName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Teléfono:</strong> ${formData.mobile || 'No proporcionado'}</li>
        <li><strong>Capital de Inversión:</strong> USD ${formData.investmentCapital?.toLocaleString() || 'No especificado'}</li>
        <li><strong>Tipo de Gestión:</strong> ${formData.managementType || 'No especificado'}</li>
        <li><strong>Tipo de Solicitud:</strong> ${buttonLabel}</li>
      </ul>
      ${formData.comments ? `<p><strong>Comentarios:</strong></p><p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.comments}</p>` : ''}
      <hr>
      <p><em>Generado automáticamente desde pessaro.cl</em></p>
    `

    await sendEmails(subject, emailBody, formData.email, formData.fullName, buttonLabel)

    return new Response(
      JSON.stringify({ success: true, message: 'Formulario enviado exitosamente', type: 'contact_popup' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Contact popup error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK WITH US
// ─────────────────────────────────────────────────────────────────────────────
async function handleWorkWithUs(supabaseClient: any, formData: any): Promise<Response> {
  try {
    if (!formData || !formData.fullName || !formData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Datos requeridos faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.phone || '',
        comments: JSON.stringify({
          linkedinProfile: formData.linkedinProfile,
          instagramProfile: formData.instagramProfile,
          workExperience: formData.workExperience,
          investmentKnowledge: formData.investmentKnowledge,
          tradingExperience: formData.tradingExperience,
          financialEducation: formData.financialEducation,
          careerGoals: formData.careerGoals,
          whyJoinUs: formData.whyJoinUs
        }),
        form_type: 'work_with_us',
        submitted_at: new Date().toISOString()
      })

    if (dbError) console.error('Database error:', dbError)

    const subject = 'Nueva Aplicación: Trabaja con Nosotros - Pessaro Capital'
    const emailBody = `
      <h2>💼 Nueva Aplicación de Empleo - Pessaro Capital</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <ul>
        <li><strong>Nombre:</strong> ${formData.fullName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</li>
        <li><strong>LinkedIn:</strong> ${formData.linkedinProfile || 'No proporcionado'}</li>
        <li><strong>Instagram:</strong> ${formData.instagramProfile || 'No proporcionado'}</li>
      </ul>
      <p><strong>Experiencia Laboral:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.workExperience}</p>
      <p><strong>Conocimiento en Inversiones:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.investmentKnowledge}</p>
      <p><strong>Experiencia en Trading:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.tradingExperience}</p>
      <p><strong>Educación Financiera:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.financialEducation}</p>
      <p><strong>Objetivos Profesionales:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.careerGoals}</p>
      <p><strong>¿Por qué quiere unirse?:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.whyJoinUs}</p>
      <hr>
      <p><em>Aplicación enviada desde pessaro.cl - "Trabaja con Nosotros"</em></p>
    `

    await sendEmails(subject, emailBody, formData.email, formData.fullName, 'aplicación de empleo')

    return new Response(
      JSON.stringify({ success: true, message: 'Aplicación enviada exitosamente', type: 'work_with_us' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Work with us error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar la aplicación' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATIONAL ADVISOR
// ─────────────────────────────────────────────────────────────────────────────
async function handleEducationalAdvisor(supabaseClient: any, formData: any): Promise<Response> {
  try {
    if (!formData || !formData.fullName || !formData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Datos requeridos faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.phone || '',
        comments: JSON.stringify({
          experience: formData.experience,
          topics: formData.topics,
          specificQuestions: formData.specificQuestions
        }),
        form_type: 'educational_advisor',
        submitted_at: new Date().toISOString()
      })

    if (dbError) console.error('Database error:', dbError)

    const subject = 'Nueva Solicitud: Asesor Educativo - Pessaro Capital'
    const emailBody = `
      <h2>🎓 Nueva Solicitud de Asesor Educativo</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <ul>
        <li><strong>Nombre:</strong> ${formData.fullName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</li>
        <li><strong>Nivel de Experiencia:</strong> ${formData.experience}</li>
      </ul>
      <p><strong>Temas de Interés:</strong></p>
      <ul>${formData.topics?.map((t: string) => `<li>${t}</li>`).join('') || '<li>No especificados</li>'}</ul>
      ${formData.specificQuestions ? `<p><strong>Preguntas Específicas:</strong></p><p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.specificQuestions}</p>` : ''}
      <hr>
      <p><em>Solicitud enviada desde pessaro.cl - Página de Educación</em></p>
    `

    await sendEmails(subject, emailBody, formData.email, formData.fullName, 'asesoría educativa')

    return new Response(
      JSON.stringify({ success: true, message: 'Solicitud de asesor educativo enviada', type: 'educational_advisor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Educational advisor error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION ASSESSMENT
// ─────────────────────────────────────────────────────────────────────────────
async function handleEducationAssessment(supabaseClient: any, formData: any): Promise<Response> {
  try {
    if (!formData || !formData.fullName || !formData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Datos requeridos faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.phone || '',
        comments: JSON.stringify({
          courseType: formData.courseType,
          currentLevel: formData.currentLevel,
          interestedTopics: formData.interestedTopics,
          learningGoals: formData.learningGoals,
          timeCommitment: formData.timeCommitment,
          preferredFormat: formData.preferredFormat,
          specificQuestions: formData.specificQuestions
        }),
        form_type: 'education_assessment',
        submitted_at: new Date().toISOString()
      })

    if (dbError) console.error('Database error:', dbError)

    const subject = 'Nueva Evaluación Educativa - Pessaro Capital'
    const emailBody = `
      <h2>📊 Nueva Evaluación Educativa Completada</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <ul>
        <li><strong>Nombre:</strong> ${formData.fullName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</li>
        <li><strong>Tipo de Curso:</strong> ${formData.courseType || 'General'}</li>
        <li><strong>Nivel Actual:</strong> ${formData.currentLevel}</li>
        <li><strong>Compromiso de Tiempo:</strong> ${formData.timeCommitment}</li>
        <li><strong>Formato Preferido:</strong> ${formData.preferredFormat}</li>
      </ul>
      <p><strong>Temas de Interés:</strong></p>
      <ul>${formData.interestedTopics?.map((t: string) => `<li>${t}</li>`).join('') || '<li>No especificados</li>'}</ul>
      <p><strong>Objetivos de Aprendizaje:</strong></p>
      <p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.learningGoals}</p>
      ${formData.specificQuestions ? `<p><strong>Preguntas Específicas:</strong></p><p style="background:#f5f5f5;padding:10px;border-radius:5px;">${formData.specificQuestions}</p>` : ''}
      <hr>
      <p><em>Evaluación completada desde pessaro.cl - Página de Educación</em></p>
    `

    await sendEmails(subject, emailBody, formData.email, formData.fullName, 'evaluación educativa')

    return new Response(
      JSON.stringify({ success: true, message: 'Evaluación educativa enviada', type: 'education_assessment' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Education assessment error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar la evaluación' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────────────────────────────────────
async function handleNewsletter(supabaseClient: any, formData: any): Promise<Response> {
  try {
    if (!formData || !formData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: dbError } = await supabaseClient
      .from('newsletter_subscriptions')
      .insert({
        email: formData.email,
        name: formData.name || 'Usuario',
        phone: formData.phone || '',
        topics: formData.topics || [],
        source: formData.source || 'website',
        subscribed_at: new Date().toISOString()
      })

    if (dbError) console.error('Newsletter DB error:', dbError)

    const subject = 'Nueva Suscripción al Newsletter - Pessaro Capital'
    const emailBody = `
      <h2>📰 Nueva Suscripción al Newsletter</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <ul>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Nombre:</strong> ${formData.name || 'No proporcionado'}</li>
        <li><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</li>
        <li><strong>Fuente:</strong> ${formData.source || 'Website'}</li>
      </ul>
      ${formData.topics?.length > 0 ? `
        <p><strong>Temas de Interés:</strong></p>
        <ul>${formData.topics.map((t: string) => `<li>${t}</li>`).join('')}</ul>
      ` : ''}
      <hr>
      <p><em>Suscripción realizada desde pessaro.cl</em></p>
    `

    await sendEmails(subject, emailBody, formData.email, formData.name || 'Usuario', 'suscripción al newsletter')

    return new Response(
      JSON.stringify({ success: true, message: 'Suscripción al newsletter exitosa', type: 'newsletter' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Newsletter error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar la suscripción' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK PROFILE
// ─────────────────────────────────────────────────────────────────────────────
async function handleRiskProfile(supabaseClient: any, formData: any): Promise<Response> {
  try {
    if (!formData || !formData.firstName || !formData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Datos requeridos faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: dbError } = await supabaseClient
      .from('contact_submissions')
      .insert({
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.phone || '',
        comments: JSON.stringify({
          riskTolerance: formData.riskTolerance,
          investmentCapital: formData.investmentCapital,
          investmentGoals: formData.investmentGoals,
          investmentHorizon: formData.investmentHorizon,
          tradingExperience: formData.tradingExperience,
          preferredInstruments: formData.preferredInstruments
        }),
        form_type: 'risk_profile',
        submitted_at: new Date().toISOString()
      })

    if (dbError) console.error('Risk profile DB error:', dbError)

    const subject = 'Nuevo Perfil de Riesgo Completado - Pessaro Capital'
    const emailBody = `
      <h2>📊 Nuevo Perfil de Riesgo Completado</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <ul>
        <li><strong>Nombre:</strong> ${formData.firstName} ${formData.lastName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</li>
        <li><strong>Tolerancia al Riesgo:</strong> ${formData.riskTolerance}</li>
        <li><strong>Capital de Inversión:</strong> ${formData.investmentCapital}</li>
        <li><strong>Horizonte de Inversión:</strong> ${formData.investmentHorizon}</li>
        <li><strong>Experiencia en Trading:</strong> ${formData.tradingExperience}</li>
      </ul>
      <p><strong>Objetivos de Inversión:</strong></p>
      <ul>${formData.investmentGoals?.map((g: string) => `<li>${g}</li>`).join('') || '<li>No especificados</li>'}</ul>
      <p><strong>Instrumentos Preferidos:</strong></p>
      <ul>${formData.preferredInstruments?.map((i: string) => `<li>${i}</li>`).join('') || '<li>No especificados</li>'}</ul>
      <hr>
      <p><em>Perfil completado desde pessaro.cl</em></p>
    `

    await sendEmails(subject, emailBody, formData.email, `${formData.firstName} ${formData.lastName}`, 'perfil de riesgo')

    return new Response(
      JSON.stringify({ success: true, message: 'Perfil de riesgo guardado exitosamente', type: 'risk_profile' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Risk profile error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar el perfil de riesgo' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND EMAILS (helper compartido)
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmails(subject: string, body: string, userEmail: string, userName: string, type: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found')
    return
  }

  try {
    // Email de notificación a la empresa
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: 'info@pessaro.cl',
        subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '')
      })
    })

    // Email de confirmación al usuario
    const confirmationBody = `
      <h2>¡Gracias por contactar a Pessaro Capital!</h2>
      <p>Estimado/a ${userName},</p>
      <p>Hemos recibido tu ${type === 'newsletter' || type === 'suscripción al newsletter' ? 'suscripción' : 'solicitud'} y 
      ${type === 'newsletter' || type === 'suscripción al newsletter' ? 'comenzarás a recibir nuestro newsletter' : 'nos pondremos en contacto contigo en las próximas 24 horas'}.</p>
      <ul>
        <li>Tipo: ${type}</li>
        <li>Fecha: ${new Date().toLocaleString('es-CL')}</li>
        <li>Estado: Recibido correctamente ✅</li>
      </ul>
      <p>Mientras tanto, te invitamos a:</p>
      <ul>
        <li>📈 Explorar nuestros <a href="https://pessaro.cl/instrumentos">instrumentos de trading</a></li>
        <li>📚 Revisar nuestro <a href="https://pessaro.cl/educacion">centro educativo</a></li>
        <li>📰 Leer nuestro <a href="https://pessaro.cl/blog">blog de análisis</a></li>
      </ul>
      <hr>
      <p><strong>Pessaro Capital</strong><br>
      Email: info@pessaro.cl<br>
      WhatsApp: +56 9 2207 1511<br>
      Web: <a href="https://pessaro.cl">pessaro.cl</a></p>
      <p><em>Este es un email automático. Si tienes preguntas, responde a este correo.</em></p>
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
        subject: `Confirmación - ${type} - Pessaro Capital`,
        html: confirmationBody,
        text: confirmationBody.replace(/<[^>]*>/g, '')
      })
    })

  } catch (error) {
    console.error('Error sending emails:', error)
  }
}