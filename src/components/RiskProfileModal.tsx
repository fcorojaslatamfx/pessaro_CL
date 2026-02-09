import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, DollarSign, Target, Clock, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RiskProfile } from '@/hooks/useRiskProfile';
import { supabase } from '@/integrations/supabase/client';

interface RiskProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: RiskProfile, shouldRegisterClient?: boolean) => void;
  showRegistrationOption?: boolean;
}

const RiskProfileModal: React.FC<RiskProfileModalProps> = ({ isOpen, onClose, onSave, showRegistrationOption = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wantsToRegister, setWantsToRegister] = useState(false);
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
    preferredInstruments: []
  });

  const totalSteps = 4;

  const investmentGoalOptions = [
    { id: 'crecimiento', label: 'Crecimiento de Capital', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'ingresos', label: 'Generación de Ingresos', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'preservacion', label: 'Preservación de Capital', icon: <Shield className="w-4 h-4" /> },
    { id: 'diversificacion', label: 'Diversificación', icon: <Target className="w-4 h-4" /> },
    { id: 'jubilacion', label: 'Ahorro para Jubilación', icon: <Clock className="w-4 h-4" /> },
    { id: 'educacion', label: 'Educación Financiera', icon: <User className="w-4 h-4" /> }
  ];

  const instrumentOptions = [
    { id: 'forex', label: 'Forex (Divisas)' },
    { id: 'acciones', label: 'Acciones' },
    { id: 'indices', label: 'Índices Bursátiles' },
    { id: 'commodities', label: 'Materias Primas' },
    { id: 'criptomonedas', label: 'Criptomonedas' },
    { id: 'etfs', label: 'ETFs' },
    { id: 'bonos', label: 'Bonos' },
    { id: 'opciones', label: 'Opciones' }
  ];

  const riskToleranceOptions = [
    {
      value: 'conservador',
      label: 'Conservador',
      description: 'Prefiero estabilidad, acepto rendimientos menores',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      value: 'moderado',
      label: 'Moderado',
      description: 'Balance entre riesgo y rendimiento',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      value: 'agresivo',
      label: 'Agresivo',
      description: 'Acepto mayor riesgo por mayores rendimientos',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      value: 'muy-agresivo',
      label: 'Muy Agresivo',
      description: 'Máximo riesgo, máximo potencial de rendimiento',
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  const handleInputChange = (field: keyof RiskProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      investmentGoals: prev.investmentGoals.includes(goalId)
        ? prev.investmentGoals.filter(g => g !== goalId)
        : [...prev.investmentGoals, goalId]
    }));
  };

  const handleInstrumentToggle = (instrumentId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredInstruments: prev.preferredInstruments.includes(instrumentId)
        ? prev.preferredInstruments.filter(i => i !== instrumentId)
        : [...prev.preferredInstruments, instrumentId]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email);
      case 2:
        return !!(formData.riskTolerance && formData.tradingExperience);
      case 3:
        return !!(formData.investmentCapital && formData.investmentHorizon);
      case 4:
        return formData.investmentGoals.length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Enviar perfil de riesgo por email
      const { error } = await supabase.functions.invoke('send_risk_profile_2026_02_08_21_16', {
        body: formData
      });

      if (error) {
        console.error('Error sending risk profile:', error);
      }

      // Guardar perfil localmente y opcionalmente registrar cliente
      onSave(formData, wantsToRegister);
    } catch (error) {
      console.error('Error submitting risk profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Información Personal</h3>
              <p className="text-sm text-muted-foreground">Datos básicos para personalizar tu experiencia</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  name="given-name"
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  name="family-name"
                  autoComplete="family-name"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Perfil de Riesgo</h3>
              <p className="text-sm text-muted-foreground">Define tu tolerancia al riesgo y experiencia</p>
            </div>
            
            <div>
              <Label className="text-base font-medium">Tolerancia al Riesgo *</Label>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {riskToleranceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.riskTolerance === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('riskTolerance', option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.riskTolerance === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="experience">Experiencia en Trading *</Label>
              <Select value={formData.tradingExperience} onValueChange={(value) => handleInputChange('tradingExperience', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin experiencia</SelectItem>
                  <SelectItem value="basica">Básica (menos de 1 año)</SelectItem>
                  <SelectItem value="intermedia">Intermedia (1-3 años)</SelectItem>
                  <SelectItem value="avanzada">Avanzada (3-5 años)</SelectItem>
                  <SelectItem value="profesional">Profesional (más de 5 años)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Capital e Inversión</h3>
              <p className="text-sm text-muted-foreground">Define tu capacidad de inversión y horizonte temporal</p>
            </div>
            
            <div>
              <Label htmlFor="capital">Capital Disponible para Invertir *</Label>
              <Select value={formData.investmentCapital} onValueChange={(value) => handleInputChange('investmentCapital', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000-5000">USD $1,000 - $5,000</SelectItem>
                  <SelectItem value="5000-10000">USD $5,000 - $10,000</SelectItem>
                  <SelectItem value="10000-25000">USD $10,000 - $25,000</SelectItem>
                  <SelectItem value="25000-50000">USD $25,000 - $50,000</SelectItem>
                  <SelectItem value="50000-100000">USD $50,000 - $100,000</SelectItem>
                  <SelectItem value="100000-250000">USD $100,000 - $250,000</SelectItem>
                  <SelectItem value="250000+">Más de USD $250,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="horizon">Horizonte de Inversión *</Label>
              <Select value={formData.investmentHorizon} onValueChange={(value) => handleInputChange('investmentHorizon', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="¿Por cuánto tiempo?" />
                </SelectTrigger>
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
              <p className="text-sm text-muted-foreground mb-3">Selecciona los instrumentos que te interesan (opcional)</p>
              <div className="grid grid-cols-2 gap-2">
                {instrumentOptions.map((instrument) => (
                  <div
                    key={instrument.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all text-sm ${
                      formData.preferredInstruments.includes(instrument.id)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleInstrumentToggle(instrument.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{instrument.label}</span>
                      <div className={`w-3 h-3 rounded border ${
                        formData.preferredInstruments.includes(instrument.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

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
                {investmentGoalOptions.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.investmentGoals.includes(goal.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          formData.investmentGoals.includes(goal.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {goal.icon}
                        </div>
                        <span className="font-medium">{goal.label}</span>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 ${
                        formData.investmentGoals.includes(goal.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opción de registro automático */}
            {showRegistrationOption && (
              <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="register-client"
                    checked={wantsToRegister}
                    onCheckedChange={(checked) => setWantsToRegister(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="register-client" className="text-sm font-medium cursor-pointer">
                      Crear cuenta automáticamente en el Portal del Cliente
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Al seleccionar esta opción, crearemos automáticamente tu cuenta de trading y te daremos acceso inmediato al Portal del Cliente con datos simulados para que puedas explorar la plataforma.
                    </p>
                    {wantsToRegister && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                        ✓ Recibirás un email con tus credenciales de acceso
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        >
          <Card className="border-border/40 bg-card/95 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Perfil de Riesgo
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paso {currentStep} de {totalSteps} - Personaliza tu experiencia de inversión
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="max-h-[60vh] overflow-y-auto">
              {renderStep()}
            </CardContent>

            <div className="p-6 border-t border-border/40 bg-card/50">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="min-w-[100px]"
                >
                  Anterior
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(4) || isSubmitting}
                    className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting 
                      ? (wantsToRegister ? 'Creando cuenta...' : 'Guardando...') 
                      : (wantsToRegister ? 'Crear Cuenta y Acceder' : 'Completar Perfil')
                    }
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