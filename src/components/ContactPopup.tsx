import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Schema de validación
const contactFormSchema = z.object({
  fullName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  mobile: z.string().min(8, { message: 'Número móvil no válido' }),
  email: z.string().email({ message: 'Correo electrónico no válido' }),
  investmentCapital: z.number().min(5000, { message: 'El monto mínimo es USD 5,000' }),
  managementType: z.enum(['PAAM', 'Copy Trading'], { message: 'Seleccione un tipo de gestión' }),
  comments: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  buttonType: 'account' | 'demo' | 'start' | 'guide';
}

const ContactPopup: React.FC<ContactPopupProps> = ({ isOpen, onClose, buttonType }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showWhatsApp } = useWhatsApp();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const managementType = watch('managementType');

  const getPopupTitle = () => {
    switch (buttonType) {
      case 'account':
        return 'Abrir Cuenta Real';
      case 'demo':
        return 'Cuenta Demo Gratuita';
      case 'start':
        return 'Empezar Ahora';
      case 'guide':
        return 'Solicitar Guía de Trading';
      default:
        return 'Contacto';
    }
  };

  const getPopupDescription = () => {
    switch (buttonType) {
      case 'account':
        return 'Complete el formulario para abrir su cuenta real y comenzar a operar con capital real.';
      case 'demo':
        return 'Practique sin riesgo con nuestra cuenta demo y $100,000 virtuales.';
      case 'start':
        return 'Inicie su viaje de inversión con Pessaro Capital completando sus datos.';
      case 'guide':
        return 'Reciba nuestra guía completa de trading y estrategias de inversión.';
      default:
        return 'Complete el formulario y nos pondremos en contacto con usted.';
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Enviar email usando Edge Function
      const { data: result, error } = await supabase.functions.invoke('send_contact_email_corrected_2026_01_30_20_41', {
        body: {
          formType: 'popup',
          formData: {
            ...data,
            buttonType
          }
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        toast.error('Error al enviar la solicitud. Por favor, intente nuevamente.');
        setIsSubmitting(false);
        return;
      }

      if (result?.success) {
        setIsSubmitted(true);
        toast.success('✅ Su información fue recepcionada con éxito.');
        
        // Resetear después de 3 segundos
        setTimeout(() => {
          setIsSubmitted(false);
          reset();
          onClose();
          showWhatsApp();
        }, 3000);
      } else {
        toast.error('Error al enviar la solicitud. Por favor, intente nuevamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar la solicitud. Por favor, intente nuevamente.');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSubmitted(false);
      reset();
      onClose();
      showWhatsApp();
    }
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

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-primary text-primary-foreground p-6 relative">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-2">{getPopupTitle()}</h2>
                <p className="text-primary-foreground/90 text-sm">{getPopupDescription()}</p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">¡Solicitud Enviada!</h3>
                    <p className="text-muted-foreground mb-4">
                      Hemos recibido su solicitud. Nuestro equipo se pondrá en contacto con usted en las próximas 24 horas.
                    </p>
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <p className="text-sm text-accent font-medium">
                        📞 Para consultas urgentes: +56 9 22 07 15 11
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Nombre Completo */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User size={16} />
                        Nombre Completo *
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Ej: Juan Carlos Pérez"
                        {...register('fullName')}
                        className={errors.fullName ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Número Móvil */}
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="flex items-center gap-2">
                        <Phone size={16} />
                        Número Móvil *
                      </Label>
                      <Input
                        id="mobile"
                        placeholder="Ej: +56 9 1234 5678"
                        {...register('mobile')}
                        className={errors.mobile ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.mobile && (
                        <p className="text-xs text-destructive">{errors.mobile.message}</p>
                      )}
                    </div>

                    {/* Correo Electrónico */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail size={16} />
                        Correo Electrónico *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Capital a Invertir */}
                    <div className="space-y-2">
                      <Label htmlFor="investmentCapital" className="flex items-center gap-2">
                        <DollarSign size={16} />
                        Capital a Invertir (USD) *
                      </Label>
                      <Input
                        id="investmentCapital"
                        type="number"
                        min="5000"
                        step="1000"
                        placeholder="5000"
                        {...register('investmentCapital', { valueAsNumber: true })}
                        className={errors.investmentCapital ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.investmentCapital && (
                        <p className="text-xs text-destructive">{errors.investmentCapital.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Monto mínimo: USD 5,000</p>
                    </div>

                    {/* Tipo de Gestión */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        Tipo de Gestión *
                      </Label>
                      <Select
                        value={managementType || ''}
                        onValueChange={(value) => setValue('managementType', value as 'PAAM' | 'Copy Trading')}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={errors.managementType ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Seleccione el tipo de gestión" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAAM">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">PAAM</span>
                              <span className="text-xs text-muted-foreground">Gestión Profesional de Activos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Copy Trading">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Copy Trading</span>
                              <span className="text-xs text-muted-foreground">Copia estrategias de traders expertos</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.managementType && (
                        <p className="text-xs text-destructive">{errors.managementType.message}</p>
                      )}
                    </div>

                    {/* Comentarios Adicionales */}
                    <div className="space-y-2">
                      <Label htmlFor="comments">Comentarios Adicionales</Label>
                      <Textarea
                        id="comments"
                        placeholder="¿Tiene alguna pregunta específica o requisito especial?"
                        rows={3}
                        {...register('comments')}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Información Adicional */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm">Información Importante:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Inversión mínima: USD 5,000</li>
                        <li>• Tiempo de respuesta: 24 horas</li>
                        <li>• Asesoría personalizada incluida</li>
                        <li>• Regulado y fondos segregados</li>
                      </ul>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </div>
                      ) : (
                        'Enviar Solicitud'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactPopup;