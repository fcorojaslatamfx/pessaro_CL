import { useState } from 'react';
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

export const useWorkWithUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  const submitApplication = async (formData: WorkWithUsData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
        body: {
          formType: 'work_with_us',
          formData
        }
      });

      if (error) {
        console.error('Error submitting work application:', error);
        toast.error('Error al enviar la aplicación. Por favor, inténtelo de nuevo.');
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast.success('¡Aplicación enviada exitosamente! Revisaremos tu perfil y nos pondremos en contacto pronto.');
        closePopup();
        return { success: true, data };
      } else {
        toast.error(data?.message || 'Error al procesar la aplicación');
        return { success: false, error: data?.message };
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast.error('Error inesperado. Por favor, inténtelo de nuevo.');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    isSubmitting,
    openPopup,
    closePopup,
    submitApplication
  };
};