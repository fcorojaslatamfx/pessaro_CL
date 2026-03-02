import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Newspaper,
  TrendingUp,
  DollarSign,
  Globe,
  BarChart3,
  Wallet,
  Bitcoin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useNewsletter } from '@/hooks/useNewsletter';

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topics: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { subscribe, loading, error } = useNewsletter();

  const topicOptions = [
    {
      id: 'noticias',
      label: 'Noticias Financieras',
      description: 'Últimas noticias del mundo financiero',
      icon: <Newspaper className="w-5 h-5" />
    },
    {
      id: 'politica',
      label: 'Política Económica',
      description: 'Decisiones de bancos centrales y gobiernos',
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'mercados',
      label: 'Análisis de Mercados',
      description: 'Tendencias y oportunidades de mercado',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'acciones',
      label: 'Acciones',
      description: 'Análisis de empresas y sectores',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'divisas',
      label: 'Divisas (Forex)',
      description: 'Pares de divisas y análisis técnico',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'etf',
      label: 'ETF',
      description: 'Fondos cotizados y diversificación',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 'criptomonedas',
      label: 'Criptomonedas',
      description: 'Bitcoin, Ethereum y altcoins',
      icon: <Bitcoin className="w-5 h-5" />
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de contacto es requerido';
    }

    if (formData.topics.length === 0) {
      newErrors.topics = 'Seleccione al menos un tema de interés';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const subscriptionData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        topics: formData.topics,
        source: 'newsletter_popup'
      };

      const result = await subscribe(subscriptionData);

      if (!error) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ name: '', email: '', phone: '', topics: [] });
        }, 2000);
      }
    } catch (err) {
      console.error('Error subscribing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter(id => id !== topicId)
        : [...prev.topics, topicId]
    }));
    if (errors.topics) {
      setErrors(prev => ({ ...prev, topics: '' }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({ name: '', email: '', phone: '', topics: [] });
      setErrors({});
      setSuccess(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <Card className="shadow-2xl">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  Suscríbete a Nuestro Newsletter
                </CardTitle>
                <p className="text-muted-foreground">
                  Recibe análisis exclusivos y actualizaciones de mercado personalizadas según tus intereses
                </p>
              </CardHeader>

              <CardContent>
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">¡Información Recepcionada!</h3>
                    <p className="text-muted-foreground">
                      Su información fue recepcionada con éxito.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Personal */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Información Personal</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre Completo *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name"
                              placeholder="Tu nombre completo"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">Número de Contacto *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              placeholder="+56 9 1234 5678"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Temas de Interés */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Temas de Interés *</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecciona los temas sobre los que te gustaría recibir información
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topicOptions.map((topic) => (
                          <div
                            key={topic.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                              formData.topics.includes(topic.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border'
                            }`}
                            onClick={() => handleTopicToggle(topic.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={formData.topics.includes(topic.id)}
                                onCheckedChange={() => handleTopicToggle(topic.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-primary">
                                    {topic.icon}
                                  </div>
                                  <span className="font-medium">{topic.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {topic.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {errors.topics && (
                        <p className="text-red-500 text-sm">{errors.topics}</p>
                      )}
                    </div>

                    {/* Error general */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-red-800">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="flex-1"
                      >
                        {isSubmitting || loading ? (
                          'Suscribiendo...'
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Suscribirse
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Información de privacidad */}
                    <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                      <p>
                        Al suscribirte, aceptas recibir emails de Pessaro Capital. 
                        Puedes cancelar tu suscripción en cualquier momento. 
                        Respetamos tu privacidad y nunca compartimos tu información.
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;