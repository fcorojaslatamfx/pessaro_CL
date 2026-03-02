import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface CreateSuperAdminRequest {
  action: 'create_super_admin' | 'update_password' | 'check_exists';
  email?: string;
  password?: string;
  userId?: string;
  newPassword?: string;
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

    // Handle GET request to check if super admin exists
    if (req.method === 'GET') {
      try {
        // Check if any super admin exists
        const { data: superAdmins, error } = await supabase
          .from('user_roles_2026_02_08_22_02')
          .select('id, user_id')
          .eq('role', 'super_admin')
          .limit(1)

        if (error) {
          console.error('Error checking super admin:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error verificando super administrador',
              details: error.message 
            }),
            { 
              status: 200, // Return 200 to avoid "non-2xx status code" error
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            superAdminExists: superAdmins && superAdmins.length > 0,
            count: superAdmins?.length || 0
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (error) {
        console.error('Unexpected error in GET:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error inesperado verificando super administrador',
            details: error.message 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Handle POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Método no permitido' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestBody: CreateSuperAdminRequest = await req.json()
    const { action, email, password, userId, newPassword } = requestBody

    switch (action) {
      case 'create_super_admin': {
        try {
          const adminEmail = email || 'admin@pessarocapital.com'
          const adminPassword = password || '@pessaro2026'

          // Validate input
          if (!adminEmail.includes('@')) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Formato de email inválido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          if (adminPassword.length < 8) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'La contraseña debe tener al menos 8 caracteres' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Check if super admin already exists
          const { data: existingSuperAdmin } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .select('id')
            .eq('role', 'super_admin')
            .limit(1)

          if (existingSuperAdmin && existingSuperAdmin.length > 0) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Ya existe un super administrador en el sistema' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Create user in auth.users
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              full_name: 'Super Administrador',
              role: 'super_admin'
            }
          })

          if (authError) {
            console.error('Auth creation error:', authError)
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error creando usuario: ${authError.message}` 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          if (!authData.user) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Error: No se pudo crear el usuario' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: authData.user.id,
              full_name: 'Super Administrador',
              email: adminEmail,
              role: 'super_admin',
              department: 'Administración',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Continue anyway, profile is optional
          }

          // Create user role
          const { error: roleError } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              role: 'super_admin',
              permissions: { all: true },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (roleError) {
            console.error('Role creation error:', roleError)
            
            // Try to delete the auth user if role creation failed
            try {
              await supabase.auth.admin.deleteUser(authData.user.id)
            } catch (deleteError) {
              console.error('Error deleting user after role creation failure:', deleteError)
            }

            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error asignando rol: ${roleError.message}` 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Log the creation
          try {
            await supabase
              .from('access_logs_2026_02_08_22_02')
              .insert({
                user_id: authData.user.id,
                action: 'SUPER_ADMIN_CREATED',
                resource_type: 'authentication',
                created_at: new Date().toISOString()
              })
          } catch (logError) {
            console.error('Error logging super admin creation:', logError)
            // Continue anyway, logging is not critical
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Super administrador creado exitosamente',
              user_id: authData.user.id,
              email: adminEmail
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error creating super admin:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Error inesperado: ${error.message}` 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      case 'update_password': {
        try {
          if (!userId || !newPassword) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'ID de usuario y nueva contraseña son requeridos' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          if (newPassword.length < 8) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'La nueva contraseña debe tener al menos 8 caracteres' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: newPassword }
          )

          if (updateError) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error actualizando contraseña: ${updateError.message}` 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Contraseña actualizada exitosamente' 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error updating password:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Error inesperado: ${error.message}` 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      case 'check_exists': {
        try {
          // Check if any super admin exists
          const { data: superAdmins, error } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .select('id, user_id')
            .eq('role', 'super_admin')

          if (error) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error verificando super administrador: ${error.message}` 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              superAdminExists: superAdmins && superAdmins.length > 0,
              count: superAdmins?.length || 0
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error checking super admin:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Error inesperado: ${error.message}` 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      default: {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Acción no válida' 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

  } catch (error) {
    console.error('Global error in super admin function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error del servidor: ${error.message}` 
      }),
      { 
        status: 200, // Always return 200 to avoid "non-2xx status code" error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})