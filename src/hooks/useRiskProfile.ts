import { useState, useEffect } from 'react';
import { useClientRegistration } from './useClientRegistration';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ROUTE_PATHS } from '@/lib/index';

export interface RiskProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  riskTolerance: 'conservador' | 'moderado' | 'agresivo' | 'muy-agresivo';
  investmentCapital: string;
  investmentGoals: string[];
  investmentHorizon: '3-meses' | '6-meses' | '1-año' | '2-años' | '5-años' | 'mas-5-años';
  tradingExperience: 'ninguna' | 'basica' | 'intermedia' | 'avanzada' | 'profesional';
  preferredInstruments: string[];
  // Nuevos campos para registro
  experience?: string;
  interestedInstruments?: string[];
}

const STORAGE_KEY = 'pessaro_risk_profile';
const EXPIRY_KEY = 'pessaro_risk_profile_expiry';
const EXPIRY_HOURS = 24; // El perfil expira en 24 horas

export const useRiskProfile = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { registerAndLoginClient, loading: registrationLoading } = useClientRegistration();
  const navigate = useNavigate();

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = () => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEY);
      const storedExpiry = localStorage.getItem(EXPIRY_KEY);
      
      if (storedProfile && storedExpiry) {
        const expiryTime = parseInt(storedExpiry);
        const currentTime = Date.now();
        
        if (currentTime < expiryTime) {
          // Perfil válido y no expirado
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
          setIsProfileComplete(true);
          return;
        } else {
          // Perfil expirado, limpiar storage
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(EXPIRY_KEY);
        }
      }
      
      // No hay perfil o está expirado
      setIsProfileComplete(false);
      setProfile(null);
    } catch (error) {
      console.error('Error checking profile status:', error);
      setIsProfileComplete(false);
      setProfile(null);
    }
  };

  const saveProfile = async (profileData: RiskProfile, shouldRegisterClient: boolean = false) => {
    try {
      const expiryTime = Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
      
      setProfile(profileData);
      setIsProfileComplete(true);
      setShowProfileModal(false);

      // Enviar email de confirmación de perfil de riesgo
      try {
        await supabase.functions.invoke('send_confirmation_email_updated_2026_02_09', {
          body: {
            formType: 'risk_profile',
            formData: profileData,
            userEmail: profileData.email
          }
        });
      } catch (emailError) {
        console.error('Error sending risk profile confirmation:', emailError);
        // No bloquear el proceso si falla el email
      }

      // Si se solicita registro de cliente, proceder con el registro automático
      if (shouldRegisterClient) {
        setIsRegistering(true);
        
        try {
          // Mapear datos del perfil al formato requerido por el registro
          const registrationData = {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            riskTolerance: profileData.riskTolerance,
            experience: profileData.tradingExperience,
            investmentCapital: profileData.investmentCapital,
            investmentHorizon: profileData.investmentHorizon,
            interestedInstruments: profileData.preferredInstruments,
            investmentGoals: profileData.investmentGoals
          };

          const result = await registerAndLoginClient(registrationData);
          
          if (result.success) {
            setRegistrationSuccess(true);
            // Redirigir al portal del cliente después de un breve delay
            setTimeout(() => {
              navigate(ROUTE_PATHS.CLIENT_PORTAL);
            }, 2000);
          } else {
            console.error('Error en registro automático:', result.error);
            // Aún así, el perfil se guardó correctamente
          }
        } catch (error) {
          console.error('Error durante el registro:', error);
        } finally {
          setIsRegistering(false);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const requireProfile = () => {
    if (!isProfileComplete) {
      setShowProfileModal(true);
      return false;
    }
    return true;
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setProfile(null);
    setIsProfileComplete(false);
  };

  return {
    isProfileComplete,
    showProfileModal,
    profile,
    isRegistering,
    registrationSuccess,
    registrationLoading,
    setShowProfileModal,
    saveProfile,
    requireProfile,
    clearProfile,
    checkProfileStatus
  };
};