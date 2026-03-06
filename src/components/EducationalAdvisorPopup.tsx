import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

interface EducationalAdvisorPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  interestedTopics: string[];
}

const tradingTopics = [
  'Análisis Técnico',
  'Análisis Fundamental',
  'Gestión de Riesgo',
  'Psicología del Trading',
  'Estrategias de Trading',
  'Forex (Divisas)',
  'Acciones y ETFs',
  'Criptomonedas',
  'Commodities',
  'Índices Bursátiles',
  'Trading Algorítmico',
  'Gestión de Portafolios',
  'Planificación Financiera',
  'Inversión a Largo Plazo',
  'Day Trading',
  'Swing Trading'
];

const EducationalAdvisorPopup: React.FC<EducationalAdvisorPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    interestedTopics: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [errors, setErrors]             = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim())
      newErrors.fullName = 'El nombre completo es requerido';

    if (!formData.email.trim())
      newErrors.email = 'El correo electrónico es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Ingrese un correo electrónico válido';

    if (!formData.phone.trim())
      newErrors.phone = 'El número de móvil es requerido';
    else if (!/^[+]?[\d\s\-()]{8,}$/.test(formData.phone))
      newErrors.phone = 'Ingrese un número de teléfono válido';

    if (formData.interestedTopics.length === 0)
      newErrors.interestedTopics = ['Seleccione al menos un tema de interés'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interestedTopics: checked
        ? [...prev.interestedTopics, topic]
        : prev.interestedTopics.filter(t => t !== topic)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('unified_forms_complete_2026_02_25_20_30', {
        body: {
          formType: 'educational_advisor',
          formData: {
            fullName: formData.fullName,
            email:    formData.email,
            phone:    formData.phone,
            topics:   formData.interestedTopics,
          },
          userEmail: formData.email
        }
      });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ fullName: '', email: '', phone: '', interestedTopics: [] });
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar su solicitud. Por favor, inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setFormData({ fullName: '', email: '', phone: '', interestedTopics: [] });
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Contactar Asesor Educativo</h2>
                  <p className="text-sm text-muted-foreground">
                    Reciba orientación personalizada sobre trading y gestión de inversiones
                  </p>
                </div>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">¡Solicitud Enviada!</h3>
                  <p className="text-muted-foreground mb-4">
                    Su solicitud ha sido recibida exitosamente. Un asesor educativo se pondrá en
                    contacto con usted dentro de las próximas 24 horas.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    También recibirá un correo de confirmación en breve.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información Personal</h3>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="Ingrese su nombre completo"
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="ejemplo@correo.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Número de Móvil *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Temas de Interés */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Temas de Interés *</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Seleccione los temas sobre los que le gustaría recibir orientación educativa:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tradingTopics.map(topic => (
                        <div key={topic} className="flex items-center space-x-2">
                          <Checkbox
                            id={topic}
                            checked={formData.interestedTopics.includes(topic)}
                            onCheckedChange={checked => handleTopicChange(topic, checked as boolean)}
                          />
                          <Label htmlFor={topic} className="text-sm font-normal cursor-pointer">
                            {topic}
                          </Label>
                        </div>
                      ))}
                    </div>

                    {errors.interestedTopics && (
                      <p className="text-sm text-red-500">Seleccione al menos un tema de interés</p>
                    )}
                  </div>

                  {/* Información Adicional */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">¿Qué incluye la asesoría educativa?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Consulta personalizada de 30 minutos</li>
                      <li>• Recomendaciones de recursos educativos</li>
                      <li>• Plan de aprendizaje adaptado a su nivel</li>
                      <li>• Acceso a materiales exclusivos</li>
                      <li>• Seguimiento de progreso</li>
                    </ul>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button" variant="outline"
                      onClick={handleClose} disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                        : 'Solicitar Asesoría'
                      }
                    </Button>
                  </div>

                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EducationalAdvisorPopup;