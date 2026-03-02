import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface ClientRequest {
  action: 'create_client' | 'verify_client' | 'list_clients' | 'update_client' | 'get_client_profile';
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  riskProfile?: any;
  clientId?: string;
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

    // Handle GET request to list clients
    if (req.method === 'GET') {
      try {
        // Get all client users with their profiles
        const { data: clientUsers, error } = await supabase
          .from('user_roles_2026_02_08_22_02')
          .select(`
            id,
            user_id,
            role,
            permissions,
            created_at,
            updated_at
          `)
          .eq('role', 'cliente')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching client users:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error obteniendo clientes registrados',
              details: error.message 
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get client profiles for these users
        const userIds = clientUsers?.map(u => u.user_id) || []
        let clientProfiles = []
        
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('client_profiles_2026_02_08_22_02')
            .select('*')
            .in('user_id', userIds)
          
          clientProfiles = profileData || []
        }

        // Get user profiles
        let userProfiles = []
        if (userIds.length > 0) {
          const { data: userProfileData } = await supabase
            .from('user_profiles')
            .select('*')
            .in('user_id', userIds)
          
          userProfiles = userProfileData || []
        }

        // Combine all data
        const clientsWithProfiles = clientUsers?.map(user => {
          const clientProfile = clientProfiles.find(p => p.user_id === user.user_id)
          const userProfile = userProfiles.find(p => p.user_id === user.user_id)
          return {
            ...user,
            clientProfile: clientProfile || null,
            userProfile: userProfile || null
          }
        }) || []

        return new Response(
          JSON.stringify({ 
            success: true, 
            clients: clientsWithProfiles,
            count: clientsWithProfiles.length
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
            error: 'Error inesperado obteniendo clientes',
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

    const requestBody: ClientRequest = await req.json()
    const { action, email, password, firstName, lastName, phone, riskProfile, clientId, userId, isActive } = requestBody

    switch (action) {
      case 'create_client': {
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

          if (!firstName || firstName.trim().length < 2) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Nombre es requerido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          if (!lastName || lastName.trim().length < 2) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Apellido es requerido' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Generate password if not provided
          const clientPassword = password || generateRandomPassword()

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
            password: clientPassword,
            email_confirm: true,
            user_metadata: {
              full_name: `${firstName} ${lastName}`,
              role: 'cliente',
              first_name: firstName,
              last_name: lastName,
              phone: phone || null
            }
          })

          if (authError) {
            console.error('Auth creation error:', authError)
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error creando cliente: ${authError.message}` 
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
                error: 'Error: No se pudo crear el cliente' 
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
              full_name: `${firstName} ${lastName}`,
              email: email,
              role: 'cliente',
              department: 'Clientes',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Continue anyway
          }

          // Create client profile
          const { error: clientProfileError } = await supabase
            .from('client_profiles_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone || null,
              risk_profile: riskProfile || null,
              account_status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (clientProfileError) {
            console.error('Client profile creation error:', clientProfileError)
            
            // Try to delete the auth user if client profile creation failed
            try {
              await supabase.auth.admin.deleteUser(authData.user.id)
            } catch (deleteError) {
              console.error('Error deleting user after client profile creation failure:', deleteError)
            }

            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error creando perfil de cliente: ${clientProfileError.message}` 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Create user role
          const { error: roleError } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              role: 'cliente',
              permissions: { trading: true, reports: true, profile: true },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (roleError) {
            console.error('Role creation error:', roleError)
            
            // Try to clean up
            try {
              await supabase.auth.admin.deleteUser(authData.user.id)
            } catch (deleteError) {
              console.error('Error deleting user after role creation failure:', deleteError)
            }

            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Error asignando rol de cliente: ${roleError.message}` 
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
                action: 'CLIENT_CREATED',
                resource_type: 'client_management',
                created_at: new Date().toISOString()
              })
          } catch (logError) {
            console.error('Error logging client creation:', logError)
            // Continue anyway
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Cliente registrado exitosamente',
              client: {
                id: authData.user.id,
                email: email,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                password: clientPassword // Return password for email notification
              }
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error creating client:', error)
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

      case 'verify_client': {
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
                error: 'Cliente no encontrado' 
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

          if (roleError || !roleData || roleData.role !== 'cliente') {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Usuario no es un cliente registrado' 
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Get client profile
          const { data: clientProfile } = await supabase
            .from('client_profiles_2026_02_08_22_02')
            .select('*')
            .eq('user_id', authUser.user.id)
            .single()

          // Get user profile
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authUser.user.id)
            .single()

          return new Response(
            JSON.stringify({ 
              success: true, 
              client: {
                id: authUser.user.id,
                email: authUser.user.email,
                role: roleData.role,
                permissions: roleData.permissions,
                clientProfile: clientProfile || null,
                userProfile: userProfile || null,
                isActive: userProfile?.is_active !== false && clientProfile?.account_status === 'active'
              }
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error verifying client:', error)
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

      case 'get_client_profile': {
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

          // Get client profile with all related data
          const { data: clientProfile, error: profileError } = await supabase
            .from('client_profiles_2026_02_08_22_02')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (profileError) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Perfil de cliente no encontrado' 
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
              profile: clientProfile
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (error) {
          console.error('Unexpected error getting client profile:', error)
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
    console.error('Global error in client management function:', error)
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

// Helper function to generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}