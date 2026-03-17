import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, DollarSign, Target, Clock, TrendingUp, Shield,
  ArrowRight, CheckCircle2, Flame, Leaf, ChevronRight
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

// ─── Niveles de riesgo con especificaciones financieras exactas ───────────────
const riskToleranceOptions = [
  {
    value: 'conservador',
    label: 'Conservador',
    drawdown: 'Hasta 5–10%',
    description: 'Priorizas la seguridad del capital. Stop-loss estrictos, posiciones pequeñas.',
    instruments: 'Pares de divisas principales (EUR/USD, GBP/USD, USD/JPY)',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50',
    Icon: Leaf,
    iconColor: 'text-emerald-600',
  },
  {
    value: 'moderado',
    label: 'Moderado',
    drawdown: '10–15%',
    description: 'Balance entre riesgo y retorno. Cartera centrada en pares de divisas.',
    instruments: 'Pares de divisas mayores y menores',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50',
    Icon: Shield,
    iconColor: 'text-blue-600',
  },
  {
    value: 'moderado_plus',
    label: 'Moderado Plus',
    drawdown: '15–30%',
    description: 'Mayor rentabilidad incorporando materias primas junto con divisas.',
    instruments: 'Divisas (mayores/menores) + Materias primas: XAU, XAG, Petróleo',
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    activeBorder: 'border-violet-500',
    activeBg: 'bg-violet-50',
    Icon: TrendingUp,
    iconColor: 'text-violet-600',
  },
  {
    value: 'agresivo',
    label: 'Agresivo',
    drawdown: 'Hasta 40%',
    description: 'Maximizas retornos asumiendo alta volatilidad en todos los mercados.',
    instruments: 'Divisas + Materias primas + Índices + Criptomonedas',
    color: 'bg-red-100 text-red-800 border-red-200',
    activeBorder: 'border-red-500',
    activeBg: 'bg-red-50',
    Icon: Flame,
    iconColor: 'text-red-600',
  },
];

// ─── Preguntas adicionales de tolerancia al riesgo (paso 2 expandido) ─────────
const riskQuestions = [
  {
    id: 'loss_reaction',
    label: '¿Qué harías si tu cuenta cae un 20% en un mes?',
    options: [
      { value: 'close_all',  label: 'Cerraría todo de inmediato'          },
      { value: 'reduce',     label: 'Reduciría posiciones y esperaría'     },
      { value: 'hold',       label: 'Mantendría mis posiciones'            },
      { value: 'add_more',   label: 'Aprovecharía para comprar más'        },
    ],
  },
  {
    id: 'max_drawdown',
    label: '¿Cuál es el drawdown máximo que aceptarías?',
    options: [
      { value: 'under_10',  label: 'Menos del 10% — muy conservador'       },
      { value: '10_15',     label: '10–15% — moderado (solo divisas)'      },
      { value: '15_30',     label: '15–30% — divisas + materias primas'    },
      { value: 'over_30',   label: 'Más del 30% — agresivo, máx retorno'  },
    ],
  },
];

const investmentGoalOptions = [
  { id: 'crecimiento',   label: 'Crecimiento de Capital',   icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'ingresos',      label: 'Generación de Ingresos',   icon: <DollarSign className="w-4 h-4" /> },
  { id: 'preservacion',  label: 'Preservación de Capital',  icon: <Shield className="w-4 h-4" />    },
  { id: 'diversificacion', label: 'Diversificación',        icon: <Target className="w-4 h-4" />    },
  { id: 'jubilacion',    label: 'Ahorro para Jubilación',   icon: <Clock className="w-4 h-4" />     },
  { id: 'educacion',     label: 'Educación Financiera',     icon: <User className="w-4 h-4" />      },
];

const instrumentOptions = [
  { id: 'forex',         label: 'Forex — Pares de Divisas'         },
  { id: 'commodities',   label: 'Materias Primas (XAU, XAG, WTI)'  },
  { id: 'indices',       label: 'Índices Bursátiles'                },
  { id: 'acciones',      label: 'Acciones'                          },
  { id: 'criptomonedas', label: 'Criptomonedas'                     },
  { id: 'etfs',          label: 'ETFs'                              },
  { id: 'bonos',         label: 'Bonos'                             },
  { id: 'opciones',      label: 'Opciones'                          },
];

// ─── Component ────────────────────────────────────────────────────────────────
const RiskProfileModal: React.FC<RiskProfileModalProps> = ({
  isOpen, onClose, onSave, showRegistrationOption = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wantsToRegister, setWantsToRegister] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const { showWhatsApp } = useWhatsApp();

  // Respuestas adicionales de tolerancia
  const [riskAnswers, setRiskAnswers] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RiskProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    riskTolerance: 'moderado',
    investmentCapital: '',
    investmentGoals: [],
    investmentHorizon: '1-año',
    tradingExperience: 'basica',
    preferredInstruments: [],
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof RiskProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      investmentGoals: prev.investmentGoals.includes(goalId)
        ? prev.investmentGoals.filter(g => g !== goalId)
        : [...prev.investmentGoals, goalId],
    }));
  };

  const handleInstrumentToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      preferredInstruments: prev.preferredInstruments.includes(id)
        ? prev.preferredInstruments.filter(i => i !== id)
        : [...prev.preferredInstruments, id],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!(formData.firstName.trim() && formData.lastName.trim() && formData.email.trim());
      case 2: return !!(formData.riskTolerance && formData.tradingExperience);
      case 3: return !!(formData.investmentCapital && formData.investmentHorizon);
      case 4: return formData.investmentGoals.length > 0;
      default: return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setShowValidationError(false);
      setCurrentStep(s => s + 1);
    } else {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
    }
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleClose = () => { onClose(); showWhatsApp(); };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send_risk_profile_2026_02_08_21_16', {
        body: { ...formData, riskAnswers },
      });
      if (error) console.error('Error sending risk profile:', error);
      onSave(formData, wantsToRegister);
      showWhatsApp();
    } catch (err) {
      console.error('Error submitting risk profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {

      // ── Paso 1: Datos personales ──────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Información Personal</h3>
              <p className="text-sm text-muted-foreground">Datos básicos para personalizar tu experiencia</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" name="given-name" autoComplete="given-name"
                  placeholder="Tu nombre" value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input id="lastName" name="family-name" autoComplete="family-name"
                  placeholder="Tu apellido" value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input id="email" name="email" type="email" autoComplete="email"
                placeholder="tu@email.com" value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="tel" type="tel" autoComplete="tel"
                placeholder="+56 9 1234 5678" value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)} className="mt-1" />
            </div>
          </div>
        );

      // ── Paso 2: Perfil de riesgo con preguntas de tolerancia ──────────────
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Perfil de Riesgo</h3>
              <p className="text-sm text-muted-foreground">Define tu tolerancia al riesgo y experiencia</p>
            </div>

            {/* Selector de nivel de riesgo */}
            <div>
              <Label className="text-base font-medium">Tolerancia al Riesgo *</Label>
              <p className="text-xs text-muted-foreground mb-3">Selecciona el nivel que mejor describe tu perfil</p>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {riskToleranceOptions.map(opt => {
                  const active = formData.riskTolerance === opt.value;
                  const IconComp = opt.Icon;
                  return (
                    <div key={opt.value}
                      onClick={() => handleInputChange('riskTolerance', opt.value)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        active ? `${opt.activeBorder} ${opt.activeBg}` : 'border-border hover:border-primary/40'
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <IconComp className={`w-5 h-5 mt-0.5 flex-shrink-0 ${active ? opt.iconColor : 'text-muted-foreground'}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={opt.color}>{opt.label}</Badge>
                              <span className="text-xs font-semibold text-muted-foreground">Drawdown: {opt.drawdown}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{opt.description}</p>
                            <p className="text-xs text-primary/70 mt-1 font-medium">📊 {opt.instruments}</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                          active ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preguntas de tolerancia adicionales */}
            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-medium text-foreground">Preguntas de tolerancia</p>
              {riskQuestions.map(q => (
                <div key={q.id}>
                  <Label className="text-sm font-medium">{q.label}</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {q.options.map(opt => {
                      const sel = riskAnswers[q.id] === opt.value;
                      return (
                        <div key={opt.value}
                          onClick={() => setRiskAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                          className={`px-4 py-2.5 border rounded-lg cursor-pointer text-sm transition-all flex items-center justify-between ${
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
                onValueChange={v => handleInputChange('tradingExperience', v)}>
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

      // ── Paso 3: Capital e instrumentos ────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Capital e Inversión</h3>
              <p className="text-sm text-muted-foreground">Define tu capacidad de inversión y horizonte temporal</p>
            </div>
            <div>
              <Label>Capital Disponible *</Label>
              <Select value={formData.investmentCapital}
                onValueChange={v => handleInputChange('investmentCapital', v)}>
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
              <Select value={formData.investmentHorizon}
                onValueChange={v => handleInputChange('investmentHorizon', v)}>
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
              <p className="text-sm text-muted-foreground mb-3">Selecciona los que te interesan (opcional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {instrumentOptions.map(inst => {
                  const active = formData.preferredInstruments.includes(inst.id);
                  return (
                    <div key={inst.id} onClick={() => handleInstrumentToggle(inst.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-sm flex items-center justify-between ${
                        active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'
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

      // ── Paso 4: Objetivos ─────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Objetivos de Inversión</h3>
              <p className="text-sm text-muted-foreground">¿Qué buscas lograr con tus inversiones?</p>
            </div>
            <div>
              <Label className="text-base font-medium">Selecciona tus objetivos *</Label>
              <p className="text-sm text-muted-foreground mb-4">Puedes seleccionar múltiples opciones</p>
              <div className="grid grid-cols-1 gap-3">
                {investmentGoalOptions.map(goal => {
                  const active = formData.investmentGoals.includes(goal.id);
                  return (
                    <div key={goal.id} onClick={() => handleGoalToggle(goal.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {goal.icon}
                          </div>
                          <span className="font-medium text-sm">{goal.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                          active ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen de perfil seleccionado */}
            {formData.riskTolerance && (() => {
              const level = riskToleranceOptions.find(o => o.value === formData.riskTolerance);
              if (!level) return null;
              return (
                <div className={`p-4 rounded-xl border-2 ${level.activeBorder} ${level.activeBg}`}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tu perfil seleccionado</p>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={level.color}>{level.label}</Badge>
                    <span className="text-xs text-muted-foreground">Drawdown máx: {level.drawdown}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">📊 {level.instruments}</p>
                </div>
              );
            })()}

            {/* Próximo paso */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-primary mb-1">Próximo Paso: Registro de Cliente</h4>
                  <p className="text-xs text-muted-foreground">
                    Al completar tu perfil de riesgo serás redirigido al formulario de registro para crear tu cuenta en el Portal del Cliente.
                  </p>
                  <div className="mt-2 space-y-1">
                    {['Perfil de riesgo personalizado', 'Acceso al Portal del Cliente', 'Verificación de identidad (KYC)'].map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-primary">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" /><span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-auto my-4"
        >
          <Card className="border-border/40 bg-card/95 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                    Perfil de Riesgo
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paso {currentStep} de {totalSteps} — Personaliza tu experiencia de inversión
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
              </div>

              {/* Step indicators */}
              <div className="flex justify-between mt-2 px-1">
                {['Datos', 'Riesgo', 'Capital', 'Objetivos'].map((label, i) => (
                  <span key={label} className={`text-xs ${currentStep === i + 1 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                ))}
              </div>
            </CardHeader>

            <CardContent className="max-h-[55vh] sm:max-h-[60vh] overflow-y-auto px-4 sm:px-6">
              {renderStep()}
            </CardContent>

            <div className="p-4 sm:p-6 border-t border-border/40 bg-card/50">
              {showValidationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Por favor, completa todos los campos obligatorios antes de continuar.</p>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="min-w-[90px] sm:min-w-[100px]">
                  Anterior
                </Button>
                {currentStep < totalSteps ? (
                  <Button onClick={nextStep} disabled={!validateStep(currentStep)}
                    className="min-w-[90px] sm:min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90">
                    Siguiente
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!validateStep(4) || isSubmitting}
                    className="min-w-[120px] sm:min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90">
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
