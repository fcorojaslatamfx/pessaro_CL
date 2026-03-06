import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  riskTolerance: string;
  experience: string;
  investmentCapital: string;
  investmentHorizon: string;
  interestedInstruments: string[];
  investmentGoals: string[];
}

interface RegistrationResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: any;
  tempPassword?: string;
}

export const useClientRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const registerClientFromProfile = async (profileData: ClientRegistrationData): Promise<RegistrationResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('client_registration_updated_2026_02_14', {
        body: { action: 'register_client_from_profile', profileData }
      });

      if (error) { setError(error.message); return { success: false, error: error.message }; }
      if (!data.success) { setError(data.error); return { success: false, error: data.error }; }

      // Enviar email de confirmación de registro
      try {
        await supabase.functions.invoke('unified_forms_complete_2026_02_25_20_30', {
          body: {
            formType: 'risk_profile',
            formData: {
              firstName:            profileData.firstName,
              lastName:             profileData.lastName,
              email:                profileData.email,
              phone:                profileData.phone,
              riskTolerance:        profileData.riskTolerance,
              investmentCapital:    profileData.investmentCapital,
              investmentGoals:      profileData.investmentGoals,
              investmentHorizon:    profileData.investmentHorizon,
              tradingExperience:    profileData.experience,
              preferredInstruments: profileData.interestedInstruments,
            },
            userEmail: profileData.email
          }
        });
      } catch (emailError) {
        console.error('Error sending client registration confirmation:', emailError);
        // No bloquear el proceso si falla el email
      }

      return {
        success: true,
        message: data.message,
        user: data.user,
        tempPassword: data.user.temp_password
      };

    } catch (err: any) {
      const msg = err.message || 'Error inesperado durante el registro';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithTempCredentials = async (email: string, tempPassword: string): Promise<RegistrationResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: tempPassword });
      if (error) { setError(error.message); return { success: false, error: error.message }; }

      if (data.user) {
        try {
          const { data: accountData } = await supabase
            .from('trading_accounts_2026_02_08_22_02')
            .select('id')
            .eq('user_id', data.user.id)
            .single();

          if (accountData) {
            await supabase.rpc('generate_sample_trading_data', {
              p_user_id: data.user.id,
              p_account_id: accountData.id
            });
          }
        } catch (tradingError) {
          console.error('Error generating trading data:', tradingError);
        }
      }

      return { success: true, message: 'Inicio de sesión exitoso', user: data.user };

    } catch (err: any) {
      const msg = err.message || 'Error durante el inicio de sesión';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const getClientData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_client_data');
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching client data:', err);
      throw err;
    }
  };

  const getClientPositions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_client_positions');
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching client positions:', err);
      throw err;
    }
  };

  const getClientHistory = async (limit: number = 10) => {
    try {
      const { data, error } = await supabase.rpc('get_client_history', { limit_count: limit });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching client history:', err);
      throw err;
    }
  };

  const registerAndLoginClient = async (profileData: ClientRegistrationData): Promise<RegistrationResult> => {
    try {
      const registrationResult = await registerClientFromProfile(profileData);
      if (!registrationResult.success) return registrationResult;

      const loginResult = await loginWithTempCredentials(profileData.email, registrationResult.tempPassword!);
      if (!loginResult.success) {
        return {
          success: false,
          error: `Cuenta creada pero error en login automático: ${loginResult.error}. Use email: ${profileData.email} y contraseña: ${registrationResult.tempPassword}`
        };
      }

      return { success: true, message: 'Registro y acceso completados exitosamente', user: loginResult.user, tempPassword: registrationResult.tempPassword };

    } catch (err: any) {
      return { success: false, error: err.message || 'Error en el proceso de registro y login' };
    }
  };

  return {
    loading,
    error,
    registerClientFromProfile,
    loginWithTempCredentials,
    registerAndLoginClient,
    getClientData,
    getClientPositions,
    getClientHistory
  };
};