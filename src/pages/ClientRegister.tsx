import { useSEO } from '@/hooks/useSEO';
import { PAGE_SEO } from '@/lib/seo-config';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  ArrowRight, Shield, MapPin, CreditCard, Upload, X, FileText,
  ChevronRight, ChevronLeft, Loader2, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientRegistration } from '@/hooks/useClientRegistration';
import { ROUTE_PATHS } from '@/lib/index';
import { supabase } from '@/integrations/supabase/client';

// ─── Constantes ───────────────────────────────────────────────────────────────
const MAX_FILE_SIZE   = 20 * 1024 * 1024; // 20 MB
const ACCEPTED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const ACCEPTED_EXT    = '.jpg,.jpeg,.png,.webp,.pdf';

const COUNTRIES = [
  'Chile','Argentina','Colombia','México','Perú','Brasil','Uruguay',
  'Paraguay','Bolivia','Venezuela','Ecuador','España','Estados Unidos','Otro',
];

const DOC_TYPES = [
  { value: 'dni',       label: 'RUT / DNI / Cédula de identidad' },
  { value: 'pasaporte', label: 'Pasaporte'                        },
  { value: 'cedula',    label: 'Cédula de ciudadanía'             },
];

const KYC_DOCS = [
  { id: 'dni_frente',            label: 'DNI / Cédula (frente)',      required: true,  desc: 'Foto clara del frente de tu documento de identidad' },
  { id: 'dni_reverso',           label: 'DNI / Cédula (reverso)',     required: false, desc: 'Foto del reverso (si aplica)' },
  { id: 'pasaporte',             label: 'Pasaporte',                  required: false, desc: 'Página principal con foto y datos personales' },
  { id: 'licencia_conducir',     label: 'Licencia de conducir',       required: false, desc: 'Alternativa al DNI como documento de identidad' },
  { id: 'comprobante_domicilio', label: 'Comprobante de domicilio',   required: true,  desc: 'Cuenta de servicios o bancaria con tu dirección (máx 3 meses de antigüedad)' },
];

const STEPS = [
  { label: 'Cuenta',     short: '1' },
  { label: 'Identidad',  short: '2' },
  { label: 'Domicilio',  short: '3' },
  { label: 'Documentos', short: '4' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  firstName: string; lastName: string; email: string; phone: string;
  password: string; confirmPassword: string;
  nationality: string; document_type: string; document_number: string;
  address: string; city: string; country: string;
  riskTolerance: string; experience: string;
  investmentCapital: string; investmentHorizon: string;
  interestedInstruments: string[]; investmentGoals: string[];
  acceptTerms: boolean; acceptPrivacy: boolean;
}

interface FileUpload {
  file: File; preview?: string;
  uploading?: boolean; uploaded?: boolean;
  error?: string; path?: string;
}

// ─── FileDropZone ─────────────────────────────────────────────────────────────
const FileDropZone = ({
  docId, label, desc, required, upload, onFile, onRemove,
}: {
  docId: string; label: string; desc: string; required: boolean;
  upload?: FileUpload; onFile: (id: string, f: File) => void; onRemove: (id: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const validate = (file: File) => {
    if (file.size > MAX_FILE_SIZE) { alert(`"${file.name}" supera el límite de 20 MB.`); return; }
    if (!ACCEPTED_TYPES.includes(file.type)) { alert('Formato no soportado. Usa JPG, PNG, WEBP o PDF.'); return; }
    onFile(docId, file);
  };

  const isPdf  = upload?.file?.type === 'application/pdf';
  const isImg  = upload?.file && !isPdf;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-semibold">{label}</p>
        {required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded font-bold">Requerido</span>}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{desc}</p>

      {!upload ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) validate(f); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}>
          <Upload className={`w-6 h-6 mx-auto mb-2 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm text-muted-foreground">
            Arrastra aquí o <span className="text-primary font-semibold">haz clic para subir</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP o PDF · Máx. 20 MB</p>
          <input ref={inputRef} type="file" accept={ACCEPTED_EXT} className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) validate(f); }} />
        </div>
      ) : (
        <div className={`border rounded-xl p-3 flex items-center gap-3 transition-all ${
          upload.uploaded ? 'border-green-300 bg-green-50' :
          upload.error   ? 'border-red-300 bg-red-50'     : 'border-border bg-muted/20'
        }`}>
          {isImg && upload.preview
            ? <img src={upload.preview} alt="preview" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{upload.file.name}</p>
            <p className="text-xs text-muted-foreground">{(upload.file.size / 1024 / 1024).toFixed(1)} MB</p>
            {upload.error && <p className="text-xs text-red-500">{upload.error}</p>}
          </div>
          {upload.uploading && <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />}
          {upload.uploaded && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
          {!upload.uploading && (
            <button onClick={() => onRemove(docId)} className="text-muted-foreground hover:text-foreground flex-shrink-0 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const ClientRegister: React.FC = () => {
  useSEO(PAGE_SEO.registro);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    nationality: 'Chile', document_type: 'dni', document_number: '',
    address: '', city: '', country: 'Chile',
    riskTolerance: '', experience: '', investmentCapital: '', investmentHorizon: '',
    interestedInstruments: [], investmentGoals: [],
    acceptTerms: false, acceptPrivacy: false,
  });
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                     = useState<Record<string, string>>({});
  const [files, setFiles]                       = useState<Record<string, FileUpload>>({});
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [submitDone, setSubmitDone]             = useState(false);

  const { registerClientFromProfile, loading } = useClientRegistration();
  const navigate = useNavigate();
  const totalSteps = 4;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleArrayToggle = (field: 'interestedInstruments' | 'investmentGoals', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(i => i !== value) : [...prev[field], value],
    }));
  };

  // ── Validación por paso ─────────────────────────────────────────────────
  const validateStep = (step: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) e.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim())  e.lastName  = 'El apellido es requerido';
      if (!formData.email.trim())     e.email     = 'El email es requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email inválido';
      if (!formData.phone.trim())     e.phone     = 'El teléfono es requerido';
      if (!formData.password)         e.password  = 'La contraseña es requerida';
      else if (formData.password.length < 8) e.password = 'Mínimo 8 caracteres';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (step === 2) {
      if (!formData.document_number.trim()) e.document_number = 'El número de documento es requerido';
    }
    if (step === 3) {
      if (!formData.address.trim()) e.address = 'La dirección es requerida';
      if (!formData.city.trim())    e.city    = 'La ciudad es requerida';
    }
    if (step === 4) {
      if (!formData.acceptTerms)   e.acceptTerms   = 'Debe aceptar los términos y condiciones';
      if (!formData.acceptPrivacy) e.acceptPrivacy = 'Debe aceptar la política de privacidad';
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(currentStep);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setCurrentStep(s => Math.min(s + 1, totalSteps));
  };

  // ── Manejo de archivos ──────────────────────────────────────────────────
  const handleFile = (docId: string, file: File) => {
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setFiles(f => ({ ...f, [docId]: { file, preview } }));
  };

  const removeFile = (docId: string) => {
    setFiles(f => { const n = { ...f }; delete n[docId]; return n; });
  };

  const uploadFiles = async (userId: string) => {
    for (const [docId, upload] of Object.entries(files)) {
      setFiles(f => ({ ...f, [docId]: { ...f[docId], uploading: true } }));
      try {
        const ext  = upload.file.name.split('.').pop();
        const path = `${userId}/${docId}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from('kyc-documents')
          .upload(path, upload.file, { contentType: upload.file.type, upsert: true });
        if (error) throw error;
        await supabase.from('client_kyc_documents_2026_03_16').insert({
          user_id: userId, document_type: docId as any,
          file_path: path, file_name: upload.file.name,
          file_size: upload.file.size, mime_type: upload.file.type,
        });
        setFiles(f => ({ ...f, [docId]: { ...f[docId], uploading: false, uploaded: true, path } }));
      } catch (err: any) {
        setFiles(f => ({ ...f, [docId]: { ...f[docId], uploading: false, error: err.message || 'Error al subir' } }));
      }
    }
  };

  // ── Submit final ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors = validateStep(4);
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    setIsSubmitting(true);
    try {
      const result = await registerClientFromProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        riskTolerance: formData.riskTolerance,
        experience: formData.experience,
        investmentCapital: formData.investmentCapital,
        investmentHorizon: formData.investmentHorizon,
        interestedInstruments: formData.interestedInstruments,
        investmentGoals: formData.investmentGoals,
      });

      if (result.success) {
        // Enriquecer profile con datos adicionales
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('client_profiles_2026_02_08_22_02').update({
            nationality:     formData.nationality,
            document_type:   formData.document_type,
            document_number: formData.document_number,
            address:         formData.address,
            city:            formData.city,
            country:         formData.country,
          }).eq('user_id', user.id);

          if (Object.keys(files).length > 0) await uploadFiles(user.id);
        }
        setSubmitDone(true);
      } else {
        setErrors({ submit: result.error || 'Error en el registro' });
      }
    } catch {
      setErrors({ submit: 'Error inesperado durante el registro' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Pantalla de éxito ───────────────────────────────────────────────────
  if (submitDone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center">
          <Card>
            <CardContent className="pt-8 pb-8 px-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">¡Registro completado!</h2>
              <p className="text-muted-foreground mb-4">
                Tu cuenta ha sido creada. Revisa tu correo para confirmar tu email antes de acceder al portal.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">⏳ Verificación de documentos</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Nuestro equipo revisará tus documentos KYC en 24–48 horas hábiles. Recibirás un email cuando tu cuenta esté completamente verificada.
                </p>
              </div>
              <div className="grid gap-3">
                <Button onClick={() => navigate(ROUTE_PATHS.CLIENT_PORTAL)} className="w-full">
                  Ir al Portal Cliente <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/perfil-de-riesgo')} className="w-full">
                  Completar perfil de riesgo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Registro de Cliente</h1>
            <p className="text-muted-foreground text-sm">
              Paso {currentStep} de {totalSteps} — {STEPS[currentStep - 1].label}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((step, i) => {
              const n     = i + 1;
              const done  = currentStep > n;
              const active = currentStep === n;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done   ? 'bg-green-500 text-white' :
                      active ? 'bg-primary text-primary-foreground' :
                               'bg-muted text-muted-foreground'
                    }`}>
                      {done ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className={`text-xs hidden sm:block ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                      currentStep > i + 1 ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* ── PASO 1: Credenciales ──────────────────────────────────── */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5" />Información Personal y Acceso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Nombre *</Label>
                          <Input id="firstName" value={formData.firstName}
                            onChange={e => handleInputChange('firstName', e.target.value)}
                            className={`mt-1 ${errors.firstName ? 'border-red-500' : ''}`} />
                          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Apellido *</Label>
                          <Input id="lastName" value={formData.lastName}
                            onChange={e => handleInputChange('lastName', e.target.value)}
                            className={`mt-1 ${errors.lastName ? 'border-red-500' : ''}`} />
                          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="email" type="email" value={formData.email}
                              onChange={e => handleInputChange('email', e.target.value)}
                              className={`pl-9 ${errors.email ? 'border-red-500' : ''}`} />
                          </div>
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono *</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="phone" value={formData.phone}
                              onChange={e => handleInputChange('phone', e.target.value)}
                              placeholder="+56 9 XXXX XXXX"
                              className={`pl-9 ${errors.phone ? 'border-red-500' : ''}`} />
                          </div>
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Contraseña * <span className="text-xs text-muted-foreground">(mín. 8 caracteres)</span></Label>
                          <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                              onChange={e => handleInputChange('password', e.target.value)}
                              className={`pl-9 pr-10 ${errors.password ? 'border-red-500' : ''}`} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                          <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                              onChange={e => handleInputChange('confirmPassword', e.target.value)}
                              className={`pl-9 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── PASO 2: Identidad ─────────────────────────────────────── */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="w-5 h-5" />Datos de Identidad
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Nacionalidad</Label>
                          <Select value={formData.nationality} onValueChange={v => handleInputChange('nationality', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tipo de Documento *</Label>
                          <Select value={formData.document_type} onValueChange={v => handleInputChange('document_type', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="document_number">Número de Documento / Pasaporte *</Label>
                        <div className="relative mt-1">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="document_number" value={formData.document_number}
                            onChange={e => handleInputChange('document_number', e.target.value)}
                            placeholder={formData.document_type === 'pasaporte' ? 'Ej: A1234567' : 'Ej: 12.345.678-9'}
                            className={`pl-9 ${errors.document_number ? 'border-red-500' : ''}`} />
                        </div>
                        {errors.document_number && <p className="text-red-500 text-xs mt-1">{errors.document_number}</p>}
                      </div>

                      {/* Experiencia + Perfil inversión (opcionales, pre-llenados desde RiskProfile) */}
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold mb-3">Perfil de Inversión (opcional)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Experiencia en Trading</Label>
                            <Select value={formData.experience} onValueChange={v => handleInputChange('experience', v)}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ninguna">Sin experiencia</SelectItem>
                                <SelectItem value="basica">Básica (&lt;1 año)</SelectItem>
                                <SelectItem value="intermedia">Intermedia (1–3 años)</SelectItem>
                                <SelectItem value="avanzada">Avanzada (3–5 años)</SelectItem>
                                <SelectItem value="profesional">Profesional (+5 años)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Capital de Inversión</Label>
                            <Select value={formData.investmentCapital} onValueChange={v => handleInputChange('investmentCapital', v)}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1000-5000">$1,000 – $5,000</SelectItem>
                                <SelectItem value="5000-10000">$5,000 – $10,000</SelectItem>
                                <SelectItem value="10000-25000">$10,000 – $25,000</SelectItem>
                                <SelectItem value="25000-50000">$25,000 – $50,000</SelectItem>
                                <SelectItem value="50000+">Más de $50,000</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── PASO 3: Domicilio ─────────────────────────────────────── */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5" />Domicilio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-blue-800 mb-1">ℹ️ ¿Por qué pedimos tu dirección?</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          La dirección es requerida para verificación KYC (Conoce a tu Cliente) conforme a regulaciones financieras internacionales. Información estrictamente confidencial.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="address">Dirección (calle, número, depto.) *</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="address" value={formData.address}
                            onChange={e => handleInputChange('address', e.target.value)}
                            placeholder="Av. Providencia 1234, Depto 5A"
                            className={`pl-9 ${errors.address ? 'border-red-500' : ''}`} />
                        </div>
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Ciudad / Comuna *</Label>
                          <Input id="city" value={formData.city}
                            onChange={e => handleInputChange('city', e.target.value)}
                            placeholder="Santiago"
                            className={`mt-1 ${errors.city ? 'border-red-500' : ''}`} />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <Label>País *</Label>
                          <Select value={formData.country} onValueChange={v => handleInputChange('country', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── PASO 4: Documentos KYC + Términos ────────────────────── */}
              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5" />Verificación de Identidad (KYC)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-violet-800 mb-1">📋 Documentos de verificación</p>
                        <p className="text-xs text-violet-700 leading-relaxed">
                          Sube tus documentos para verificar tu identidad. Formatos: JPG, PNG, WEBP, PDF.{' '}
                          <strong>Tamaño máximo: 20 MB por archivo.</strong>{' '}
                          Los documentos marcados como <span className="text-red-600 font-bold">Requerido</span> son obligatorios.
                        </p>
                      </div>

                      {KYC_DOCS.map(doc => (
                        <FileDropZone
                          key={doc.id} docId={doc.id} label={doc.label}
                          desc={doc.desc} required={doc.required}
                          upload={files[doc.id]}
                          onFile={handleFile} onRemove={removeFile}
                        />
                      ))}

                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-xs text-green-700">
                          🔒 Tus documentos son cifrados y almacenados de forma segura. Solo personal autorizado de Pessaro Capital tiene acceso.
                        </p>
                      </div>

                      {/* Términos */}
                      <div className="border-t pt-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <Checkbox id="acceptTerms" checked={formData.acceptTerms}
                            onCheckedChange={v => handleInputChange('acceptTerms', v)}
                            className={errors.acceptTerms ? 'border-red-500' : ''} />
                          <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                            Acepto los <a href="#" className="text-primary underline">términos y condiciones</a> de Pessaro Capital *
                          </Label>
                        </div>
                        {errors.acceptTerms && <p className="text-red-500 text-xs pl-7">{errors.acceptTerms}</p>}

                        <div className="flex items-start gap-3">
                          <Checkbox id="acceptPrivacy" checked={formData.acceptPrivacy}
                            onCheckedChange={v => handleInputChange('acceptPrivacy', v)}
                            className={errors.acceptPrivacy ? 'border-red-500' : ''} />
                          <Label htmlFor="acceptPrivacy" className="text-sm leading-relaxed cursor-pointer">
                            Acepto la <a href="#" className="text-primary underline">política de privacidad</a> *
                          </Label>
                        </div>
                        {errors.acceptPrivacy && <p className="text-red-500 text-xs pl-7">{errors.acceptPrivacy}</p>}
                      </div>

                      {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-800 text-sm">{errors.submit}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navegación */}
            <div className="flex justify-between mt-6 gap-3">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                disabled={currentStep === 1} className="min-w-[100px]">
                <ChevronLeft className="w-4 h-4 mr-1" />Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={goNext} className="min-w-[120px]">
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || loading} className="min-w-[160px]">
                  {isSubmitting || loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creando cuenta...</>
                  ) : (
                    <>Crear Cuenta <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              )}
            </div>

            {/* Skip docs */}
            {currentStep === 4 && !isSubmitting && (
              <p className="text-center mt-4 text-xs text-muted-foreground">
                Puedes subir los documentos más tarde desde{' '}
                <span className="text-primary font-semibold cursor-pointer" onClick={() => handleInputChange('skipDocs', true)}>
                  Mi Cuenta
                </span>
              </p>
            )}
          </form>

          {/* Card de seguridad */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <Shield className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Seguridad y Privacidad</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tu información está protegida con encriptación de nivel bancario. Pessaro Capital cumple con todas las regulaciones financieras internacionales y nunca compartirá tus datos personales con terceros sin tu consentimiento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </div>
    </div>
  );
};

export default ClientRegister;
