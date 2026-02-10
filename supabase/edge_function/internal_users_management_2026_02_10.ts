import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface InternalUserRequest {
  action: 'create_internal_user' | 'verify_internal_user' | 'list_internal_users' | 'update_internal_user' | 'deactivate_internal_user';
  email?: string;
  password?: string;
  fullName?: string;
  department?: string;
  role?: 'interno' | 'admin';
  userId?: string;
  isActive?: boolean;
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

    // Handle GET request to list internal users
    if (req.method === 'GET') {
      try {
        // Get all internal users with their profiles
        const { data: internalUsers, error } = await supabase
          .from('user_roles_2026_02_08_22_02')
          .select(`
            id,
            user_id,
            role,
            permissions,
            created_at,
            updated_at
          `)
          .in('role', ['interno', 'admin'])
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching internal users:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error obteniendo usuarios internos',
              details: error.message 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get profiles for these users
        const userIds = internalUsers?.map(u => u.user_id) || []
        let profiles = []
        
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .in('user_id', userIds)
          
          profiles = profileData || []
        }

        // Combine role and profile data
        const usersWithProfiles = internalUsers?.map(user => {
          const profile = profiles.find(p => p.user_id === user.user_id)
          return {
            ...user,
            profile: profile || null
          }
        }) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            users: usersWithProfiles,
            count: usersWithProfiles.length
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
            error: 'Error inesperado obteniendo usuarios internos',
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

    const requestBody: InternalUserRequest = await req.json()
    const { action, email, password, fullName, department, role, userId, isActive } = requestBody

    switch (action) {
      case 'create_internal_user': {
        try {
          // Validate input
          if (!email || !email.includes('@')) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Email válido es requerido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          if (!password || password.length < 8) {
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

          if (!fullName || fullName.trim().length < 2) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Nombre completo es requerido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          const userRole = role || 'interno'
          if (!['interno', 'admin'].includes(userRole)) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Rol debe ser "interno" o "admin"' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Check if user already exists
          const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)
          
          if (existingUser.user) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Ya existe un usuario con este email' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Create user in auth.users
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              role: userRole,
              department: department || 'General'
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
              full_name: fullName,
              email: email,
              role: userRole,
              department: department || 'General',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Continue anyway, we'll try to clean up
          }

          // Create user role with appropriate permissions
          const permissions = userRole === 'admin' 
            ? { cms: true, users: true, reports: true, dashboard: true }
            : { cms: true, reports: true, dashboard: true }

          const { error: roleError } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              role: userRole,
              permissions: permissions,
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
                action: 'INTERNAL_USER_CREATED',
                resource_type: 'user_management',
                created_at: new Date().toISOString()
              })
          } catch (logError) {
            console.error('Error logging internal user creation:', logError)
            // Continue anyway, logging is not critical
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Usuario interno creado exitosamente',
              user: {
                id: authData.user.id,
                email: email,
                fullName: fullName,
                role: userRole,
                department: department || 'General'
              }
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error creating internal user:', error)
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

      case 'verify_internal_user': {
        try {
          if (!email) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Email es requerido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Get user by email
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)
          
          if (authError || !authUser.user) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Usuario no encontrado' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Get user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .select('*')
            .eq('user_id', authUser.user.id)
            .single()

          if (roleError || !roleData) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Usuario no tiene rol asignado' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Check if it's an internal user
          if (!['interno', 'admin'].includes(roleData.role)) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Usuario no es un usuario interno' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Get user profile
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authUser.user.id)
            .single()

          return new Response(
            JSON.stringify({ 
              success: true, 
              user: {
                id: authUser.user.id,
                email: authUser.user.email,
                role: roleData.role,
                permissions: roleData.permissions,
                profile: profileData || null,
                isActive: profileData?.is_active !== false
              }
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error verifying internal user:', error)
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

      case 'update_internal_user': {
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

          // Update user profile if provided
          if (fullName || department || isActive !== undefined) {
            const updateData: any = {
              updated_at: new Date().toISOString()
            }

            if (fullName) updateData.full_name = fullName
            if (department) updateData.department = department
            if (isActive !== undefined) updateData.is_active = isActive

            const { error: profileError } = await supabase
              .from('user_profiles')
              .update(updateData)
              .eq('user_id', userId)

            if (profileError) {
              console.error('Profile update error:', profileError)
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Error actualizando perfil: ${profileError.message}` 
                }),
                { 
                  status: 200,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              )
            }
          }

          // Update role if provided
          if (role && ['interno', 'admin'].includes(role)) {
            const permissions = role === 'admin' 
              ? { cms: true, users: true, reports: true, dashboard: true }
              : { cms: true, reports: true, dashboard: true }

            const { error: roleError } = await supabase
              .from('user_roles_2026_02_08_22_02')
              .update({
                role: role,
                permissions: permissions,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId)

            if (roleError) {
              console.error('Role update error:', roleError)
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Error actualizando rol: ${roleError.message}` 
                }),
                { 
                  status: 200,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              )
            }
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Usuario interno actualizado exitosamente' 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error updating internal user:', error)
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

      case 'deactivate_internal_user': {
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

          // Deactivate user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

          if (profileError) {
            console.error('Profile deactivation error:', profileError)
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error desactivando usuario: ${profileError.message}` 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Log the deactivation
          try {
            await supabase
              .from('access_logs_2026_02_08_22_02')
              .insert({
                user_id: userId,
                action: 'INTERNAL_USER_DEACTIVATED',
                resource_type: 'user_management',
                created_at: new Date().toISOString()
              })
          } catch (logError) {
            console.error('Error logging user deactivation:', logError)
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Usuario interno desactivado exitosamente' 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error deactivating internal user:', error)
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
    console.error('Global error in internal users function:', error)
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