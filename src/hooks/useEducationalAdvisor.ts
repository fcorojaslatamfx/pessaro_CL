import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EducationalAdvisorData {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  topics: string[];
  specificQuestions?: string;
}

export const useEducationalAdvisor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  const submitForm = async (formData: EducationalAdvisorData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
        body: {
          formType: 'educational_advisor',
          formData
        }
      });

      if (error) {
        console.error('Error submitting educational advisor form:', error);
        toast.error('Error al enviar la solicitud. Por favor, inténtelo de nuevo.');
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast.success('¡Solicitud enviada exitosamente! Un asesor educativo se pondrá en contacto pronto.');
        closePopup();
        return { success: true, data };
      } else {
        toast.error(data?.message || 'Error al procesar la solicitud');
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
    submitForm
  };
};