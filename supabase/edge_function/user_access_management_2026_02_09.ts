import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface UserAccessRequest {
  action: 'check_access' | 'verify_user' | 'sync_roles' | 'create_user_profile' | 'system_status'
  email?: string
  userData?: {
    email: string
    fullName: string
    role: string
    department?: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, userData }: UserAccessRequest = await req.json()

    switch (action) {
      case 'check_access': {
        if (!email) {
          return new Response(
            JSON.stringify({ success: false, error: 'Email requerido' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar permisos del usuario
        const { data, error } = await supabaseClient.rpc('check_user_permissions', {
          user_email: email
        })

        if (error) {
          console.error('Error checking user permissions:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'verify_user': {
        if (!email) {
          return new Response(
            JSON.stringify({ success: false, error: 'Email requerido' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar si el usuario existe y está activo
        const { data: userProfile, error: profileError } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single()

        if (profileError || !userProfile) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Usuario no encontrado o inactivo',
              exists: false
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar rol en la tabla de roles
        const { data: roleData, error: roleError } = await supabaseClient
          .from('user_roles_2026_02_08_22_02')
          .select('*')
          .eq('user_id', userProfile.user_id)
          .single()

        return new Response(
          JSON.stringify({ 
            success: true, 
            exists: true,
            user: {
              id: userProfile.user_id,
              email: userProfile.email,
              fullName: userProfile.full_name,
              role: userProfile.role,
              department: userProfile.department,
              isActive: userProfile.is_active,
              lastLogin: userProfile.last_login,
              rolePermissions: roleData?.permissions || {}
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'sync_roles': {
        // Sincronizar roles entre tablas
        const { data, error } = await supabaseClient.rpc('sync_user_roles')

        if (error) {
          console.error('Error syncing roles:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create_user_profile': {
        if (!userData || !userData.email || !userData.fullName || !userData.role) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Datos de usuario incompletos (email, fullName, role requeridos)' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Crear perfil de usuario
        const { data, error } = await supabaseClient.rpc('create_user_profile', {
          user_email: userData.email,
          full_name: userData.fullName,
          user_role: userData.role,
          department: userData.department || null
        })

        if (error) {
          console.error('Error creating user profile:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'system_status': {
        // Verificar estado del sistema de acceso
        const { data, error } = await supabaseClient.rpc('check_access_system_status')

        if (error) {
          console.error('Error checking system status:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Acción no válida' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in user access function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})