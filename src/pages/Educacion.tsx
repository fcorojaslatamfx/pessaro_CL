import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Video, Globe, Users, CheckCircle2, ArrowRight, FileText, Calendar, 
  PlayCircle, GraduationCap, Search, Download, ChevronDown, Clock, Target,
  HelpCircle, Database, Play, Award, TrendingUp, BarChart3, Brain, Lightbulb
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { useNavigate } from 'react-router-dom';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useEducationAssessment } from '@/hooks/useEducationAssessment';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { useEducationalAdvisor } from '@/hooks/useEducationalAdvisor';
import EducationAssessmentPopup from '@/components/EducationAssessmentPopup';
import RiskProfileModal from '@/components/RiskProfileModal';
import EducationalAdvisorPopup from '@/components/EducationalAdvisorPopup';
import DownloadPopup from '@/components/DownloadPopup';
import ExploreContentPopup from '@/components/ExploreContentPopup';
import { useDownload } from '@/hooks/useDownload';
import { useExploreContent } from '@/hooks/useExploreContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { learningPaths, faqData, faqCategories, type LearningPath, type FAQItem } from '@/data/learningPaths';

const Educacion: React.FC = () => {
  const navigate = useNavigate();
  const { openPopup } = useContactPopup();
  const { isOpen, courseType, openAssessment, closeAssessment } = useEducationAssessment();
  const { isProfileComplete, showProfileModal, setShowProfileModal, saveProfile, requireProfile } = useRiskProfile();
  const { isPopupOpen, currentContent, openDownloadPopup, closeDownloadPopup, processDownload } = useDownload();
  const { isPopupOpen: isExploreOpen, openExplorePopup, closeExplorePopup, navigateToContent } = useExploreContent();
  const { isOpen: isAdvisorOpen, openPopup: openAdvisorPopup, closePopup: closeAdvisorPopup } = useEducationalAdvisor();
  
  // Estados para FAQ
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [openFAQItems, setOpenFAQItems] = useState<string[]>([]);
  
  // Estados para Base de Conocimientos
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [openLessons, setOpenLessons] = useState<string[]>([]);

  // Verificar perfil al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isProfileComplete) {
        setShowProfileModal(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isProfileComplete, setShowProfileModal]);

  // Funciones para FAQ
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQItem = (id: string) => {
    setOpenFAQItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Funciones para Base de Conocimientos
  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const toggleLesson = (lessonId: string) => {
    setOpenLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handlePathClick = (pathId: string) => {
    setSelectedPath(selectedPath === pathId ? null : pathId);
    setOpenModules([]);
    setOpenLessons([]);
  };

  const selectedLearningPath = learningPaths.find(path => path.id === selectedPath);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-responsive-lg overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.BUSINESS_OFFICE_1} 
            alt="Centro de Educación Financiera" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        <div className="container-wide relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary px-6 py-2 text-sm">
              Centro de Aprendizaje Pessaro Capital 2026
            </Badge>
            <h1 className="text-hero mb-6">
              Eleve su <span className="text-primary">Inteligencia Financiera</span>
            </h1>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Acceda a recursos exclusivos, rutas de aprendizaje estructuradas y respuestas detalladas 
              diseñadas por expertos con más de 15 años de experiencia en los mercados globales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4"
                onClick={() => openAssessment('general')}
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Empezar a Aprender
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={openExplorePopup}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explorar Contenido
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-responsive-sm border-y border-border bg-muted/30">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Estudiantes Activos', value: '45k+', icon: <Users className="w-6 h-6" /> },
              { label: 'Horas de Contenido', value: '50+', icon: <Clock className="w-6 h-6" /> },
              { label: 'Rutas de Aprendizaje', value: '3', icon: <Target className="w-6 h-6" /> },
              { label: 'Tasa de Éxito', value: '94%', icon: <Award className="w-6 h-6" /> }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2 text-primary">
                  {stat.icon}
                </div>
                <div className="text-heading font-bold text-foreground">{stat.value}</div>
                <div className="text-caption text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-responsive-lg">
        <div className="container-wide">
          <Tabs defaultValue="rutas" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="rutas" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Rutas de Aprendizaje
              </TabsTrigger>
              <TabsTrigger value="base-conocimientos" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Base de Conocimientos
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Preguntas Frecuentes
              </TabsTrigger>
            </TabsList>

            {/* Rutas de Aprendizaje */}
            <TabsContent value="rutas" id="rutas-section" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-display mb-4">Rutas de Aprendizaje Estructuradas</h2>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                  Programe su educación financiera con nuestras rutas diseñadas por expertos, 
                  desde conceptos básicos hasta estrategias avanzadas.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => openDownloadPopup('rutas', 'Rutas de Aprendizaje Estructuradas')}
                    className="mx-auto flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Guía Completa (PDF)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {learningPaths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 ${path.color} rounded-lg flex items-center justify-center text-white`}>
                            {path.icon}
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2">
                              {path.level}
                            </Badge>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {path.title}
                            </CardTitle>
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {path.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <PlayCircle className="w-4 h-4" />
                              <span>{path.totalLessons} lecciones</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{path.totalDuration}</span>
                            </div>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => {
                              // Navegar directamente a la sección de contenido detallado de la ruta
                              const routeElement = document.getElementById(`route-${path.id}`);
                              if (routeElement) {
                                routeElement.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {path.title === 'Fundamentos del Trading' ? 'Fundamentos del Trading' :
                             path.title === 'Estrategias Avanzadas' ? 'Estrategias Avanzadas' :
                             path.title === 'Psicología del Inversor' ? 'Psicología del Inversor' :
                             'Comenzar Ruta'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Contenido Detallado de Rutas */}
              <div className="mt-16">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold mb-4">Contenido Completo de las Rutas</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Explore el contenido detallado de cada ruta de aprendizaje. Cada ruta incluye objetivos, 
                    prerrequisitos, módulos estructurados y lecciones completas.
                  </p>
                </div>

                <div className="space-y-12">
                  {learningPaths.map((path, index) => (
                    <motion.div
                      key={path.id}
                      id={`route-${path.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className="border border-border rounded-xl overflow-hidden scroll-mt-20"
                    >
                      <div className={`${path.color} p-6 text-white`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                            {path.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-2">{path.title}</h4>
                            <p className="text-white/90 mb-4">{path.description}</p>
                            <div className="flex items-center gap-6">
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                {path.level}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <PlayCircle className="w-4 h-4" />
                                <span>{path.totalLessons} lecciones</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{path.totalDuration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-card">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h5 className="font-semibold mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              Objetivos de Aprendizaje
                            </h5>
                            <ul className="space-y-2">
                              {path.objectives.map((objective, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              Información del Curso
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm font-medium">Audiencia Objetivo:</span>
                                <p className="text-sm text-muted-foreground mt-1">{path.targetAudience}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium">Prerrequisitos:</span>
                                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                  {path.prerequisites.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                      <span>{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Módulos */}
                        <div>
                          <h5 className="font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Módulos del Curso
                          </h5>
                          <div className="space-y-4">
                            {path.modules.map((module, moduleIndex) => (
                              <Accordion key={module.id} type="single" collapsible className="border border-border rounded-lg">
                                <AccordionItem value={module.id} className="border-none">
                                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                    <div className="flex items-center gap-4 text-left">
                                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-sm">
                                        {moduleIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h6 className="font-medium">{module.title}</h6>
                                        <p className="text-sm text-muted-foreground">
                                          {module.description} • {module.estimatedTime}
                                        </p>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                      {module.lessons.map((lesson, lessonIndex) => (
                                        <Accordion key={lesson.id} type="single" collapsible className="border border-border/50 rounded-md">
                                          <AccordionItem value={lesson.id} className="border-none">
                                            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                                              <div className="flex items-center gap-3 text-left">
                                                <div className="w-6 h-6 bg-secondary/10 rounded flex items-center justify-center text-secondary text-xs font-medium">
                                                  {lessonIndex + 1}
                                                </div>
                                                <div className="flex-1">
                                                  <span className="font-medium">{lesson.title}</span>
                                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{lesson.duration}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-3 pb-3">
                                              <div className="space-y-4">
                                                <div>
                                                  <h6 className="text-sm font-semibold mb-2">Objetivos:</h6>
                                                  <ul className="space-y-1">
                                                    {lesson.objectives.map((obj, idx) => (
                                                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{obj}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                                <div>
                                                  <h6 className="text-sm font-semibold mb-2">Puntos Clave:</h6>
                                                  <ul className="space-y-1">
                                                    {lesson.keyPoints.map((point, idx) => (
                                                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                                        <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                        <span>{point}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                                <div>
                                                  <h6 className="text-sm font-semibold mb-2">Contenido:</h6>
                                                  <div className="prose prose-sm max-w-none text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
                                                    {lesson.content.split('\n').map((paragraph, idx) => {
                                                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                                        return (
                                                          <h6 key={idx} className="font-semibold text-foreground mt-3 mb-2 text-sm">
                                                            {paragraph.replace(/\*\*/g, '')}
                                                          </h6>
                                                        );
                                                      }
                                                      if (paragraph.startsWith('• ')) {
                                                        return (
                                                          <li key={idx} className="ml-4 mb-1">
                                                            {paragraph.substring(2)}
                                                          </li>
                                                        );
                                                      }
                                                      if (paragraph.trim() === '') {
                                                        return <br key={idx} />;
                                                      }
                                                      return (
                                                        <p key={idx} className="mb-2">
                                                          {paragraph}
                                                        </p>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                                {lesson.practicalExercise && (
                                                  <div>
                                                    <h6 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                      <Lightbulb className="w-3 h-3 text-yellow-500" />
                                                      Ejercicio Práctico:
                                                    </h6>
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                                      <p className="text-xs text-yellow-800">{lesson.practicalExercise}</p>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Base de Conocimientos */}
            <TabsContent value="base-conocimientos" id="base-conocimientos" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-display mb-4">Base de Conocimientos</h2>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                  Explore nuestro contenido educativo organizado por rutas de aprendizaje. 
                  Haga clic en una ruta para acceder a sus módulos y lecciones.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => openDownloadPopup('base-conocimientos', 'Base de Conocimientos Completa')}
                    className="mx-auto flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Manual Completo (PDF)
                  </Button>
                </div>
              </div>

              {/* Selector de Rutas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {learningPaths.map((path) => (
                  <Card 
                    key={path.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedPath === path.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handlePathClick(path.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${path.color} rounded-lg flex items-center justify-center text-white`}>
                          {path.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{path.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-xs">
                              {path.level}
                            </Badge>
                            <span>{path.totalLessons} lecciones</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${
                          selectedPath === path.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Contenido de la Ruta Seleccionada */}
              <AnimatePresence>
                {selectedLearningPath && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 ${selectedLearningPath.color} rounded-xl flex items-center justify-center text-white`}>
                            {selectedLearningPath.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{selectedLearningPath.title}</CardTitle>
                            <CardDescription className="text-base">
                              {selectedLearningPath.description}
                            </CardDescription>
                            <div className="flex items-center gap-6 mt-4">
                              <Badge variant="secondary">{selectedLearningPath.level}</Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <PlayCircle className="w-4 h-4" />
                                <span>{selectedLearningPath.totalLessons} lecciones</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{selectedLearningPath.totalDuration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Módulos y Lecciones */}
                    <div className="space-y-4">
                      {selectedLearningPath.modules.map((module, moduleIndex) => (
                        <Card key={module.id} className="overflow-hidden">
                          <CardHeader 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleModule(module.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
                                  {moduleIndex + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{module.title}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {module.description} • {module.estimatedTime}
                                  </CardDescription>
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 transition-transform ${
                                openModules.includes(module.id) ? 'rotate-180' : ''
                              }`} />
                            </div>
                          </CardHeader>
                          
                          <AnimatePresence>
                            {openModules.includes(module.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <CardContent className="pt-0 border-t border-border">
                                  <div className="space-y-2">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <div key={lesson.id} className="border border-border rounded-lg overflow-hidden">
                                        <div 
                                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                          onClick={() => toggleLesson(lesson.id)}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-secondary/10 rounded flex items-center justify-center text-secondary text-sm font-medium">
                                              {lessonIndex + 1}
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{lesson.title}</h4>
                                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>{lesson.duration}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <ChevronDown className={`w-4 h-4 transition-transform ${
                                            openLessons.includes(lesson.id) ? 'rotate-180' : ''
                                          }`} />
                                        </div>
                                        
                                        <AnimatePresence>
                                          {openLessons.includes(lesson.id) && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.3 }}
                                            >
                                              <div className="px-4 pb-4 border-t border-border bg-muted/20">
                                                <div className="prose prose-sm max-w-none mt-4 text-muted-foreground">
                                                  {lesson.content.split('\n').map((paragraph, idx) => {
                                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                                      return (
                                                        <h4 key={idx} className="font-semibold text-foreground mt-4 mb-2">
                                                          {paragraph.replace(/\*\*/g, '')}
                                                        </h4>
                                                      );
                                                    }
                                                    if (paragraph.startsWith('• ')) {
                                                      return (
                                                        <li key={idx} className="ml-4 mb-1">
                                                          {paragraph.substring(2)}
                                                        </li>
                                                      );
                                                    }
                                                    if (paragraph.trim() === '') {
                                                      return <br key={idx} />;
                                                    }
                                                    return (
                                                      <p key={idx} className="mb-3">
                                                        {paragraph}
                                                      </p>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedPath && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Selecciona una Ruta de Aprendizaje</h3>
                  <p className="text-muted-foreground">
                    Elige una de las rutas arriba para acceder a sus módulos y lecciones detalladas.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" id="faq-section" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-display mb-4">Preguntas Frecuentes</h2>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                  Encuentra respuestas detalladas sobre trading, instrumentos financieros, 
                  regulación y todo lo que necesitas saber para operar con confianza.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => openDownloadPopup('faq', 'Preguntas Frecuentes sobre Trading')}
                    className="mx-auto flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Compendio FAQ (PDF)
                  </Button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar en FAQ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {faqCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      data-category={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {filteredFAQs.length} pregunta{filteredFAQs.length !== 1 ? 's' : ''} encontrada{filteredFAQs.length !== 1 ? 's' : ''}
                {searchTerm && ` para "${searchTerm}"`}
                {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
              </div>

              {/* FAQ Content */}
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                  <p className="text-muted-foreground">
                    Intenta con otros términos de búsqueda o selecciona una categoría diferente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleFAQItem(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                {item.icon}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-left text-lg">
                                  {item.question}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category}
                                  </Badge>
                                  <div className="flex gap-1">
                                    {item.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: openFAQItems.includes(item.id) ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </CardHeader>
                        
                        <AnimatePresence>
                          {openFAQItems.includes(item.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CardContent className="pt-0">
                                {/* Información adicional de la FAQ */}
                                <div className="mb-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                      <Badge variant="secondary" className="text-xs">
                                        Nivel: {item.difficulty}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {item.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {item.relatedTopics.length > 0 && (
                                    <div className="mb-4">
                                      <span className="text-sm font-medium text-foreground">Temas Relacionados:</span>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {item.relatedTopics.map((topic, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Contenido principal */}
                                <div className="prose prose-sm max-w-none text-muted-foreground">
                                  {item.answer.split('\n').map((paragraph, idx) => {
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                      return (
                                        <h4 key={idx} className="font-semibold text-foreground mt-4 mb-2">
                                          {paragraph.replace(/\*\*/g, '')}
                                        </h4>
                                      );
                                    }
                                    if (paragraph.startsWith('• ')) {
                                      return (
                                        <li key={idx} className="ml-4 mb-1">
                                          {paragraph.substring(2)}
                                        </li>
                                      );
                                    }
                                    if (paragraph.trim() === '') {
                                      return <br key={idx} />;
                                    }
                                    return (
                                      <p key={idx} className="mb-3">
                                        {paragraph}
                                      </p>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-responsive-sm bg-muted/30">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-heading mb-4">¿Necesitas Ayuda Personalizada?</h3>
            <p className="text-body text-muted-foreground mb-6">
              Nuestro equipo de expertos está aquí para guiarte en tu camino hacia el éxito financiero.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={openAdvisorPopup}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Contactar Asesor Educativo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowProfileModal(true)}
              >
                Evaluar Perfil de Riesgo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <EducationAssessmentPopup 
        isOpen={isOpen} 
        onClose={closeAssessment} 
        courseType={courseType} 
      />
      <RiskProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        onSave={saveProfile} 
      />
      <DownloadPopup
        isOpen={isPopupOpen}
        onClose={closeDownloadPopup}
        contentType={currentContent?.type || 'rutas'}
        contentTitle={currentContent?.title || ''}
        onDownload={processDownload}
      />
      <ExploreContentPopup
        isOpen={isExploreOpen}
        onClose={closeExplorePopup}
        onNavigate={navigateToContent}
      />
      
      {/* Educational Advisor Popup */}
      <EducationalAdvisorPopup
        isOpen={isAdvisorOpen}
        onClose={closeAdvisorPopup}
      />
    </div>
  );
};

export default Educacion;