import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, Globe, Users, CheckCircle2, ArrowRight, FileText, Calendar, PlayCircle, GraduationCap, Search, Download } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { faqs } from '@/data/index';
import { IMAGES } from '@/assets/images';
import { useNavigate } from 'react-router-dom';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useEducationAssessment } from '@/hooks/useEducationAssessment';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import EducationAssessmentPopup from '@/components/EducationAssessmentPopup';
import RiskProfileModal from '@/components/RiskProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
const Educacion: React.FC = () => {
  const navigate = useNavigate();
  const { openPopup } = useContactPopup();
  const { isOpen, courseType, openAssessment, closeAssessment } = useEducationAssessment();
  const { isProfileComplete, showProfileModal, setShowProfileModal, saveProfile, requireProfile } = useRiskProfile();
  const [searchTerm, setSearchTerm] = useState('');

  // Verificar perfil al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isProfileComplete) {
        setShowProfileModal(true);
      }
    }, 1000); // Mostrar después de 1 segundo para mejor UX

    return () => clearTimeout(timer);
  }, [isProfileComplete, setShowProfileModal]);
  const educationalPaths = [{
    title: 'Fundamentos del Trading',
    level: 'Principiante',
    description: 'Aprenda los conceptos básicos de los mercados financieros, desde pips hasta apalancamiento.',
    icon: <BookOpen className="w-6 h-6" />,
    lessons: 12,
    duration: '4h 30m'
  }, {
    title: 'Estrategias Avanzadas',
    level: 'Intermedio',
    description: 'Profundice en el análisis técnico, patrones de velas y gestión de riesgo institucional.',
    icon: <Globe className="w-6 h-6" />,
    lessons: 18,
    duration: '8h 15m'
  }, {
    title: 'Psicología del Inversor',
    level: 'Todos los niveles',
    description: 'Domine sus emociones y desarrolle la disciplina necesaria para el éxito a largo plazo.',
    icon: <Users className="w-6 h-6" />,
    lessons: 8,
    duration: '3h 45m'
  }];
  const resources = [{
    title: 'Guía de Divisas 2026',
    type: 'PDF',
    size: '4.2 MB',
    description: 'Manual completo sobre el mercado Forex actualizado para el entorno actual.'
  }, {
    title: 'Plantilla de Plan de Trading',
    type: 'Excel',
    size: '1.5 MB',
    description: 'Herramienta para documentar y auditar sus operaciones de forma profesional.'
  }, {
    title: 'Análisis de Correlaciones',
    type: 'E-Book',
    size: '2.8 MB',
    description: 'Cómo se mueven los activos financieros en relación unos con otros.'
  }];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.BUSINESS_OFFICE_3} alt="Academia Pessaro Capital" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary px-4 py-1">
              Centro de Aprendizaje 2026
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Eleve su <span className="text-primary">Inteligencia Financiera</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Acceda a recursos exclusivos, webinars en vivo y guías detalladas diseñadas por expertos con más de 15 años de experiencia en los mercados globales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => openAssessment('general')}
              >
                Empezar a Aprender
              </Button>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar temas, guías o activos..." 
                  className="pl-10 bg-card/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      navigate(`${ROUTE_PATHS.BASE_CONOCIMIENTOS}?search=${encodeURIComponent(searchTerm.trim())}`);
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{
            label: 'Estudiantes Activos',
            value: '45k+'
          }, {
            label: 'Horas de Video',
            value: '1,200+'
          }, {
            label: 'Guías Descargables',
            value: '350+'
          }, {
            label: 'Satisfacción',
            value: '98%'
          }].map((stat, idx) => <div key={idx}>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Rutas de Aprendizaje Estructuradas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Programas diseñados para llevarle de cero a profesional con una metodología probada y práctica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {educationalPaths.map((path, idx) => <motion.div key={idx} whileHover={{
            y: -5
          }} transition={{
            duration: 0.2
          }}>
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {path.icon}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{path.level}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" /> {path.lessons} lecciones
                      </span>
                    </div>
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground"
                      onClick={() => openAssessment(path.title.toLowerCase().replace(/\s+/g, '-'))}
                    >
                      Explorar curso <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Featured Webinar */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 mb-6">
                Próximo Webinar en Vivo
              </Badge>
              <h2 className="text-4xl font-bold mb-6">Análisis Macro: Navegando la Volatilidad en 2026</h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Únase a nuestro Head Trader, Francisco Rojas-Aranda, para una sesión intensiva sobre cómo las nuevas regulaciones europeas y el cambio en las tasas de interés afectarán sus carteras este trimestre.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span>25 de Febrero, 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-accent" />
                  <span>Zoom / YouTube Live</span>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => openPopup('guide')}
              >
                Reservar mi Plaza Gratis
              </Button>
            </div>
            <div className="flex-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <img src={IMAGES.TEAM_2} alt="Francisco Rojas-Aranda Webinar" className="w-full h-[400px] object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="font-bold text-white">Francisco Rojas-Aranda</p>
                  <p className="text-white/70 text-sm">Head Trader @ Pessaro Capital</p>
                </div>
              </div>
              {/* Floating element */}
              <motion.div animate={{
              y: [0, -10, 0]
            }} transition={{
              repeat: Infinity,
              duration: 4
            }} className="absolute -top-6 -right-6 p-4 bg-card rounded-xl shadow-xl text-card-foreground hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-tighter">En Vivo Pronto</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Library */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Biblioteca de Recursos</h2>
              <p className="text-muted-foreground">
                Descargue nuestras herramientas y publicaciones exclusivas para complementar su análisis diario.
              </p>
            </div>
            <Button variant="outline">Ver todos los archivos</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((res, idx) => <div key={idx} className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{res.type}</Badge>
                </div>
                <h3 className="text-lg font-bold mb-2">{res.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{res.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tamaño: {res.size}</span>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                    <Download className="w-4 h-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes sobre Educación</h2>
              <p className="text-muted-foreground">Todo lo que necesita saber sobre nuestra metodología y acceso.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => <AccordionItem key={faq.id} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 rounded-3xl p-8 md:p-16 flex flex-col items-center text-center">
            <GraduationCap className="w-16 h-16 text-primary mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para dar el siguiente paso?</h2>
            <p className="text-muted-foreground max-w-2xl mb-10 text-lg">
              Únase a miles de inversores que ya están transformando su futuro financiero con Pessaro Capital Academy. Registro gratuito por tiempo limitado.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="px-12 py-6 text-lg">
                Crear Cuenta Gratis
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-12 py-6 text-lg"
                onClick={() => setShowProfileModal(true)}
              >
                Contactar Asesor
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 grayscale opacity-50">
              <CheckCircle2 className="w-5 h-5" /> <span>Certificación Oficial</span>
              <CheckCircle2 className="w-5 h-5" /> <span>Soporte 24/5</span>
              <CheckCircle2 className="w-5 h-5" /> <span>Acceso Vitalicio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer (Minimal context for education) */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Pessaro Capital. El trading conlleva riesgos significativos. La educación proporcionada es para fines informativos y no constituye asesoramiento financiero directo.
          </p>
        </div>
      </footer>

      {/* Education Assessment Popup */}
      <EducationAssessmentPopup
        isOpen={isOpen}
        onClose={closeAssessment}
        courseType={courseType}
      />

      {/* Risk Profile Modal */}
      <RiskProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfile}
        showRegistrationOption={true}
      />
    </div>;
};
export default Educacion;