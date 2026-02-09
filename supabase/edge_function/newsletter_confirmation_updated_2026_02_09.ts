const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Helper function to determine from email with custom domain
function getFromEmail() {
  // Usar el dominio personalizado de Pessaro Capital
  const customDomain = 'send.pessarocapital.com';
  
  // Intentar usar el dominio personalizado, con fallback al dominio por defecto
  try {
    return `noreply@${customDomain}`;
  } catch (error) {
    // Fallback al dominio por defecto de Resend
    return 'onboarding@resend.dev';
  }
}

// Función para generar email de confirmación de suscripción
function generateConfirmationEmail(subscriptionData: any) {
  const topicsText = subscriptionData.topics && subscriptionData.topics.length > 0 
    ? subscriptionData.topics.join(', ') 
    : 'Todos los temas';

  return {
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido al Newsletter - Pessaro Capital</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .welcome {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .success-banner {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .success-title {
            font-size: 18px;
            font-weight: 600;
            color: #047857;
            margin-bottom: 10px;
        }
        .topics-section {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .topics-title {
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
        }
        .topics-list {
            color: #075985;
            font-size: 14px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PESSARO CAPITAL</div>
            <div class="subtitle">Newsletter de Trading e Inversiones</div>
        </div>
        
        <div class="welcome">¡Bienvenido a nuestro Newsletter!</div>
        
        <p>Estimado/a <strong>${subscriptionData.name || 'Inversor'}</strong>,</p>
        
        <div class="success-banner">
            <div class="success-title">✅ Suscripción Confirmada</div>
            <div class="success-text">
                Te has suscrito exitosamente al newsletter de Pessaro Capital
            </div>
        </div>
        
        <p>Gracias por unirte a nuestra comunidad de más de 15,000 inversionistas. Recibirás contenido exclusivo sobre:</p>
        
        <div class="topics-section">
            <div class="topics-title">📊 Tus Temas de Interés:</div>
            <div class="topics-list">
                <strong>${topicsText}</strong>
            </div>
        </div>
        
        <h3>¿Qué puedes esperar?</h3>
        <ul>
            <li><strong>Análisis de Mercado:</strong> Insights diarios sobre tendencias financieras</li>
            <li><strong>Estrategias de Trading:</strong> Técnicas probadas por nuestros expertos</li>
            <li><strong>Alertas de Oportunidades:</strong> Notificaciones sobre movimientos importantes</li>
            <li><strong>Educación Financiera:</strong> Contenido para mejorar tus habilidades de inversión</li>
        </ul>
        
        <p><strong>Próximo envío:</strong> Recibirás tu primer newsletter en las próximas 24 horas.</p>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong><br>
            Avenida Apoquindo 6410, Las Condes, Santiago<br>
            © 2026 Pessaro Capital. Todos los derechos reservados.</p>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
                Si no deseas recibir más emails, puedes darte de baja en cualquier momento.
            </p>
        </div>
    </div>
</body>
</html>
    `,
    text: `
PESSARO CAPITAL - Newsletter

¡Bienvenido a nuestro Newsletter!

Estimado/a ${subscriptionData.name || 'Inversor'},

✅ SUSCRIPCIÓN CONFIRMADA
Te has suscrito exitosamente al newsletter de Pessaro Capital

Gracias por unirte a nuestra comunidad de más de 15,000 inversionistas.

TUS TEMAS DE INTERÉS: ${topicsText}

¿QUÉ PUEDES ESPERAR?
• Análisis de Mercado: Insights diarios sobre tendencias financieras
• Estrategias de Trading: Técnicas probadas por nuestros expertos
• Alertas de Oportunidades: Notificaciones sobre movimientos importantes
• Educación Financiera: Contenido para mejorar tus habilidades

PRÓXIMO ENVÍO: Recibirás tu primer newsletter en las próximas 24 horas.

---
Pessaro Capital
Avenida Apoquindo 6410, Las Condes, Santiago
© 2026 Pessaro Capital. Todos los derechos reservados.

Si no deseas recibir más emails, puedes darte de baja en cualquier momento.
    `
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada');
    }

    const { subscriptionData } = await req.json();

    if (!subscriptionData || !subscriptionData.email) {
      throw new Error('Datos de suscripción inválidos');
    }

    const emailContent = generateConfirmationEmail(subscriptionData);
    const fromEmail = getFromEmail();

    // Enviar email de confirmación
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: subscriptionData.email,
        subject: '🎯 Bienvenido al Newsletter de Pessaro Capital - Suscripción Confirmada',
        html: emailContent.html,
        text: emailContent.text
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      
      // Si falla con el dominio personalizado, intentar con el dominio por defecto
      if (errorText.includes('domain is not verified')) {
        console.log('Intentando con dominio por defecto...');
        
        const fallbackResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: subscriptionData.email,
            subject: '🎯 Bienvenido al Newsletter de Pessaro Capital - Suscripción Confirmada',
            html: emailContent.html,
            text: emailContent.text
          })
        });

        if (!fallbackResponse.ok) {
          const fallbackError = await fallbackResponse.text();
          throw new Error(`Fallback email error: ${fallbackResponse.status} ${fallbackError}`);
        }

        const fallbackResult = await fallbackResponse.json();
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email de confirmación enviado (dominio fallback)',
            message_id: fallbackResult.id,
            from_email: 'onboarding@resend.dev',
            to_email: subscriptionData.email,
            subscription_data: subscriptionData
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      throw new Error(`Resend API error: ${emailResponse.status} ${errorText}`);
    }

    const result = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de confirmación enviado exitosamente',
        message_id: result.id,
        from_email: fromEmail,
        to_email: subscriptionData.email,
        subscription_data: subscriptionData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error en newsletter confirmation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error al enviar email de confirmación'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});