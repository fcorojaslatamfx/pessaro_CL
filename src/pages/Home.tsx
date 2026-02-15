import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// 1. IMPORTANTE: Importar HashLink para que funcionen las anclas internas (#)
import { HashLink } from 'react-router-hash-link'; 
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, ShieldCheck, Globe2, Zap, CheckCircle2, 
MessageSquare, Send, BarChart3, Users, Clock, ChevronLeft, ChevronRight } from 
'lucide-react';
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

const testimonials =;

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

 const nextTestimonial = () => {
 setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
 };
 const prevTestimonial = () => {
 setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
 };

 React.useEffect(() => {
 const interval = setInterval(nextTestimonial, 5000);
 return () => clearInterval(interval);
 }, []);

 return <main className="flex flex-col w-full" role="main" aria-label="Página principal de Pessaro Capital">
    {/* Hero Section */}
    <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden safe-area-top py-4 sm:py-6 lg:py-8">
        <div className="hero-background" role="img" aria-label="Gráficos de trading en tiempo real">
            <img src={IMAGES.TRADING_CHARTS_1} alt="Gráficos de trading" className="img-hero" loading="eager" decoding="async" />
            <div className="hero-overlay" aria-hidden="true"></div>
        </div>
        <div className="container-narrow relative z-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="space-y-6 sm:space-y-8 lg:space-y-10">
                    <span className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-accent/20 border border-accent/30 text-sm sm:text-base font-medium text-[rgb(125,225,129)]">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        Mercado Regulado y Fondos Segregados
                    </span>
                    <h1 id="hero-title" className="text-fluid-3xl font-bold leading-[1.1]">
                        <span className="block text-title-primary mb-2 sm:mb-3">Domine los Mercados con</span> 
                        <span className="block text-title-accent">Precisión Institucional</span>
                    </h1>
                    <p className="text-fluid-lg text-white/85 max-w-4xl mx-auto">Acceda a Forex, Commodities e Índices con tecnología de baja latencia.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="..." onClick={() => setShowProfileModal(true)}>Abrir Cuenta Real <ArrowRight className="ml-2 w-5 h-5" /></Button>
                        <Button size="lg" variant="outline" className="..." onClick={() => setShowProfileModal(true)}>Prueba Demo Gratis</Button>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>

    {/* Stats Section */}
    <section className="py-mobile-lg bg-secondary/50 border-y border-border">
        <div className="container-wide px-mobile-md">
            <div className="grid grid-mobile-auto gap-mobile-md">
                {stats.map(stat => (
                    <motion.div key={stat.id} className="flex flex-col items-center text-center">
                        <div className="p-mobile-sm rounded-full bg-accent/10 mb-mobile-sm">
                            <stat.icon className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-heading font-bold text-accent mb-1">{stat.value}</span>
                        <span className="text-caption text-muted-foreground">{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>

    {/* Servicios Section CORREGIDA */}
    <section id="servicios" className="py-responsive-lg bg-background">
        <div className="container-wide">
            <div className="text-center container-narrow mb-responsive-lg">
                <h2 className="text-display font-bold mb-responsive">
                    <span className="text-foreground">Servicios Financieros de</span> <span className="text-title-accent">Elite</span>
                </h2>
                <p className="text-muted-foreground">Combinamos tecnología con asesoría experta.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map(service => (
                    <div key={service.id} className="flex flex-col">
                        <ServiceCard service={service} />
                        {/* 2. CORRECCIÓN: Botón que redirige a la sección FAQ de abajo */}
                        <Button variant="link" className="text-accent mt-2" asChild>
                            <HashLink smooth to="#servicios-faq">Saber más</HashLink>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    </section>

    {/* FAQ Servicios Section CORREGIDA (Agregado ID de ancla) */}
    <section id="servicios-faq" className="py-responsive-lg bg-muted/20">
        <div className="container-wide">
            <div className="text-center container-narrow mb-responsive-lg">
                <h2 className="text-display font-bold mb-responsive">
                    <span className="text-foreground">¿Qué son nuestros</span> <span className="text-title-accent">Servicios Financieros?</span>
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.filter(faq => faq.id.startsWith('faq-forex') || faq.id.startsWith('faq-commodities') || faq.id.startsWith('faq-indices') || faq.id.startsWith('faq-crypto')).map(faq => (
                    <motion.div key={faq.id} className="bg-card border border-border/40 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-foreground mb-3">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>

    {/* ... (resto del código se mantiene igual) ... */}
 </main>;
};

export default Home;
