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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    if (req.method === 'POST') {
      const { action, email, password } = await req.json()

      if (action === 'create_super_admin') {
        // Crear el usuario super administrador
        const adminEmail = email || 'admin@pessarocapital.com'
        const adminPassword = password || '@pessaro2026'

        // Crear usuario en Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            role: 'super_admin',
            created_by: 'system',
            full_name: 'Super Administrador'
          }
        })

        if (authError) {
          console.error('Error creating user:', authError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error al crear usuario: ' + authError.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          )
        }

        if (!authData.user) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'No se pudo crear el usuario' 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          )
        }

        // Asignar rol de super admin en la tabla de roles
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('user_roles_2026_02_08_22_02')
          .insert({
            user_id: authData.user.id,
            role: 'super_admin',
            permissions: {
              access_level: 'full',
              can_modify_roles: true,
              can_view_confidential: true,
              can_view_logs: true,
              can_modify_passwords: true
            },
            created_by: authData.user.id
          })

        if (roleError) {
          console.error('Error assigning role:', roleError)
          // Intentar eliminar el usuario creado si falla la asignación de rol
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error al asignar rol: ' + roleError.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          )
        }

        // Registrar la creación en logs
        await supabaseAdmin
          .from('access_logs_2026_02_08_22_02')
          .insert({
            user_id: authData.user.id,
            action: 'SUPER_ADMIN_CREATED',
            resource_type: 'user_account',
            resource_id: authData.user.id
          })

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Super administrador creado exitosamente',
            user: {
              id: authData.user.id,
              email: authData.user.email,
              role: 'super_admin'
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }

      if (action === 'update_password') {
        const { userId, newPassword } = await req.json()

        if (!userId || !newPassword) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'userId y newPassword son requeridos' 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          )
        }

        // Verificar que el usuario que hace la petición es super admin
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: 'No autorizado' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401
            }
          )
        }

        // Actualizar contraseña
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        )

        if (updateError) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error al actualizar contraseña: ' + updateError.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          )
        }

        // Registrar la actualización en logs
        await supabaseAdmin
          .from('access_logs_2026_02_08_22_02')
          .insert({
            user_id: userId,
            action: 'PASSWORD_UPDATED',
            resource_type: 'user_account',
            resource_id: userId
          })

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Contraseña actualizada exitosamente'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    if (req.method === 'GET') {
      // Verificar si ya existe un super admin
      const { data: existingAdmin, error } = await supabaseAdmin
        .from('user_roles_2026_02_08_22_02')
        .select('user_id, created_at')
        .eq('role', 'super_admin')
        .limit(1)

      if (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error al verificar super admin existente' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          superAdminExists: existingAdmin && existingAdmin.length > 0,
          count: existingAdmin ? existingAdmin.length : 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Método no permitido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    )

  } catch (error) {
    console.error('Error in super admin function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor: ' + error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})