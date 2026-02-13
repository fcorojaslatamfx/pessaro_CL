import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'rutas' | 'base-conocimientos' | 'faq';
  contentTitle: string;
  onDownload: (data: { fullName: string; phone: string; email: string }) => void;
}

const DownloadPopup: React.FC<DownloadPopupProps> = ({
  isOpen,
  onClose,
  contentType,
  contentTitle,
  onDownload
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const contentInfo = {
    'rutas': {
      icon: <FileText className="w-6 h-6" />,
      description: 'Guía completa con las 3 rutas de aprendizaje estructuradas',
      pages: '45 páginas',
      format: 'PDF',
      color: 'bg-blue-500'
    },
    'base-conocimientos': {
      icon: <FileText className="w-6 h-6" />,
      description: 'Manual completo con todos los módulos y lecciones detalladas',
      pages: '120 páginas',
      format: 'PDF',
      color: 'bg-green-500'
    },
    'faq': {
      icon: <FileText className="w-6 h-6" />,
      description: 'Compendio de preguntas frecuentes sobre trading e instrumentos financieros',
      pages: '25 páginas',
      format: 'PDF',
      color: 'bg-purple-500'
    }
  };

  const currentContent = contentInfo[contentType];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de móvil es requerido';
    } else if (!/^[+]?[\d\s\-\(\)]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simular envío de datos y generación de descarga
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Llamar a la función de descarga
      onDownload(formData);
      
      setIsSuccess(true);
      
      // Cerrar el popup después de 3 segundos
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error en descarga:', error);
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

  const handleClose = () => {
    setFormData({ fullName: '', phone: '', email: '' });
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${currentContent.color} rounded-lg flex items-center justify-center text-white`}>
                    {currentContent.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Descargar Contenido</CardTitle>
                    <p className="text-sm text-muted-foreground">{contentTitle}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Content Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Contenido incluido:</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentContent.description}
                </p>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{currentContent.pages}</Badge>
                  <Badge variant="outline">{currentContent.format}</Badge>
                </div>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">¡Descarga Iniciada!</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu descarga comenzará automáticamente. También recibirás una copia por email.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre Completo *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Número de Móvil *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Preparando descarga...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar Ahora
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Al descargar, aceptas recibir comunicaciones educativas de Pessaro Capital.
                      Puedes cancelar la suscripción en cualquier momento.
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DownloadPopup;