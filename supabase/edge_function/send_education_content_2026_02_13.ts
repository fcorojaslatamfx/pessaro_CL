import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

// Helper function to determine from email
function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) {
    return `send@${domain}`;
  }
  return 'onboarding@resend.dev'; // Default fallback
}

// Función para obtener el contenido del email según el tipo
function getEmailContent(contentType: string, fullName: string, contentTitle: string) {
  const contentInfo = {
    'rutas': {
      title: 'Rutas de Aprendizaje Estructuradas',
      description: 'Guía completa con las 3 rutas de aprendizaje: Fundamentos del Trading, Estrategias Avanzadas y Psicología del Inversor.',
      pages: '45 páginas',
      highlights: [
        '3 rutas de aprendizaje progresivas',
        'Desde principiante hasta avanzado',
        'Módulos estructurados con lecciones detalladas',
        'Ejercicios prácticos y evaluaciones'
      ]
    },
    'base-conocimientos': {
      title: 'Base de Conocimientos Completa',
      description: 'Manual completo con todos los módulos, lecciones detalladas y contenido educativo de Pessaro Capital.',
      pages: '120 páginas',
      highlights: [
        'Contenido completo de todas las rutas',
        'Lecciones detalladas paso a paso',
        'Ejemplos prácticos del mercado',
        'Glosario de términos financieros'
      ]
    },
    'faq': {
      title: 'Preguntas Frecuentes sobre Trading',
      description: 'Compendio completo de preguntas frecuentes sobre trading, instrumentos financieros y regulación.',
      pages: '25 páginas',
      highlights: [
        'Respuestas sobre Forex, Commodities, Índices',
        'Información sobre reguladores y custodios',
        'Explicación de cuentas segregadas',
        'Guía sobre criptomonedas y USDT'
      ]
    }
  };

  const content = contentInfo[contentType as keyof typeof contentInfo];
  
  return {
    subject: `📚 ${content.title} - Pessaro Capital`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #1e40af; font-weight: 600; }
        .description { font-size: 16px; margin-bottom: 30px; color: #64748b; }
        .content-info { background-color: #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #3b82f6; }
        .content-info h3 { margin: 0 0 15px 0; color: #1e40af; font-size: 20px; }
        .content-info p { margin: 0 0 15px 0; color: #475569; }
        .highlights { margin: 20px 0; }
        .highlights h4 { color: #1e40af; margin: 0 0 15px 0; font-size: 16px; }
        .highlights ul { margin: 0; padding-left: 20px; }
        .highlights li { margin-bottom: 8px; color: #475569; }
        .pages-badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 15px; }
        .cta-section { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; color: #64748b; font-size: 14px; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #3b82f6; text-decoration: none; }
        .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 ${content.title}</h1>
            <p>Tu contenido educativo de Pessaro Capital</p>
        </div>
        
        <div class="content">
            <div class="greeting">¡Hola ${fullName}!</div>
            
            <p>Gracias por tu interés en nuestro contenido educativo. Como prometimos, aquí tienes acceso al material que solicitaste:</p>
            
            <div class="content-info">
                <h3>${contentTitle}</h3>
                <p>${content.description}</p>
                <div class="pages-badge">${content.pages}</div>
                
                <div class="highlights">
                    <h4>📋 Contenido destacado:</h4>
                    <ul>
                        ${content.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="https://pessaro.cl/educacion" class="cta-button">
                    🎓 Acceder a Más Contenido Educativo
                </a>
            </div>
            
            <div class="divider"></div>
            
            <p><strong>💡 ¿Necesitas ayuda personalizada?</strong></p>
            <p>Nuestro equipo de expertos está disponible para guiarte en tu camino hacia el éxito financiero. Contáctanos para una consulta personalizada.</p>
            
            <p><strong>📞 Contacto:</strong><br>
            Teléfono: +56 9 2207 1511<br>
            Email: info@pessarocapital.com<br>
            Web: <a href="https://pessaro.cl" style="color: #3b82f6;">pessaro.cl</a></p>
        </div>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong></p>
            <p>Tu socio en inversiones inteligentes</p>
            
            <div class="social-links">
                <a href="https://www.linkedin.com/company/pessarocapital/?viewAsMember=true">LinkedIn</a>
                <a href="https://www.instagram.com/pessaro.capital/">Instagram</a>
                <a href="https://x.com/pessaro">Twitter</a>
            </div>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                Este email fue enviado porque solicitaste contenido educativo en pessaro.cl<br>
                © 2026 Pessaro Capital. Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>`,
    text: `
Hola ${fullName},

Gracias por tu interés en nuestro contenido educativo de Pessaro Capital.

CONTENIDO SOLICITADO:
${contentTitle}
${content.description}
${content.pages}

CONTENIDO DESTACADO:
${content.highlights.map(highlight => `• ${highlight}`).join('\n')}

Para acceder a más contenido educativo, visita: https://pessaro.cl/educacion

¿Necesitas ayuda personalizada?
Nuestro equipo está disponible para guiarte en tu camino hacia el éxito financiero.

CONTACTO:
Teléfono: +56 9 2207 1511
Email: info@pessarocapital.com
Web: pessaro.cl

---
Pessaro Capital - Tu socio en inversiones inteligentes
© 2026 Pessaro Capital. Todos los derechos reservados.
`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, phone, contentType, contentTitle } = await req.json();

    // Validar datos requeridos
    if (!email || !fullName || !phone || !contentType || !contentTitle) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Faltan datos requeridos: email, fullName, phone, contentType, contentTitle' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar tipo de contenido
    const validContentTypes = ['rutas', 'base-conocimientos', 'faq'];
    if (!validContentTypes.includes(contentType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Tipo de contenido inválido' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Obtener contenido del email
    const emailContent = getEmailContent(contentType, fullName, contentTitle);

    // Enviar email con Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY no configurada');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Servicio de email no configurado' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Resend API:', response.status, errorText);
      throw new Error(`Resend API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Email enviado exitosamente:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contenido educativo enviado exitosamente',
        messageId: result.id,
        contentType,
        recipient: email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error en send_education_content:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});