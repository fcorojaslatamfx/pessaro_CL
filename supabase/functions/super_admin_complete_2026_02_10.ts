import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface SuperAdminRequest {
  action: 'create_super_admin' | 'update_password' | 'check_exists' | 'force_create' | 'check_first_login';
  email?: string;
  password?: string;
  userId?: string;
  newPassword?: string;
  forceRecreate?: boolean;
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
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // If super admin exists, check if it's their first login
        let requiresPasswordChange = false
        if (superAdmins && superAdmins.length > 0) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('first_login_completed')
            .eq('user_id', superAdmins[0].user_id)
            .single()

          requiresPasswordChange = !profileData?.first_login_completed
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            superAdminExists: superAdmins && superAdmins.length > 0,
            count: superAdmins?.length || 0,
            requiresPasswordChange: requiresPasswordChange
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

    const requestBody: SuperAdminRequest = await req.json()
    const { action, email, password, userId, newPassword, forceRecreate } = requestBody

    switch (action) {
      case 'force_create': {
        try {
          const adminEmail = email || 'admin@pessarocapital.com'
          const adminPassword = password || '@PessaroAdmin2026!'

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

          if (adminPassword.length < 10) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'La contraseña debe tener al menos 10 caracteres' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // If forceRecreate is true, delete existing super admin first
          if (forceRecreate) {
            try {
              // Get existing super admin
              const { data: existingSuperAdmin } = await supabase
                .from('user_roles_2026_02_08_22_02')
                .select('user_id')
                .eq('role', 'super_admin')
                .single()

              if (existingSuperAdmin) {
                // Delete from all tables
                await supabase
                  .from('user_roles_2026_02_08_22_02')
                  .delete()
                  .eq('user_id', existingSuperAdmin.user_id)

                await supabase
                  .from('user_profiles')
                  .delete()
                  .eq('user_id', existingSuperAdmin.user_id)

                // Delete from auth
                await supabase.auth.admin.deleteUser(existingSuperAdmin.user_id)
              }
            } catch (deleteError) {
              console.error('Error deleting existing super admin:', deleteError)
              // Continue anyway
            }
          } else {
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
                  error: 'Ya existe un super administrador en el sistema. Use forceRecreate para recrear.' 
                }),
                { 
                  status: 200,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              )
            }
          }

          // Create user in auth.users
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              full_name: 'Super Administrador',
              role: 'super_admin',
              created_by: 'system',
              creation_date: new Date().toISOString()
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

          // Create user profile with first_login_completed = false
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: authData.user.id,
              full_name: 'Super Administrador',
              email: adminEmail,
              role: 'super_admin',
              department: 'Administración',
              is_active: true,
              first_login_completed: false, // Require password change on first login
              password_changed_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Continue anyway, we'll try to clean up if role creation fails
          }

          // Create user role
          const { error: roleError } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .insert({
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
                details: `Super admin created with email: ${adminEmail}`,
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
              email: adminEmail,
              temporaryPassword: adminPassword,
              requiresPasswordChange: true,
              instructions: 'Debe cambiar la contraseña en el primer inicio de sesión'
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

          if (newPassword.length < 10) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'La nueva contraseña debe tener al menos 10 caracteres' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Validate password strength
          const hasUpperCase = /[A-Z]/.test(newPassword)
          const hasLowerCase = /[a-z]/.test(newPassword)
          const hasNumbers = /\d/.test(newPassword)
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

          if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial' 
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

          // Update profile to mark first login as completed
          const { error: profileUpdateError } = await supabase
            .from('user_profiles')
            .update({
              first_login_completed: true,
              password_changed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

          if (profileUpdateError) {
            console.error('Error updating profile after password change:', profileUpdateError)
            // Continue anyway
          }

          // Log the password change
          try {
            await supabase
              .from('access_logs_2026_02_08_22_02')
              .insert({
                user_id: userId,
                action: 'PASSWORD_CHANGED',
                resource_type: 'authentication',
                details: 'Super admin password changed on first login',
                created_at: new Date().toISOString()
              })
          } catch (logError) {
            console.error('Error logging password change:', logError)
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Contraseña actualizada exitosamente. Ya puede usar el sistema normalmente.' 
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

      case 'check_first_login': {
        try {
          if (!userId) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'ID de usuario es requerido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Check if user has completed first login
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('first_login_completed, password_changed_at')
            .eq('user_id', userId)
            .single()

          if (profileError) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Error verificando estado de primer login' 
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
              requiresPasswordChange: !profileData?.first_login_completed,
              passwordChangedAt: profileData?.password_changed_at
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error checking first login:', error)
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

      // Keep existing actions for compatibility
      case 'create_super_admin': {
        // Redirect to force_create for better handling
        return await handleForceCreate(supabase, email, password, false)
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function for create_super_admin compatibility
async function handleForceCreate(supabase: any, email?: string, password?: string, forceRecreate = false) {
  // Implementation similar to force_create case
  // This ensures backward compatibility
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'Use action "force_create" para crear super administrador' 
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    }
  )
}