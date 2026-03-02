import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface CMSRequest {
  action: 'get' | 'create' | 'update' | 'delete' | 'bulk_update'
  table: 'page_content' | 'services' | 'instruments' | 'team_members' | 'blog_posts' | 'faqs' | 'site_settings' | 'media_files'
  data?: any
  id?: string
  filters?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin (super admin or internal user)
    const { data: superAdmin } = await supabaseClient
      .from('super_admin_users_2026_02_10')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const { data: internalUser } = await supabaseClient
      .from('internal_users_2026_02_10')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!superAdmin && !internalUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, table, data, id, filters }: CMSRequest = await req.json()

    // Map table names to actual table names
    const tableMap = {
      'page_content': 'cms_page_content_2026_02_23_17_38',
      'services': 'cms_services_2026_02_23_17_38',
      'instruments': 'cms_instruments_2026_02_23_17_38',
      'team_members': 'cms_team_members_2026_02_23_17_38',
      'blog_posts': 'cms_blog_posts_2026_02_23_17_38',
      'faqs': 'cms_faqs_2026_02_23_17_38',
      'site_settings': 'cms_site_settings_2026_02_23_17_38',
      'media_files': 'cms_media_files_2026_02_23_17_38'
    }

    const actualTable = tableMap[table]
    if (!actualTable) {
      throw new Error(`Invalid table: ${table}`)
    }

    let result

    switch (action) {
      case 'get':
        let query = supabaseClient.from(actualTable).select('*')
        
        if (filters) {
          Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null) {
              query = query.eq(key, filters[key])
            }
          })
        }
        
        if (id) {
          query = query.eq('id', id).single()
        } else {
          // Default ordering
          if (table === 'services' || table === 'team_members') {
            query = query.order('order_index', { ascending: true })
          } else if (table === 'blog_posts') {
            query = query.order('created_at', { ascending: false })
          } else if (table === 'faqs') {
            query = query.order('order_index', { ascending: true })
          } else {
            query = query.order('created_at', { ascending: false })
          }
        }
        
        const { data: getData, error: getError } = await query
        if (getError) throw getError
        result = getData
        break

      case 'create':
        const { data: createData, error: createError } = await supabaseClient
          .from(actualTable)
          .insert(data)
          .select()
          .single()
        if (createError) throw createError
        result = createData
        break

      case 'update':
        if (!id) throw new Error('ID required for update')
        const { data: updateData, error: updateError } = await supabaseClient
          .from(actualTable)
          .update(data)
          .eq('id', id)
          .select()
          .single()
        if (updateError) throw updateError
        result = updateData
        break

      case 'delete':
        if (!id) throw new Error('ID required for delete')
        const { error: deleteError } = await supabaseClient
          .from(actualTable)
          .delete()
          .eq('id', id)
        if (deleteError) throw deleteError
        result = { success: true, message: 'Deleted successfully' }
        break

      case 'bulk_update':
        if (!Array.isArray(data)) throw new Error('Data must be an array for bulk update')
        
        const bulkResults = []
        for (const item of data) {
          const { id: itemId, ...itemData } = item
          if (itemId) {
            // Update existing
            const { data: bulkUpdateData, error: bulkUpdateError } = await supabaseClient
              .from(actualTable)
              .update(itemData)
              .eq('id', itemId)
              .select()
              .single()
            if (bulkUpdateError) throw bulkUpdateError
            bulkResults.push(bulkUpdateData)
          } else {
            // Create new
            const { data: bulkCreateData, error: bulkCreateError } = await supabaseClient
              .from(actualTable)
              .insert(itemData)
              .select()
              .single()
            if (bulkCreateError) throw bulkCreateError
            bulkResults.push(bulkCreateData)
          }
        }
        result = bulkResults
        break

      default:
        throw new Error(`Invalid action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('CMS Operation Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})