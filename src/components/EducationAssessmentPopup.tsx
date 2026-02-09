import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, DollarSign, BookOpen, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Schema de validación
const assessmentFormSchema = z.object({
  fullName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Correo electrónico no válido' }),
  phone: z.string().min(8, { message: 'Número de teléfono no válido' }),
  interests: z.array(z.string()).min(1, { message: 'Seleccione al menos un área de interés' }),
  knowledgeLevel: z.enum(['basico', 'principiante-intermedio', 'intermedio', 'intermedio-avanzado', 'avanzado'], 
    { message: 'Seleccione su nivel de conocimientos' }),
  investmentCapital: z.number().min(1000, { message: 'El monto mínimo es USD 1,000' }),
  learningGoals: z.string().optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface EducationAssessmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  courseType?: string;
}

const EducationAssessmentPopup: React.FC<EducationAssessmentPopupProps> = ({ 
  isOpen, 
  onClose, 
  courseType 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
  });

  const knowledgeLevel = watch('knowledgeLevel');
  const investmentCapital = watch('investmentCapital');

  const marketAreas = [
    { id: 'forex', label: 'Mercado de Divisas (Forex)', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'stocks', label: 'Acciones', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'indices', label: 'Índices Bursátiles', icon: <Target className="w-5 h-5" /> },
    { id: 'crypto', label: 'Criptomonedas', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'etf', label: 'ETFs', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const knowledgeLevels = [
    { value: 'basico', label: 'Básico', description: 'Nuevo en trading, conceptos fundamentales' },
    { value: 'principiante-intermedio', label: 'Principiante-Intermedio', description: 'Conocimientos básicos, algunas operaciones' },
    { value: 'intermedio', label: 'Intermedio', description: 'Experiencia regular, estrategias básicas' },
    { value: 'intermedio-avanzado', label: 'Intermedio-Avanzado', description: 'Buen conocimiento, análisis técnico' },
    { value: 'avanzado', label: 'Avanzado', description: 'Experto, estrategias complejas' },
  ];

  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    setValue('interests', newInterests);
  };

  const onSubmit = async (data: AssessmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Enviar evaluación usando Edge Function
      const { data: result, error } = await supabase.functions.invoke('send_contact_email_final_2026_01_30_20_41', {
        body: {
          formType: 'education_assessment',
          formData: {
            ...data,
            courseType: courseType || 'general',
            interests: selectedInterests
          }
        }
      });

      if (error) {
        console.error('Error sending assessment:', error);
        toast.error('Error al enviar la evaluación. Por favor, intente nuevamente.');
        setIsSubmitting(false);
        return;
      }

      if (result?.success) {
        setIsSubmitted(true);
        toast.success('Evaluación enviada correctamente. Nos pondremos en contacto pronto.');
        
        // Resetear después de 3 segundos
        setTimeout(() => {
          setIsSubmitted(false);
          reset();
          setSelectedInterests([]);
          setCurrentStep(1);
          onClose();
        }, 3000);
      } else {
        toast.error('Error al enviar la evaluación. Por favor, intente nuevamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar la evaluación. Por favor, intente nuevamente.');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSubmitted(false);
      setSelectedInterests([]);
      setCurrentStep(1);
      reset();
      onClose();
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border shadow-2xl">
              <CardHeader className="relative pb-4">
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 p-2 hover:bg-muted rounded-full transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="pr-12">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {isSubmitted ? '¡Evaluación Completada!' : 'Evaluación de Conocimientos'}
                  </CardTitle>
                  {!isSubmitted && (
                    <p className="text-muted-foreground mt-2">
                      Ayúdanos a personalizar tu experiencia de aprendizaje
                    </p>
                  )}
                </div>

                {!isSubmitted && (
                  <div className="flex items-center gap-2 mt-4">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          step <= currentStep ? 'bg-accent' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      ¡Gracias por completar la evaluación!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Hemos recibido tu información y pronto recibirás un plan de aprendizaje personalizado.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Cerrando automáticamente...
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Paso 1: Información Personal */}
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Información Personal
                        </h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nombre Completo</Label>
                          <Input
                            id="fullName"
                            placeholder="Juan Pérez"
                            {...register('fullName')}
                            className={errors.fullName ? 'border-destructive' : ''}
                          />
                          {errors.fullName && (
                            <p className="text-xs text-destructive">{errors.fullName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="juan.perez@ejemplo.com"
                            {...register('email')}
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive">{errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            placeholder="+56 9 1234 5678"
                            {...register('phone')}
                            className={errors.phone ? 'border-destructive' : ''}
                          />
                          {errors.phone && (
                            <p className="text-xs text-destructive">{errors.phone.message}</p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button type="button" onClick={nextStep} className="bg-accent text-accent-foreground">
                            Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Paso 2: Intereses y Nivel */}
                    {currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Áreas de Interés y Conocimientos
                        </h3>
                        
                        <div className="space-y-3">
                          <Label>¿Qué mercados te interesan? (Selecciona todos los que apliquen)</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {marketAreas.map((area) => (
                              <button
                                key={area.id}
                                type="button"
                                onClick={() => handleInterestToggle(area.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                                  selectedInterests.includes(area.id)
                                    ? 'border-accent bg-accent/10 text-accent'
                                    : 'border-border hover:border-accent/50'
                                }`}
                              >
                                {area.icon}
                                <span className="font-medium">{area.label}</span>
                                {selectedInterests.includes(area.id) && (
                                  <CheckCircle className="w-4 h-4 ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                          {errors.interests && (
                            <p className="text-xs text-destructive">{errors.interests.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Nivel de Conocimientos</Label>
                          <Select onValueChange={(value) => setValue('knowledgeLevel', value as any)}>
                            <SelectTrigger className={errors.knowledgeLevel ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Selecciona tu nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              {knowledgeLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  <div>
                                    <div className="font-medium">{level.label}</div>
                                    <div className="text-xs text-muted-foreground">{level.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.knowledgeLevel && (
                            <p className="text-xs text-destructive">{errors.knowledgeLevel.message}</p>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={prevStep}>
                            Anterior
                          </Button>
                          <Button type="button" onClick={nextStep} className="bg-accent text-accent-foreground">
                            Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Paso 3: Capital y Objetivos */}
                    {currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Capital y Objetivos de Aprendizaje
                        </h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="investmentCapital">Capital Disponible para Gestión (USD)</Label>
                          <Input
                            id="investmentCapital"
                            type="number"
                            placeholder="10000"
                            min="1000"
                            step="1000"
                            {...register('investmentCapital', { valueAsNumber: true })}
                            className={errors.investmentCapital ? 'border-destructive' : ''}
                          />
                          <p className="text-xs text-muted-foreground">
                            Monto que estaría dispuesto a invertir durante su aprendizaje
                          </p>
                          {errors.investmentCapital && (
                            <p className="text-xs text-destructive">{errors.investmentCapital.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="learningGoals">Objetivos de Aprendizaje (Opcional)</Label>
                          <Textarea
                            id="learningGoals"
                            placeholder="¿Qué esperas lograr con tu educación financiera?"
                            rows={3}
                            {...register('learningGoals')}
                          />
                        </div>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={prevStep}>
                            Anterior
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            {isSubmitting ? 'Enviando...' : 'Completar Evaluación'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EducationAssessmentPopup;