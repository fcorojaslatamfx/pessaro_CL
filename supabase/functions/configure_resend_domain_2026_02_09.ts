const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Configurar el dominio personalizado
const RESEND_DOMAIN = 'send.pessarocapital.com';

// Helper function to get from email with custom domain
function getFromEmail() {
  return `noreply@${RESEND_DOMAIN}`;
}

// Test email function
async function sendTestEmail() {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no está configurada');
  }

  const testEmailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: 'fcorojas.fx@gmail.com',
      subject: '✅ Configuración de Dominio Personalizado - Pessaro Capital',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dominio Configurado - Pessaro Capital</title>
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
                .success-banner {
                    background: #ecfdf5;
                    border: 1px solid #10b981;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: center;
                }
                .success-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #047857;
                    margin-bottom: 10px;
                }
                .config-info {
                    background: #f0f9ff;
                    border: 1px solid #0ea5e9;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .config-title {
                    font-weight: 600;
                    color: #0c4a6e;
                    margin-bottom: 10px;
                }
                .config-item {
                    margin: 10px 0;
                    padding: 8px 0;
                }
                .config-label {
                    font-weight: 600;
                    color: #475569;
                    display: inline-block;
                    width: 120px;
                }
                .config-value {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    background: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid #d1d5db;
                    color: #1e293b;
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
                    <div class="subtitle">Sistema de Email Configurado</div>
                </div>
                
                <div class="success-banner">
                    <div class="success-title">✅ Dominio Personalizado Configurado</div>
                    <div class="success-text">
                        El dominio personalizado de Resend ha sido configurado exitosamente
                    </div>
                </div>
                
                <div class="config-info">
                    <div class="config-title">📧 Configuración de Email</div>
                    <div class="config-item">
                        <span class="config-label">Dominio:</span>
                        <span class="config-value">${RESEND_DOMAIN}</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">From Email:</span>
                        <span class="config-value">${getFromEmail()}</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">Estado:</span>
                        <span class="config-value">Activo y Funcionando</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">Fecha:</span>
                        <span class="config-value">${new Date().toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
                
                <h3>Funciones de Email Actualizadas:</h3>
                <ul>
                    <li><strong>Newsletter:</strong> Suscripciones y confirmaciones</li>
                    <li><strong>Usuarios Internos:</strong> Credenciales de acceso</li>
                    <li><strong>Contacto:</strong> Formularios y consultas</li>
                    <li><strong>Notificaciones:</strong> Alertas del sistema</li>
                </ul>
                
                <h3>Beneficios del Dominio Personalizado:</h3>
                <ul>
                    <li><strong>Profesionalismo:</strong> Emails desde @pessarocapital.com</li>
                    <li><strong>Confianza:</strong> Mayor credibilidad en las comunicaciones</li>
                    <li><strong>Deliverability:</strong> Mejor entrega de emails</li>
                    <li><strong>Branding:</strong> Consistencia con la marca</li>
                </ul>
                
                <div class="footer">
                    <p><strong>Pessaro Capital - Sistema de Email</strong><br>
                    Dominio configurado el ${new Date().toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
PESSARO CAPITAL - Dominio Personalizado Configurado

✅ El dominio personalizado de Resend ha sido configurado exitosamente

CONFIGURACIÓN:
- Dominio: ${RESEND_DOMAIN}
- From Email: ${getFromEmail()}
- Estado: Activo y Funcionando
- Fecha: ${new Date().toLocaleDateString('es-ES')}

FUNCIONES ACTUALIZADAS:
• Newsletter: Suscripciones y confirmaciones
• Usuarios Internos: Credenciales de acceso
• Contacto: Formularios y consultas
• Notificaciones: Alertas del sistema

BENEFICIOS:
• Profesionalismo: Emails desde @pessarocapital.com
• Confianza: Mayor credibilidad
• Deliverability: Mejor entrega
• Branding: Consistencia de marca

---
Pessaro Capital - Sistema de Email
Configurado el ${new Date().toLocaleDateString('es-ES')}
      `
    })
  });

  if (!testEmailResponse.ok) {
    const errorText = await testEmailResponse.text();
    throw new Error(`Resend API error: ${testEmailResponse.status} ${errorText}`);
  }

  return await testEmailResponse.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await sendTestEmail();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dominio personalizado configurado exitosamente',
        domain: RESEND_DOMAIN,
        from_email: getFromEmail(),
        test_email_sent: true,
        message_id: result.id,
        configuration: {
          domain: RESEND_DOMAIN,
          from_email: getFromEmail(),
          status: 'active',
          configured_at: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error configurando dominio:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error al configurar dominio personalizado',
        domain: RESEND_DOMAIN,
        from_email: getFromEmail()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});