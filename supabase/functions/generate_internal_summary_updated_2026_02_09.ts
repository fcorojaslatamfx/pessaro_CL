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
    return `admin@${customDomain}`;
  } catch (error) {
    // Fallback al dominio por defecto de Resend
    return 'onboarding@resend.dev';
  }
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

function generateSummaryEmailHTML() {
  const userRows = internalUsers.map(user => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: 600;">${user.fullName}</td>
      <td style="padding: 12px; font-family: monospace; background: #f8fafc;">${user.email}</td>
      <td style="padding: 12px; font-family: monospace; background: #f8fafc; color: #dc2626;">${user.temporaryPassword}</td>
      <td style="padding: 12px;">${user.role}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuarios Internos Creados - Dashboard Pessaro Capital</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
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
        .success-text {
            color: #065f46;
        }
        .credentials-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .credentials-table th {
            background: #f1f5f9;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
        }
        .credentials-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
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
        .instructions {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .instructions-title {
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
        }
        .instructions-list {
            color: #075985;
            font-size: 14px;
        }
        .instructions-list li {
            margin: 8px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
            text-align: center;
        }
        .access-url {
            background: #1e40af;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 0;
            font-weight: 600;
        }
        .domain-info {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .domain-title {
            font-weight: 600;
            color: #047857;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PESSARO CAPITAL</div>
            <div class="subtitle">Dashboard Interno - Administración</div>
        </div>
        
        <div class="domain-info">
            <div class="domain-title">📧 Email enviado desde:</div>
            <div style="color: #065f46; font-family: monospace;">${getFromEmail()}</div>
        </div>
        
        <div class="success-banner">
            <div class="success-title">✅ Usuarios Internos Creados Exitosamente</div>
            <div class="success-text">
                Se han creado 4 usuarios con acceso al Dashboard Interno como Business Development Managers
            </div>
        </div>
        
        <h2>Credenciales de Acceso</h2>
        <p>Los siguientes usuarios han sido configurados en el sistema:</p>
        
        <table class="credentials-table">
            <thead>
                <tr>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Contraseña Temporal</th>
                    <th>Rol</th>
                </tr>
            </thead>
            <tbody>
                ${userRows}
            </tbody>
        </table>
        
        <div class="warning">
            <div class="warning-title">⚠️ Importante - Seguridad</div>
            <div class="warning-text">
                Estas son contraseñas temporales. Los usuarios deben cambiarlas inmediatamente después de su primer inicio de sesión.
                Comparte estas credenciales de forma segura con cada usuario individualmente.
            </div>
        </div>
        
        <div class="instructions">
            <div class="instructions-title">📋 Instrucciones para Compartir</div>
            <ol class="instructions-list">
                <li><strong>Envía las credenciales individualmente</strong> a cada usuario por email o mensaje seguro</li>
                <li><strong>Incluye el enlace de acceso:</strong> 
                    <a href="https://babr325dcb.skywork.website/login-interno" class="access-url">
                        Dashboard Interno
                    </a>
                </li>
                <li><strong>Solicita cambio de contraseña</strong> inmediato tras el primer login</li>
                <li><strong>Proporciona soporte</strong> si tienen problemas de acceso</li>
            </ol>
        </div>
        
        <h3>Acceso y Permisos</h3>
        <p>Cada usuario tendrá acceso a:</p>
        <ul>
            <li><strong>Dashboard Interno:</strong> Métricas y estadísticas de la plataforma</li>
            <li><strong>Gestión de Clientes:</strong> Información de usuarios y suscripciones</li>
            <li><strong>Análisis de Newsletter:</strong> Estadísticas de suscripciones por temas</li>
            <li><strong>Reportes de Business Development:</strong> Métricas de crecimiento</li>
            <li><strong>Herramientas de Comunicación:</strong> Gestión de contactos y leads</li>
        </ul>
        
        <h3>Información Técnica</h3>
        <ul>
            <li><strong>URL de Acceso:</strong> https://babr325dcb.skywork.website/login-interno</li>
            <li><strong>Rol en Sistema:</strong> interno (Business Development Manager)</li>
            <li><strong>Estado:</strong> Activos y listos para usar</li>
            <li><strong>Departamento:</strong> Business Development</li>
            <li><strong>Email desde:</strong> ${getFromEmail()}</li>
        </ul>
        
        <div class="footer">
            <p><strong>Pessaro Capital - Sistema de Administración</strong><br>
            Dashboard Interno creado el ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
                Este email contiene información confidencial del sistema. 
                Maneja las credenciales con seguridad.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateSummaryEmailText() {
  const userList = internalUsers.map(user => 
    `${user.fullName} (${user.email})\n  Contraseña: ${user.temporaryPassword}\n  Rol: ${user.role}`
  ).join('\n\n');

  return `
PESSARO CAPITAL - Dashboard Interno
Usuarios Creados Exitosamente

Email enviado desde: ${getFromEmail()}

✅ Se han creado 4 usuarios con acceso al Dashboard Interno como Business Development Managers

CREDENCIALES DE ACCESO:

${userList}

⚠️ IMPORTANTE - SEGURIDAD:
Estas son contraseñas temporales. Los usuarios deben cambiarlas inmediatamente después de su primer inicio de sesión.

INSTRUCCIONES:
1. Envía las credenciales individualmente a cada usuario
2. Incluye el enlace: https://babr325dcb.skywork.website/login-interno
3. Solicita cambio de contraseña inmediato
4. Proporciona soporte si tienen problemas

ACCESO Y PERMISOS:
• Dashboard Interno: Métricas y estadísticas
• Gestión de Clientes: Información de usuarios
• Análisis de Newsletter: Estadísticas de suscripciones
• Reportes de Business Development: Métricas de crecimiento
• Herramientas de Comunicación: Gestión de contactos

INFORMACIÓN TÉCNICA:
- URL: https://babr325dcb.skywork.website/login-interno
- Rol: interno (Business Development Manager)
- Estado: Activos y listos para usar
- Departamento: Business Development
- Email desde: ${getFromEmail()}

---
Pessaro Capital - Sistema de Administración
Dashboard Interno creado el ${new Date().toLocaleDateString('es-ES')}
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

    const fromEmail = getFromEmail();

    // Enviar resumen al administrador
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: 'fcorojas.fx@gmail.com', // Email del administrador
        subject: '🔐 Usuarios Internos Creados - Dashboard Pessaro Capital',
        html: generateSummaryEmailHTML(),
        text: generateSummaryEmailText()
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
            to: 'fcorojas.fx@gmail.com',
            subject: '🔐 Usuarios Internos Creados - Dashboard Pessaro Capital',
            html: generateSummaryEmailHTML(),
            text: generateSummaryEmailText()
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
            message: 'Resumen de usuarios internos enviado exitosamente (dominio fallback)',
            summary: {
              total_users: internalUsers.length,
              admin_email_sent: true,
              message_id: fallbackResult.id,
              from_email: 'onboarding@resend.dev'
            },
            users_created: internalUsers.map(u => ({
              email: u.email,
              fullName: u.fullName,
              role: u.role,
              temporaryPassword: u.temporaryPassword,
              access: 'Dashboard Interno - Business Development Manager',
              status: 'Creado - Pendiente de primer login'
            })),
            instructions: {
              dashboard_url: 'https://babr325dcb.skywork.website/login-interno',
              next_steps: [
                'Compartir credenciales individualmente con cada usuario',
                'Solicitar cambio de contraseña tras primer login',
                'Proporcionar soporte si hay problemas de acceso',
                'Verificar que todos puedan acceder correctamente'
              ]
            }
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
        message: 'Resumen de usuarios internos enviado exitosamente',
        summary: {
          total_users: internalUsers.length,
          admin_email_sent: true,
          message_id: result.id,
          from_email: fromEmail
        },
        users_created: internalUsers.map(u => ({
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          temporaryPassword: u.temporaryPassword,
          access: 'Dashboard Interno - Business Development Manager',
          status: 'Creado - Pendiente de primer login'
        })),
        instructions: {
          dashboard_url: 'https://babr325dcb.skywork.website/login-interno',
          next_steps: [
            'Compartir credenciales individualmente con cada usuario',
            'Solicitar cambio de contraseña tras primer login',
            'Proporcionar soporte si hay problemas de acceso',
            'Verificar que todos puedan acceder correctamente'
          ]
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error en generate_internal_summary_updated:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error al generar resumen de usuarios internos',
        users_info: internalUsers.map(u => ({
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          temporaryPassword: u.temporaryPassword
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});