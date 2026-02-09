const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Helper function to determine from email
function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) {
    return `send@${domain}`;
  }
  return 'onboarding@resend.dev'; // Default fallback
}

// Usuarios internos con sus datos
const internalUsers = [
  {
    email: 'mario@pessarocapital.com',
    fullName: 'Mario Fatigante',
    role: 'Business Development Manager',
    temporaryPassword: 'PessaroCapital2026!Mario'
  },
  {
    email: 'juan.pablo@pessarocapital.com',
    fullName: 'Juan Pablo Alberio',
    role: 'Business Development Manager',
    temporaryPassword: 'PessaroCapital2026!JuanPablo'
  },
  {
    email: 'ivan@pessarocapital.com',
    fullName: 'Iván Serrano',
    role: 'Business Development Manager',
    temporaryPassword: 'PessaroCapital2026!Ivan'
  },
  {
    email: 'daniel@pessarocapital.com',
    fullName: 'Daniel Malpartida',
    role: 'Business Development Manager',
    temporaryPassword: 'PessaroCapital2026!Daniel'
  }
];

function generateEmailHTML(user: any) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso al Dashboard Interno - Pessaro Capital</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
        .subtitle {
            color: #64748b;
            font-size: 16px;
        }
        .welcome {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .credentials-box {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .credential-item {
            margin: 10px 0;
            padding: 8px 0;
        }
        .credential-label {
            font-weight: 600;
            color: #475569;
            display: inline-block;
            width: 120px;
        }
        .credential-value {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
            color: #1e293b;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .warning-text {
            color: #a16207;
            font-size: 14px;
        }
        .access-info {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .access-title {
            font-weight: 600;
            color: #047857;
            margin-bottom: 10px;
        }
        .access-list {
            color: #065f46;
            font-size: 14px;
        }
        .access-list li {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
            text-align: center;
        }
        .contact-info {
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PESSARO CAPITAL</div>
            <div class="subtitle">Plataforma de Trading e Inversiones</div>
        </div>
        
        <div class="welcome">¡Bienvenido al Dashboard Interno!</div>
        
        <p>Estimado/a <strong>${user.fullName}</strong>,</p>
        
        <p>Te damos la bienvenida al equipo de Pessaro Capital como <strong>${user.role}</strong>. Hemos configurado tu acceso al dashboard interno de la plataforma.</p>
        
        <div class="credentials-box">
            <h3 style="margin-top: 0; color: #1e293b;">Credenciales de Acceso</h3>
            <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${user.email}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Contraseña:</span>
                <span class="credential-value">${user.temporaryPassword}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Rol:</span>
                <span class="credential-value">${user.role}</span>
            </div>
        </div>
        
        <div class="warning">
            <div class="warning-title">⚠️ Importante - Seguridad</div>
            <div class="warning-text">
                Esta es una contraseña temporal. Por favor, cámbiala inmediatamente después de tu primer inicio de sesión por razones de seguridad.
            </div>
        </div>
        
        <div class="access-info">
            <div class="access-title">🎯 Tu Acceso Incluye:</div>
            <ul class="access-list">
                <li><strong>Dashboard Interno:</strong> Métricas y estadísticas de la plataforma</li>
                <li><strong>Gestión de Clientes:</strong> Información de usuarios y suscripciones</li>
                <li><strong>Análisis de Newsletter:</strong> Estadísticas de suscripciones por temas</li>
                <li><strong>Reportes de Business Development:</strong> Métricas de crecimiento</li>
                <li><strong>Herramientas de Comunicación:</strong> Gestión de contactos y leads</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="https://babr325dcb.skywork.website/login-interno" class="button">
                Acceder al Dashboard Interno
            </a>
        </div>
        
        <h3>Pasos para Comenzar:</h3>
        <ol>
            <li><strong>Accede al dashboard:</strong> Haz clic en el botón de arriba o ve a la página de login interno</li>
            <li><strong>Inicia sesión:</strong> Usa tu email y la contraseña temporal proporcionada</li>
            <li><strong>Cambia tu contraseña:</strong> Ve a tu perfil y actualiza tu contraseña</li>
            <li><strong>Explora la plataforma:</strong> Familiarízate con las herramientas disponibles</li>
        </ol>
        
        <h3>Soporte Técnico:</h3>
        <p>Si tienes algún problema con el acceso o necesitas ayuda:</p>
        <div class="contact-info">
            <strong>Email:</strong> soporte@pessarocapital.com<br>
            <strong>Teléfono:</strong> +56 9 22 07 15 11<br>
            <strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 CLT
        </div>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong><br>
            Avenida Apoquindo 6410, Las Condes, Santiago<br>
            © 2026 Pessaro Capital. Todos los derechos reservados.</p>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
                Este email contiene información confidencial. Si lo has recibido por error, 
                por favor elimínalo y notifica al remitente.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateEmailText(user: any) {
  return `
PESSARO CAPITAL - Acceso al Dashboard Interno

¡Bienvenido al Dashboard Interno!

Estimado/a ${user.fullName},

Te damos la bienvenida al equipo de Pessaro Capital como ${user.role}. Hemos configurado tu acceso al dashboard interno de la plataforma.

CREDENCIALES DE ACCESO:
- Email: ${user.email}
- Contraseña: ${user.temporaryPassword}
- Rol: ${user.role}

⚠️ IMPORTANTE - SEGURIDAD:
Esta es una contraseña temporal. Por favor, cámbiala inmediatamente después de tu primer inicio de sesión por razones de seguridad.

TU ACCESO INCLUYE:
• Dashboard Interno: Métricas y estadísticas de la plataforma
• Gestión de Clientes: Información de usuarios y suscripciones
• Análisis de Newsletter: Estadísticas de suscripciones por temas
• Reportes de Business Development: Métricas de crecimiento
• Herramientas de Comunicación: Gestión de contactos y leads

ACCEDER AL DASHBOARD:
https://babr325dcb.skywork.website/login-interno

PASOS PARA COMENZAR:
1. Accede al dashboard usando el enlace de arriba
2. Inicia sesión con tu email y la contraseña temporal
3. Cambia tu contraseña en tu perfil
4. Explora la plataforma y familiarízate con las herramientas

SOPORTE TÉCNICO:
Email: soporte@pessarocapital.com
Teléfono: +56 9 22 07 15 11
Horario: Lunes a Viernes, 9:00 - 18:00 CLT

---
Pessaro Capital
Avenida Apoquindo 6410, Las Condes, Santiago
© 2026 Pessaro Capital. Todos los derechos reservados.

Este email contiene información confidencial. Si lo has recibido por error, por favor elimínalo y notifica al remitente.
  `;
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

    const results = [];

    // Enviar email a cada usuario interno
    for (const user of internalUsers) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: getFromEmail(),
            to: user.email,
            subject: `🔐 Acceso al Dashboard Interno - Pessaro Capital | ${user.role}`,
            html: generateEmailHTML(user),
            text: generateEmailText(user)
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Resend API error para ${user.email}: ${emailResponse.status} ${errorText}`);
        }

        const result = await emailResponse.json();
        results.push({
          email: user.email,
          fullName: user.fullName,
          success: true,
          messageId: result.id,
          message: 'Email enviado exitosamente'
        });

        console.log(`✅ Email enviado a ${user.fullName} (${user.email})`);

      } catch (error) {
        console.error(`❌ Error enviando email a ${user.email}:`, error);
        results.push({
          email: user.email,
          fullName: user.fullName,
          success: false,
          error: error.message
        });
      }
    }

    // Resumen de resultados
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Proceso completado: ${successful} emails enviados, ${failed} fallidos`,
        summary: {
          total: internalUsers.length,
          successful,
          failed
        },
        results,
        users_created: internalUsers.map(u => ({
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          access: 'Dashboard Interno - Business Development Manager'
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error en send_internal_credentials:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error al enviar credenciales de acceso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});