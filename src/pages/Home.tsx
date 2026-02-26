import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2 
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { services, faqs } from '@/data/index';
import { ServiceCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import RiskProfileModal from '@/components/RiskProfileModal';
import { springPresets } from '@/lib/motion';

const stats = [
  { id: 'stat-1', label: 'Años de Experiencia', value: '15+', icon: Clock },
  { id: 'stat-2', label: 'Activos Disponibles', value: '120+', icon: BarChart3 },
  { id: 'stat-3', label: 'Usuarios Globales', value: '40M+', icon: Users },
  { id: 'stat-4', label: 'Ejecución', value: '0.01s', icon: TrendingUp }
];

// Corregido: Array de testimonios con datos válidos para evitar error de build
const testimonials = [
  {
    id: 1,
    name: "Roberto Silva",
    role: "Inversionista Senior",
    content: "La ejecución de baja latencia ha transformado mi operativa diaria. Excelente plataforma."
  },
  {
    id: 2,
    name: "Elena Martínez",
    role: "Trader Particular",
    content: "El soporte institucional y la variedad de activos disponibles son inigualables en el mercado."
  }
];

const Home: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Lógica extraída de Servicios.tsx (PDF)
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <main className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={IMAGES.TRADING_CHARTS_1} 
            alt="Hero Background" 
            className="object-cover w-full h-full" 
          />
        </div>
        <div className="container relative z-10 text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={springPresets.smooth}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Domine los Mercados con <span className="text-blue-400">Precisión Institucional</span>
            </h1>
            <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">
              Tecnología de vanguardia y ejecución de baja latencia para inversores de élite.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={() => setShowProfileModal(true)}
              >
                Abrir Cuenta Real <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10" 
                onClick={() => setShowProfileModal(true)}
              >
                Prueba Demo Gratis
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {stats.map(stat => (
            <div key={stat.id} className="text-center">
              <stat.icon className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN SERVICIOS */}
      <section id="servicios" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Servicios Financieros de <span className="text-blue-600">Elite</span>
            </h2>
            <p className="text-slate-600">Combinamos tecnología de vanguardia con décadas de experiencia institucional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(service => (
              <div 
                key={service.id} 
                className="flex flex-col h-full bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow duration-300"
              >
                <ServiceCard service={service} />
                <Button 
                  variant="link" 
                  className="mt-6 text-blue-600 p-0 h-auto justify-start font-bold group" 
                  onClick={() => setShowProfileModal(true)}
                >
                  Saber más sobre {service.title}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Informativa: FAQ */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Qué son nuestros Servicios Financieros?</h2>
            <p className="text-slate-400">Resolvemos sus dudas sobre nuestra infraestructura y operativa.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {faqs.slice(0, 4).map(faq => (
              <div 
                key={faq.id} 
                className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
              >
                <h3 className="text-xl font-bold mb-4 text-blue-400">{faq.question}</h3>
                <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Perfil de Riesgo */}
      <RiskProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        onSave={saveProfile} 
        showRegistrationOption={true} 
      />
    </main>
  );
};

export default Home;
