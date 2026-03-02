import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EducationAssessmentData {
  fullName: string;
  email: string;
  phone: string;
  currentLevel: string;
  interestedTopics: string[];
  learningGoals: string;
  timeCommitment: string;
  preferredFormat: string;
  specificQuestions?: string;
}

export const useEducationAssessment = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseType, setCourseType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAssessment = (type: string = 'general') => {
    setCourseType(type);
    setIsOpen(true);
  };

  const closeAssessment = () => {
    setIsOpen(false);
    setCourseType('');
  };

  const submitAssessment = async (formData: EducationAssessmentData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
        body: {
          formType: 'education_assessment',
          formData: {
            ...formData,
            courseType
          }
        }
      });

      if (error) {
        console.error('Error submitting education assessment:', error);
        toast.error('Error al enviar la evaluación. Por favor, inténtelo de nuevo.');
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast.success('¡Evaluación enviada exitosamente! Te contactaremos con recomendaciones personalizadas.');
        closeAssessment();
        return { success: true, data };
      } else {
        toast.error(data?.message || 'Error al procesar la evaluación');
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
    courseType,
    isSubmitting,
    openAssessment,
    closeAssessment,
    submitAssessment,
  };
};