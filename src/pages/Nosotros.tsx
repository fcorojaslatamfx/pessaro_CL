import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Globe, Users, Target, History, CheckCircle } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { teamMembers } from '@/data/index';
import { TeamCard } from '@/components/Cards';
import { ROUTE_PATHS } from '@/lib/index';
import { Link } from 'react-router-dom';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import RiskProfileModal from '@/components/RiskProfileModal';
const Nosotros = () => {
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();
  
  const stats = [{
    label: 'Años de Experiencia',
    value: '15+'
  }, {
    label: 'Clientes Globales',
    value: '50k+'
  }, {
    label: 'Países Cubiertos',
    value: '120+'
  }, {
    label: 'Soporte 24/7',
    value: 'Si'
  }];
  const values = [{
    title: 'Transparencia',
    description: 'Operamos con total claridad en nuestras tarifas y procesos, garantizando que el inversor siempre tenga el control.',
    icon: <ShieldCheck className="w-8 h-8 text-accent" />
  }, {
    title: 'Innovación',
    description: 'Implementamos la última tecnología en ejecución de órdenes y seguridad cibernética para proteger su capital.',
    icon: <Target className="w-8 h-8 text-accent" />
  }, {
    title: 'Excelencia',
    description: 'Buscamos la perfección en cada análisis y recomendación, respaldados por décadas de experiencia institucional.',
    icon: <Award className="w-8 h-8 text-accent" />
  }];
  return <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.BUSINESS_OFFICE_4} alt="Pessaro Capital Office" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4 border border-accent/20">
              Nuestra Identidad
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground">
              Liderando el Futuro de las <span className="text-primary">Inversiones</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Desde hace más de 15 años, Pessaro Capital ha sido el socio de confianza para miles de inversores que buscan precisión, seguridad y rendimientos excepcionales.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History & Stats Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.8
          }}>
              <div className="flex items-center gap-3 mb-4 text-primary">
                <History className="w-6 h-6" />
                <span className="font-semibold uppercase tracking-wider">Nuestra Trayectoria</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Más de una Década de Innovación Financiera</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Fundada en 2011, Pessaro Capital nació con una misión clara: cerrar la brecha entre los mercados institucionales de élite y el inversor individual ambicioso. Lo que comenzó como una pequeña firma boutique en Madrid se ha transformado en un referente global del trading.
                </p>
                <p>
                  A lo largo de estos 15 años, hemos navegado por diversas crisis financieras internacionales, saliendo fortalecidos gracias a nuestra gestión prudente del riesgo y nuestra capacidad de adaptación tecnológica. Hoy, operamos en los principales centros financieros del mundo, ofreciendo acceso a más de 120 instrumentos financieros con ejecución de ultra-baja latencia.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12">
                {stats.map((stat, index) => <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase font-medium">{stat.label}</div>
                  </div>)}
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.8
          }} className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img src={IMAGES.INVESTMENT_3} alt="Trading Floor Analysis" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-primary p-8 rounded-2xl shadow-xl hidden md:block">
                <div className="text-white">
                  <div className="text-4xl font-bold mb-1">100%</div>
                  <div className="text-sm opacity-80 uppercase tracking-tighter">Fondos Segregados</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Nuestros Pilares Fundamentales</h2>
            <p className="text-muted-foreground">Nuestra cultura corporativa se basa en la integridad y el compromiso inquebrantable con el éxito de nuestros clientes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {values.map((value, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.2
          }} className="p-6 sm:p-8 bg-card border border-border rounded-2xl hover:border-accent/50 transition-colors group text-center">
                <div className="mb-6 inline-flex p-4 rounded-xl bg-accent/5 group-hover:bg-accent/10 transition-colors">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[rgb(1,28,118)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Users className="w-6 h-6" />
                <span className="font-semibold uppercase tracking-wider text-[rgb(125,225,129)]">Liderazgo</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[rgb(255,255,255)]">El Equipo Detrás del Éxito</h2>
              <p className="mt-4 text-[rgb(125,225,129)]">Contamos con un grupo diverso de profesionales con experiencia en banca de inversión, análisis cuantitativo y desarrollo de sistemas financieros.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(member => <TeamCard key={member.id} member={member} />)}
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img src={IMAGES.TEAM_3} alt="Regulatory Compliance" className="rounded-2xl shadow-2xl" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold uppercase tracking-wider">Seguridad & Regulación</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Su Capital, Nuestra Máxima Prioridad</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Segregación de Fondos</h4>
                    <p className="text-sm text-muted-foreground">Los fondos de los clientes se mantienen en cuentas bancarias segregadas en bancos internacionales de primer nivel (Tier 1), completamente separados del capital operativo de la empresa.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Protección de Saldo Negativo</h4>
                    <p className="text-sm text-muted-foreground">Nuestra plataforma garantiza que nunca pierda más de lo que ha depositado, proporcionando una red de seguridad esencial en mercados volátiles.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Cumplimiento Internacional</h4>
                    <p className="text-sm text-muted-foreground">Operamos bajo estrictos estándares de cumplimiento KYC (Conozca a su Cliente) y AML (Prevención de Lavado de Dinero) para garantizar la integridad de nuestra red.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-12 relative overflow-hidden text-center text-white">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Globe className="w-64 h-64" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para Invertir con el Líder del Mercado?</h2>
              <p className="text-lg opacity-80 mb-10">
                Únase a los miles de inversores que ya confían en Pessaro Capital para potenciar su patrimonio global.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  Abrir Cuenta Real
                </button>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
                >
                  Evaluar Perfil de Riesgo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Risk Profile Modal */}
      <RiskProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfile}
        showRegistrationOption={true}
      />
    </div>;
};
export default Nosotros;