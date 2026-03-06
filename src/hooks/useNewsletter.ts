// Agrega este import al inicio del archivo (junto a los demás)
import { supabase } from '@/integrations/supabase/client';


// ─── Reemplaza la función sendOTP completa ────────────────────────────────────
const sendOTP = async () => {
  if (!validateForm()) return;
  setSubmitting(true);

  try {
    const code = genOTP();

    // Enviar OTP por email vía Supabase Edge Function
    const { error } = await supabase.functions.invoke('unified_forms_complete_2026_02_25_20_30', {
      body: {
        formType: 'otp_verification',
        formData: {
          name,
          email,
          phone,
          otpCode: code,
        },
        userEmail: email,
      }
    });

    if (error) throw error;

    // Guardar código en estado solo después de confirmar envío exitoso
    setOtpCode(code);
    setStep('otp');
    startResendCd();

  } catch (err: any) {
    console.error('Error enviando OTP:', err);
    setErrors(p => ({
      ...p,
      email: 'No se pudo enviar el código. Verifica tu email e intenta de nuevo.'
    }));
  } finally {
    setSubmitting(false);
  }
};


// ─── Reemplaza resendOTP también ──────────────────────────────────────────────
const resendOTP = async () => {
  if (resendCd > 0) return;
  setOtpLoading(true);

  try {
    const code = genOTP();

    const { error } = await supabase.functions.invoke('unified_forms_complete_2026_02_25_20_30', {
      body: {
        formType: 'otp_verification',
        formData: {
          name,
          email,
          phone,
          otpCode: code,
        },
        userEmail: email,
      }
    });

    if (error) throw error;

    setOtpCode(code);
    setOtpInputs(['', '', '', '', '', '']);
    setOtpError('');
    startResendCd();
    inputRefs.current[0]?.focus();

  } catch (err: any) {
    console.error('Error reenviando OTP:', err);
    setOtpError('No se pudo reenviar el código. Intenta de nuevo.');
  } finally {
    setOtpLoading(false);
  }
};import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  email: string;
  name?: string;
  phone?: string;
  topics?: string[];
  source?: string;
}

interface SimpleSubscriptionData {
  email: string;
}

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subscribe = async (data: SubscriptionData | SimpleSubscriptionData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Normalizar los datos para compatibilidad
      const normalizedData: SubscriptionData = {
        email: data.email,
        name: 'name' in data ? data.name || 'Usuario' : 'Usuario',
        phone: 'phone' in data ? data.phone || '' : '',
        topics: 'topics' in data ? data.topics || [] : [],
        source: 'source' in data ? data.source || 'website' : 'website'
      };

      // Verificar si el email ya existe
      const { data: existingSubscription, error: checkError } = await supabase
        .from('newsletter_subscriptions')
        .select('id, email')
        .eq('email', normalizedData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSubscription) {
        // Actualizar suscripción existente
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({
            name: normalizedData.name,
            phone: normalizedData.phone,
            topics: normalizedData.topics,
            source: normalizedData.source,
            updated_at: new Date().toISOString(),
            is_active: true
          })
          .eq('email', normalizedData.email);

        if (updateError) throw updateError;

        // Enviar email de confirmación para actualización
        try {
          await supabase.functions.invoke('unified_forms_complete_2026_02_25_20_30', {
            body: {
              formType: 'newsletter',
              formData: normalizedData,
              userEmail: normalizedData.email
            }
          });
        } catch (emailError) {
          console.error('Error sending newsletter update confirmation:', emailError);
          // No bloquear el proceso si falla el email
        }

        setSuccess(true);
      } else {
        // Crear nueva suscripción
        const { error: insertError } = await supabase
          .from('newsletter_subscriptions')
          .insert({
            email: normalizedData.email,
            name: normalizedData.name,
            phone: normalizedData.phone,
            topics: normalizedData.topics,
            source: normalizedData.source,
            is_active: true,
            subscribed_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        // Enviar email de confirmación automático
        try {
          await supabase.functions.invoke('unified_forms_complete_2026_02_25_20_30', {
            body: {
              formType: 'newsletter',
              formData: normalizedData,
              userEmail: normalizedData.email
            }
          });
        } catch (emailError) {
          console.error('Error sending newsletter confirmation:', emailError);
          // No bloquear el proceso si falla el email
        }

        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setError(err.message || 'Error al procesar la suscripción');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;

      return { success: true, message: 'Suscripción cancelada exitosamente' };
    } catch (err: any) {
      console.error('Newsletter unsubscribe error:', err);
      setError(err.message || 'Error al cancelar la suscripción');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    subscribe,
    unsubscribe,
    loading,
    error,
    success,
    reset
  };
};