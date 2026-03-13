import { useSEO } from '@/hooks/useSEO';
import { PAGE_SEO } from '@/lib/seo-config';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientRegistration } from '@/hooks/useClientRegistration';
import { ROUTE_PATHS } from '@/lib/index';


const ClientRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    riskTolerance: '',
    experience: '',
    investmentCapital: '',
    investmentHorizon: '',
    interestedInstruments: [] as string[],
    investmentGoals: [] as string[],
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerClientFromProfile, loading } = useClientRegistration();
  const navigate = useNavigate();

  const riskToleranceOptions = [
    { value: 'conservador', label: 'Conservador' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'agresivo', label: 'Agresivo' },
    { value: 'muy-agresivo', label: 'Muy Agresivo' }
  ];

  const experienceOptions = [
    { value: 'ninguna', label: 'Sin experiencia' },
    { value: 'basica', label: 'Básica (menos de 1 año)' },
    { value: 'intermedia', label: 'Intermedia (1-3 años)' },
    { value: 'avanzada', label: 'Avanzada (3-5 años)' },
    { value: 'profesional', label: 'Profesional (más de 5 años)' }
  ];

  const capitalOptions = [
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000-25000', label: '$10,000 - $25,000' },
    { value: '25000-50000', label: '$25,000 - $50,000' },
    { value: '50000+', label: 'Más de $50,000' }
  ];

  const horizonOptions = [
    { value: '3-meses', label: '3 meses' },
    { value: '6-meses', label: '6 meses' },
    { value: '1-año', label: '1 año' },
    { value: '2-años', label: '2 años' },
    { value: '5-años', label: '5 años' },
    { value: 'mas-5-años', label: 'Más de 5 años' }
  ];

  const instrumentOptions = [
    'Forex', 'Commodities', 'Índices', 'Acciones', 'ETF', 'Criptomonedas'
  ];

  const goalOptions = [
    'Crecimiento de Capital', 'Generación de Ingresos', 'Preservación de Capital', 
    'Diversificación', 'Ahorro para Jubilación', 'Educación Financiera'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.riskTolerance) newErrors.riskTolerance = 'Seleccione su tolerancia al riesgo';
    if (!formData.experience) newErrors.experience = 'Seleccione su experiencia';
    if (!formData.investmentCapital) newErrors.investmentCapital = 'Seleccione su capital de inversión';
    if (!formData.investmentHorizon) newErrors.investmentHorizon = 'Seleccione su horizonte de inversión';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debe aceptar los términos y condiciones';
    if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'Debe aceptar la política de privacidad';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        riskTolerance: formData.riskTolerance,
        experience: formData.experience,
        investmentCapital: formData.investmentCapital,
        investmentHorizon: formData.investmentHorizon,
        interestedInstruments: formData.interestedInstruments,
        investmentGoals: formData.investmentGoals
      };

      const result = await registerClientFromProfile(registrationData);

      if (result.success) {
        // Redirigir al portal del cliente
        navigate(ROUTE_PATHS.CLIENT_PORTAL);
      } else {
        setErrors({ submit: result.error || 'Error en el registro' });
      }
    } catch (error) {
      setErrors({ submit: 'Error inesperado durante el registro' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
  useSEO(PAGE_SEO.registro);

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayToggle = (field: 'interestedInstruments' | 'investmentGoals', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Registro de Cliente</h1>
            <p className="text-muted-foreground">
              Complete el formulario para crear su cuenta en el Portal del Cliente
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal y Perfil de Inversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Perfil de Inversión */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Perfil de Inversión</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Tolerancia al Riesgo *</Label>
                      <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                        <SelectTrigger className={errors.riskTolerance ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {riskToleranceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.riskTolerance && (
                        <p className="text-red-500 text-sm mt-1">{errors.riskTolerance}</p>
                      )}
                    </div>

                    <div>
                      <Label>Experiencia en Trading *</Label>
                      <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                        <SelectTrigger className={errors.experience ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                      )}
                    </div>

                    <div>
                      <Label>Capital de Inversión *</Label>
                      <Select value={formData.investmentCapital} onValueChange={(value) => handleInputChange('investmentCapital', value)}>
                        <SelectTrigger className={errors.investmentCapital ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {capitalOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.investmentCapital && (
                        <p className="text-red-500 text-sm mt-1">{errors.investmentCapital}</p>
                      )}
                    </div>

                    <div>
                      <Label>Horizonte de Inversión *</Label>
                      <Select value={formData.investmentHorizon} onValueChange={(value) => handleInputChange('investmentHorizon', value)}>
                        <SelectTrigger className={errors.investmentHorizon ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {horizonOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.investmentHorizon && (
                        <p className="text-red-500 text-sm mt-1">{errors.investmentHorizon}</p>
                      )}
                    </div>
                  </div>

                  {/* Instrumentos de Interés */}
                  <div className="mt-6">
                    <Label>Instrumentos de Interés</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {instrumentOptions.map(instrument => (
                        <div key={instrument} className="flex items-center space-x-2">
                          <Checkbox
                            id={`instrument-${instrument}`}
                            checked={formData.interestedInstruments.includes(instrument)}
                            onCheckedChange={() => handleArrayToggle('interestedInstruments', instrument)}
                          />
                          <Label htmlFor={`instrument-${instrument}`} className="text-sm">
                            {instrument}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Objetivos de Inversión */}
                  <div className="mt-6">
                    <Label>Objetivos de Inversión</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {goalOptions.map(goal => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={`goal-${goal}`}
                            checked={formData.investmentGoals.includes(goal)}
                            onCheckedChange={() => handleArrayToggle('investmentGoals', goal)}
                          />
                          <Label htmlFor={`goal-${goal}`} className="text-sm">
                            {goal}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Términos y Condiciones */}
                <div className="border-t pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                        className={errors.acceptTerms ? 'border-red-500' : ''}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm">
                        Acepto los <a href="#" className="text-primary underline">términos y condiciones</a> de Pessaro Capital *
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptPrivacy"
                        checked={formData.acceptPrivacy}
                        onCheckedChange={(checked) => handleInputChange('acceptPrivacy', checked)}
                        className={errors.acceptPrivacy ? 'border-red-500' : ''}
                      />
                      <Label htmlFor="acceptPrivacy" className="text-sm">
                        Acepto la <a href="#" className="text-primary underline">política de privacidad</a> *
                      </Label>
                    </div>
                    {errors.acceptPrivacy && (
                      <p className="text-red-500 text-sm">{errors.acceptPrivacy}</p>
                    )}
                  </div>
                </div>

                {/* Error de envío */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-800">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Botón de envío */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-8 py-3 text-lg"
                  >
                    {isSubmitting || loading ? (
                      'Creando cuenta...'
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información de seguridad */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Seguridad y Privacidad</h3>
                  <p className="text-sm text-muted-foreground">
                    Su información está protegida con encriptación de nivel bancario. 
                    Pessaro Capital cumple con todas las regulaciones financieras internacionales 
                    y nunca compartirá sus datos personales con terceros sin su consentimiento.
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