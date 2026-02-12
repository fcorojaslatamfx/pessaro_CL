import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SiLinkedin } from 'react-icons/si';
import { contactInfo } from '@/data/index';
import { IMAGES } from '@/assets/images';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres'
  }),
  email: z.string().email({
    message: 'Correo electrónico no válido'
  }),
  phone: z.string().min(8, {
    message: 'El número móvil debe tener al menos 8 dígitos'
  }).regex(/^[+]?[0-9\s\-\(\)]+$/, {
    message: 'Formato de número móvil no válido'
  }),
  subject: z.string().min(5, {
    message: 'El asunto debe ser más descriptivo'
  }),
  message: z.string().min(10, {
    message: 'El mensaje debe tener al menos 10 caracteres'
  })
});
type ContactFormValues = z.infer<typeof contactFormSchema>;
const Contacto: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema)
  });
  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Enviar email de confirmación automático al usuario
      const { data: confirmationResult, error: confirmationError } = await supabase.functions.invoke('send_confirmation_email_updated_2026_02_09', {
        body: {
          formType: 'contact',
          formData: data,
          userEmail: data.email
        }
      });

      if (confirmationError) {
        console.error('Error sending confirmation email:', confirmationError);
        // No bloquear el proceso si falla el email de confirmación
      }

      // Enviar notificación interna (opcional - mantener función existente si existe)
      try {
        await supabase.functions.invoke('send_contact_email_corrected_2026_01_30_20_41', {
          body: {
            formType: 'contact',
            formData: data
          }
        });
      } catch (internalError) {
        console.error('Error sending internal notification:', internalError);
        // No bloquear si falla la notificación interna
      }

      // Mostrar mensaje de éxito al usuario
      toast.success('✅ Su información fue recepcionada con éxito.');
      reset();

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar el mensaje. Por favor, intente nuevamente.');
    }
  };
  return <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.BUSINESS_OFFICE_5} alt="Pessaro Capital Office" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-hero font-bold text-white mb-responsive">
            Contacto
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="text-body-lg text-white/80 container-narrow">
            Estamos aquí para responder sus preguntas y ayudarle a alcanzar sus metas financieras.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-responsive-lg">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-responsive-lg items-start">
            
            {/* Contact Form */}
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
              <Card className="border-border/50 shadow-xl">
                <CardHeader className="card-responsive">
                  <CardTitle className="text-heading">Envíenos un mensaje</CardTitle>
                  <CardDescription className="text-body">
                    Complete el formulario a continuación y un asesor se pondrá en contacto con usted en menos de 24 horas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="card-responsive">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-responsive">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" placeholder="Juan Pérez" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" type="email" placeholder="juan.perez@ejemplo.com" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Número Móvil</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+56 9 1234 5678" 
                        {...register('phone')} 
                        className={errors.phone ? 'border-destructive' : ''} 
                      />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto</Label>
                      <Input id="subject" placeholder="Consulta sobre gestión de carteras" {...register('subject')} className={errors.subject ? 'border-destructive' : ''} />
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea id="message" placeholder="¿En qué podemos ayudarle?" rows={5} {...register('message')} className={errors.message ? 'border-destructive' : ''} />
                      {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 sm:py-6" disabled={isSubmitting}>
                      {isSubmitting ? <span className="flex items-center gap-2">
                          <motion.div animate={{
                        rotate: 360
                      }} transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: 'linear'
                      }}>
                            <Send className="w-4 h-4" />
                          </motion.div>
                          Enviando...
                        </span> : <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Enviar Consulta
                        </span>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information & Channels */}
            <div className="space-y-8">
              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Canales de Atención</h2>
                <p className="text-muted-foreground">Nuestra sede central coordina todas las operaciones globales. Puede visitarnos o contactarnos directamente a través de los siguientes canales.</p>

                <div className="grid grid-cols-1 gap-4">
                  <Card className="bg-secondary/30 border-none">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Llámenos</h4>
                        <p className="text-sm text-muted-foreground xl:text-xs">{contactInfo.phone}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/30 border-none">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <p className="text-sm text-muted-foreground xl:text-xs">{contactInfo.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/30 border-none">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Oficina</h4>
                        <p className="text-sm text-muted-foreground xl:text-xs">{contactInfo.address}, {contactInfo.office}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/30 border-none">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Horario</h4>
                        <p className="text-sm text-muted-foreground xl:text-xs">{contactInfo.hours}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: 0.2
            }} className="space-y-4">
                <h3 className="text-xl font-bold">Síguenos en redes</h3>
                <div className="flex gap-4">
                  <a 
                    href="https://www.linkedin.com/company/pessarocapital/?viewAsMember=true" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-muted hover:bg-primary hover:text-white rounded-full transition-colors"
                  >
                    <SiLinkedin className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} viewport={{
              once: true
            }} className="relative h-64 w-full rounded-2xl overflow-hidden border border-border shadow-inner">
                {/* Placeholder para Mapa Reemplazable con Google Maps API o Iframe */}
                <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-center p-6">
                  <MapPin className="w-12 h-12 text-primary mb-2 opacity-50" />
                  <h4 className="font-bold">Sede Central Santiago</h4>
                  <p className="text-sm text-muted-foreground mb-4">Av. Apoquindo 6410 oficina 605, Las Condes</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address + ' ' + contactInfo.office)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Ver en Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/50 to-transparent" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Info */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">¿Necesita soporte técnico inmediato?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
              <h4 className="font-bold">Centro de Ayuda</h4>
              <p className="text-sm text-primary-foreground/70">Consulte nuestras guías y FAQs en la sección educativa.</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
              <h4 className="font-bold">Chat en Vivo</h4>
              <p className="text-sm text-primary-foreground/70">Disponible 24/5 para clientes registrados en la plataforma.</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
              <h4 className="font-bold">Portal de Cliente</h4>
              <p className="text-sm text-primary-foreground/70">Gestione sus tickets de soporte directamente desde su dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Contacto;