import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, CheckCircle, Loader2, User, Mail, Phone, Linkedin, Instagram, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';

interface WorkWithUsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  linkedinProfile: string;
  instagramProfile: string;
  workExperience: string;
  investmentKnowledge: string;
  tradingExperience: string;
  financialEducation: string;
  careerGoals: string;
  whyJoinUs: string;
}

type InvestmentQuestionId = 'investmentKnowledge' | 'tradingExperience' | 'financialEducation' | 'careerGoals';

const investmentQuestions: Array<{
  id: InvestmentQuestionId;
  question: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    id: 'investmentKnowledge',
    question: '¿Cuál es tu nivel de conocimiento en inversiones?',
    options: [
      { value: 'beginner', label: 'Principiante - Conocimientos básicos' },
      { value: 'intermediate', label: 'Intermedio - Experiencia moderada' },
      { value: 'advanced', label: 'Avanzado - Amplia experiencia' },
      { value: 'expert', label: 'Experto - Conocimiento profesional' }
    ]
  },
  {
    id: 'tradingExperience',
    question: '¿Tienes experiencia en trading o análisis de mercados?',
    options: [
      { value: 'none', label: 'Sin experiencia' },
      { value: 'personal', label: 'Trading personal/hobby' },
      { value: 'professional', label: 'Experiencia profesional' },
      { value: 'certified', label: 'Certificado/Licenciado en el área' }
    ]
  },
  {
    id: 'financialEducation',
    question: '¿Cuál es tu formación académica relacionada con finanzas?',
    options: [
      { value: 'none', label: 'Sin formación específica' },
      { value: 'courses', label: 'Cursos y certificaciones' },
      { value: 'technical', label: 'Carrera técnica relacionada' },
      { value: 'university', label: 'Título universitario en finanzas/economía' }
    ]
  },
  {
    id: 'careerGoals',
    question: '¿Qué área te interesa más para desarrollarte profesionalmente?',
    options: [
      { value: 'analysis', label: 'Análisis de mercados y research' },
      { value: 'advisory', label: 'Asesoría y atención al cliente' },
      { value: 'education', label: 'Educación financiera y contenido' },
      { value: 'operations', label: 'Operaciones y gestión de riesgo' }
    ]
  }
];

const chilePhoneRegex = /^\+?56(9[0-9]{8}|[2-8][0-9]{7,8})$/;

const WorkWithUsPopup: React.FC<WorkWithUsPopupProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    linkedinProfile: '',
    instagramProfile: '',
    workExperience: '',
    investmentKnowledge: '',
    tradingExperience: '',
    financialEducation: '',
    careerGoals: '',
    whyJoinUs: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData> & { resume?: string }>({});

  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> & { resume?: string } = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'El nombre completo es requerido';
      if (!formData.email.trim()) newErrors.email = 'El correo electrónico es requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Ingrese un correo electrónico válido';
      if (!formData.phone.trim()) newErrors.phone = 'El número de móvil es requerido';
      else if (!chilePhoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Ingrese un número chileno válido (ej: +56 9 1234 5678)';
      }
    }

    if (step === 2) {
      if (!formData.investmentKnowledge) newErrors.investmentKnowledge = 'Seleccione su nivel de conocimiento';
      if (!formData.tradingExperience) newErrors.tradingExperience = 'Seleccione su experiencia en trading';
      if (!formData.financialEducation) newErrors.financialEducation = 'Seleccione su formación académica';
      if (!formData.careerGoals) newErrors.careerGoals = 'Seleccione el área de interés';
    }

    if (step === 3) {
      if (!formData.workExperience.trim()) newErrors.workExperience = 'La experiencia laboral es requerida';
      if (!formData.whyJoinUs.trim()) newErrors.whyJoinUs = 'Por favor explique por qué quiere unirse';
      if (!resumeFile) newErrors.resume = 'La hoja de vida (CV) es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    let resumeUrl = '';

    // Subir CV
    if (resumeFile) {
      setIsUploadingCV(true);
      try {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `cv-${Date.now()}-${formData.fullName.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
        resumeUrl = urlData.publicUrl;
      } catch (err) {
        alert('Error al subir el CV. Inténtalo nuevamente.');
        setIsSubmitting(false);
        setIsUploadingCV(false);
        return;
      } finally {
        setIsUploadingCV(false);
      }
    }

    // Enviar aplicación
    try {
      const applicationData = {
        type: 'job_application',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedinProfile: formData.linkedinProfile,
        instagramProfile: formData.instagramProfile,
        workExperience: formData.workExperience,
        investmentKnowledge: formData.investmentKnowledge,
        tradingExperience: formData.tradingExperience,
        financialEducation: formData.financialEducation,
        careerGoals: formData.careerGoals,
        whyJoinUs: formData.whyJoinUs,
        resumeUrl,
        message: `Nueva aplicación de ${formData.fullName} - Área: ${formData.careerGoals} - CV adjunto`
      };

      const { error } = await supabase.functions.invoke('send_confirmation_email_updated_2026_02_09', {
        body: applicationData
      });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar la aplicación. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', phone: '', email: '', linkedinProfile: '', instagramProfile: '',
      workExperience: '', investmentKnowledge: '', tradingExperience: '',
      financialEducation: '', careerGoals: '', whyJoinUs: ''
    });
    setResumeFile(null);
    setCurrentStep(1);
    setErrors({});
    setIsSuccess(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Información Personal</h3>
        <p className="text-muted-foreground">Cuéntanos sobre ti y cómo contactarte</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre Completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="fullName" type="text" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Tu nombre completo" className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`} />
          </div>
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>
        {/* email, phone, linkedin, instagram exactamente igual al original */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="tu@correo.com" className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Número de Móvil *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+56 9 1234 5678" className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`} />
          </div>
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">Perfil de LinkedIn (Opcional)</Label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="linkedin" type="url" value={formData.linkedinProfile} onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))} placeholder="https://linkedin.com/in/tu-perfil" className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Perfil de Instagram (Opcional)</Label>
          <div className="relative">
            <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="instagram" type="url" value={formData.instagramProfile} onChange={(e) => setFormData(prev => ({ ...prev, instagramProfile: e.target.value }))} placeholder="https://instagram.com/tu-usuario" className="pl-10" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Cuestionario de Inversiones</h3>
        <p className="text-muted-foreground">Ayúdanos a conocer tu experiencia financiera</p>
      </div>
      <div className="space-y-6">
        {investmentQuestions.map((question) => (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-semibold">{question.question} *</Label>
            <RadioGroup value={formData[question.id]} onValueChange={(value) => setFormData(prev => ({ ...prev, [question.id]: value }))} className="space-y-2">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="text-sm font-normal cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors[question.id] && <p className="text-sm text-red-500">{errors[question.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Experiencia y Motivación</h3>
        <p className="text-muted-foreground">Cuéntanos sobre tu trayectoria y objetivos</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workExperience">Experiencia Laboral *</Label>
          <Textarea id="workExperience" value={formData.workExperience} onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))} placeholder="Describe brevemente tu experiencia laboral..." rows={4} className={errors.workExperience ? 'border-red-500' : ''} />
          {errors.workExperience && <p className="text-sm text-red-500">{errors.workExperience}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whyJoinUs">¿Por qué quieres trabajar con Pessaro Capital? *</Label>
          <Textarea id="whyJoinUs" value={formData.whyJoinUs} onChange={(e) => setFormData(prev => ({ ...prev, whyJoinUs: e.target.value }))} placeholder="Explica qué te motiva..." rows={4} className={errors.whyJoinUs ? 'border-red-500' : ''} />
          {errors.whyJoinUs && <p className="text-sm text-red-500">{errors.whyJoinUs}</p>}
        </div>
      </div>

      {/* === SUBIDA DE CV === */}
      <div className="space-y-2">
        <Label>Hoja de Vida / CV *</Label>
        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${errors.resume ? 'border-red-500 bg-red-50/50' : 'border-muted hover:border-green-500'}`}>
          {resumeFile ? (
            <div className="flex items-center justify-center gap-4">
              <FileText className="w-10 h-10 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-sm">{resumeFile.name}</p>
                <p className="text-xs text-muted-foreground">{(resumeFile.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setResumeFile(null)} className="text-red-600 hover:text-red-700">Eliminar</Button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size < 10 * 1024 * 1024) {
                  setResumeFile(file);
                  setErrors(prev => ({ ...prev, resume: undefined }));
                } else {
                  alert('El archivo no debe superar los 10 MB');
                }
              }} className="hidden" />
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">Haz clic o arrastra tu CV aquí</p>
                  <p className="text-sm text-muted-foreground">PDF, Word • Máx. 10 MB</p>
                </div>
              </div>
            </label>
          )}
        </div>
        {errors.resume && <p className="text-sm text-red-500">{errors.resume}</p>}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">¿Qué ofrecemos?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Ambiente de trabajo dinámico y colaborativo</li>
          <li>• Oportunidades de crecimiento profesional</li>
          <li>• Capacitación continua en mercados financieros</li>
          <li>• Compensación competitiva y beneficios</li>
          <li>• Flexibilidad laboral y trabajo remoto</li>
        </ul>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Trabaja con Nosotros</h2>
                  <p className="text-sm text-muted-foreground">Únete al equipo líder en servicios financieros</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting} className="rounded-full"><X className="w-4 h-4" /></Button>
            </div>

            {/* PROGRESS BAR */}
            <div className="px-6 py-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
                <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% completado</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isSuccess ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                  <h3 className="text-xl font-bold mb-2">¡Aplicación Enviada!</h3>
                  <p className="text-muted-foreground mb-4">Gracias por tu interés en unirte a Pessaro Capital.</p>
                  <p className="text-sm text-muted-foreground">Te contactaremos dentro de los próximos 5 días hábiles.</p>
                </motion.div>
              ) : (
                <>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </>
              )}
            </div>

            {/* FOOTER */}
            {!isSuccess && (
              <div className="flex justify-between items-center p-6 border-t border-border bg-card">
                <Button variant="outline" onClick={currentStep === 1 ? handleClose : handlePrevious} disabled={isSubmitting}>
                  {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                </Button>
                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">Siguiente</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : 'Enviar Aplicación'}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WorkWithUsPopup;