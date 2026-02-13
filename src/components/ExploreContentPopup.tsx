import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, HelpCircle, Database, Play, ArrowRight, Clock, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { learningPaths, faqCategories } from '@/data/learningPaths';

interface ExploreContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string, itemId?: string) => void;
}

const ExploreContentPopup: React.FC<ExploreContentPopupProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'rutas' | 'faq' | 'base'>('rutas');

  const handleNavigate = (section: string, itemId?: string) => {
    onNavigate(section, itemId);
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
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="relative">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Explorar Contenido Educativo</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Descubre todo nuestro material educativo organizado por categorías
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant={activeTab === 'rutas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('rutas')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Rutas de Aprendizaje
                </Button>
                <Button
                  variant={activeTab === 'base' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('base')}
                  className="flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Base de Conocimientos
                </Button>
                <Button
                  variant={activeTab === 'faq' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('faq')}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Preguntas Frecuentes
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Rutas de Aprendizaje */}
              {activeTab === 'rutas' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Rutas de Aprendizaje Estructuradas</h3>
                    <p className="text-sm text-muted-foreground">
                      Programe su educación financiera con nuestras rutas diseñadas por expertos
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {learningPaths.map((path) => (
                      <motion.div
                        key={path.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 h-full"
                          onClick={() => handleNavigate('rutas', path.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 ${path.color} rounded-lg flex items-center justify-center text-white`}>
                                {path.icon}
                              </div>
                              <div className="flex-1">
                                <Badge variant="secondary" className="text-xs mb-1">
                                  {path.level}
                                </Badge>
                                <CardTitle className="text-base leading-tight">
                                  {path.title}
                                </CardTitle>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {path.description}
                            </p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                <span>{path.totalLessons} lecciones</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{path.totalDuration}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-primary">
                                Ver Contenido Completo
                              </span>
                              <ArrowRight className="w-3 h-3 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Base de Conocimientos */}
              {activeTab === 'base' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Base de Conocimientos Interactiva</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore nuestro contenido educativo organizado por rutas de aprendizaje
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => handleNavigate('base-conocimientos')}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                            <Database className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Navegación Interactiva</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Explore módulos y lecciones organizadas
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="w-4 h-4 text-green-500" />
                            <span>Selección de rutas específicas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4 text-green-500" />
                            <span>Módulos expandibles</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Play className="w-4 h-4 text-green-500" />
                            <span>Lecciones detalladas</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm font-medium text-green-600">
                            Acceder a Base de Conocimientos
                          </span>
                          <ArrowRight className="w-4 h-4 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Contenido Incluido</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Todo el material educativo disponible
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-blue-700 mb-2">Fundamentos</div>
                            <ul className="space-y-1 text-blue-600">
                              <li>• 4 módulos</li>
                              <li>• 12 lecciones</li>
                              <li>• 4h 30m contenido</li>
                            </ul>
                          </div>
                          <div>
                            <div className="font-medium text-blue-700 mb-2">Avanzado</div>
                            <ul className="space-y-1 text-blue-600">
                              <li>• Estrategias</li>
                              <li>• Psicología</li>
                              <li>• Casos prácticos</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Preguntas Frecuentes</h3>
                    <p className="text-sm text-muted-foreground">
                      Respuestas detalladas sobre trading, instrumentos financieros y regulación
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {faqCategories.filter(cat => cat !== 'Todos').map((category) => (
                      <Card 
                        key={category}
                        className="cursor-pointer hover:shadow-md transition-all duration-300 text-center p-3"
                        onClick={() => handleNavigate('faq', category)}
                      >
                        <div className="text-sm font-medium text-primary mb-1">{category}</div>
                        <div className="text-xs text-muted-foreground">
                          {category === 'Forex' ? '1 pregunta' :
                           category === 'Commodities' ? '1 pregunta' :
                           category === 'Índices' ? '1 pregunta' :
                           category === 'Crypto' ? '2 preguntas' :
                           category === 'Regulación' ? '1 pregunta' :
                           category === 'Servicios Financieros' ? '1 pregunta' :
                           category === 'Protección' ? '1 pregunta' : ''}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => handleNavigate('faq')}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Ver Todas las FAQ</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Accede a todas las preguntas frecuentes con búsqueda y filtros
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>8 preguntas detalladas</span>
                          <span>•</span>
                          <span>Búsqueda avanzada</span>
                          <span>•</span>
                          <span>Filtros por categoría</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExploreContentPopup;