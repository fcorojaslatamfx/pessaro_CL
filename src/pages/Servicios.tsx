import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  LineChart, 
  Briefcase, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Globe2,
  Zap
} from 'lucide-react';
import { services } from '@/data/index';
import { ServiceCard } from '@/components/Cards';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import RiskProfileModal from '@/components/RiskProfileModal';

const iconMap: Record<string, React.ReactNode> = {
  LineChart: <LineChart className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  UserCheck: <UserCheck className="w-6 h-6" />,
};

export default function Servicios() {
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();
  
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src={IMAGES.TRADING_CHARTS_2} 
            alt="Trading Charts Background" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-primary/90" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.smooth}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-title-primary">Soluciones Financieras de</span> <span className="text-title-accent">Clase Mundial</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              En Pessaro Capital, combinamos tecnología de vanguardia con décadas de experiencia institucional para ofrecerle servicios que transforman su visión financiera en realidad.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowProfileModal(true)}>
                Abrir Cuenta Real
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowProfileModal(true)}>
                Ver Tutoriales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid de Servicios Principales */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestra Propuesta de Valor</h2>
            <p className="text-muted-foreground">
              Un ecosistema integral diseñado para cubrir cada etapa de su jornada como inversor, desde la formación inicial hasta la gestión patrimonial compleja.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {services.map((service) => (
              <motion.div key={service.id} variants={staggerItem}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Detalle Profundo: Por qué elegirnos */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={IMAGES.BUSINESS_OFFICE_2} 
                  alt="Professional Office"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-2xl shadow-xl hidden md:block">
                <div className="text-4xl font-bold text-accent mb-1">15+</div>
                <div className="text-sm text-primary-foreground font-medium">Años de Excelencia</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Infraestructura Tecnológica de <span className="text-primary">Baja Latencia</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                No solo ofrecemos asesoría; proporcionamos el motor que impulsa sus transacciones. Nuestra plataforma está construida sobre los mismos estándares que utilizan los grandes bancos de inversión.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Seguridad de Grado Bancario",
                    desc: "Fondos segregados en instituciones Tier-1 y encriptación de extremo a extremo.",
                    icon: <ShieldCheck className="text-primary" />
                  },
                  {
                    title: "Ejecución Instantánea",
                    desc: "Tecnología ECN para asegurar que sus órdenes se ejecuten al mejor precio disponible.",
                    icon: <Zap className="text-primary" />
                  },
                  {
                    title: "Alcance Global",
                    desc: "Acceso directo a más de 120 mercados financieros internacionales desde una sola cuenta.",
                    icon: <Globe2 className="text-primary" />
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-border">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Beneficios por Servicio (Breakdown) */}
      <section className="py-24 bg-background" data-service-details>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {services.map((service, idx) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl border border-border bg-card shadow-sm transition-all duration-300"
                data-service-id={service.id}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {iconMap[service.iconName]}
                  </div>
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground mb-8">{service.description}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         SECCIÓN: Gestión de Cuentas PAMM / MAM / CopyTrading
         ============================================================ */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          {/* Título */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={springPresets.smooth}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Gestión Profesional de Cuentas de Trading
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.smooth, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Administración institucional mediante modelos <strong>PAMM</strong>, 
              <strong> MAM</strong> y <strong> CopyTrading</strong>, diseñados para inversionistas que buscan 
              delegar ejecución, gestión de riesgo y estrategias avanzadas con total transparencia.
            </motion.p>
          </div>

          {/* Grid de características */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {/* PAMM */}
            <motion.div 
              variants={staggerItem}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Modelo PAMM</h3>
              <p className="text-muted-foreground mb-6">
                El gestor opera una cuenta maestra y los resultados se distribuyen proporcionalmente entre los inversionistas. 
                Ideal para quienes buscan delegar completamente la ejecución.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Distribución proporcional de ganancias</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Transparencia total en métricas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Gestión profesional centralizada</span>
                </li>
              </ul>
            </motion.div>

            {/* MAM */}
            <motion.div 
              variants={staggerItem}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Modelo MAM</h3>
              <p className="text-muted-foreground mb-6">
                Permite asignaciones flexibles por riesgo, lotaje o estrategia. 
                Diseñado para inversionistas con perfiles diferenciados.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Asignación por riesgo o lotaje</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Control individual por cuenta</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Ideal para carteras diversificadas</span>
                </li>
              </ul>
            </motion.div>

            {/* CopyTrading */}
            <motion.div 
              variants={staggerItem}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">CopyTrading</h3>
              <p className="text-muted-foreground mb-6">
                Replica automáticamente las operaciones de traders profesionales. 
                Perfecto para quienes buscan resultados consistentes sin intervenir manualmente.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Copia automática de estrategias</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Control total del riesgo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Ideal para principiantes y pasivos</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={springPresets.smooth}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg font-bold group"
              onClick={() => setShowProfileModal(true)}
            >
              Solicitar Información
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={springPresets.bouncy}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para elevar su estrategia de inversión?</h2>
            <p className="text-xl text-primary-foreground/70 mb-10">
              Únase a miles de inversores que ya confían en Pessaro Capital para la gestión de su futuro financiero.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 h-14 text-lg font-bold group" onClick={() => setShowProfileModal(true)}>
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-10 h-14 text-lg" onClick={() => setShowProfileModal(true)}>
                Hablar con un Asesor
              </Button>
            </div>
            <p className="mt-8 text-sm text-primary-foreground/50">
              * El trading conlleva riesgos. Asegúrese de comprenderlos antes de comenzar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Risk Profile Modal */}
      <RiskProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfile}
        showRegistrationOption={true}
      />
    </div>
  );
}