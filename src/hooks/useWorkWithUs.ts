import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkWithUsData {
  fullName: string;
  phone: string;
  email: string;
  linkedinProfile?: string;
  instagramProfile?: string;
  workExperience: string;
  investmentKnowledge: string;
  tradingExperience: string;
  financialEducation: string;
  careerGoals: string;
  whyJoinUs: string;
}

interface SupabaseResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const useWorkWithUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openPopup = useCallback(() => setIsOpen(true), []);
  const closePopup = useCallback(() => setIsOpen(false), []);

  const validateForm = (formData: WorkWithUsData) => {
    if (!formData.fullName.trim()) return 'El nombre es obligatorio.';
    if (!formData.email.trim()) return 'El correo es obligatorio.';
    if (!formData.phone.trim()) return 'El teléfono es obligatorio.';
    if (!formData.workExperience.trim()) return 'La experiencia laboral es obligatoria.';
    return null;
  };

  const submitApplication = useCallback(
    async (formData: WorkWithUsData): Promise<SupabaseResponse> => {
      if (isSubmitting) return { success: false, message: 'Envío en progreso...' };

      const validationError = validateForm(formData);
      if (validationError) {
        toast.error(validationError);
        return { success: false, message: validationError };
      }

      setIsSubmitting(true);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const { data, error } = await supabase.functions.invoke(
          'unified_forms_handler_2026_02_23_19_35',
          {
            body: {
              formType: 'work_with_us',
              formData
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        if (error) {
          console.error('Error submitting work application:', error);
          toast.error('Error al enviar la aplicación. Intente nuevamente.');
          return { success: false, message: error.message };
        }

        if (data?.success) {
          toast.success('¡Aplicación enviada exitosamente! Nos pondremos en contacto pronto.');
          closePopup();
          return { success: true, data };
        }

        toast.error(data?.message || 'Error al procesar la aplicación.');
        return { success: false, message: data?.message };

      } catch (err: any) {
        console.error('Unexpected error:', err);
        toast.error('Error inesperado. Por favor, inténtelo de nuevo.');
        return { success: false, message: err.message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, closePopup]
  );

  return {
    isOpen,
    isSubmitting,
    openPopup,
    closePopup,
    submitApplication
  };
};
