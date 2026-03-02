import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PopupType = 'account' | 'demo' | 'start' | 'guide';

interface ContactFormData {
  fullName: string;
  email: string;
  mobile: string;
  investmentCapital: number;
  managementType: string;
  comments?: string;
}

export const useContactPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>('account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openPopup = (type: PopupType) => {
    setPopupType(type);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const submitForm = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
        body: {
          formType: 'popup',
          formData: {
            ...formData,
            buttonType: popupType
          }
        }
      });

      if (error) {
        console.error('Error submitting form:', error);
        toast.error('Error al enviar el formulario. Por favor, inténtelo de nuevo.');
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast.success('¡Formulario enviado exitosamente! Nos pondremos en contacto pronto.');
        closePopup();
        return { success: true, data };
      } else {
        toast.error(data?.message || 'Error al procesar el formulario');
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
    popupType,
    isSubmitting,
    openPopup,
    closePopup,
    submitForm,
  };
};