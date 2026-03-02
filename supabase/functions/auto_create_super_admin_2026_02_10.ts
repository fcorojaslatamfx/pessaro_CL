import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Crear super admin automáticamente
    const adminEmail = 'admin@pessarocapital.com'
    const adminPassword = '@PessaroAdmin2026!'

    console.log('Iniciando creación automática de super admin...')

    // 1. Verificar si ya existe
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail)
    
    if (existingUser.user) {
      console.log('Super admin ya existe en auth.users, eliminando...')
      await supabase.auth.admin.deleteUser(existingUser.user.id)
    }

    // 2. Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Administrador',
        role: 'super_admin',
        created_by: 'auto_setup',
        creation_date: new Date().toISOString()
      }
    })

    if (authError) {
      throw new Error(`Error creando usuario en auth: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en auth')
    }

    console.log('Usuario creado en auth.users:', authData.user.id)

    // 3. Crear perfil de usuario
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: authData.user.id,
        full_name: 'Super Administrador',
        email: adminEmail,
        role: 'super_admin',
        department: 'Administración',
        is_active: true,
        first_login_completed: false, // Requiere cambio de contraseña
        password_changed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creando perfil:', profileError)
      // Continuar de todos modos
    }

    // 4. Crear rol de super admin
    const { error: roleError } = await supabase
      .from('user_roles_2026_02_08_22_02')
      .upsert({
        user_id: authData.user.id,
        role: 'super_admin',
        permissions: { 
          all: true, 
          super_admin: true, 
          user_management: true, 
          system_settings: true,
          access_logs: true,
          confidential_content: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (roleError) {
      console.error('Error creando rol:', roleError)
      // Limpiar usuario auth si falla
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Error eliminando usuario después de fallo de rol:', deleteError)
      }
      throw new Error(`Error asignando rol: ${roleError.message}`)
    }

    // 5. Registrar en logs
    try {
      await supabase
        .from('access_logs_2026_02_08_22_02')
        .insert({
          user_id: authData.user.id,
          action: 'SUPER_ADMIN_AUTO_CREATED',
          resource_type: 'authentication',
          details: 'Super admin created automatically with temporary password',
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Error registrando en logs:', logError)
      // Continuar de todos modos
    }

    // 6. Verificar creación exitosa
    const { data: verifyRole } = await supabase
      .from('user_roles_2026_02_08_22_02')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('role', 'super_admin')
      .single()

    const { data: verifyProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Super administrador creado exitosamente',
        details: {
          user_id: authData.user.id,
          email: adminEmail,
          temporary_password: adminPassword,
          requires_password_change: true,
          auth_created: !!authData.user,
          profile_created: !!verifyProfile,
          role_created: !!verifyRole,
          instructions: [
            '1. Vaya a /super-admin-login',
            '2. Use las credenciales: admin@pessarocapital.com / @PessaroAdmin2026!',
            '3. Será obligatorio cambiar la contraseña en el primer ingreso',
            '4. La nueva contraseña debe tener al menos 10 caracteres con mayúsculas, minúsculas, números y símbolos'
          ]
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error global en creación automática:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error del servidor: ${error.message}` 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})