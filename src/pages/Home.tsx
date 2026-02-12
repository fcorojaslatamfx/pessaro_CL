import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, ShieldCheck, Globe2, Zap, CheckCircle2, MessageSquare, Send, BarChart3, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { ROUTE_PATHS, PESSARO_LOGO_HEADER } from '@/lib/index';
import { services, tradingInstruments, contactInfo, faqs } from '@/data/index';
import { ServiceCard, InstrumentCard, TestimonialCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { useNewsletter } from '@/hooks/useNewsletter';
import ContactPopup from '@/components/ContactPopup';
import RiskProfileModal from '@/components/RiskProfileModal';
import NewsletterPopup from '@/components/NewsletterPopup';
const stats = [{
  id: 'stat-1',
  label: 'Años de Experiencia',
  value: '15+',
  icon: Clock
}, {
  id: 'stat-2',
  label: 'Activos Disponibles',
  value: '120+',
  icon: BarChart3
}, {
  id: 'stat-3',
  label: 'Usuarios Globales',
  value: '40M+',
  icon: Users
}, {
  id: 'stat-4',
  label: 'Ejecución',
  value: '0.01s',
  icon: TrendingUp
}];
const testimonials = [{
  id: 'testimonial-1',
  name: 'María González',
  role: 'Trader Profesional',
  content: 'Pessaro Capital ha revolucionado mi forma de operar. Sus análisis de mercado son precisos y su plataforma tecnológica es excepcional. Los spreads competitivos me han permitido maximizar mis ganancias.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_1
}, {
  id: 'testimonial-2',
  name: 'Carlos Mendoza',
  role: 'Inversor Institucional',
  content: 'La gestión de riesgo que ofrece Pessaro Capital es sobresaliente. Durante 15 años de experiencia, nunca había encontrado un equipo tan profesional y dedicado a proteger el capital de sus clientes.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_2
}, {
  id: 'testimonial-3',
  name: 'Ana Ruiz',
  role: 'Gestora de Fondos',
  content: 'Lo que más valoro es la transparencia total en cada operación. Mi asesor me mantiene informada en tiempo real y cada decisión está respaldada por análisis fundamentales sólidos.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_3
}, {
  id: 'testimonial-4',
  name: 'Roberto Silva',
  role: 'Empresario',
  content: 'Pessaro Capital no solo gestiona mis inversiones, sino que me ha educado para tomar mejores decisiones financieras. Su programa de formación continua es invaluable para cualquier inversor serio.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_4
}, {
  id: 'testimonial-5',
  name: 'Patricia Morales',
  role: 'Inversionista Privada',
  content: 'El servicio al cliente es extraordinario. Disponibilidad 24/7, respuestas inmediatas y un trato personalizado que hace la diferencia. Nunca me he sentido como un número más.',
  rating: 5,
  image: IMAGES.PROFESSIONAL_WOMAN_3
}, {
  id: 'testimonial-6',
  name: 'Diego Fernández',
  role: 'Trader Algorítmico',
  content: 'Los retornos consistentes que he obtenido con Pessaro Capital superan mis expectativas. Su tecnología de ejecución es rápida y confiable, perfecta para mi estrategia de trading algorítmico.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_6
}, {
  id: 'testimonial-7',
  name: 'Lucía Herrera',
  role: 'Directora Financiera',
  content: 'Durante la crisis del 2022, Pessaro Capital demostró su verdadero valor. Sus estrategias defensivas no solo protegieron mi portafolio, sino que generaron ganancias cuando otros perdían.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_7
}, {
  id: 'testimonial-8',
  name: 'Andrés Vega',
  role: 'Inversor de Largo Plazo',
  content: 'La capacidad de anticipación de mercado de mi asesor es impresionante. Sus recomendaciones estratégicas han sido acertadas en el 95% de los casos, generando retornos excepcionales.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_8
}, {
  id: 'testimonial-9',
  name: 'Carmen López',
  role: 'Family Office Manager',
  content: 'Pessaro Capital entiende las necesidades complejas de gestión patrimonial. Su enfoque integral y diversificación inteligente han optimizado nuestro portafolio familiar significativamente.',
  rating: 5,
  image: IMAGES.BUSINESS_OFFICE_9
}];
const Home: React.FC = () => {
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const {
    isOpen,
    popupType,
    openPopup,
    closePopup
  } = useContactPopup();
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();

  // Funciones del carrusel
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play del carrusel
  React.useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000); // Cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);
  return <main className="flex flex-col w-full" role="main" aria-label="Página principal de Pessaro Capital">
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] sm:min-h-[85vh] lg:min-h-screen flex items-center bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white overflow-hidden safe-area-top"
        aria-labelledby="hero-title"
      >
        {/* Background Image */}
        <div className="hero-background" role="img" aria-label="Gráficos de trading en tiempo real">
          <img 
            src={IMAGES.TRADING_CHARTS_1} 
            alt="Gráficos de trading y análisis financiero en tiempo real" 
            className="img-hero" 
            loading="eager"
            decoding="async"
          />
          <div className="hero-overlay" aria-hidden="true"></div>
        </div>

        <div className="container-narrow relative z-20">
          <div className="text-center">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }}>
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-medium mb-4 sm:mb-6 text-[rgb(125,225,129)]">
                <ShieldCheck className="w-4 h-4" />
                Mercado Regulado y Fondos Segregados
              </span>
              <h1 
                id="hero-title"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6"
              >
                <span className="text-title-primary">Domine los Mercados con</span> <span className="text-title-accent">Precisión Institucional</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Acceda a Forex, Commodities e Índices con tecnología de baja latencia y el respaldo de 15 años de excelencia financiera.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Button size="lg" className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30" onClick={() => setShowProfileModal(true)}>
                  Abrir Cuenta Real
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg text-white border-white/20 hover:bg-white/10 hover:border-white/40" onClick={() => setShowProfileModal(true)}>
                  Prueba Demo Gratis
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-responsive-sm bg-secondary/50 border-y border-border">
        <div className="container-wide">
          <div className="grid grid-responsive-features gap-responsive">
            {stats.map(stat => <motion.div key={stat.id} initial={{
            opacity: 0,
            scale: 0.95
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} className="flex flex-col items-center text-center card-responsive-sm">
                <div className="p-3 rounded-full bg-accent/10 mb-4">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <span className="text-heading font-bold text-accent mb-1">{stat.value}</span>
                <span className="text-caption text-muted-foreground font-medium">{stat.label}</span>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="py-responsive-lg bg-background">
        <div className="container-wide">
          <div className="text-center container-narrow mb-responsive-lg">
            <h2 className="text-display font-bold mb-responsive">
              <span className="text-foreground">Servicios Financieros de</span> <span className="text-title-accent">Elite</span>
            </h2>
            <p className="text-muted-foreground">
              Ofrecemos un ecosistema completo para el inversor moderno, combinando tecnología de vanguardia con asesoría experta.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {services.map(service => <ServiceCard key={service.id} service={service} />)}
          </div>
        </div>
      </section>

      {/* FAQ Servicios Financieros Section */}
      <section className="py-responsive-lg bg-muted/20">
        <div className="container-wide">
          <div className="text-center container-narrow mb-responsive-lg">
            <h2 className="text-display font-bold mb-responsive">
              <span className="text-foreground">¿Qué son nuestros</span> <span className="text-title-accent">Servicios Financieros?</span>
            </h2>
            <p className="text-muted-foreground">
              Conozca en detalle cada uno de nuestros servicios de inversión y trading.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {faqs.filter(faq => faq.id.startsWith('faq-forex') || faq.id.startsWith('faq-commodities') || faq.id.startsWith('faq-indices') || faq.id.startsWith('faq-crypto')).map(faq => (
              <motion.div
                key={faq.id}
                id={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card border border-border/40 rounded-xl p-6 hover:border-accent/40 transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instrumentos Section */}
      <section id="instrumentos" className="py-24 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Mercados</span> <span className="text-title-accent">Globales</span> <span className="text-foreground">al Alcance</span>
              </h2>
              <p className="text-muted-foreground">
                Opere con los activos más líquidos del mundo con spreads competitivos desde 0.0 pips y apalancamiento flexible.
              </p>
            </div>
            <Button variant="link" className="text-accent font-semibold flex items-center gap-2 group hover:text-accent/80" asChild>
              <Link to={ROUTE_PATHS.INSTRUMENTOS}>
                Ver todos los instrumentos
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {tradingInstruments.slice(0, 8).map(instrument => (
              <InstrumentCard 
                key={instrument.id} 
                instrument={instrument} 
                onTrade={() => setShowProfileModal(true)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                <span className="text-foreground">Trayectoria, Confianza y</span> <span className="text-title-accent">Resultados</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Con más de 15 años en los mercados financieros, Pessaro Capital se ha consolidado como un referente en servicios de inversión. 
                Nuestra plataforma combina tecnología de última generación con la experiencia de un equipo de profesionales altamente cualificados.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[{
                label: 'Regulación Internacional',
                icon: ShieldCheck
              }, {
                label: 'Fondos Segregados',
                icon: CheckCircle2
              }, {
                label: 'Soporte 24/7',
                icon: MessageSquare
              }, {
                label: 'Ejecución Instantánea',
                icon: Zap
              }].map((feature, index) => <div key={index} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>)}
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30" asChild>
                <Link to={ROUTE_PATHS.NOSOTROS}>
                  Conozca Nuestro Equipo
                </Link>
              </Button>
            </div>
            <div className="relative">
              <img src={IMAGES.BUSINESS_OFFICE_4} alt="Pessaro Capital Team" className="rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              <span className="text-title-primary">Lo que dicen nuestros</span> <span className="text-title-accent">inversores</span>
            </h2>
            <p className="text-white/60">
              Más de 15,000 inversionistas confían en nuestra asesoría personalizada y gestión profesional.
            </p>
          </div>
          
          {/* Carrusel de Testimonios */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-xl">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 border border-white/20">
                      <div className="flex gap-1 mb-6 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-5 h-5 text-accent fill-current">⭐</div>
                        ))}
                      </div>
                      
                      <blockquote className="text-lg sm:text-xl md:text-2xl text-center text-white/90 leading-relaxed italic mb-6 sm:mb-8">
                        "{testimonial.content}"
                      </blockquote>
                      
                      <div className="flex items-center justify-center gap-4">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-3 border-accent/30"
                        />
                        <div className="text-center">
                          <div className="font-bold text-white text-lg">{testimonial.name}</div>
                          <div className="text-white/70">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Controles del Carrusel */}
            <button
              onClick={prevTestimonial}
              className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 border border-white/30"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 border border-white/30"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            
            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial 
                      ? 'bg-accent scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-20 overflow-hidden bg-blue-950">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.TRADING_SCREEN_BLUE_1} 
            alt="Financial Trading Background" 
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-blue-900/80 to-blue-950/90"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              <span className="text-white">Mantente</span>{' '}
              <span className="text-blue-300">Informado</span>
            </h2>
            <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 leading-relaxed">
              Recibe análisis de mercado exclusivos, estrategias de trading personalizadas y alertas de oportunidades 
              directamente en tu correo. Selecciona los temas que más te interesan.
            </p>
            
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <span className="px-3 py-1 bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-full">📈 Análisis de Mercados</span>
                <span className="px-3 py-1 bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-full">💱 Forex & Divisas</span>
                <span className="px-3 py-1 bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-full">📊 Acciones & ETF</span>
                <span className="px-3 py-1 bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-full">₿ Criptomonedas</span>
                <span className="px-3 py-1 bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-full">🏛️ Política Económica</span>
              </div>
              
              <Button 
                onClick={() => setShowNewsletterPopup(true)}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30 px-8 py-4 text-lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Suscribirse al Newsletter
              </Button>
              
              <p className="text-xs text-blue-200 max-w-md mx-auto">
                Únete a más de 10,000 traders que ya reciben nuestros análisis exclusivos. 
                Sin spam, solo contenido de valor.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-5xl mx-auto bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 sm:p-8 md:p-12 bg-primary text-white">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                  <span className="text-title-primary">Contáctanos</span>
                </h2>
                <p className="text-white/70 mb-10">
                  Nuestro equipo de expertos está disponible para ayudarte con tus inversiones y responder todas tus consultas.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/10">
                      <MessageSquare className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Correo Electrónico</p>
                      <p className="font-medium">{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/10">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Atención Telefónica</p>
                      <p className="font-medium">{contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/10">
                      <Globe2 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Oficina Principal</p>
                      <p className="font-medium">{contactInfo.address}, {contactInfo.office}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-6">¿Listo para comenzar?</h3>
                <p className="text-muted-foreground mb-8">
                  Únete a miles de traders que confían en Pessaro Capital para sus inversiones.
                </p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => openPopup('account')}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contactar Asesor
                  </Button>
                  
                  <Button 
                    onClick={() => setShowProfileModal(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Abrir Cuenta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-[rgb(255,255,255)]">¿Listo para</span> <span className="text-[rgb(255,255,255)]">Comenzar?</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30" onClick={() => setShowProfileModal(true)}>
              Empezar Ahora
            </Button>
            <Button size="lg" variant="outline" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-transparent h-11 rounded-md px-8 border-accent hover:bg-accent hover:text-accent-foreground text-[rgb(125,225,129)]" onClick={() => setShowProfileModal(true)}>
              Ver Guía de Trading
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Popup */}
      <ContactPopup isOpen={isOpen} onClose={closePopup} buttonType={popupType} />

      {/* Risk Profile Modal */}
      <RiskProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfile}
      />

      {/* Newsletter Popup */}
      <NewsletterPopup
        isOpen={showNewsletterPopup}
        onClose={() => setShowNewsletterPopup(false)}
      />
    </main>;
};
export default Home;