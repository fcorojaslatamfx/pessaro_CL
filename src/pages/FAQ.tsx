import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, TrendingUp, DollarSign, BarChart3, Bitcoin, Shield, Building, Wallet, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: 'forex-trading',
    question: '¿Qué es el Forex Trading?',
    answer: `El Forex (Foreign Exchange) es el mercado de divisas más grande del mundo, donde se intercambian monedas de diferentes países. Con un volumen diario de más de $6 billones, opera 24 horas al día, 5 días a la semana.

**Características principales:**
• **Liquidez alta**: Facilita la entrada y salida de posiciones
• **Apalancamiento**: Permite operar con más capital del disponible
• **Spreads bajos**: Costos de transacción reducidos
• **Volatilidad**: Oportunidades de ganancia en movimientos de precios

**Pares de divisas principales:**
- EUR/USD (Euro/Dólar estadounidense)
- GBP/USD (Libra esterlina/Dólar estadounidense)
- USD/JPY (Dólar estadounidense/Yen japonés)
- USD/CHF (Dólar estadounidense/Franco suizo)

**Factores que influyen en el Forex:**
• Políticas económicas de los bancos centrales
• Indicadores económicos (PIB, inflación, empleo)
• Eventos geopolíticos y noticias
• Flujos de inversión internacional`,
    category: 'Instrumentos Financieros',
    icon: <TrendingUp className="w-5 h-5" />,
    tags: ['forex', 'divisas', 'trading', 'mercados']
  },
  {
    id: 'materias-primas',
    question: '¿Qué son las Materias Primas en Trading?',
    answer: `Las materias primas (commodities) son bienes físicos básicos que se utilizan en la producción de otros bienes. Son activos tangibles que se pueden intercambiar en los mercados financieros.

**Tipos de materias primas:**

**Metales preciosos:**
• Oro - Refugio de valor tradicional
• Plata - Industrial y de inversión
• Platino - Uso automotriz e industrial
• Paladio - Catalizadores y electrónicos

**Energía:**
• Petróleo crudo (WTI, Brent)
• Gas natural
• Gasolina
• Combustible para calefacción

**Productos agrícolas:**
• Trigo, maíz, soja
• Café, azúcar, cacao
• Algodón, ganado

**Ventajas del trading de commodities:**
• Diversificación de portafolio
• Protección contra la inflación
• Correlación con ciclos económicos
• Oportunidades en volatilidad estacional

**Factores que afectan los precios:**
• Oferta y demanda global
• Condiciones climáticas
• Políticas gubernamentales
• Situación geopolítica
• Fortaleza del dólar estadounidense`,
    category: 'Instrumentos Financieros',
    icon: <DollarSign className="w-5 h-5" />,
    tags: ['commodities', 'materias primas', 'oro', 'petróleo']
  },
  {
    id: 'indices-bursatiles',
    question: '¿Qué son los Índices Bursátiles?',
    answer: `Los índices bursátiles son indicadores que miden el rendimiento de un grupo seleccionado de acciones, representando el comportamiento general de un mercado o sector específico.

**Índices principales mundiales:**

**Estados Unidos:**
• **S&P 500** - 500 empresas más grandes de EE.UU.
• **Dow Jones** - 30 empresas industriales principales
• **NASDAQ 100** - 100 empresas tecnológicas más grandes

**Europa:**
• **DAX 40** - 40 empresas alemanas principales
• **FTSE 100** - 100 empresas británicas más grandes
• **CAC 40** - 40 empresas francesas principales

**Asia:**
• **Nikkei 225** - 225 empresas japonesas
• **Hang Seng** - Empresas de Hong Kong

**Ventajas del trading de índices:**
• Diversificación automática
• Menor riesgo que acciones individuales
• Reflejan la economía general
• Alta liquidez y spreads competitivos
• Disponibles 24/5 en mercados globales

**Métodos de cálculo:**
• **Ponderado por capitalización**: Empresas más grandes tienen mayor peso
• **Ponderado por precio**: Basado en el precio de las acciones
• **Igualmente ponderado**: Todas las empresas tienen el mismo peso

**Factores que influyen:**
• Resultados corporativos
• Políticas económicas
• Indicadores macroeconómicos
• Sentimiento del mercado`,
    category: 'Instrumentos Financieros',
    icon: <BarChart3 className="w-5 h-5" />,
    tags: ['índices', 'bursátiles', 'sp500', 'dow jones']
  },
  {
    id: 'criptomonedas',
    question: '¿Qué son las Criptomonedas?',
    answer: `Las criptomonedas son monedas digitales descentralizadas que utilizan tecnología blockchain para garantizar transacciones seguras y controlar la creación de nuevas unidades.

**Principales criptomonedas:**

**Bitcoin (BTC):**
• Primera y más conocida criptomoneda
• Reserva de valor digital ("oro digital")
• Suministro limitado a 21 millones de monedas
• Mayor capitalización de mercado

**Ethereum (ETH):**
• Plataforma para contratos inteligentes
• Base para aplicaciones descentralizadas (DApps)
• Segunda mayor capitalización
• Transición a Proof of Stake

**Otras criptomonedas importantes:**
• **Binance Coin (BNB)** - Token del exchange Binance
• **Cardano (ADA)** - Blockchain de tercera generación
• **Solana (SOL)** - Blockchain de alta velocidad
• **Polkadot (DOT)** - Interoperabilidad entre blockchains

**Características del trading de criptomonedas:**
• **Alta volatilidad**: Oportunidades de grandes ganancias y pérdidas
• **Mercado 24/7**: Opera todos los días del año
• **Liquidez variable**: Depende de la criptomoneda
• **Regulación en evolución**: Marco legal en desarrollo

**Factores que afectan los precios:**
• Adopción institucional
• Regulaciones gubernamentales
• Desarrollos tecnológicos
• Sentimiento del mercado
• Noticias y eventos del sector

**Riesgos importantes:**
• Extrema volatilidad
• Riesgo regulatorio
• Riesgo tecnológico
• Falta de respaldo gubernamental`,
    category: 'Instrumentos Financieros',
    icon: <Bitcoin className="w-5 h-5" />,
    tags: ['criptomonedas', 'bitcoin', 'ethereum', 'blockchain']
  },
  {
    id: 'regulador-trading',
    question: '¿Qué es un Regulador en Trading?',
    answer: `Un regulador financiero es una entidad gubernamental o autoridad independiente que supervisa y controla las actividades de los mercados financieros y las instituciones que operan en ellos.

**Principales reguladores mundiales:**

**Estados Unidos:**
• **SEC** (Securities and Exchange Commission) - Mercados de valores
• **CFTC** (Commodity Futures Trading Commission) - Futuros y derivados
• **FINRA** - Autorregulación de brokers
• **NFA** (National Futures Association) - Futuros y Forex

**Reino Unido:**
• **FCA** (Financial Conduct Authority) - Conducta financiera
• **PRA** (Prudential Regulation Authority) - Regulación prudencial

**Europa:**
• **CySEC** (Chipre) - Muy popular para brokers de Forex
• **BaFin** (Alemania) - Supervisión financiera federal
• **CONSOB** (Italia) - Comisión de valores
• **CNMV** (España) - Comisión Nacional del Mercado de Valores

**Australia:**
• **ASIC** (Australian Securities and Investments Commission)

**Funciones de los reguladores:**
• **Protección al inversor**: Garantizar prácticas justas
• **Supervisión de brokers**: Licencias y cumplimiento
• **Transparencia del mercado**: Información clara y precisa
• **Prevención de fraudes**: Investigación y sanciones
• **Estabilidad financiera**: Mantener la confianza del mercado

**Importancia de elegir un broker regulado:**
• Segregación de fondos de clientes
• Compensación en caso de insolvencia
• Procesos de quejas y resolución de disputas
• Auditorías regulares y transparencia
• Cumplimiento de estándares internacionales

**Señales de alerta (brokers no regulados):**
• Promesas de ganancias garantizadas
• Bonos excesivamente altos
• Falta de información regulatoria
• Presión para depositar más dinero
• Dificultades para retirar fondos`,
    category: 'Regulación y Seguridad',
    icon: <Shield className="w-5 h-5" />,
    tags: ['regulador', 'SEC', 'FCA', 'CySEC', 'seguridad']
  },
  {
    id: 'banco-custodio',
    question: '¿Qué es un Banco Custodio?',
    answer: `Un banco custodio es una institución financiera especializada en la custodia, administración y protección de activos financieros de terceros, incluyendo valores, efectivo y otros instrumentos de inversión.

**Funciones principales:**

**Custodia de activos:**
• Almacenamiento seguro de valores y efectivo
• Registro y seguimiento de todas las transacciones
• Protección física y digital de los activos
• Segregación de activos de clientes

**Servicios administrativos:**
• Liquidación y compensación de operaciones
• Cobro de dividendos e intereses
• Procesamiento de splits y fusiones corporativas
• Reportes detallados de posiciones

**Servicios de valor agregado:**
• Préstamo de valores
• Gestión de garantías
• Servicios de cambio de divisas
• Análisis de riesgo y performance

**Principales bancos custodios globales:**
• **BNY Mellon** - Líder mundial en custodia
• **State Street** - Especialista en servicios institucionales
• **JPMorgan Chase** - Servicios globales de custodia
• **Citibank** - Red internacional extensa
• **HSBC** - Fuerte presencia en mercados emergentes

**Importancia en el trading:**
• **Segregación de fondos**: Los activos del cliente están separados de los del broker
• **Protección adicional**: Doble capa de seguridad
• **Transparencia**: Reportes independientes de posiciones
• **Regulación estricta**: Supervisión por múltiples autoridades
• **Respaldo institucional**: Mayor confianza y estabilidad

**Diferencia con cuentas bancarias normales:**
• Especialización en valores y instrumentos financieros
• Servicios post-trading avanzados
• Conectividad con mercados globales
• Expertise en regulaciones internacionales
• Tecnología especializada para custodia

**Beneficios para el inversor:**
• Mayor seguridad de los fondos
• Reducción del riesgo de contraparte
• Acceso a reportes detallados
• Protección en caso de insolvencia del broker
• Cumplimiento regulatorio mejorado`,
    category: 'Regulación y Seguridad',
    icon: <Building className="w-5 h-5" />,
    tags: ['banco custodio', 'custodia', 'seguridad', 'activos']
  },
  {
    id: 'cuenta-segregada',
    question: '¿Qué es una Cuenta Segregada?',
    answer: `Una cuenta segregada es una cuenta bancaria donde los fondos de los clientes se mantienen completamente separados de los fondos operativos del broker o institución financiera.

**Características principales:**

**Separación total:**
• Los fondos del cliente nunca se mezclan con los del broker
• Cuentas bancarias completamente independientes
• Identificación clara de la propiedad de los fondos
• Acceso restringido solo para operaciones del cliente

**Protección legal:**
• Los fondos no pueden ser utilizados por el broker para sus operaciones
• Protección en caso de insolvencia o quiebra del broker
• Los acreedores del broker no pueden reclamar estos fondos
• Derecho de propiedad claro del cliente

**Tipos de segregación:**

**Segregación individual:**
• Cada cliente tiene su propia cuenta separada
• Máximo nivel de protección
• Más costoso de mantener
• Común en cuentas institucionales grandes

**Segregación omnibus:**
• Fondos de múltiples clientes en una cuenta segregada
• Separada de los fondos del broker
• Más eficiente operativamente
• Común en brokers retail

**Beneficios para el trader:**
• **Seguridad máxima**: Protección contra mal uso de fondos
• **Transparencia**: Reportes claros de saldos
• **Rapidez en retiros**: Acceso directo a los fondos
• **Confianza**: Cumplimiento de regulaciones estrictas
• **Protección legal**: Derechos claros en caso de problemas

**Regulaciones que exigen segregación:**
• **FCA (Reino Unido)**: Segregación obligatoria
• **CySEC (Chipre)**: Cuentas segregadas requeridas
• **ASIC (Australia)**: Protección de fondos de clientes
• **SEC/CFTC (EE.UU.)**: Reglas estrictas de segregación

**Verificación de segregación:**
• Revisar términos y condiciones del broker
• Confirmar el banco donde se mantienen los fondos
• Verificar certificaciones regulatorias
• Solicitar información sobre políticas de segregación
• Revisar auditorías independientes

**Diferencia con cuentas no segregadas:**
• **Riesgo de contraparte**: Menor en cuentas segregadas
• **Acceso a fondos**: Más rápido en segregadas
• **Protección legal**: Mayor en segregadas
• **Transparencia**: Superior en segregadas
• **Costos**: Pueden ser ligeramente mayores

**Señales de alerta:**
• Broker que no especifica políticas de segregación
• Fondos mantenidos en cuentas del propio broker
• Falta de información sobre bancos custodios
• Términos vagos sobre protección de fondos`,
    category: 'Regulación y Seguridad',
    icon: <Wallet className="w-5 h-5" />,
    tags: ['cuenta segregada', 'protección', 'fondos', 'seguridad']
  },
  {
    id: 'usdt-tether',
    question: '¿Qué es USDT (Tether)?',
    answer: `USDT (Tether) es una stablecoin o criptomoneda estable que está diseñada para mantener un valor de paridad 1:1 con el dólar estadounidense, proporcionando estabilidad en el volátil mundo de las criptomonedas.

**Características principales:**

**Estabilidad de precio:**
• Valor objetivo de $1 USD por cada USDT
• Respaldado por reservas en dólares estadounidenses
• Menor volatilidad comparado con otras criptomonedas
• Auditorías regulares de las reservas

**Blockchains soportadas:**
• **Ethereum (ERC-20)**: La versión más común
• **Tron (TRC-20)**: Transacciones más rápidas y baratas
• **Bitcoin (Omni Layer)**: La versión original
• **Binance Smart Chain (BEP-20)**: Para el ecosistema Binance
• **Solana, Polygon, Avalanche**: Otras redes populares

**Usos principales en trading:**

**Refugio de valor:**
• Protección durante alta volatilidad del mercado
• Preservación de valor sin salir del ecosistema crypto
• Evitar conversiones frecuentes a moneda fiat

**Par de trading:**
• Base para trading de otras criptomonedas
• Liquidez alta en la mayoría de exchanges
• Facilita arbitraje entre diferentes mercados

**Transferencias internacionales:**
• Envíos rápidos y económicos
• Disponible 24/7 sin restricciones bancarias
• Menor costo que transferencias bancarias tradicionales

**Ventajas del USDT:**
• **Estabilidad**: Precio relativamente estable
• **Liquidez**: Alta disponibilidad en exchanges
• **Velocidad**: Transacciones rápidas según la blockchain
• **Accesibilidad**: Amplia adopción mundial
• **Transparencia**: Reportes regulares de reservas

**Riesgos y consideraciones:**
• **Riesgo de contraparte**: Dependencia de Tether Limited
• **Regulación**: Posibles cambios regulatorios
• **Despeg del dólar**: Riesgo de perder la paridad
• **Controversias**: Debates sobre respaldo completo
• **Riesgo de blockchain**: Dependiente de la red subyacente

**Alternativas a USDT:**
• **USDC (USD Coin)**: Mayor transparencia regulatoria
• **BUSD (Binance USD)**: Respaldado por Paxos
• **DAI**: Stablecoin descentralizada
• **TUSD (TrueUSD)**: Auditorías regulares

**Cómo usar USDT en trading:**
• Comprar durante volatilidad alta
• Usar como par base para altcoins
• Mantener liquidez sin exposición a volatilidad
• Facilitar entrada y salida rápida de posiciones
• Arbitraje entre diferentes exchanges

**Verificación de reservas:**
• Reportes trimestrales de auditoría
• Transparencia en composición de reservas
• Seguimiento de emisión y redención
• Monitoreo de ratio de respaldo`,
    category: 'Criptomonedas',
    icon: <Coins className="w-5 h-5" />,
    tags: ['USDT', 'Tether', 'stablecoin', 'criptomonedas']
  }
];

const categories = [
  'Todos',
  'Instrumentos Financieros',
  'Regulación y Seguridad',
  'Criptomonedas'
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-responsive-lg bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-hero mb-responsive">
              Preguntas Frecuentes
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-3xl mx-auto mb-responsive-lg">
              Encuentra respuestas detalladas sobre trading, instrumentos financieros, 
              regulación y todo lo que necesitas saber para operar con confianza.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-responsive-sm border-b border-border">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
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

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredFAQs.length} pregunta{filteredFAQs.length !== 1 ? 's' : ''} encontrada{filteredFAQs.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
            {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-responsive-lg">
        <div className="container-wide">
          {filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda o selecciona una categoría diferente.
              </p>
            </motion.div>
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
                      onClick={() => toggleItem(item.id)}
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
                          animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {openItems.includes(item.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-0">
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
            <h3 className="text-heading mb-4">¿No encontraste lo que buscabas?</h3>
            <p className="text-body text-muted-foreground mb-6">
              Nuestro equipo de expertos está aquí para ayudarte con cualquier pregunta adicional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contacto"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contactar Soporte
              </motion.a>
              <motion.a
                href="/educacion"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Recursos Educativos
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}