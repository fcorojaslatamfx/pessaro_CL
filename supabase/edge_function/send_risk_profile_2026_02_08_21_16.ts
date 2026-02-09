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

// Helper function to format risk tolerance
function formatRiskTolerance(risk: string): string {
  const riskMap: { [key: string]: string } = {
    'conservador': 'Conservador - Prefiere estabilidad, acepta rendimientos menores',
    'moderado': 'Moderado - Balance entre riesgo y rendimiento',
    'agresivo': 'Agresivo - Acepta mayor riesgo por mayores rendimientos',
    'muy-agresivo': 'Muy Agresivo - Máximo riesgo, máximo potencial de rendimiento'
  };
  return riskMap[risk] || risk;
}

// Helper function to format trading experience
function formatTradingExperience(experience: string): string {
  const expMap: { [key: string]: string } = {
    'ninguna': 'Sin experiencia',
    'basica': 'Básica (menos de 1 año)',
    'intermedia': 'Intermedia (1-3 años)',
    'avanzada': 'Avanzada (3-5 años)',
    'profesional': 'Profesional (más de 5 años)'
  };
  return expMap[experience] || experience;
}

// Helper function to format investment horizon
function formatInvestmentHorizon(horizon: string): string {
  const horizonMap: { [key: string]: string } = {
    '3-meses': '3 meses',
    '6-meses': '6 meses',
    '1-año': '1 año',
    '2-años': '2 años',
    '5-años': '5 años',
    'mas-5-años': 'Más de 5 años'
  };
  return horizonMap[horizon] || horizon;
}

// Helper function to format investment goals
function formatInvestmentGoals(goals: string[]): string {
  const goalMap: { [key: string]: string } = {
    'crecimiento': 'Crecimiento de Capital',
    'ingresos': 'Generación de Ingresos',
    'preservacion': 'Preservación de Capital',
    'diversificacion': 'Diversificación',
    'jubilacion': 'Ahorro para Jubilación',
    'educacion': 'Educación Financiera'
  };
  return goals.map(goal => goalMap[goal] || goal).join(', ');
}

// Helper function to format preferred instruments
function formatPreferredInstruments(instruments: string[]): string {
  const instrumentMap: { [key: string]: string } = {
    'forex': 'Forex (Divisas)',
    'acciones': 'Acciones',
    'indices': 'Índices Bursátiles',
    'commodities': 'Materias Primas',
    'criptomonedas': 'Criptomonedas',
    'etfs': 'ETFs',
    'bonos': 'Bonos',
    'opciones': 'Opciones'
  };
  return instruments.length > 0 
    ? instruments.map(inst => instrumentMap[inst] || inst).join(', ')
    : 'No especificado';
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
    
    // Validate required fields
    if (!requestBody.firstName || !requestBody.lastName || !requestBody.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required personal information' }),
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

    // Get current date in Chile timezone
    const now = new Date()
    const chileTime = new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(now)

    // Create email content
    const emailSubject = `Nuevo Perfil de Riesgo: ${requestBody.firstName} ${requestBody.lastName}`
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0A2687; margin: 0; font-size: 24px;">📊 Nuevo Perfil de Riesgo</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Pessaro Capital - Sistema de Perfilado</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #0A2687; margin: 0 0 15px 0; font-size: 18px;">👤 Información Personal</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600; width: 140px;">Nombre:</td>
                <td style="padding: 8px 0; color: #111827;">${requestBody.firstName} ${requestBody.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #111827;">${requestBody.email}</td>
              </tr>
              ${requestBody.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Teléfono:</td>
                <td style="padding: 8px 0; color: #111827;">${requestBody.phone}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background-color: #fef3f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">🎯 Perfil de Riesgo</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600; width: 180px;">Tolerancia al Riesgo:</td>
                <td style="padding: 8px 0; color: #111827;">${formatRiskTolerance(requestBody.riskTolerance)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Experiencia Trading:</td>
                <td style="padding: 8px 0; color: #111827;">${formatTradingExperience(requestBody.tradingExperience)}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #16a34a; margin: 0 0 15px 0; font-size: 18px;">💰 Capital e Inversión</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600; width: 180px;">Capital Disponible:</td>
                <td style="padding: 8px 0; color: #111827;">USD ${requestBody.investmentCapital}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Horizonte Inversión:</td>
                <td style="padding: 8px 0; color: #111827;">${formatInvestmentHorizon(requestBody.investmentHorizon)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Instrumentos Preferidos:</td>
                <td style="padding: 8px 0; color: #111827;">${formatPreferredInstruments(requestBody.preferredInstruments || [])}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">🎯 Objetivos de Inversión</h2>
            <p style="color: #111827; margin: 0; line-height: 1.6;">${formatInvestmentGoals(requestBody.investmentGoals || [])}</p>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              🔗 <strong>Origen:</strong> Pessaro Capital - Perfil de Riesgo<br>
              📅 <strong>Fecha:</strong> ${chileTime} (Chile)
            </p>
          </div>
        </div>
      </div>
    `

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: 'fcorojas.fx@gmail.com',
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
          error: `Email service error: ${response.status}` 
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
        message: 'Perfil de riesgo enviado exitosamente',
        messageId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing risk profile:', error)
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