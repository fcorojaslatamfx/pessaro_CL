import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart3, Globe, ShieldCheck, TrendingUp, ArrowRight, Zap, Activity, Wallet, Bitcoin } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { tradingInstruments } from '@/data/index';
import { MarketCategory } from '@/lib/index';
import { InstrumentCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import RiskProfileModal from '@/components/RiskProfileModal';
const categories: {
  id: MarketCategory;
  label: string;
  icon: React.ReactNode;
}[] = [{
  id: 'Forex',
  label: 'Forex',
  icon: <Globe className="w-4 h-4" />
}, {
  id: 'Commodities',
  label: 'Materias Primas',
  icon: <Activity className="w-4 h-4" />
}, {
  id: 'Indices',
  label: 'Índices',
  icon: <BarChart3 className="w-4 h-4" />
}, {
  id: 'Acciones',
  label: 'Acciones',
  icon: <TrendingUp className="w-4 h-4" />
}, {
  id: 'ETF',
  label: 'ETF',
  icon: <Wallet className="w-4 h-4" />
}, {
  id: 'Criptomonedas',
  label: 'Criptomonedas',
  icon: <Bitcoin className="w-4 h-4" />
}];
const Instrumentos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('Forex');
  const [searchQuery, setSearchQuery] = useState('');
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();
  const filteredInstruments = useMemo(() => {
    return tradingInstruments.filter(inst => inst.category === activeCategory && (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || inst.symbol.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [activeCategory, searchQuery]);
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.TRADING_CHARTS_3} alt="Trading Markets" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
              Mercados Globales
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
              Explora más de <span className="text-primary">1,200 instrumentos</span> financieros
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              Opere con spreads competitivos y ejecución ultrarrápida en divisas, materias primas, índices y acciones de todo el mundo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Explorer Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Buscar símbolo..." 
                    className="pl-10" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                  />
                </div>

                <nav className="flex flex-col gap-2">
                  {categories.map(cat => <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeCategory === cat.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'}`}>
                      {cat.icon}
                      {cat.label}
                    </button>)}
                </nav>

                <div className="p-4 rounded-2xl border border-accent/20 bg-[rgb(125,225,129)]">
                  <h4 className="font-semibold text-accent-foreground mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> 
                    Tip Pro
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Utiliza nuestra cuenta Demo para practicar tus estrategias en estos mercados sin riesgo.
                  </p>
                </div>
              </div>
            </aside>

            {/* Instruments Grid */}
            <main className="flex-1">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold">{activeCategory}</h2>
                  <p className="text-muted-foreground">Mostrando instrumentos populares en este mercado</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredInstruments.length} resultados encontrados
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode='popLayout'>
                  {filteredInstruments.length > 0 ? filteredInstruments.map(inst => <motion.div key={inst.id} layout initial={{
                  opacity: 0,
                  scale: 0.95
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  scale: 0.95
                }} transition={{
                  duration: 0.2
                }}>
                        <InstrumentCard 
                          instrument={inst} 
                          onTrade={() => setShowProfileModal(true)}
                        />
                      </motion.div>) : <div className="col-span-full py-20 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No se encontraron instrumentos</h3>
                      <p className="text-muted-foreground">Intenta con otra búsqueda o categoría.</p>
                    </div>}
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Trading Conditions Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Condiciones de Trading Superiores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              En Pessaro Capital, combinamos tecnología institucional con una interfaz intuitiva para ofrecerte la mejor experiencia de inversión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ejecución Ultra-Rápida</h3>
              <p className="text-muted-foreground">
                Latencia inferior a 30ms gracias a nuestros servidores estratégicamente ubicados en centros de datos financieros globales.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <ShieldCheck className="text-accent-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Protección de Fondos</h3>
              <p className="text-muted-foreground">
                Tus fondos están segregados en bancos de nivel 1 y protegidos por estrictos protocolos de seguridad internacionales.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <ArrowRight className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Spreads desde 0.0 pips</h3>
              <p className="text-muted-foreground">
                Accede a liquidez de grado institucional con spreads extremadamente bajos en nuestra cuenta Raw Spread.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.INVESTMENT_2} alt="Start Trading" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para empezar a operar?</h2>
            <p className="text-lg mb-10 text-muted-foreground">
              Únete a miles de inversores que ya confían en Pessaro Capital para acceder a los mercados globales con las mejores condiciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                onClick={() => setShowProfileModal(true)}
              >
                Abrir Cuenta Real <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="px-8 py-4 bg-card border border-border rounded-full font-bold text-lg hover:bg-muted transition-all"
                onClick={() => setShowProfileModal(true)}
              >
                Probar Cuenta Demo
              </Button>
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              Aviso de Riesgo: Los CFDs son instrumentos complejos y conllevan un alto riesgo de perder dinero rápidamente debido al apalancamiento.
            </p>
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
export default Instrumentos;