import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Importación necesaria para el scroll suave a las anclas
import { HashLink } from 'react-router-hash-link'; 
import { motion } from 'framer-motion';
import { 
  ArrowRight, TrendingUp, ShieldCheck, Globe2, Zap, CheckCircle2, 
  MessageSquare, Send, BarChart3, Users, Clock, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { ROUTE_PATHS } from '@/lib/index';
import { services, tradingInstruments, faqs } from '@/data/index';
import { ServiceCard, InstrumentCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';

const stats = [
  { id: 'stat-1', label: 'Años de Experiencia', value: '15+', icon: Clock },
  { id: 'stat-2', label: 'Activos Disponibles', value: '120+', icon: BarChart3 },
  { id: 'stat-3', label: 'Usuarios Globales', value: '40M+', icon: Users },
  { id: 'stat-4', label: 'Ejecución', value: '0.01s', icon: TrendingUp }
];

const testimonials =;

const Home: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const {
    isOpen,
    popupType,
    openPopup,
    closePopup
  } = useContactPopup();
  
  const { setShowProfileModal } = useRiskProfile();

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <main className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-blue-900 text-white overflow-hidden">
        <div className="container-narrow relative z-20 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Domine los Mercados con <span className="text-blue-400">Precisión</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">Tecnología de vanguardia para inversores de élite.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => setShowProfileModal(true)}>Abrir Cuenta Real</Button>
              <Button size="lg" variant="outline">Prueba Demo</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {stats.map(stat => (
            <div key={stat.id} className="text-center">
              <stat.icon className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN CORREGIDA: Servicios Financieros de Elite */}
      <section id="servicios" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Servicios Financieros de <span className="text-blue-600">Elite</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(service => (
              <div key={service.id} className="flex flex-col h-full bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <ServiceCard service={service} />
                {/* BOTÓN CORREGIDO: Redirige a la sección FAQ de abajo */}
                <Button variant="link" className="mt-4 text-blue-600 p-0 h-auto justify-start font-bold" asChild>
                  <HashLink smooth to="#nuestros-servicios-faq">
                    Saber más sobre {service.title} <ArrowRight className="ml-2 w-4 h-4" />
                  </HashLink>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN DESTINO: ¿Qué son nuestros servicios financieros? */}
      <section id="nuestros-servicios-faq" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Qué son nuestros Servicios Financieros?</h2>
            <p className="text-slate-400">Resolvemos tus dudas sobre nuestra operativa institucional.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {faqs.slice(0, 4).map(faq => (
              <div key={faq.id} className="p-6 rounded-xl bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-blue-400">{faq.question}</h3>
                <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
