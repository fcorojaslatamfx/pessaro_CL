import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
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

    // Verificar si el usuario existe y está activo
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, is_active, full_name')
      .eq('email', normalizedEmail)
      .single()

    if (profileError || !userProfile) {
      // No revelar si el email existe o no por seguridad
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Si el correo electrónico está registrado, recibirá un enlace de recuperación.'
        } as PasswordResetResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!userProfile.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La cuenta está desactivada. Contacte al administrador.'
        } as PasswordResetResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generar enlace de recuperación
    const redirectUrl = getRedirectUrl()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: redirectUrl
      }
    })

    if (error) {
      console.error('Error generating recovery link:', error)
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

    // Registrar evento en access_logs
    await supabase
      .from('access_logs_2026_02_08_22_02')
      .insert({
        user_id: userProfile.id,
        action: 'password_reset_requested',
        details: {
          email: normalizedEmail,
          timestamp: new Date().toISOString(),
          ip_address: getClientIP(req),
          user_agent: req.headers.get('user-agent')
        }
      })

    console.log(`Password reset link generated for: ${normalizedEmail}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Se ha enviado un enlace de recuperación a su correo electrónico.',
        data: {
          recovery_url: data.properties?.action_link
        }
      } as PasswordResetResponse),
      {
        status: 200,
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
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token de acceso requerido'
        } as PasswordResetResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar el token con Supabase
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

    // Verificar que el usuario esté activo
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, is_active, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || !userProfile.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario no encontrado o cuenta desactivada'
        } as PasswordResetResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token válido',
        data: {
          user_id: user.id,
          email: user.email,
          full_name: userProfile.full_name
        }
      } as PasswordResetResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in handleValidateToken:', error)
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
    if (!accessToken || !newPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token de acceso y nueva contraseña requeridos'
        } as PasswordResetResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validar fortaleza de la contraseña
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Contraseña no válida: ${passwordValidation.errors.join(', ')}`
        } as PasswordResetResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Obtener usuario del token
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

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
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

    // Registrar evento en access_logs
    await supabase
      .from('access_logs_2026_02_08_22_02')
      .insert({
        user_id: user.id,
        action: 'password_updated',
        details: {
          email: user.email,
          timestamp: new Date().toISOString(),
          ip_address: getClientIP(req),
          user_agent: req.headers.get('user-agent'),
          method: 'password_recovery'
        }
      })

    console.log(`Password updated successfully for user: ${user.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contraseña actualizada exitosamente. Puede iniciar sesión con su nueva contraseña.'
      } as PasswordResetResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in handleUpdatePassword:', error)
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

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una mayúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una minúscula')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Al menos un número')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Al menos un carácter especial')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function getRedirectUrl(): string {
  // Determinar la URL de redirección basada en el entorno
  const vercelUrl = Deno.env.get('VERCEL_URL')
  const vercelEnv = Deno.env.get('VERCEL_ENV')
  
  if (vercelEnv === 'production') {
    return 'https://login.pessaro.cl/recuperar-contrasena'
  } else if (vercelUrl) {
    return `https://${vercelUrl}/recuperar-contrasena`
  } else {
    return 'http://localhost:5173/recuperar-contrasena'
  }
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown'
}