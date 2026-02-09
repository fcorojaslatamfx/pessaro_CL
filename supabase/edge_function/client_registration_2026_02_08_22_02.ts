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
      const { action, profileData } = await req.json()

      if (action === 'register_client_from_profile') {
        // Extraer datos del perfil de riesgo
        const {
          firstName,
          lastName,
          email,
          phone,
          riskTolerance,
          experience,
          investmentCapital,
          investmentHorizon,
          interestedInstruments,
          investmentGoals
        } = profileData

        // Generar contraseña temporal
        const tempPassword = `PC${Math.random().toString(36).substring(2, 10).toUpperCase()}`

        try {
          // Crear usuario en Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
              phone: phone,
              role: 'client',
              account_type: 'standard',
              created_via: 'risk_profile_registration'
            }
          })

          if (authError) {
            console.error('Error creating user:', authError)
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Error al crear cuenta: ' + authError.message 
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
                error: 'No se pudo crear la cuenta de usuario' 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
              }
            )
          }

          // Asignar rol de cliente
          const { error: roleError } = await supabaseAdmin
            .from('user_roles_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              role: 'client',
              permissions: {
                access_level: 'client',
                can_trade: true,
                can_view_portfolio: true,
                can_deposit_withdraw: true
              },
              created_by: authData.user.id
            })

          if (roleError) {
            console.error('Error assigning client role:', roleError)
          }

          // Crear perfil del cliente con datos del perfil de riesgo
          const { error: profileError } = await supabaseAdmin
            .from('client_profiles_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone,
              risk_tolerance: riskTolerance,
              experience_level: experience,
              investment_capital: investmentCapital,
              investment_horizon: investmentHorizon,
              interested_instruments: interestedInstruments,
              investment_goals: investmentGoals,
              account_status: 'active',
              account_type: 'standard',
              created_via: 'risk_profile'
            })

          if (profileError) {
            console.error('Error creating client profile:', profileError)
          }

          // Crear cuenta de trading simulada
          const initialBalance = Math.floor(Math.random() * 50000) + 10000 // Entre 10k y 60k
          const { error: accountError } = await supabaseAdmin
            .from('trading_accounts_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              account_number: `PC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
              account_type: 'standard',
              balance: initialBalance,
              equity: initialBalance,
              margin: 0,
              free_margin: initialBalance,
              margin_level: 0,
              currency: 'USD',
              leverage: '1:100',
              status: 'active'
            })

          if (accountError) {
            console.error('Error creating trading account:', accountError)
          }

          // Registrar la creación en logs
          await supabaseAdmin
            .from('access_logs_2026_02_08_22_02')
            .insert({
              user_id: authData.user.id,
              action: 'CLIENT_REGISTERED_FROM_PROFILE',
              resource_type: 'user_account',
              resource_id: authData.user.id
            })

          // Enviar email con credenciales usando Resend
          const resendApiKey = Deno.env.get('RESEND_API_KEY')
          const resendDomain = Deno.env.get('RESEND_DOMAIN')
          
          function getFromEmail() {
            if (resendDomain) {
              return `send@${resendDomain}`
            }
            return 'onboarding@resend.dev'
          }

          if (resendApiKey) {
            const emailBody = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0A2687 0%, #5e17eb 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">¡Bienvenido a Pessaro Capital!</h1>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                  <h2 style="color: #0A2687;">Hola ${firstName} ${lastName},</h2>
                  
                  <p>Gracias por completar tu perfil de riesgo. Hemos creado tu cuenta en el Portal del Cliente de Pessaro Capital.</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #24d594;">
                    <h3 style="margin-top: 0; color: #0A2687;">Tus Credenciales de Acceso:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Contraseña Temporal:</strong> ${tempPassword}</p>
                    <p style="color: #e74c3c; font-size: 14px;"><strong>Importante:</strong> Te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0A2687;">Tu Perfil de Riesgo:</h3>
                    <p><strong>Tolerancia al Riesgo:</strong> ${riskTolerance}</p>
                    <p><strong>Experiencia:</strong> ${experience}</p>
                    <p><strong>Capital de Inversión:</strong> ${investmentCapital}</p>
                    <p><strong>Horizonte de Inversión:</strong> ${investmentHorizon}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://babr325dcb.skywork.website/portal-cliente" 
                       style="background: #24d594; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Acceder al Portal del Cliente
                    </a>
                  </div>
                  
                  <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #0A2687;">¿Necesitas ayuda?</h4>
                    <p style="margin-bottom: 0;">Nuestro equipo está disponible 24/7:</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> fcorojas.fx@gmail.com</p>
                    <p style="margin: 5px 0;"><strong>WhatsApp:</strong> +56 9 22071511</p>
                  </div>
                </div>
                
                <div style="background: #0A2687; padding: 20px; text-align: center;">
                  <p style="color: white; margin: 0; font-size: 14px;">
                    © 2026 Pessaro Capital. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            `

            try {
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: getFromEmail(),
                  to: email,
                  subject: '¡Bienvenido a Pessaro Capital - Credenciales de Acceso!',
                  html: emailBody,
                  text: `¡Bienvenido a Pessaro Capital!\n\nHola ${firstName} ${lastName},\n\nTus credenciales de acceso:\nEmail: ${email}\nContraseña Temporal: ${tempPassword}\n\nAccede al portal: https://babr325dcb.skywork.website/portal-cliente\n\n¿Necesitas ayuda? Contacta: fcorojas.fx@gmail.com`
                })
              })

              if (!emailResponse.ok) {
                console.error('Error sending welcome email:', await emailResponse.text())
              }
            } catch (emailError) {
              console.error('Error sending email:', emailError)
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Cuenta creada exitosamente',
              user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: `${firstName} ${lastName}`,
                temp_password: tempPassword
              },
              next_step: 'redirect_to_portal'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )

        } catch (error) {
          console.error('Error in registration process:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error en el proceso de registro: ' + error.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          )
        }
      }

      if (action === 'login_client') {
        const { email, password } = await req.json()

        try {
          // Intentar login con Supabase Auth
          const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Credenciales incorrectas' 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401
              }
            )
          }

          // Registrar login en logs
          if (data.user) {
            await supabaseAdmin
              .from('access_logs_2026_02_08_22_02')
              .insert({
                user_id: data.user.id,
                action: 'CLIENT_LOGIN',
                resource_type: 'authentication'
              })
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Login exitoso',
              user: data.user,
              session: data.session
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )

        } catch (error) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error en el login: ' + error.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          )
        }
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Método no permitido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    )

  } catch (error) {
    console.error('Error in client registration function:', error)
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