const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Helper function to determine from email with custom domain
function getFromEmail() {
  const customDomain = 'send.pessarocapital.com';
  
  try {
    return `noreply@${customDomain}`;
  } catch (error) {
    return 'onboarding@resend.dev';
  }
}

// Plantillas de email por tipo de formulario
const emailTemplates = {
  contact: {
    subject: '✅ Consulta Recibida - Pessaro Capital',
    getContent: (data: any) => ({
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta Recibida - Pessaro Capital</title>
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
        .info-section {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-title {
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
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
            <div class="subtitle">Servicios Financieros Profesionales</div>
        </div>
        
        <div class="success-banner">
            <div class="success-title">✅ Su Consulta Ha Sido Recibida</div>
            <div class="success-text">
                Hemos recibido su mensaje exitosamente y será procesado por nuestro equipo de asesores
            </div>
        </div>
        
        <p>Estimado/a <strong>${data.name}</strong>,</p>
        
        <p>Gracias por contactar a Pessaro Capital. Hemos recibido su consulta y queremos confirmarle que:</p>
        
        <div class="info-section">
            <div class="info-title">📋 Detalles de su Consulta:</div>
            <ul>
                <li><strong>Asunto:</strong> ${data.subject}</li>
                <li><strong>Email:</strong> ${data.email}</li>
                ${data.phone ? `<li><strong>Teléfono Móvil:</strong> ${data.phone}</li>` : ''}
                <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
            </ul>
        </div>
        
        <h3>¿Qué sigue ahora?</h3>
        <ol>
            <li><strong>Revisión:</strong> Un asesor especializado revisará su consulta</li>
            <li><strong>Análisis:</strong> Evaluaremos la mejor forma de ayudarle</li>
            <li><strong>Contacto:</strong> Nos pondremos en contacto en las próximas 24 horas</li>
            <li><strong>Seguimiento:</strong> Le proporcionaremos una solución personalizada</li>
        </ol>
        
        <p><strong>Tiempo de respuesta estimado:</strong> 2-24 horas hábiles</p>
        
        <h3>Información de Contacto</h3>
        <ul>
            <li><strong>Email:</strong> contacto@pessarocapital.com</li>
            <li><strong>Teléfono:</strong> +56 9 22 07 15 11</li>
            <li><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 CLT</li>
        </ul>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong><br>
            Avenida Apoquindo 6410, Las Condes, Santiago<br>
            © 2026 Pessaro Capital. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
PESSARO CAPITAL - Consulta Recibida

Estimado/a ${data.name},

✅ SU CONSULTA HA SIDO RECIBIDA

Gracias por contactar a Pessaro Capital. Hemos recibido su consulta exitosamente.

DETALLES DE SU CONSULTA:
- Asunto: ${data.subject}
- Email: ${data.email}
${data.phone ? `- Teléfono Móvil: ${data.phone}` : ''}
- Fecha: ${new Date().toLocaleDateString('es-ES')}

¿QUÉ SIGUE AHORA?
1. Revisión: Un asesor especializado revisará su consulta
2. Análisis: Evaluaremos la mejor forma de ayudarle
3. Contacto: Nos pondremos en contacto en las próximas 24 horas
4. Seguimiento: Le proporcionaremos una solución personalizada

TIEMPO DE RESPUESTA: 2-24 horas hábiles

INFORMACIÓN DE CONTACTO:
- Email: contacto@pessarocapital.com
- Teléfono: +56 9 22 07 15 11
- Horario: Lunes a Viernes, 9:00 - 18:00 CLT

---
Pessaro Capital
Avenida Apoquindo 6410, Las Condes, Santiago
© 2026 Pessaro Capital. Todos los derechos reservados.
      `
    })
  },

  newsletter: {
    subject: '🎯 Bienvenido al Newsletter de Pessaro Capital',
    getContent: (data: any) => ({
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suscripción Confirmada - Newsletter Pessaro Capital</title>
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
        
        <div class="success-banner">
            <div class="success-title">✅ Suscripción Confirmada</div>
            <div class="success-text">
                Te has suscrito exitosamente al newsletter de Pessaro Capital
            </div>
        </div>
        
        <p>Estimado/a <strong>${data.name || 'Inversor'}</strong>,</p>
        
        <p>¡Bienvenido a nuestra comunidad de más de 15,000 inversionistas! Tu suscripción ha sido procesada exitosamente.</p>
        
        ${data.topics && data.topics.length > 0 ? `
        <div class="topics-section">
            <div class="topics-title">📊 Tus Temas de Interés:</div>
            <ul>
                ${data.topics.map((topic: string) => `<li>${topic}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <h3>¿Qué puedes esperar?</h3>
        <ul>
            <li><strong>Análisis de Mercado:</strong> Insights diarios sobre tendencias financieras</li>
            <li><strong>Estrategias de Trading:</strong> Técnicas probadas por nuestros expertos</li>
            <li><strong>Alertas de Oportunidades:</strong> Notificaciones sobre movimientos importantes</li>
            <li><strong>Educación Financiera:</strong> Contenido para mejorar tus habilidades</li>
        </ul>
        
        <p><strong>Próximo envío:</strong> Recibirás tu primer newsletter en las próximas 24 horas.</p>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong><br>
            Avenida Apoquindo 6410, Las Condes, Santiago<br>
            © 2026 Pessaro Capital. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
PESSARO CAPITAL - Newsletter

¡Bienvenido al Newsletter de Pessaro Capital!

Estimado/a ${data.name || 'Inversor'},

✅ SUSCRIPCIÓN CONFIRMADA
Te has suscrito exitosamente al newsletter de Pessaro Capital

¡Bienvenido a nuestra comunidad de más de 15,000 inversionistas!

${data.topics && data.topics.length > 0 ? `
TUS TEMAS DE INTERÉS:
${data.topics.map((topic: string) => `• ${topic}`).join('\n')}
` : ''}

¿QUÉ PUEDES ESPERAR?
• Análisis de Mercado: Insights diarios sobre tendencias financieras
• Estrategias de Trading: Técnicas probadas por nuestros expertos
• Alertas de Oportunidades: Notificaciones sobre movimientos importantes
• Educación Financiera: Contenido para mejorar tus habilidades

PRÓXIMO ENVÍO: Recibirás tu primer newsletter en las próximas 24 horas.

---
Pessaro Capital
© 2026 Pessaro Capital. Todos los derechos reservados.
      `
    })
  },

  client_registration: {
    subject: '🎉 Registro Exitoso - Portal Cliente Pessaro Capital',
    getContent: (data: any) => ({
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Exitoso - Portal Cliente</title>
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
        .credentials-section {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .credentials-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 10px;
        }
        .access-button {
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 0;
            font-weight: 600;
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
            <div class="subtitle">Portal Cliente</div>
        </div>
        
        <div class="success-banner">
            <div class="success-title">🎉 Registro Completado Exitosamente</div>
            <div class="success-text">
                Su cuenta en el Portal Cliente ha sido creada y está lista para usar
            </div>
        </div>
        
        <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
        
        <p>¡Felicidades! Su registro en el Portal Cliente de Pessaro Capital ha sido completado exitosamente.</p>
        
        <div class="credentials-section">
            <div class="credentials-title">🔐 Sus Credenciales de Acceso:</div>
            <ul>
                <li><strong>Email:</strong> ${data.email}</li>
                <li><strong>Contraseña:</strong> ${data.tempPassword || 'Enviada por separado'}</li>
            </ul>
            <p><strong>Importante:</strong> Por seguridad, cambie su contraseña temporal en el primer inicio de sesión.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://babr325dcb.skywork.website/portal-cliente" class="access-button">
                Acceder al Portal Cliente
            </a>
        </div>
        
        <h3>¿Qué puede hacer en su Portal?</h3>
        <ul>
            <li><strong>Dashboard Personal:</strong> Resumen de sus inversiones y rendimiento</li>
            <li><strong>Análisis de Mercado:</strong> Reportes exclusivos y recomendaciones</li>
            <li><strong>Gestión de Portafolio:</strong> Seguimiento de sus posiciones</li>
            <li><strong>Educación:</strong> Recursos y webinars exclusivos</li>
            <li><strong>Soporte:</strong> Chat directo con su asesor personal</li>
        </ul>
        
        <h3>Próximos Pasos</h3>
        <ol>
            <li>Acceda al Portal Cliente con sus credenciales</li>
            <li>Complete su perfil de inversor</li>
            <li>Explore las herramientas disponibles</li>
            <li>Su asesor personal se pondrá en contacto en 24 horas</li>
        </ol>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong><br>
            Portal Cliente - Servicios Exclusivos<br>
            © 2026 Pessaro Capital. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
PESSARO CAPITAL - Portal Cliente

🎉 REGISTRO COMPLETADO EXITOSAMENTE

Estimado/a ${data.firstName} ${data.lastName},

¡Felicidades! Su registro en el Portal Cliente de Pessaro Capital ha sido completado exitosamente.

🔐 SUS CREDENCIALES DE ACCESO:
- Email: ${data.email}
- Contraseña: ${data.tempPassword || 'Enviada por separado'}

IMPORTANTE: Por seguridad, cambie su contraseña temporal en el primer inicio de sesión.

ACCESO AL PORTAL: https://babr325dcb.skywork.website/portal-cliente

¿QUÉ PUEDE HACER EN SU PORTAL?
• Dashboard Personal: Resumen de inversiones y rendimiento
• Análisis de Mercado: Reportes exclusivos y recomendaciones
• Gestión de Portafolio: Seguimiento de posiciones
• Educación: Recursos y webinars exclusivos
• Soporte: Chat directo con su asesor personal

PRÓXIMOS PASOS:
1. Acceda al Portal Cliente con sus credenciales
2. Complete su perfil de inversor
3. Explore las herramientas disponibles
4. Su asesor personal se pondrá en contacto en 24 horas

---
Pessaro Capital - Portal Cliente
© 2026 Pessaro Capital. Todos los derechos reservados.
      `
    })
  },

  risk_profile: {
    subject: '📊 Perfil de Riesgo Completado - Pessaro Capital',
    getContent: (data: any) => ({
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil de Riesgo Completado</title>
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
        .profile-section {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .profile-title {
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
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
            <div class="subtitle">Evaluación de Perfil de Riesgo</div>
        </div>
        
        <div class="success-banner">
            <div class="success-title">📊 Perfil de Riesgo Completado</div>
            <div class="success-text">
                Su evaluación ha sido procesada y analizada por nuestros expertos
            </div>
        </div>
        
        <p>Estimado/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
        
        <p>Gracias por completar su perfil de riesgo. Esta información nos permite ofrecerle recomendaciones de inversión personalizadas y acordes a su perfil.</p>
        
        <div class="profile-section">
            <div class="profile-title">📋 Resumen de su Perfil:</div>
            <ul>
                <li><strong>Tolerancia al Riesgo:</strong> ${data.riskTolerance}</li>
                <li><strong>Experiencia:</strong> ${data.experience}</li>
                <li><strong>Horizonte de Inversión:</strong> ${data.investmentHorizon}</li>
                <li><strong>Capital de Inversión:</strong> ${data.investmentCapital}</li>
            </ul>
        </div>
        
        <h3>¿Qué sigue ahora?</h3>
        <ol>
            <li><strong>Análisis Personalizado:</strong> Nuestros expertos analizarán su perfil</li>
            <li><strong>Recomendaciones:</strong> Recibirá estrategias adaptadas a su perfil</li>
            <li><strong>Contacto de Asesor:</strong> Un especialista se comunicará en 24 horas</li>
            <li><strong>Plan de Inversión:</strong> Desarrollaremos un plan personalizado</li>
        </ol>
        
        <h3>Instrumentos Recomendados Preliminares</h3>
        <p>Basado en su perfil, estos instrumentos podrían ser adecuados para usted:</p>
        <ul>
            ${data.interestedInstruments ? data.interestedInstruments.map((instrument: string) => `<li>${instrument}</li>`).join('') : '<li>Análisis en proceso</li>'}
        </ul>
        
        <p><strong>Próximo contacto:</strong> Un asesor especializado se pondrá en contacto en las próximas 24 horas para discutir sus opciones de inversión.</p>
        
        <div class="footer">
            <p><strong>Pessaro Capital</strong><br>
            Asesoría Personalizada en Inversiones<br>
            © 2026 Pessaro Capital. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
PESSARO CAPITAL - Perfil de Riesgo

📊 PERFIL DE RIESGO COMPLETADO

Estimado/a ${data.firstName} ${data.lastName},

Gracias por completar su perfil de riesgo. Esta información nos permite ofrecerle recomendaciones personalizadas.

RESUMEN DE SU PERFIL:
- Tolerancia al Riesgo: ${data.riskTolerance}
- Experiencia: ${data.experience}
- Horizonte de Inversión: ${data.investmentHorizon}
- Capital de Inversión: ${data.investmentCapital}

¿QUÉ SIGUE AHORA?
1. Análisis Personalizado: Nuestros expertos analizarán su perfil
2. Recomendaciones: Recibirá estrategias adaptadas
3. Contacto de Asesor: Un especialista se comunicará en 24 horas
4. Plan de Inversión: Desarrollaremos un plan personalizado

PRÓXIMO CONTACTO: Un asesor se pondrá en contacto en 24 horas.

---
Pessaro Capital - Asesoría Personalizada
© 2026 Pessaro Capital. Todos los derechos reservados.
      `
    })
  }
};

async function sendConfirmationEmail(formType: string, formData: any, userEmail: string) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no está configurada');
  }

  const template = emailTemplates[formType as keyof typeof emailTemplates];
  if (!template) {
    throw new Error(`Tipo de formulario no soportado: ${formType}`);
  }

  const emailContent = template.getContent(formData);
  const fromEmail = getFromEmail();

  // Intentar envío con dominio personalizado
  let emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: userEmail,
      subject: template.subject,
      html: emailContent.html,
      text: emailContent.text
    })
  });

  // Si falla con dominio personalizado, usar fallback
  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    
    if (errorText.includes('domain is not verified')) {
      console.log('Usando dominio fallback para confirmación...');
      
      emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: userEmail,
          subject: template.subject,
          html: emailContent.html,
          text: emailContent.text
        })
      });
    }
  }

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    throw new Error(`Error enviando email: ${emailResponse.status} ${errorText}`);
  }

  return await emailResponse.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, formData, userEmail } = await req.json();

    if (!formType || !formData || !userEmail) {
      throw new Error('Faltan parámetros requeridos: formType, formData, userEmail');
    }

    // Enviar email de confirmación
    const result = await sendConfirmationEmail(formType, formData, userEmail);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de confirmación enviado exitosamente',
        message_id: result.id,
        form_type: formType,
        sent_to: userEmail
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error en send_confirmation_email:', error);
    
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