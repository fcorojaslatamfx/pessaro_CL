import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { supabase } from '@/integrations/supabase/client';


interface ErrorFormData {
  name: string;
  phone: string;
  errorPages: string[];
  description: string;
}

const availablePages = [
  { id: 'home', label: 'Página de Inicio', path: '/' },
  { id: 'servicios', label: 'Servicios', path: '/servicios' },
  { id: 'instrumentos', label: 'Instrumentos', path: '/instrumentos' },
  { id: 'educacion', label: 'Educación', path: '/educacion' },
  { id: 'blog', label: 'Blog', path: '/blog' },
  { id: 'nosotros', label: 'Nosotros', path: '/nosotros' },
  { id: 'contacto', label: 'Contacto', path: '/contacto' },
  { id: 'registro', label: 'Registro de Cliente', path: '/registro-cliente' },
  { id: 'portal', label: 'Portal del Cliente', path: '/portal-cliente' },
  { id: 'login', label: 'Inicio de Sesión', path: '/login' },
  { id: 'wyckoff', label: 'Dashboard Wyckoff', path: '/wyckoff-dashboard' },
  { id: 'cms', label: 'Sistema CMS', path: '/cms' },
  { id: 'other', label: 'Otra página (especificar en descripción)', path: '' }
];

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<ErrorFormData>({
    name: '',
    phone: '',
    errorPages: [],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [errors, setErrors] = useState<Partial<ErrorFormData>>({});

  // Detectar automáticamente la página que causó el error 404
  useEffect(() => {
    // Obtener la URL anterior del sessionStorage
    const previousUrl = sessionStorage.getItem('previousUrl') || 
                       sessionStorage.getItem('lastVisitedUrl') || 
                       document.referrer;
    const currentPath = location.pathname;
    
    // Si llegamos desde otra página, intentar identificar cuál página tiene el error
    if (previousUrl) {
      try {
        const url = new URL(previousUrl);
        const path = url.pathname;
        
        // Buscar la página correspondiente en availablePages
        const matchingPage = availablePages.find(page => 
          page.path === path || path.includes(page.path)
        );
        
        if (matchingPage) {
          setFormData(prev => ({
            ...prev,
            errorPages: [matchingPage.id],
            description: `Error 404: Página no encontrada - ${path}`
          }));
        } else {
          // Si no encontramos coincidencia, marcar como "otra página"
          setFormData(prev => ({
            ...prev,
            errorPages: ['other'],
            description: `Error 404: Página no encontrada - ${path}`
          }));
        }
      } catch (error) {
        console.error('Error parsing previous URL:', error);
      }
    }
    
    // Limpiar el sessionStorage
    sessionStorage.removeItem('previousUrl');
  }, [location]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ErrorFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de móvil es requerido';
    } else if (!/^[+]?[\d\s\-()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Ingrese un número de teléfono válido';
    }

    if (formData.errorPages.length === 0) {
      newErrors.errorPages = ['Seleccione al menos una página con error'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePageChange = (pageId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      errorPages: checked 
        ? [...prev.errorPages, pageId]
        : prev.errorPages.filter(p => p !== pageId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener nombres de las páginas seleccionadas
      const selectedPageNames = formData.errorPages.map(pageId => {
        const page = availablePages.find(p => p.id === pageId);
        return page ? page.label : pageId;
      });

      // Enviar reporte de error a Supabase
      const { data, error } = await supabase.functions.invoke('send_confirmation_email_updated_2026_02_09', {
        body: {
          type: 'error_report',
          name: formData.name,
          phone: formData.phone,
          errorPages: selectedPageNames,
          description: formData.description,
          message: `Reporte de error del sitio web. Páginas afectadas: ${selectedPageNames.join(', ')}. Descripción: ${formData.description || 'No se proporcionó descripción adicional.'}`
        }
      });

      if (error) {
        console.error('Error enviando reporte:', error);
        throw error;
      }

      setIsSubmitted(true);
      
      // Redirigir a inicio después de 3 segundos
      setTimeout(() => {
        navigate(ROUTE_PATHS.HOME);
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar el reporte. Por favor, inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnHome = () => {
    navigate(ROUTE_PATHS.HOME);
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header de Error */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Error 404: Página No Encontrada</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La página que buscas no existe o ha sido movida. Ayúdanos a mejorar reportando este problema.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Acciones Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Antes de reportar el error, puedes intentar estas soluciones:
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleRefreshPage}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recargar la página
                  </Button>
                  
                  <Button 
                    onClick={handleReturnHome}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold mb-2">Consejos adicionales:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verifica tu conexión a internet</li>
                    <li>• Limpia la caché de tu navegador</li>
                    <li>• Intenta usar un navegador diferente</li>
                    <li>• Desactiva temporalmente extensiones del navegador</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formulario de Reporte */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Reportar Error
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tu reporte nos ayuda a mejorar. Como agradecimiento, ¡tenemos una sorpresa para ti!
                </p>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">¡Reporte Enviado!</h3>
                    <p className="text-muted-foreground mb-4">
                      Gracias por ayudarnos a mejorar. Nuestro equipo técnico revisará el problema.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Personal */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Tu nombre completo"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Número de Móvil *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+56 9 1234 5678"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Páginas con Error */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">Páginas con Error *</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Selecciona las páginas donde experimentaste problemas:
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {availablePages.map((page) => (
                          <div key={page.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={page.id}
                              checked={formData.errorPages.includes(page.id)}
                              onCheckedChange={(checked) => handlePageChange(page.id, checked as boolean)}
                            />
                            <Label 
                              htmlFor={page.id} 
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {page.label}
                              {page.path && (
                                <span className="text-muted-foreground ml-1">({page.path})</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      {errors.errorPages && (
                        <p className="text-sm text-red-500">Selecciona al menos una página con error</p>
                      )}
                    </div>

                    {/* Descripción Adicional */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción del Error (Opcional)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe qué estabas haciendo cuando ocurrió el error, qué mensaje viste, etc."
                        rows={3}
                      />
                    </div>

                    {/* Botón de Envío */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Enviando Reporte...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Reporte y Recibir Sorpresa
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Información de Contacto Alternativa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">¿Necesitas ayuda inmediata?</h3>
              <p className="text-muted-foreground mb-4">
                Si el problema es urgente, puedes contactarnos directamente:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-sm">
                  <strong>Email:</strong> soporte@pessarocapital.com
                </div>
                <div className="text-sm">
                  <strong>WhatsApp:</strong> +56 9 2207 1511
                </div>
                <div className="text-sm">
                  <strong>Horario:</strong> Lun-Vie 9:00-18:00
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>  {/* ← cierre de "w-full max-w-4xl" */}
    </div>    {/* ← cierre de "min-h-screen" */}
  );          {/* ← cierre del return */}
};            {/* ← cierre del componente */}

export default ErrorPage;