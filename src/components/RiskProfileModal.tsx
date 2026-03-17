import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, DollarSign, Target, Clock, TrendingUp, Shield,
  ArrowRight, CheckCircle2, Leaf, Flame, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiskProfile } from '@/hooks/useRiskProfile';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface RiskProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: RiskProfile, shouldRegisterClient?: boolean) => void;
  showRegistrationOption?: boolean;
}

// ─── 5 Perfiles con especificaciones financieras exactas ─────────────────────
const RISK_PROFILES = [
  {
    value: 'conservador',
    label: 'Conservador',
    drawdown: '5–10%',
    description: 'Priorizas la seguridad del capital. Stop-loss estrictos y posiciones pequeñas.',
    instruments: 'Pares de divisas principales — EUR/USD, GBP/USD, USD/JPY',
    icon: Leaf,
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    value: 'moderado',
    label: 'Moderado',
    drawdown: '10–15%',
    description: 'Balance entre riesgo y retorno. Cartera centrada en divisas principales.',
    instruments: 'Pares de divisas mayores y menores',
    icon: Shield,
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    value: 'moderado_plus',
    label: 'Moderado Plus',
    drawdown: '15–30%',
    description: 'Mayor rentabilidad incorporando materias primas junto con divisas.',
    instruments: 'Divisas + Materias primas: XAU, XAG, Petróleo',
    icon: TrendingUp,
    activeBorder: 'border-violet-500',
    activeBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  {
    value: 'agresivo',
    label: 'Agresivo',
    drawdown: 'Hasta 40%',
    description: 'Maximizas retornos asumiendo alta volatilidad en todos los mercados.',
    instruments: 'Divisas + Materias primas + Índices bursátiles',
    icon: TrendingUp,
    activeBorder: 'border-orange-500',
    activeBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    value: 'muy_agresivo',
    label: 'Muy Agresivo',
    drawdown: '+50%',
    description: 'Máximo potencial de retorno con exposición total a mercados volátiles.',
    instruments: 'Divisas + Materias primas + Índices + Criptomonedas',
    icon: Flame,
    activeBorder: 'border-red-500',
    activeBg: 'bg-red-50',
    iconColor: 'text-red-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
] as const;

type RiskValue = typeof RISK_PROFILES[number]['value'];

// ─── Preguntas de tolerancia ──────────────────────────────────────────────────
const TOLERANCE_QUESTIONS = [
  {
    id: 'loss_reaction',
    label: '¿Qué harías si tu cuenta cae un 20% en un mes?',
    options: [
      { value: 'close_all', label: 'Cerraría todo de inmediato' },
      { value: 'reduce',    label: 'Reduciría posiciones y esperaría' },
      { value: 'hold',      label: 'Mantendría mis posiciones' },
      { value: 'add_more',  label: 'Aprovecharía para comprar más' },
    ],
  },
  {
    id: 'max_drawdown',
    label: '¿Cuál es el drawdown máximo que aceptarías?',
    options: [
      { value: 'under_10',  label: 'Menos del 10% — muy conservador' },
      { value: '10_15',     label: '10–15% — moderado (solo divisas)' },
      { value: '15_30',     label: '15–30% — divisas + materias primas' },
      { value: 'over_30',   label: 'Más del 30% — agresivo/muy agresivo' },
    ],
  },
];

const INVESTMENT_GOALS = [
  { id: 'crecimiento',    label: 'Crecimiento de Capital',   icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'ingresos',       label: 'Generación de Ingresos',   icon: <DollarSign className="w-4 h-4" /> },
  { id: 'preservacion',   label: 'Preservación de Capital',  icon: <Shield className="w-4 h-4" /> },
  { id: 'diversificacion',label: 'Diversificación',          icon: <Target className="w-4 h-4" /> },
  { id: 'jubilacion',     label: 'Ahorro para Jubilación',   icon: <Clock className="w-4 h-4" /> },
  { id: 'educacion',      label: 'Educación Financiera',     icon: <User className="w-4 h-4" /> },
];

const INSTRUMENTS = [
  { id: 'forex',         label: 'Forex — Pares de Divisas' },
  { id: 'commodities',   label: 'Materias Primas (XAU, XAG, WTI)' },
  { id: 'indices',       label: 'Índices Bursátiles' },
  { id: 'acciones',      label: 'Acciones' },
  { id: 'criptomonedas', label: 'Criptomonedas' },
  { id: 'etfs',          label: 'ETFs' },
];

const STEP_LABELS = ['Datos', 'Riesgo', 'Capital', 'Objetivos'];

// ─── Componente ───────────────────────────────────────────────────────────────
const RiskProfileModal: React.FC<RiskProfileModalProps> = ({
  isOpen, onClose, onSave,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [toleranceAnswers, setToleranceAnswers] = useState<Record<string, string>>({});
  const { showWhatsApp } = useWhatsApp();

  const [formData, setFormData] = useState<RiskProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    riskTolerance: 'moderado' as any,
    investmentCapital: '',
    investmentGoals: [],
    investmentHorizon: '1-año',
    tradingExperience: 'basica',
    preferredInstruments: [],
  });

  const totalSteps = 4;

  const set = (field: keyof RiskProfile, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const toggleArr = (field: 'investmentGoals' | 'preferredInstruments', v: string) =>
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(v)
        ? (prev[field] as string[]).filter(x => x !== v)
        : [...(prev[field] as string[]), v],
    }));

  const validate = (step: number) => {
    switch (step) {
      case 1: return !!(formData.firstName.trim() && formData.lastName.trim() && formData.email.trim());
      case 2: return !!(formData.riskTolerance && formData.tradingExperience);
      case 3: return !!(formData.investmentCapital && formData.investmentHorizon);
      case 4: return formData.investmentGoals.length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (validate(currentStep) && currentStep < totalSteps) {
      setShowValidationError(false);
      setCurrentStep(s => s + 1);
    } else {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
    }
  };

  const goPrev = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleClose = () => { onClose(); showWhatsApp(); };

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData, toleranceAnswers };
      const { error } = await supabase.functions.invoke(
        'send_risk_profile_2026_02_08_21_16',
        { body: payload }
      );
      if (error) console.error('Error sending risk profile:', error);
      onSave(formData, false);
      showWhatsApp();
    } catch (e) {
      console.error('Error submitting risk profile:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Paso 1: Datos personales ────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <User className="w-10 h-10 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Información Personal</h3>
        <p className="text-sm text-muted-foreground">Datos para personalizar tu experiencia</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rp-fname">Nombre *</Label>
          <Input id="rp-fname" autoComplete="given-name" placeholder="Tu nombre"
            value={formData.firstName} onChange={e => set('firstName', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="rp-lname">Apellido *</Label>
          <Input id="rp-lname" autoComplete="family-name" placeholder="Tu apellido"
            value={formData.lastName} onChange={e => set('lastName', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="rp-email">Correo Electrónico *</Label>
        <Input id="rp-email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={formData.email} onChange={e => set('email', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="rp-phone">Teléfono</Label>
        <Input id="rp-phone" type="tel" autoComplete="tel" placeholder="+56 9 1234 5678"
          value={formData.phone} onChange={e => set('phone', e.target.value)} className="mt-1" />
      </div>
    </div>
  );

  // ── Paso 2: Perfil de riesgo con 5 opciones ─────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Perfil de Riesgo</h3>
        <p className="text-sm text-muted-foreground">Selecciona el nivel que mejor te describe</p>
      </div>

      {/* 5 perfiles */}
      <div className="space-y-2">
        {RISK_PROFILES.map(profile => {
          const active = formData.riskTolerance === profile.value;
          const Icon = profile.icon;
          return (
            <div key={profile.value}
              onClick={() => set('riskTolerance', profile.value)}
              className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                active ? `${profile.activeBorder} ${profile.activeBg}` : 'border-border hover:border-primary/40'
              }`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${active ? profile.iconColor : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <Badge className={`text-xs ${profile.badgeClass}`}>{profile.label}</Badge>
                    <span className="text-xs text-muted-foreground font-medium">Drawdown: {profile.drawdown}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{profile.description}</p>
                  <p className="text-xs text-primary/70 mt-0.5 font-medium truncate">📊 {profile.instruments}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                  active ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Preguntas de tolerancia */}
      <div className="border-t pt-4 space-y-4">
        <p className="text-sm font-medium">Preguntas de tolerancia (opcional)</p>
        {TOLERANCE_QUESTIONS.map(q => (
          <div key={q.id}>
            <Label className="text-sm">{q.label}</Label>
            <div className="grid grid-cols-1 gap-1.5 mt-2">
              {q.options.map(opt => {
                const sel = toleranceAnswers[q.id] === opt.value;
                return (
                  <div key={opt.value}
                    onClick={() => setToleranceAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                    className={`px-3 py-2 border rounded-lg cursor-pointer text-sm flex items-center justify-between transition-all ${
                      sel ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/40 text-muted-foreground'
                    }`}>
                    <span>{opt.label}</span>
                    {sel && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Experiencia */}
      <div>
        <Label>Experiencia en Trading *</Label>
        <Select value={formData.tradingExperience}
          onValueChange={v => set('tradingExperience', v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecciona tu nivel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ninguna">Sin experiencia</SelectItem>
            <SelectItem value="basica">Básica (menos de 1 año)</SelectItem>
            <SelectItem value="intermedia">Intermedia (1–3 años)</SelectItem>
            <SelectItem value="avanzada">Avanzada (3–5 años)</SelectItem>
            <SelectItem value="profesional">Profesional (más de 5 años)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // ── Paso 3: Capital e instrumentos ──────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <DollarSign className="w-10 h-10 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Capital e Inversión</h3>
        <p className="text-sm text-muted-foreground">Define tu capacidad y horizonte temporal</p>
      </div>
      <div>
        <Label>Capital Disponible *</Label>
        <Select value={formData.investmentCapital} onValueChange={v => set('investmentCapital', v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecciona el rango" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1000-5000">USD $1,000 – $5,000</SelectItem>
            <SelectItem value="5000-10000">USD $5,000 – $10,000</SelectItem>
            <SelectItem value="10000-25000">USD $10,000 – $25,000</SelectItem>
            <SelectItem value="25000-50000">USD $25,000 – $50,000</SelectItem>
            <SelectItem value="50000-100000">USD $50,000 – $100,000</SelectItem>
            <SelectItem value="100000-250000">USD $100,000 – $250,000</SelectItem>
            <SelectItem value="250000+">Más de USD $250,000</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Horizonte de Inversión *</Label>
        <Select value={formData.investmentHorizon} onValueChange={v => set('investmentHorizon', v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="¿Por cuánto tiempo?" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3-meses">3 meses</SelectItem>
            <SelectItem value="6-meses">6 meses</SelectItem>
            <SelectItem value="1-año">1 año</SelectItem>
            <SelectItem value="2-años">2 años</SelectItem>
            <SelectItem value="5-años">5 años</SelectItem>
            <SelectItem value="mas-5-años">Más de 5 años</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Instrumentos de Interés</Label>
        <p className="text-xs text-muted-foreground mb-2">Selecciona los que te interesan (opcional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {INSTRUMENTS.map(inst => {
            const active = formData.preferredInstruments.includes(inst.id);
            return (
              <div key={inst.id} onClick={() => toggleArr('preferredInstruments', inst.id)}
                className={`p-2.5 border rounded-lg cursor-pointer text-sm flex items-center justify-between transition-all ${
                  active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                }`}>
                <span>{inst.label}</span>
                <div className={`w-3 h-3 rounded border flex-shrink-0 ${
                  active ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Paso 4: Objetivos + resumen ──────────────────────────────────────────────
  const renderStep4 = () => {
    const selectedProfile = RISK_PROFILES.find(p => p.value === formData.riskTolerance);
    return (
      <div className="space-y-5">
        <div className="text-center mb-4">
          <Target className="w-10 h-10 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Objetivos de Inversión</h3>
          <p className="text-sm text-muted-foreground">¿Qué buscas lograr? Selecciona uno o varios</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {INVESTMENT_GOALS.map(goal => {
            const active = formData.investmentGoals.includes(goal.id);
            return (
              <div key={goal.id} onClick={() => toggleArr('investmentGoals', goal.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {goal.icon}
                  </div>
                  <span className="text-sm font-medium">{goal.label}</span>
                </div>
                <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                  active ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Resumen del perfil seleccionado */}
        {selectedProfile && (
          <div className={`p-4 rounded-xl border-2 ${selectedProfile.activeBorder} ${selectedProfile.activeBg}`}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tu perfil seleccionado</p>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs ${selectedProfile.badgeClass}`}>{selectedProfile.label}</Badge>
              <span className="text-xs text-muted-foreground">Drawdown máx: {selectedProfile.drawdown}</span>
            </div>
            <p className="text-xs text-muted-foreground">📊 {selectedProfile.instruments}</p>
          </div>
        )}

        {/* CTA próximo paso */}
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-primary mb-1">Próximo paso: Registro de Cliente</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Al completar serás redirigido al formulario de registro para crear tu cuenta en el Portal.
              </p>
              {['Perfil personalizado', 'Acceso al Portal', 'Verificación KYC'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-primary mt-1">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" /><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepContent = [renderStep1, renderStep2, renderStep3, renderStep4];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-auto my-4"
        >
          <Card className="border-border/40 bg-card/95 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-primary">Perfil de Riesgo</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Paso {currentStep} de {totalSteps} — {STEP_LABELS[currentStep - 1]}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
              </div>

              {/* Step dots */}
              <div className="flex justify-between mt-1.5 px-0.5">
                {STEP_LABELS.map((label, i) => (
                  <span key={label} className={`text-xs ${
                    currentStep === i + 1 ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}>{label}</span>
                ))}
              </div>
            </CardHeader>

            <CardContent className="max-h-[58vh] sm:max-h-[62vh] overflow-y-auto px-4 sm:px-6">
              {stepContent[currentStep - 1]()}
            </CardContent>

            <div className="p-4 sm:p-5 border-t border-border/40">
              {showValidationError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600">Completa todos los campos obligatorios (*) antes de continuar.</p>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={goPrev} disabled={currentStep === 1}
                  className="min-w-[90px] sm:min-w-[100px]">
                  Anterior
                </Button>
                {currentStep < totalSteps ? (
                  <Button onClick={goNext} disabled={!validate(currentStep)}
                    className="min-w-[90px] sm:min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90">
                    Siguiente
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!validate(4) || isSubmitting}
                    className="min-w-[140px] sm:min-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90">
                    {isSubmitting ? 'Guardando...' : 'Completar y Continuar'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RiskProfileModal;
