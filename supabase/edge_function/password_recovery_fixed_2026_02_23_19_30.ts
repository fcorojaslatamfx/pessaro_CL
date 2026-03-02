import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

interface PasswordResetRequest {
  action: 'request_reset' | 'validate_token' | 'update_password'
  email?: string
  password?: string
  access_token?: string
}

interface PasswordResetResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    const { action, email, password, access_token }: PasswordResetRequest = await req.json()

    console.log(`Password recovery action: ${action}`)

    switch (action) {
      case 'request_reset':
        return await handleRequestReset(supabase, email!)
      
      case 'validate_token':
        return await handleValidateToken(supabase, access_token!)
      
      case 'update_password':
        return await handleUpdatePassword(supabase, access_token!, password!)
      
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Acción no válida'
          } as PasswordResetResponse),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Password recovery error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as PasswordResetResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleRequestReset(supabase: any, email: string): Promise<Response> {
  try {
    // Validar email
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email no válido'
        } as PasswordResetResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verificar si el usuario existe en alguna de las tablas de usuarios
    const { data: superAdmin } = await supabase
      .from('super_admin_users_2026_02_10')
      .select('email, full_name')
      .eq('email', normalizedEmail)
      .single()

    const { data: internalUser } = await supabase
      .from('internal_users_2026_02_10')
      .select('email, full_name')
      .eq('email', normalizedEmail)
      .single()

    if (!superAdmin && !internalUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se encontró una cuenta asociada a este email'
        } as PasswordResetResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userData = superAdmin || internalUser
    const userType = superAdmin ? 'Super Administrador' : 'Usuario Interno'

    // Usar el método nativo de Supabase para enviar el email de reset
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `https://pessaro.cl/recuperar-contrasena`
      }
    })

    if (resetError) {
      console.error('Error generating reset link:', resetError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al generar enlace de recuperación'
        } as PasswordResetResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enviar email personalizado usando Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const emailBody = `
          <h2>Recuperación de Contraseña - Pessaro Capital</h2>
          <p>Estimado/a ${userData.full_name},</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta de ${userType}.</p>
          <p>Si usted solicitó este cambio, recibirá un email adicional con el enlace de recuperación en los próximos minutos.</p>
          <p>Si no solicitó este cambio, puede ignorar este mensaje de forma segura.</p>
          <p><strong>Información de seguridad:</strong></p>
          <ul>
            <li>El enlace de recuperación expira en 1 hora</li>
            <li>Solo puede ser usado una vez</li>
            <li>Debe crear una contraseña segura (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)</li>
          </ul>
          <p>Para consultas de seguridad: info@pessaro.cl</p>
          <hr>
          <p><em>Equipo de Seguridad<br>Pessaro Capital</em></p>
        `

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: getFromEmail(),
            to: normalizedEmail,
            subject: 'Solicitud de Recuperación de Contraseña - Pessaro Capital',
            html: emailBody,
            text: emailBody.replace(/<[^>]*>/g, '')
          })
        })
      } catch (emailError) {
        console.error('Error sending custom email:', emailError)
        // Continue even if custom email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Se ha enviado un enlace de recuperación a su correo electrónico. Revise su bandeja de entrada y spam.'
      } as PasswordResetResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in handleRequestReset:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al procesar solicitud de recuperación'
      } as PasswordResetResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleValidateToken(supabase: any, accessToken: string): Promise<Response> {
  try {
    // Verificar el token usando Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido o expirado'
        } as PasswordResetResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token válido',
        data: { user_id: user.id, email: user.email }
      } as PasswordResetResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error validating token:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al validar token'
      } as PasswordResetResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleUpdatePassword(supabase: any, accessToken: string, newPassword: string): Promise<Response> {
  try {
    // Validar contraseña
    if (!isValidPassword(newPassword)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos'
        } as PasswordResetResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar el token y obtener el usuario
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido o expirado'
        } as PasswordResetResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al actualizar la contraseña'
        } as PasswordResetResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enviar email de confirmación
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const emailBody = `
          <h2>Contraseña Actualizada - Pessaro Capital</h2>
          <p>Su contraseña ha sido actualizada exitosamente.</p>
          <p><strong>Información de seguridad:</strong></p>
          <ul>
            <li>Fecha: ${new Date().toLocaleString('es-CL')}</li>
            <li>Si no realizó este cambio, contacte inmediatamente a info@pessaro.cl</li>
          </ul>
          <p>Ahora puede iniciar sesión con su nueva contraseña en:</p>
          <p><a href="https://login.pessaro.cl">https://login.pessaro.cl</a></p>
          <hr>
          <p><em>Equipo de Seguridad<br>Pessaro Capital</em></p>
        `

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: getFromEmail(),
            to: user.email,
            subject: 'Contraseña Actualizada - Pessaro Capital',
            html: emailBody,
            text: emailBody.replace(/<[^>]*>/g, '')
          })
        })
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Continue even if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contraseña actualizada exitosamente. Ahora puede iniciar sesión con su nueva contraseña.'
      } as PasswordResetResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error updating password:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al actualizar contraseña'
      } as PasswordResetResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPassword(password: string): boolean {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}