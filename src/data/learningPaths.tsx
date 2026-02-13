import React from 'react';
import { 
  BookOpen, TrendingUp, Brain, Clock, Target, Users, Award,
  CheckCircle2, ArrowRight, PlayCircle, FileText, Lightbulb,
  BarChart3, PieChart, LineChart, Activity, Zap, Shield, Globe
} from 'lucide-react';

// Interfaces para el contenido
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  objectives: string[];
  keyPoints: string[];
  practicalExercise?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  lessons: Lesson[];
  icon: React.ReactNode;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: string;
  totalLessons: number;
  totalDuration: string;
  modules: Module[];
  icon: React.ReactNode;
  color: string;
  objectives: string[];
  prerequisites: string[];
  targetAudience: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  icon: React.ReactNode;
  relatedTopics: string[];
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
}

// Contenido detallado de las rutas de aprendizaje
export const learningPaths: LearningPath[] = [
  {
    id: 'fundamentos-trading',
    title: 'Fundamentos del Trading',
    description: 'Aprende los conceptos básicos del trading financiero desde cero. Ideal para principiantes que quieren entender los mercados.',
    level: 'Principiante',
    totalLessons: 12,
    totalDuration: '4h 30m',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-blue-500',
    objectives: [
      'Comprender los conceptos básicos del trading',
      'Identificar diferentes tipos de mercados financieros',
      'Aprender terminología esencial del trading',
      'Dominar el uso de plataformas de trading',
      'Aplicar principios básicos de análisis técnico',
      'Implementar estrategias de gestión de riesgo'
    ],
    prerequisites: [
      'Conocimientos básicos de matemáticas',
      'Acceso a internet y computadora',
      'Interés en los mercados financieros'
    ],
    targetAudience: 'Personas sin experiencia previa en trading que desean aprender desde los fundamentos.',
    modules: [
      {
        id: 'introduccion-mercados',
        title: 'Introducción a los Mercados Financieros',
        description: 'Conceptos fundamentales sobre mercados financieros y trading',
        estimatedTime: '1h 30m',
        icon: <BarChart3 className="w-5 h-5" />,
        lessons: [
          {
            id: 'que-es-trading',
            title: '¿Qué es el Trading?',
            duration: '25 min',
            objectives: [
              'Definir qué es el trading financiero',
              'Distinguir entre trading e inversión',
              'Identificar los participantes del mercado'
            ],
            keyPoints: [
              'Trading vs Inversión: diferencias clave',
              'Tipos de traders según duración',
              'Participantes del mercado financiero',
              'Conceptos de liquidez y volatilidad'
            ],
            content: `**¿Qué es el Trading?**

El trading es la compra y venta de instrumentos financieros con el objetivo de obtener beneficios a corto o mediano plazo. A diferencia de la inversión tradicional, el trading se enfoca en aprovechar las fluctuaciones de precios en períodos más cortos.

**Diferencias entre Trading e Inversión:**

• **Trading**: Operaciones de corto a mediano plazo (minutos a meses)
• **Inversión**: Estrategia de largo plazo (años a décadas)
• **Análisis**: Trading usa más análisis técnico, inversión más fundamental
• **Frecuencia**: Trading requiere monitoreo constante, inversión es más pasiva

**Tipos de Trading por Duración:**

**Scalping (Segundos a Minutos)**
• Operaciones muy rápidas
• Pequeñas ganancias por operación
• Alto volumen de transacciones
• Requiere dedicación completa

**Day Trading (Intradiario)**
• Posiciones abiertas y cerradas el mismo día
• No se mantienen posiciones overnight
• Aprovecha volatilidad diaria
• Requiere tiempo y concentración

**Swing Trading (Días a Semanas)**
• Posiciones mantenidas varios días
• Aprovecha tendencias de mediano plazo
• Menos tiempo de pantalla requerido
• Equilibrio entre análisis técnico y fundamental

**Position Trading (Semanas a Meses)**
• Posiciones de largo plazo dentro del trading
• Enfoque en tendencias principales
• Menos operaciones, más análisis
• Combina aspectos de trading e inversión

**Participantes del Mercado:**

• **Retail Traders**: Individuos que operan con capital propio
• **Institucionales**: Bancos, fondos, aseguradoras
• **Market Makers**: Proveen liquidez al mercado
• **Hedgers**: Buscan protección contra riesgos
• **Especuladores**: Buscan beneficios de movimientos de precios

**Conceptos Clave:**

**Liquidez**: Facilidad para comprar/vender sin afectar el precio
**Volatilidad**: Grado de variación de precios en el tiempo
**Spread**: Diferencia entre precio de compra y venta
**Volumen**: Cantidad de activos negociados en un período`,
            practicalExercise: 'Identifica 3 diferencias clave entre tu enfoque actual hacia el dinero y lo que sería una mentalidad de trader. Reflexiona sobre qué tipo de trading se adapta mejor a tu estilo de vida.'
          },
          {
            id: 'tipos-mercados',
            title: 'Tipos de Mercados Financieros',
            duration: '30 min',
            objectives: [
              'Clasificar los diferentes mercados financieros',
              'Comprender las características de cada mercado',
              'Identificar oportunidades en cada tipo de mercado'
            ],
            keyPoints: [
              'Mercado Forex y sus características',
              'Mercados de acciones globales',
              'Commodities y materias primas',
              'Criptomonedas y activos digitales'
            ],
            content: `**Tipos de Mercados Financieros**

**1. Mercado Forex (Foreign Exchange)**

El mercado de divisas es el más grande y líquido del mundo, con un volumen diario superior a $6 trillones.

**Características:**
• Operativo 24 horas, 5 días a la semana
• Alta liquidez y bajos spreads
• Apalancamiento disponible
• Pares de divisas como instrumentos

**Pares Principales (Majors):**
• EUR/USD - Euro vs Dólar Americano
• GBP/USD - Libra Esterlina vs Dólar
• USD/JPY - Dólar vs Yen Japonés
• USD/CHF - Dólar vs Franco Suizo

**Pares Menores (Minors):**
• EUR/GBP, EUR/JPY, GBP/JPY
• No incluyen el dólar americano
• Menor liquidez que los majors

**Pares Exóticos:**
• Incluyen divisas de economías emergentes
• USD/TRY, EUR/ZAR, USD/MXN
• Mayor volatilidad y spreads más amplios

**2. Mercado de Acciones**

Representa la propiedad parcial de empresas públicas.

**Principales Bolsas:**
• NYSE (New York Stock Exchange)
• NASDAQ (National Association of Securities Dealers Automated Quotations)
• LSE (London Stock Exchange)
• TSE (Tokyo Stock Exchange)

**Tipos de Acciones:**
• **Blue Chips**: Empresas grandes y estables (Apple, Microsoft)
• **Growth Stocks**: Empresas en crecimiento acelerado
• **Value Stocks**: Acciones subvaloradas por el mercado
• **Dividend Stocks**: Empresas que pagan dividendos regulares

**3. Mercado de Commodities**

Materias primas y productos básicos.

**Categorías:**
• **Metales Preciosos**: Oro, plata, platino, paladio
• **Energía**: Petróleo crudo, gas natural, gasolina
• **Agricultura**: Trigo, maíz, soja, café, azúcar
• **Metales Industriales**: Cobre, aluminio, zinc

**Características:**
• Influenciados por factores estacionales
• Correlación con inflación
• Refugio de valor en crisis
• Volatilidad por eventos geopolíticos

**4. Mercado de Criptomonedas**

Activos digitales descentralizados.

**Principales Criptomonedas:**
• **Bitcoin (BTC)**: Primera y más conocida
• **Ethereum (ETH)**: Plataforma de contratos inteligentes
• **Altcoins**: Monedas alternativas (ADA, DOT, LINK)
• **Stablecoins**: Vinculadas a monedas fiat (USDT, USDC)

**Características:**
• Mercado 24/7 sin interrupciones
• Alta volatilidad
• Tecnología blockchain
• Regulación en desarrollo

**5. Mercado de Índices**

Representan el rendimiento de un grupo de acciones.

**Índices Principales:**
• **S&P 500**: 500 empresas más grandes de EE.UU.
• **Dow Jones**: 30 empresas industriales estadounidenses
• **NASDAQ 100**: 100 empresas tecnológicas más grandes
• **FTSE 100**: 100 empresas más grandes del Reino Unido

**Ventajas del Trading de Índices:**
• Diversificación automática
• Menor riesgo que acciones individuales
• Reflejan la economía general
• Disponibles como CFDs y ETFs`,
            practicalExercise: 'Elige un mercado que te interese y busca 3 noticias recientes que hayan afectado sus precios. Analiza cómo los eventos externos influyen en cada tipo de mercado.'
          },
          {
            id: 'terminologia-basica',
            title: 'Terminología Básica del Trading',
            duration: '20 min',
            objectives: [
              'Dominar el vocabulario esencial del trading',
              'Comprender conceptos de precio y volumen',
              'Familiarizarse con órdenes de mercado'
            ],
            keyPoints: [
              'Bid, Ask y Spread',
              'Pip, Lote y Apalancamiento',
              'Long, Short y posiciones',
              'Órdenes de mercado y límite'
            ],
            content: `**Terminología Básica del Trading**

**Conceptos de Precio:**

**Bid (Oferta)**
• Precio al cual los compradores están dispuestos a comprar
• Siempre es menor que el Ask
• Representa la demanda del mercado

**Ask (Demanda)**
• Precio al cual los vendedores están dispuestos a vender
• Siempre es mayor que el Bid
• Representa la oferta del mercado

**Spread**
• Diferencia entre Ask y Bid
• Costo implícito de cada operación
• Indicador de liquidez del mercado
• Spread estrecho = mayor liquidez

**Conceptos de Tamaño:**

**Pip (Percentage in Point)**
• Unidad mínima de movimiento de precio
• En Forex: cuarta decimal (0.0001)
• En JPY: segunda decimal (0.01)
• Ejemplo: EUR/USD de 1.1200 a 1.1201 = 1 pip

**Lote**
• Unidad estándar de trading
• **Lote Estándar**: 100,000 unidades de la divisa base
• **Mini Lote**: 10,000 unidades
• **Micro Lote**: 1,000 unidades
• **Nano Lote**: 100 unidades

**Apalancamiento**
• Capacidad de controlar posiciones grandes con capital pequeño
• Expresado como ratio (1:100, 1:500)
• Amplifica tanto ganancias como pérdidas
• Requiere gestión cuidadosa del riesgo

**Tipos de Posiciones:**

**Long (Compra)**
• Comprar un activo esperando que suba de precio
• Beneficio cuando el precio aumenta
• "Ir largo" en el mercado

**Short (Venta)**
• Vender un activo esperando que baje de precio
• Beneficio cuando el precio disminuye
• "Ir corto" en el mercado

**Tipos de Órdenes:**

**Market Order (Orden de Mercado)**
• Ejecuta inmediatamente al mejor precio disponible
• Garantiza ejecución pero no el precio
• Útil para entrar/salir rápidamente

**Limit Order (Orden Límite)**
• Se ejecuta solo a un precio específico o mejor
• Garantiza precio pero no ejecución
• Útil para entrar en niveles específicos

**Stop Loss**
• Orden para cerrar posición perdedora
• Limita pérdidas máximas
• Esencial para gestión de riesgo

**Take Profit**
• Orden para cerrar posición ganadora
• Asegura beneficios en nivel objetivo
• Automatiza la toma de ganancias

**Conceptos de Análisis:**

**Soporte**
• Nivel de precio donde la demanda supera la oferta
• Los precios tienden a "rebotar" hacia arriba
• Actúa como "piso" del precio

**Resistencia**
• Nivel de precio donde la oferta supera la demanda
• Los precios tienden a "rebotar" hacia abajo
• Actúa como "techo" del precio

**Tendencia**
• Dirección general del movimiento de precios
• **Alcista**: Máximos y mínimos crecientes
• **Bajista**: Máximos y mínimos decrecientes
• **Lateral**: Movimiento horizontal

**Volatilidad**
• Medida de variación de precios
• Alta volatilidad = grandes movimientos
• Baja volatilidad = movimientos pequeños
• Afecta estrategias y gestión de riesgo`,
            practicalExercise: 'Abre una plataforma de trading demo y identifica el Bid, Ask y Spread de 5 instrumentos diferentes. Calcula cuántos pips se mueve cada uno en 1 hora.'
          },
          {
            id: 'plataformas-trading',
            title: 'Plataformas de Trading',
            duration: '15 min',
            objectives: [
              'Conocer las principales plataformas de trading',
              'Comprender las funcionalidades básicas',
              'Saber elegir la plataforma adecuada'
            ],
            keyPoints: [
              'MetaTrader 4 y 5',
              'Plataformas web y móviles',
              'Funcionalidades esenciales',
              'Criterios de selección'
            ],
            content: `**Plataformas de Trading**

**MetaTrader 4 (MT4)**

La plataforma más popular para Forex y CFDs.

**Características:**
• Interfaz intuitiva y personalizable
• Amplia gama de indicadores técnicos
• Expert Advisors (robots de trading)
• Backtesting de estrategias
• Comunidad grande de usuarios

**Ventajas:**
• Estabilidad y confiabilidad
• Recursos educativos abundantes
• Compatible con múltiples brokers
• Versiones desktop, web y móvil

**MetaTrader 5 (MT5)**

Versión más avanzada con funcionalidades adicionales.

**Mejoras sobre MT4:**
• Más timeframes disponibles
• Calendario económico integrado
• Profundidad de mercado (DOM)
• Más tipos de órdenes
• Trading de acciones y futuros

**Plataformas Web**

**Ventajas:**
• No requiere instalación
• Acceso desde cualquier navegador
• Actualizaciones automáticas
• Multiplataforma (Windows, Mac, Linux)

**Desventajas:**
• Dependiente de conexión a internet
• Funcionalidades limitadas vs desktop
• Posible latencia en ejecución

**Aplicaciones Móviles**

**Características Esenciales:**
• Ejecución de órdenes
• Gráficos básicos con indicadores
• Notificaciones push
• Gestión de cuenta

**Limitaciones:**
• Pantalla pequeña para análisis detallado
• Funcionalidades reducidas
• Mayor riesgo de errores por pantalla táctil

**Funcionalidades Esenciales:**

**Gráficos y Análisis:**
• Múltiples timeframes
• Indicadores técnicos
• Herramientas de dibujo
• Plantillas personalizables

**Gestión de Órdenes:**
• Tipos de órdenes variados
• Modificación rápida de posiciones
• Historial de operaciones
• Cálculo automático de P&L

**Gestión de Riesgo:**
• Stop Loss y Take Profit
• Trailing Stop
• Cálculo de tamaño de posición
• Alertas de precio

**Criterios de Selección:**

**Facilidad de Uso:**
• Interfaz intuitiva
• Curva de aprendizaje
• Personalización disponible

**Funcionalidades:**
• Herramientas de análisis
• Tipos de órdenes
• Automatización disponible

**Estabilidad:**
• Tiempo de actividad
• Velocidad de ejecución
• Soporte técnico

**Compatibilidad:**
• Sistemas operativos soportados
• Brokers compatibles
• Dispositivos móviles

**Recomendaciones por Perfil:**

**Principiantes:**
• Plataformas simples e intuitivas
• Buenos recursos educativos
• Soporte al cliente en español
• Cuenta demo disponible

**Intermedios:**
• Más herramientas de análisis
• Capacidades de automatización
• Múltiples tipos de órdenes
• Backtesting básico

**Avanzados:**
• Programación de estrategias
• APIs para trading algorítmico
• Análisis avanzado
• Múltiples feeds de datos`,
            practicalExercise: 'Descarga una plataforma demo (MT4 o MT5) y familiarízate con la interfaz. Practica colocando órdenes de prueba y explorando los diferentes tipos de gráficos.'
          }
        ]
      },
      {
        id: 'analisis-tecnico-basico',
        title: 'Análisis Técnico Básico',
        description: 'Fundamentos del análisis técnico para tomar decisiones de trading',
        estimatedTime: '2h 15m',
        icon: <LineChart className="w-5 h-5" />,
        lessons: [
          {
            id: 'tipos-graficos',
            title: 'Tipos de Gráficos',
            duration: '35 min',
            objectives: [
              'Distinguir entre diferentes tipos de gráficos',
              'Interpretar velas japonesas',
              'Elegir el gráfico adecuado para cada análisis'
            ],
            keyPoints: [
              'Gráficos de línea, barras y velas',
              'Interpretación de velas japonesas',
              'Timeframes y su importancia',
              'Patrones básicos de velas'
            ],
            content: `**Tipos de Gráficos en Trading**

**1. Gráfico de Línea**

**Características:**
• Conecta precios de cierre consecutivos
• Muestra tendencia general claramente
• Elimina ruido de movimientos intradiarios
• Ideal para análisis de largo plazo

**Ventajas:**
• Simplicidad visual
• Tendencias claras
• Menos distracciones

**Desventajas:**
• Información limitada
• No muestra volatilidad intradiaria
• Pierde detalles importantes

**2. Gráfico de Barras**

**Componentes de cada barra:**
• **Máximo**: Punto más alto de la barra
• **Mínimo**: Punto más bajo de la barra
• **Apertura**: Pequeña línea horizontal izquierda
• **Cierre**: Pequeña línea horizontal derecha

**Información proporcionada:**
• Rango de precios del período
• Precios de apertura y cierre
• Volatilidad del período
• Dirección del movimiento

**3. Gráfico de Velas Japonesas (Candlesticks)**

**Componentes:**
• **Cuerpo**: Diferencia entre apertura y cierre
• **Mechas/Sombras**: Máximos y mínimos del período
• **Color**: Verde/blanco (alcista), Rojo/negro (bajista)

**Interpretación Básica:**

**Vela Alcista (Verde/Blanca):**
• Cierre > Apertura
• Los compradores dominaron
• Presión de compra

**Vela Bajista (Roja/Negra):**
• Cierre < Apertura
• Los vendedores dominaron
• Presión de venta

**Tipos de Velas por Tamaño del Cuerpo:**

**Velas de Cuerpo Largo:**
• Fuerte movimiento direccional
• Convicción del mercado
• Continuación probable de tendencia

**Velas de Cuerpo Pequeño:**
• Indecisión del mercado
• Equilibrio entre compradores y vendedores
• Posible cambio de tendencia

**Doji:**
• Apertura ≈ Cierre
• Máxima indecisión
• Señal de posible reversión

**Tipos de Velas por Mechas:**

**Mechas Largas Superiores:**
• Rechazo en niveles altos
• Presión vendedora
• Posible resistencia

**Mechas Largas Inferiores:**
• Rechazo en niveles bajos
• Presión compradora
• Posible soporte

**Timeframes (Marcos Temporales)**

**Definición:**
Período de tiempo que representa cada vela o barra.

**Timeframes Comunes:**

**Muy Corto Plazo:**
• M1 (1 minuto)
• M5 (5 minutos)
• M15 (15 minutos)

**Corto Plazo:**
• M30 (30 minutos)
• H1 (1 hora)
• H4 (4 horas)

**Mediano Plazo:**
• D1 (Diario)
• W1 (Semanal)

**Largo Plazo:**
• MN (Mensual)

**Regla de Múltiples Timeframes:**
• Analizar tendencia en timeframe superior
• Buscar entradas en timeframe inferior
• Confirmar señales en múltiples timeframes

**Patrones Básicos de Velas Individuales:**

**Martillo (Hammer):**
• Cuerpo pequeño en la parte superior
• Mecha inferior larga
• Señal alcista en tendencia bajista

**Estrella Fugaz (Shooting Star):**
• Cuerpo pequeño en la parte inferior
• Mecha superior larga
• Señal bajista en tendencia alcista

**Marubozu:**
• Sin mechas o mechas muy pequeñas
• Cuerpo ocupa toda la vela
• Fuerte convicción direccional

**Spinning Top:**
• Cuerpo muy pequeño
• Mechas largas arriba y abajo
• Indecisión extrema del mercado`,
            practicalExercise: 'Abre un gráfico de velas de EUR/USD en timeframe H1. Identifica 5 velas de cada tipo: alcistas, bajistas, doji, martillo y estrella fugaz. Anota qué pasó después de cada patrón.'
          },
          {
            id: 'soportes-resistencias',
            title: 'Soportes y Resistencias',
            duration: '40 min',
            objectives: [
              'Identificar niveles de soporte y resistencia',
              'Comprender la psicología detrás de estos niveles',
              'Usar soportes y resistencias en trading'
            ],
            keyPoints: [
              'Concepto de soporte y resistencia',
              'Métodos de identificación',
              'Ruptura y retesteo',
              'Niveles psicológicos'
            ],
            content: `**Soportes y Resistencias**

**Concepto Fundamental:**

**Soporte:**
• Nivel de precio donde la demanda supera la oferta
• Los precios tienden a "rebotar" hacia arriba
• Actúa como "piso" del precio
• Zona donde aparecen compradores

**Resistencia:**
• Nivel de precio donde la oferta supera la demanda
• Los precios tienden a "rebotar" hacia abajo
• Actúa como "techo" del precio
• Zona donde aparecen vendedores

**Psicología del Mercado:**

**En Soporte:**
• Traders ven "oportunidad de compra"
• "El precio está barato"
• Órdenes de compra acumuladas
• Stop loss de posiciones cortas

**En Resistencia:**
• Traders ven "oportunidad de venta"
• "El precio está caro"
• Órdenes de venta acumuladas
• Stop loss de posiciones largas

**Métodos de Identificación:**

**1. Máximos y Mínimos Previos:**
• Puntos donde el precio cambió de dirección
• Más toques = nivel más fuerte
• Niveles históricos importantes

**2. Números Redondos:**
• Niveles psicológicos (1.2000, 1.3000)
• Facilidad de recordar
• Concentración de órdenes

**3. Medias Móviles:**
• Actúan como soporte/resistencia dinámicos
• MM20, MM50, MM200 más relevantes
• Cambian con el tiempo

**4. Líneas de Tendencia:**
• Conectan máximos o mínimos
• Soporte en tendencia alcista
• Resistencia en tendencia bajista

**5. Retrocesos de Fibonacci:**
• Niveles matemáticos: 23.6%, 38.2%, 50%, 61.8%
• Basados en secuencia de Fibonacci
• Niveles de corrección comunes

**Fortaleza de Niveles:**

**Factores que Fortalecen:**
• Número de toques (3+ es fuerte)
• Volumen en el nivel
• Tiempo transcurrido
• Confluencia con otros niveles

**Niveles Débiles:**
• Solo un toque
• Bajo volumen
• Nivel muy reciente
• Sin confluencia

**Ruptura de Niveles:**

**Ruptura Verdadera:**
• Cierre convincente más allá del nivel
• Alto volumen en la ruptura
• Continuación del movimiento
• No retorno inmediato al nivel

**Ruptura Falsa (Fake Breakout):**
• Penetración temporal del nivel
• Bajo volumen
• Retorno rápido al rango
• Trampa para traders

**Confirmación de Ruptura:**
• Esperar cierre de vela más allá del nivel
• Verificar aumento de volumen
• Buscar continuación del movimiento
• Evitar entrar en la primera penetración

**Retesteo:**
• Precio vuelve a tocar nivel roto
• Soporte se convierte en resistencia
• Resistencia se convierte en soporte
• Oportunidad de entrada con mejor R:R

**Estrategias de Trading:**

**Trading de Rebote:**
• Comprar en soporte
• Vender en resistencia
• Stop loss más allá del nivel
• Take profit en nivel opuesto

**Trading de Ruptura:**
• Entrar tras ruptura confirmada
• Stop loss en nivel roto
• Take profit en siguiente nivel
• Gestionar riesgo de ruptura falsa

**Niveles Psicológicos Importantes:**

**En Forex:**
• Números redondos (1.2000, 1.3000)
• Paridad (1.0000 en EUR/USD)
• Máximos/mínimos históricos

**En Índices:**
• Números redondos (20,000 en Dow Jones)
• Máximos históricos
• Niveles de cierre anuales

**Errores Comunes:**

• Dibujar demasiados niveles
• No considerar el timeframe
• Ignorar el volumen
• Entrar sin confirmación
• No gestionar el riesgo adecuadamente`,
            practicalExercise: 'En un gráfico diario de S&P 500, identifica 3 niveles de soporte y 3 de resistencia de los últimos 6 meses. Marca cuántas veces cada nivel fue tocado y si hubo rupturas.'
          },
          {
            id: 'tendencias-mercado',
            title: 'Tendencias de Mercado',
            duration: '30 min',
            objectives: [
              'Identificar diferentes tipos de tendencias',
              'Usar líneas de tendencia efectivamente',
              'Reconocer cambios de tendencia'
            ],
            keyPoints: [
              'Tendencias alcistas, bajistas y laterales',
              'Líneas de tendencia y canales',
              'Cambios de tendencia',
              'Trading con la tendencia'
            ],
            content: `**Tendencias de Mercado**

**Definición:**
La tendencia es la dirección general del movimiento de precios durante un período determinado.

**Tipos de Tendencias:**

**1. Tendencia Alcista (Uptrend):**
• Serie de máximos y mínimos crecientes
• Cada corrección no rompe el mínimo anterior
• Dominio de compradores
• "The trend is your friend"

**Características:**
• Mínimos ascendentes conectados por línea de tendencia
• Rupturas de resistencias previas
• Volumen creciente en movimientos alcistas
• Correcciones con menor volumen

**2. Tendencia Bajista (Downtrend):**
• Serie de máximos y mínimos decrecientes
• Cada rebote no supera el máximo anterior
• Dominio de vendedores
• Presión vendedora constante

**Características:**
• Máximos descendentes conectados por línea de tendencia
• Rupturas de soportes previos
• Volumen creciente en movimientos bajistas
• Rebotes con menor volumen

**3. Tendencia Lateral (Sideways/Range):**
• Movimiento horizontal entre soporte y resistencia
• Equilibrio entre compradores y vendedores
• Consolidación de precios
• Indecisión del mercado

**Características:**
• Rango definido entre niveles clave
• Volumen generalmente menor
• Rebotes en extremos del rango
• Preparación para próximo movimiento direccional

**Líneas de Tendencia:**

**Construcción:**
• Conectar mínimos en tendencia alcista
• Conectar máximos en tendencia bajista
• Mínimo 2 puntos, ideal 3 o más
• Más toques = línea más válida

**Validación:**
• Tercera confirmación fortalece la línea
• Respeto del precio a la línea
• Volumen en rebotes
• Duración temporal

**Canales de Tendencia:**

**Canal Alcista:**
• Línea de tendencia inferior (soporte)
• Línea paralela superior (resistencia)
• Precio oscila entre ambas líneas
• Oportunidades de compra en soporte del canal

**Canal Bajista:**
• Línea de tendencia superior (resistencia)
• Línea paralela inferior (soporte)
• Precio oscila entre ambas líneas
• Oportunidades de venta en resistencia del canal

**Ruptura de Tendencias:**

**Señales de Cambio:**
• Ruptura de línea de tendencia
• Fallo en crear nuevo máximo/mínimo
• Cambio en estructura de mercado
• Aumento de volumen en ruptura

**Confirmación de Cambio:**
• Cierre convincente más allá de línea
• Retesteo de línea rota
• Formación de nueva estructura
• Cambio en momentum

**Grados de Tendencia:**

**Tendencia Primaria:**
• Duración: meses a años
• Movimiento principal del mercado
• Más importante para posicionamiento

**Tendencia Secundaria:**
• Duración: semanas a meses
• Correcciones de tendencia primaria
• Oportunidades de trading intermedio

**Tendencia Menor:**
• Duración: días a semanas
• Fluctuaciones de corto plazo
• Trading intradía y swing

**Principios de Trading con Tendencia:**

**"The Trend is Your Friend":**
• Operar a favor de la tendencia
• Mayor probabilidad de éxito
• Movimientos más amplios
• Menor resistencia del mercado

**Estrategias:**

**En Tendencia Alcista:**
• Buscar oportunidades de compra
• Comprar en correcciones
• Evitar ventas en corto
• Stop loss bajo mínimos recientes

**En Tendencia Bajista:**
• Buscar oportunidades de venta
• Vender en rebotes
• Evitar compras
• Stop loss sobre máximos recientes

**En Tendencia Lateral:**
• Comprar en soporte del rango
• Vender en resistencia del rango
• Stop loss fuera del rango
• Prepararse para ruptura

**Herramientas de Confirmación:**

**Indicadores de Momentum:**
• RSI, MACD, Stochastic
• Confirman fuerza de tendencia
• Detectan divergencias
• Señalan posibles cambios

**Volumen:**
• Confirma validez de movimientos
• Alto volumen en dirección de tendencia
• Bajo volumen en correcciones
• Ruptura con volumen es más confiable

**Errores Comunes:**

• Operar contra la tendencia principal
• Dibujar líneas forzadas
• No esperar confirmación de ruptura
• Ignorar múltiples timeframes
• No adaptar estrategia al tipo de mercado`,
            practicalExercise: 'Analiza el gráfico semanal de Bitcoin de los últimos 2 años. Identifica las tendencias principales, dibuja líneas de tendencia y marca los puntos donde cambiaron las tendencias.'
          },
          {
            id: 'indicadores-tecnicos-basicos',
            title: 'Indicadores Técnicos Básicos',
            duration: '30 min',
            objectives: [
              'Comprender los indicadores más utilizados',
              'Interpretar señales de RSI y MACD',
              'Combinar indicadores efectivamente'
            ],
            keyPoints: [
              'RSI y niveles de sobrecompra/sobreventa',
              'MACD y cruces de señal',
              'Medias móviles simples y exponenciales',
              'Combinación de indicadores'
            ],
            content: `**Indicadores Técnicos Básicos**

**1. RSI (Relative Strength Index)**

**Concepto:**
• Oscilador de momentum
• Rango: 0 a 100
• Mide velocidad y cambio de movimientos de precio
• Desarrollado por J. Welles Wilder

**Interpretación:**

**Niveles Clave:**
• **RSI > 70**: Zona de sobrecompra (posible venta)
• **RSI < 30**: Zona de sobreventa (posible compra)
• **RSI = 50**: Línea neutral

**Señales de Trading:**
• Entrada en zona de sobreventa (< 30)
• Salida en zona de sobrecompra (> 70)
• Cruces de línea 50 para confirmación de tendencia

**Divergencias:**
• **Divergencia Alcista**: Precio baja, RSI sube
• **Divergencia Bajista**: Precio sube, RSI baja
• Señales de posible cambio de tendencia

**2. MACD (Moving Average Convergence Divergence)**

**Componentes:**
• **Línea MACD**: EMA12 - EMA26
• **Línea de Señal**: EMA9 del MACD
• **Histograma**: MACD - Línea de Señal

**Señales Principales:**

**Cruces de Líneas:**
• MACD cruza arriba de señal = Compra
• MACD cruza abajo de señal = Venta
• Confirmación con histograma

**Cruces de Línea Cero:**
• MACD cruza arriba de cero = Momentum alcista
• MACD cruza abajo de cero = Momentum bajista

**Divergencias:**
• Similar al RSI
• Precio vs MACD en direcciones opuestas
• Señal de debilitamiento de tendencia

**3. Medias Móviles**

**Media Móvil Simple (SMA):**
• Promedio aritmético de precios
• Todos los períodos tienen igual peso
• Más suave pero con retraso

**Media Móvil Exponencial (EMA):**
• Mayor peso a precios recientes
• Más sensible a cambios
• Menos retraso que SMA

**Períodos Comunes:**
• **MM20**: Tendencia de corto plazo
• **MM50**: Tendencia de mediano plazo
• **MM200**: Tendencia de largo plazo

**Señales de Trading:**

**Cruces de Precio:**
• Precio cruza arriba de MM = Señal alcista
• Precio cruza abajo de MM = Señal bajista

**Cruces de Medias:**
• MM rápida cruza arriba de MM lenta = Golden Cross
• MM rápida cruza abajo de MM lenta = Death Cross

**Soporte/Resistencia Dinámicos:**
• MM actúan como niveles dinámicos
• Rebotes en MM en tendencias fuertes
• Rupturas indican cambio de tendencia

**4. Bandas de Bollinger**

**Componentes:**
• **Banda Central**: Media móvil (típicamente 20)
• **Banda Superior**: MM + (2 × Desviación Estándar)
• **Banda Inferior**: MM - (2 × Desviación Estándar)

**Interpretación:**
• Precio cerca de banda superior = Sobrecompra
• Precio cerca de banda inferior = Sobreventa
• Contracción de bandas = Baja volatilidad
• Expansión de bandas = Alta volatilidad

**Combinación de Indicadores:**

**Confirmación Múltiple:**
• Usar 2-3 indicadores diferentes
• Buscar confluencia de señales
• Evitar indicadores redundantes

**Ejemplo de Combinación:**
• RSI para momentum
• MACD para confirmación de tendencia
• MM para dirección general

**Filtros de Calidad:**
• Tendencia principal (MM200)
• Volumen para confirmación
• Soporte/resistencia para contexto

**Configuraciones Recomendadas:**

**Para Swing Trading:**
• RSI (14)
• MACD (12, 26, 9)
• MM (20, 50, 200)

**Para Day Trading:**
• RSI (9)
• MACD (5, 13, 4)
• MM (9, 21, 50)

**Errores Comunes:**

• Usar demasiados indicadores
• Seguir señales sin contexto
• Ignorar la tendencia principal
• No confirmar con precio/volumen
• Cambiar configuraciones constantemente

**Mejores Prácticas:**

• Entender qué mide cada indicador
• Usar indicadores como confirmación
• Combinar con análisis de precio
• Backtestear estrategias
• Mantener simplicidad`,
            practicalExercise: 'Configura un gráfico de Apple (AAPL) con RSI(14), MACD(12,26,9) y MM(20,50). Identifica 3 señales de compra donde todos los indicadores coincidan y analiza qué pasó después.'
          }
        ]
      },
      {
        id: 'gestion-riesgo',
        title: 'Gestión de Riesgo',
        description: 'Principios fundamentales para proteger tu capital',
        estimatedTime: '45m',
        icon: <Shield className="w-5 h-5" />,
        lessons: [
          {
            id: 'principios-gestion-riesgo',
            title: 'Principios de Gestión de Riesgo',
            duration: '45 min',
            objectives: [
              'Comprender la importancia de la gestión de riesgo',
              'Calcular el tamaño de posición adecuado',
              'Implementar stop loss y take profit'
            ],
            keyPoints: [
              'Regla del 1-2% por operación',
              'Cálculo de tamaño de posición',
              'Ratio riesgo-beneficio',
              'Diversificación básica'
            ],
            content: `**Principios de Gestión de Riesgo**

**Importancia de la Gestión de Riesgo:**

La gestión de riesgo es el aspecto más importante del trading. Puedes tener razón en el 40% de tus operaciones y aún así ser rentable con una buena gestión de riesgo.

**Regla Fundamental: Preservar el Capital**
• El capital es tu herramienta de trabajo
• Sin capital no puedes operar
• Es más fácil perder dinero que ganarlo
• Una pérdida del 50% requiere 100% de ganancia para recuperar

**Regla del 1-2% por Operación:**

**Concepto:**
• Nunca arriesgar más del 1-2% del capital total por operación
• Si tienes $10,000, máximo riesgo por trade: $100-200
• Permite sobrevivir a rachas perdedoras
• Base matemática para longevidad

**Ventajas:**
• Protege contra ruina del trader
• Permite múltiples intentos
• Reduce estrés emocional
• Facilita toma de decisiones objetivas

**Cálculo de Tamaño de Posición:**

**Fórmula Básica:**
Tamaño de Posición = (Capital × % Riesgo) ÷ Riesgo por Acción

**Ejemplo Práctico:**
• Capital: $10,000
• Riesgo por trade: 2% = $200
• Entrada: $50
• Stop Loss: $48
• Riesgo por acción: $2
• Tamaño: $200 ÷ $2 = 100 acciones

**En Forex:**
• Capital: $10,000
• Riesgo: 2% = $200
• Par: EUR/USD
• Entrada: 1.2000
• Stop Loss: 1.1950 (50 pips)
• Valor del pip: $10 (lote estándar)
• Riesgo total: 50 pips × $10 = $500
• Tamaño ajustado: $200 ÷ $500 = 0.4 lotes

**Stop Loss:**

**Definición:**
Orden automática para cerrar posición perdedora en nivel predeterminado.

**Tipos de Stop Loss:**

**Stop Loss Fijo:**
• Nivel específico de precio
• No cambia durante la operación
• Fácil de calcular y gestionar

**Trailing Stop:**
• Se mueve a favor de la posición
• Protege ganancias acumuladas
• Se activa solo cuando precio mejora

**Stop Loss Técnico:**
• Basado en niveles de soporte/resistencia
• Bajo mínimos recientes (compras)
• Sobre máximos recientes (ventas)

**Stop Loss por Volatilidad:**
• Basado en ATR (Average True Range)
• Se adapta a condiciones de mercado
• Más amplio en mercados volátiles

**Take Profit:**

**Definición:**
Orden automática para cerrar posición ganadora en nivel objetivo.

**Métodos de Determinación:**

**Niveles Técnicos:**
• Resistencias/soportes próximos
• Retrocesos de Fibonacci
• Extensiones de movimientos previos

**Ratio Riesgo-Beneficio:**
• Relación entre pérdida máxima y ganancia objetivo
• Mínimo recomendado: 1:2
• Ejemplo: Riesgo $100, objetivo $200

**Take Profit Parcial:**
• Cerrar parte de posición en primer objetivo
• Mover stop loss a breakeven
• Dejar correr resto para mayor ganancia

**Ratio Riesgo-Beneficio (R:R):**

**Concepto:**
Relación entre lo que arriesgas vs lo que puedes ganar.

**Cálculos:**
• R:R 1:1 = Riesgo $100, Objetivo $100
• R:R 1:2 = Riesgo $100, Objetivo $200
• R:R 1:3 = Riesgo $100, Objetivo $300

**Importancia:**
• Con R:R 1:2, puedes ser rentable ganando solo 34% de trades
• Con R:R 1:3, puedes ser rentable ganando solo 26% de trades
• Compensa por tasa de acierto menor

**Diversificación:**

**Por Instrumentos:**
• No concentrar todo en un activo
• Diferentes mercados (Forex, acciones, commodities)
• Correlaciones bajas entre posiciones

**Por Tiempo:**
• No abrir todas las posiciones simultáneamente
• Escalonar entradas en el tiempo
• Evitar concentración temporal

**Por Estrategia:**
• Combinar diferentes enfoques
• Tendencia + reversión
• Diferentes timeframes

**Gestión de Drawdown:**

**Definición:**
Pérdida desde el máximo de capital hasta el mínimo.

**Tipos:**
• **Drawdown Actual**: Pérdida real en cuenta
• **Drawdown Máximo**: Mayor pérdida histórica
• **Drawdown Esperado**: Pérdida estadísticamente probable

**Gestión:**
• Reducir tamaño tras pérdidas consecutivas
• Parar trading tras drawdown significativo
• Revisar estrategia si drawdown excede expectativas

**Reglas Psicológicas:**

**Disciplina:**
• Seguir reglas sin excepción
• No cambiar stop loss por emociones
• Aceptar pérdidas como parte del negocio

**Objetividad:**
• Decisiones basadas en análisis, no emociones
• Mantener journal de trading
• Revisar y aprender de errores

**Paciencia:**
• Esperar configuraciones de alta probabilidad
• No forzar operaciones
• Calidad sobre cantidad

**Herramientas de Gestión:**

**Calculadoras de Posición:**
• Automatizan cálculos complejos
• Reducen errores humanos
• Disponibles online y en plataformas

**Alertas de Precio:**
• Notificaciones automáticas
• Evitan monitoreo constante
• Permiten reacción oportuna

**Journal de Trading:**
• Registro de todas las operaciones
• Análisis de patrones de éxito/fracaso
• Mejora continua del desempeño`,
            practicalExercise: 'Con un capital simulado de $5,000, planifica 5 operaciones diferentes aplicando la regla del 2%. Calcula el tamaño de posición, stop loss y take profit para cada una, manteniendo un R:R mínimo de 1:2.'
          }
        ]
      }
    ]
  },
  {
    id: 'estrategias-avanzadas',
    title: 'Estrategias Avanzadas',
    description: 'Técnicas y estrategias para traders con experiencia intermedia que buscan mejorar sus resultados.',
    level: 'Intermedio',
    totalLessons: 18,
    totalDuration: '8h 15m',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-green-500',
    objectives: [
      'Dominar patrones de velas japonesas avanzados',
      'Implementar estrategias de breakout y pullback',
      'Usar análisis de múltiples timeframes',
      'Desarrollar sistemas de trading personalizados',
      'Aplicar técnicas de scalping y swing trading',
      'Gestionar carteras de múltiples posiciones'
    ],
    prerequisites: [
      'Conocimientos sólidos de análisis técnico básico',
      'Experiencia práctica con plataformas de trading',
      'Comprensión de gestión de riesgo fundamental',
      'Al menos 6 meses de trading con cuenta demo'
    ],
    targetAudience: 'Traders con experiencia básica que buscan estrategias más sofisticadas y mejores resultados.',
    modules: [
      {
        id: 'patrones-velas-avanzados',
        title: 'Patrones de Velas Japonesas Avanzados',
        description: 'Patrones complejos de múltiples velas para identificar reversiones y continuaciones',
        estimatedTime: '3h 45m',
        icon: <Activity className="w-5 h-5" />,
        lessons: [
          {
            id: 'patrones-reversion',
            title: 'Patrones de Reversión',
            duration: '45 min',
            objectives: [
              'Identificar patrones de reversión confiables',
              'Comprender la psicología detrás de cada patrón',
              'Aplicar criterios de validación'
            ],
            keyPoints: [
              'Envolvente alcista y bajista',
              'Estrella de la mañana y tarde',
              'Harami y Harami Cruz',
              'Criterios de confirmación'
            ],
            content: `**Patrones de Reversión Avanzados**

**1. Patrón Envolvente (Engulfing)**

**Envolvente Alcista:**
• Primera vela: Bajista (roja)
• Segunda vela: Alcista (verde) que envuelve completamente la anterior
• Aparece en tendencia bajista
• Señala posible cambio a tendencia alcista

**Criterios de Validación:**
• Tendencia bajista previa clara
• Segunda vela debe abrir por debajo del cierre anterior
• Segunda vela debe cerrar por encima de la apertura anterior
• Mayor volumen en segunda vela

**Envolvente Bajista:**
• Primera vela: Alcista (verde)
• Segunda vela: Bajista (roja) que envuelve completamente la anterior
• Aparece en tendencia alcista
• Señala posible cambio a tendencia bajista

**Psicología del Mercado:**
• Primera vela: Continuación de tendencia previa
• Segunda vela: Cambio dramático de sentimiento
• Los traders cambian de bando masivamente
• Momentum se invierte completamente

**2. Estrella de la Mañana (Morning Star)**

**Estructura:**
• **Primera vela**: Bajista larga (continuación de tendencia bajista)
• **Segunda vela**: Cuerpo pequeño con gap hacia abajo (indecisión)
• **Tercera vela**: Alcista larga que cierra dentro del cuerpo de la primera

**Interpretación:**
• Aparece al final de tendencia bajista
• Señal de reversión alcista muy confiable
• La "estrella" representa indecisión del mercado
• Tercera vela confirma cambio de sentimiento

**Variaciones:**
• **Doji Star**: Segunda vela es un doji
• **Shooting Star**: Segunda vela con mecha superior larga
• **Hammer Star**: Segunda vela tipo martillo

**3. Estrella de la Tarde (Evening Star)**

**Estructura:**
• **Primera vela**: Alcista larga (continuación de tendencia alcista)
• **Segunda vela**: Cuerpo pequeño con gap hacia arriba (indecisión)
• **Tercera vela**: Bajista larga que cierra dentro del cuerpo de la primera

**Interpretación:**
• Aparece al final de tendencia alcista
• Señal de reversión bajista muy confiable
• Indica agotamiento de compradores
• Entrada de presión vendedora

**4. Harami**

**Harami Alcista:**
• Primera vela: Bajista larga
• Segunda vela: Alcista pequeña contenida dentro de la primera
• Significa "embarazada" en japonés
• Señal de posible reversión alcista

**Harami Bajista:**
• Primera vela: Alcista larga
• Segunda vela: Bajista pequeña contenida dentro de la primera
• Señal de posible reversión bajista
• Indica pérdida de momentum

**Harami Cruz:**
• Segunda vela es un doji
• Señal más fuerte que harami regular
• Máxima indecisión del mercado
• Alta probabilidad de reversión

**5. Piercing Line (Línea Perforante)**

**Estructura:**
• Primera vela: Bajista larga
• Segunda vela: Alcista que abre con gap hacia abajo
• Segunda vela cierra por encima del 50% de la primera vela
• Aparece en tendencia bajista

**Interpretación:**
• Señal de reversión alcista
• Los compradores superan a vendedores
• Rechazo de precios bajos
• Confirmación necesaria en vela siguiente

**6. Dark Cloud Cover (Nube Oscura)**

**Estructura:**
• Primera vela: Alcista larga
• Segunda vela: Bajista que abre con gap hacia arriba
• Segunda vela cierra por debajo del 50% de la primera vela
• Aparece en tendencia alcista

**Interpretación:**
• Señal de reversión bajista
• Los vendedores superan a compradores
• Rechazo de precios altos
• Presión vendedora aumenta

**Criterios de Confirmación:**

**Contexto de Mercado:**
• Patrón debe aparecer en extremos de tendencia
• Sobrecompra/sobreventa en indicadores
• Niveles de soporte/resistencia importantes
• Confluencia con otros análisis

**Volumen:**
• Aumento de volumen en velas de confirmación
• Volumen decreciente en velas de indecisión
• Volumen alto valida la reversión

**Confirmación Posterior:**
• Vela siguiente debe confirmar la reversión
• Continuación en dirección del patrón
• Ruptura de niveles técnicos relevantes

**Gestión de Riesgo:**

**Entrada:**
• Esperar confirmación antes de entrar
• Entrar en apertura de vela siguiente
• O esperar pullback al patrón

**Stop Loss:**
• Más allá del extremo del patrón
• Para reversión alcista: bajo mínimo del patrón
• Para reversión bajista: sobre máximo del patrón

**Take Profit:**
• Niveles de resistencia/soporte próximos
• Retrocesos de Fibonacci
• Ratio riesgo-beneficio mínimo 1:2

**Errores Comunes:**

• Operar patrones sin confirmación
• Ignorar el contexto de tendencia
• No considerar volumen
• Entrar demasiado temprano
• Stop loss muy ajustado
• No esperar confluencia técnica`,
            practicalExercise: 'Busca en gráficos de diferentes instrumentos 2 ejemplos de cada patrón de reversión. Analiza si se cumplieron los criterios de validación y qué pasó después de cada patrón.'
          }
        ]
      }
    ]
  },
  {
    id: 'psicologia-inversor',
    title: 'Psicología del Inversor',
    description: 'Desarrolla la mentalidad correcta y controla las emociones para ser un trader exitoso.',
    level: 'Avanzado',
    totalLessons: 15,
    totalDuration: '6h 45m',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-purple-500',
    objectives: [
      'Identificar y controlar sesgos cognitivos',
      'Desarrollar disciplina y paciencia',
      'Gestionar el miedo y la codicia',
      'Crear rutinas de trading efectivas',
      'Mantener consistencia emocional',
      'Desarrollar confianza basada en competencia'
    ],
    prerequisites: [
      'Experiencia práctica en trading',
      'Conocimiento de análisis técnico y fundamental',
      'Haber experimentado pérdidas y ganancias',
      'Comprensión de gestión de riesgo'
    ],
    targetAudience: 'Traders experimentados que buscan mejorar su consistencia y control emocional.',
    modules: [
      {
        id: 'control-emocional',
        title: 'Control Emocional en Trading',
        description: 'Técnicas para gestionar emociones destructivas y mantener objetividad',
        estimatedTime: '2h 30m',
        icon: <Zap className="w-5 h-5" />,
        lessons: [
          {
            id: 'miedo-codicia',
            title: 'Gestión del Miedo y la Codicia',
            duration: '50 min',
            objectives: [
              'Reconocer manifestaciones de miedo y codicia',
              'Implementar técnicas de control emocional',
              'Desarrollar objetividad en decisiones'
            ],
            keyPoints: [
              'Identificación de emociones destructivas',
              'Técnicas de respiración y mindfulness',
              'Sistemas para decisiones objetivas',
              'Rutinas pre y post trading'
            ],
            content: `**Gestión del Miedo y la Codicia**

**El Miedo en Trading:**

**Manifestaciones del Miedo:**
• **Miedo a la pérdida**: Evitar operaciones válidas
• **Miedo a perderse oportunidades (FOMO)**: Entrar sin análisis
• **Miedo al éxito**: Sabotear operaciones ganadoras
• **Miedo a estar equivocado**: No cerrar posiciones perdedoras

**Síntomas Físicos:**
• Tensión muscular
• Respiración acelerada
• Sudoración
• Palpitaciones
• Indecisión paralizante

**Efectos en el Trading:**
• Análisis paralizado por exceso de información
• Entradas tardías por indecisión
• Stop loss muy ajustados por miedo
• Salidas prematuras de operaciones ganadoras
• Evitar el mercado después de pérdidas

**La Codicia en Trading:**

**Manifestaciones de la Codicia:**
• **Sobreoperación**: Buscar constantemente oportunidades
• **Apalancamiento excesivo**: Usar más riesgo del apropiado
• **No tomar ganancias**: Esperar siempre más beneficio
• **Perseguir pérdidas**: Aumentar posiciones perdedoras

**Síntomas Comportamentales:**
• Impaciencia constante
• Cambio frecuente de estrategias
• Ignorar reglas de gestión de riesgo
• Operaciones impulsivas
• Expectativas irreales de ganancias

**Efectos Destructivos:**
• Pérdida de capital por sobreexposición
• Estrés emocional constante
• Decisiones irracionales
• Destrucción de cuentas de trading
• Abandono prematuro del trading

**Técnicas de Control Emocional:**

**1. Respiración Consciente:**

**Técnica 4-7-8:**
• Inhalar por 4 segundos
• Mantener por 7 segundos
• Exhalar por 8 segundos
• Repetir 3-4 veces

**Beneficios:**
• Activa sistema nervioso parasimpático
• Reduce cortisol (hormona del estrés)
• Mejora claridad mental
• Facilita toma de decisiones objetivas

**2. Mindfulness en Trading:**

**Práctica de Atención Plena:**
• Observar pensamientos sin juzgar
• Reconocer emociones sin reaccionar
• Mantener foco en el presente
• Aceptar incertidumbre del mercado

**Aplicación Práctica:**
• 5 minutos de meditación antes de operar
• Pausas conscientes durante el trading
• Observación de reacciones emocionales
• Respuesta vs reacción automática

**3. Sistemas de Decisión Objetiva:**

**Checklist Pre-Operación:**
• ¿La configuración cumple mis criterios?
• ¿He calculado correctamente el riesgo?
• ¿Estoy emocionalmente neutral?
• ¿Tengo plan claro de entrada y salida?

**Reglas Inquebrantables:**
• Nunca operar sin stop loss
• Respetar tamaño de posición calculado
• No cambiar plan durante la operación
• Tomar descansos después de pérdidas

**4. Rutinas Estructuradas:**

**Rutina Pre-Trading:**
• Revisión de mercados y noticias
• Análisis técnico objetivo
• Identificación de oportunidades
• Preparación mental y emocional

**Durante el Trading:**
• Seguimiento de plan establecido
• Monitoreo de estado emocional
• Pausas regulares para evaluar
• Registro de decisiones y emociones

**Rutina Post-Trading:**
• Revisión de operaciones del día
• Análisis de errores y aciertos
• Registro en journal de trading
• Desconexión mental del mercado

**Técnicas Específicas:**

**Para el Miedo:**

**Visualización Positiva:**
• Imaginar ejecución perfecta de estrategia
• Visualizar manejo calmado de pérdidas
• Practicar mentalmente escenarios difíciles

**Exposición Gradual:**
• Comenzar con posiciones pequeñas
• Aumentar gradualmente el riesgo
• Construir confianza con éxitos pequeños

**Reframe Cognitivo:**
• "Las pérdidas son parte del negocio"
• "Cada operación es independiente"
• "Mi valor no depende de una operación"

**Para la Codicia:**

**Objetivos Realistas:**
• Metas de ganancia mensual/anual realistas
• Enfoque en consistencia, no en home runs
• Celebrar pequeños éxitos consistentes

**Automatización:**
• Usar órdenes automáticas (stop loss, take profit)
• Sistemas de trading mecánicos
• Reducir decisiones emocionales

**Gratitud y Perspectiva:**
• Apreciar ganancias obtenidas
• Recordar objetivos de largo plazo
• Mantener perspectiva de riesgo/recompensa

**Desarrollo de Disciplina:**

**Principios Fundamentales:**
• La disciplina se construye con práctica
• Pequeñas victorias crean momentum
• La consistencia supera la perfección
• Los hábitos son más fuertes que la motivación

**Estrategias de Implementación:**
• Comenzar con reglas simples
• Usar recordatorios visuales
• Crear consecuencias por romper reglas
• Celebrar adherencia a reglas

**Construcción de Confianza:**

**Confianza Basada en Competencia:**
• Dominio técnico de herramientas
• Comprensión profunda de estrategias
• Experiencia en diferentes condiciones de mercado
• Historial de seguimiento de reglas

**Vs Confianza Falsa:**
• Basada en suerte o racha ganadora
• Ignorar riesgos reales
• Sobreestimar habilidades
• Subestimar complejidad del mercado

**Mantenimiento del Estado Mental:**

**Factores de Apoyo:**
• Ejercicio físico regular
• Sueño adecuado (7-8 horas)
• Nutrición balanceada
• Relaciones sociales saludables
• Hobbies fuera del trading

**Señales de Alerta:**
• Irritabilidad constante
• Obsesión con el mercado
• Aislamiento social
• Problemas de sueño
• Decisiones impulsivas frecuentes

**Recuperación de Drawdowns Emocionales:**

**Pasos de Recuperación:**
1. **Parar**: Dejar de operar temporalmente
2. **Analizar**: Revisar qué salió mal
3. **Ajustar**: Modificar estrategia o reglas
4. **Practicar**: Volver con cuenta demo
5. **Reintegrarse**: Retorno gradual con posiciones pequeñas

**Tiempo de Recuperación:**
• Pérdidas pequeñas: 1-2 días
• Pérdidas moderadas: 1-2 semanas
• Pérdidas grandes: 1-3 meses
• Burnout completo: 3-6 meses`,
            practicalExercise: 'Durante una semana, lleva un registro emocional de cada operación. Anota tu estado emocional antes, durante y después de cada trade. Identifica patrones entre tus emociones y los resultados de tus operaciones.'
          }
        ]
      }
    ]
  }
];

// Datos de FAQ expandidos
export const faqData: FAQItem[] = [
  {
    id: 'forex-trading',
    question: '¿Qué es el Forex Trading y cómo funciona?',
    category: 'Forex',
    difficulty: 'Básico',
    icon: <Globe className="w-5 h-5" />,
    tags: ['forex', 'divisas', 'mercado', 'trading'],
    relatedTopics: ['Análisis Técnico', 'Gestión de Riesgo', 'Pares de Divisas'],
    answer: `**¿Qué es el Forex Trading?**

El Forex (Foreign Exchange) es el mercado de divisas más grande y líquido del mundo, donde se intercambian monedas de diferentes países. Con un volumen diario superior a $6 trillones, opera 24 horas al día, 5 días a la semana.

**Características Principales:**

• **Liquidez Extrema**: Facilita entradas y salidas rápidas
• **Horario Extendido**: Desde el domingo 5 PM EST hasta el viernes 4 PM EST
• **Apalancamiento Disponible**: Permite controlar posiciones grandes con capital pequeño
• **Spreads Bajos**: Especialmente en pares principales
• **Acceso Global**: Operativo desde cualquier parte del mundo

**Cómo Funciona:**

**Pares de Divisas:**
El trading de Forex siempre involucra dos monedas:
• **Divisa Base**: La primera moneda del par (EUR en EUR/USD)
• **Divisa Cotizada**: La segunda moneda del par (USD en EUR/USD)
• **Precio**: Indica cuánto de la divisa cotizada necesitas para comprar una unidad de la divisa base

**Tipos de Pares:**

**Pares Principales (Majors):**
• EUR/USD - Euro vs Dólar Americano
• GBP/USD - Libra Esterlina vs Dólar
• USD/JPY - Dólar vs Yen Japonés
• USD/CHF - Dólar vs Franco Suizo
• AUD/USD - Dólar Australiano vs Dólar
• USD/CAD - Dólar vs Dólar Canadiense
• NZD/USD - Dólar Neozelandés vs Dólar

**Pares Menores (Minors):**
• EUR/GBP, EUR/JPY, GBP/JPY
• No incluyen el dólar americano
• Menor liquidez que los majors

**Pares Exóticos:**
• USD/TRY, EUR/ZAR, USD/MXN
• Incluyen divisas de economías emergentes
• Mayor volatilidad y spreads más amplios

**Factores que Influyen en los Precios:**

**Factores Económicos:**
• **Tasas de Interés**: Tasas más altas atraen inversión extranjera
• **Inflación**: Afecta el poder adquisitivo de la moneda
• **PIB**: Indica la salud económica del país
• **Empleo**: Datos de desempleo impactan la confianza

**Factores Políticos:**
• **Estabilidad Política**: Gobiernos estables atraen inversión
• **Políticas Fiscales**: Déficit/superávit gubernamental
• **Elecciones**: Incertidumbre política afecta la moneda
• **Relaciones Internacionales**: Conflictos impactan los mercados

**Factores de Mercado:**
• **Sentimiento del Mercado**: Percepción de riesgo global
• **Flujos de Capital**: Inversión extranjera directa
• **Especulación**: Actividad de grandes traders institucionales
• **Correlaciones**: Relación con commodities y otros mercados

**Ventajas del Forex Trading:**

• **Alta Liquidez**: Facilita ejecución de órdenes
• **Bajos Costos**: Spreads competitivos
• **Flexibilidad Horaria**: Trading 24/5
• **Apalancamiento**: Maximiza potencial de ganancias
• **Diversidad**: Múltiples pares para operar
• **Transparencia**: Mercado difícil de manipular por su tamaño

**Riesgos a Considerar:**

• **Apalancamiento**: Amplifica tanto ganancias como pérdidas
• **Volatilidad**: Movimientos rápidos pueden generar pérdidas
• **Riesgo de Contraparte**: Dependes de la solvencia del broker
• **Riesgo de Liquidez**: En eventos extremos puede reducirse
• **Complejidad**: Requiere conocimiento y experiencia

**Cómo Empezar:**

1. **Educación**: Aprender conceptos básicos y análisis
2. **Broker Regulado**: Elegir plataforma confiable
3. **Cuenta Demo**: Practicar sin riesgo real
4. **Plan de Trading**: Definir estrategia y reglas
5. **Gestión de Riesgo**: Implementar controles de pérdidas
6. **Inicio Gradual**: Comenzar con posiciones pequeñas`
  },
  {
    id: 'materias-primas',
    question: '¿Cómo invertir en Materias Primas (Commodities)?',
    category: 'Commodities',
    difficulty: 'Intermedio',
    icon: <BarChart3 className="w-5 h-5" />,
    tags: ['commodities', 'oro', 'petróleo', 'materias primas'],
    relatedTopics: ['Análisis Fundamental', 'Inflación', 'Diversificación'],
    answer: `**¿Qué son las Materias Primas (Commodities)?**

Las materias primas son productos básicos utilizados en la producción de bienes y servicios. Son recursos naturales que se extraen, cultivan o producen, y forman la base de la economía global.

**Categorías Principales:**

**Metales Preciosos:**
• **Oro**: Refugio de valor tradicional, reserva de bancos centrales
• **Plata**: Uso industrial y como reserva de valor
• **Platino**: Aplicaciones industriales, especialmente automotriz
• **Paladio**: Catalizadores automotrices, electrónicos

**Energía:**
• **Petróleo Crudo (WTI, Brent)**: Combustible global principal
• **Gas Natural**: Calefacción, generación eléctrica
• **Gasolina**: Combustible para transporte
• **Carbón**: Generación de energía eléctrica

**Productos Agrícolas:**
• **Granos**: Trigo, maíz, soja, arroz
• **Tropicales**: Café, cacao, azúcar
• **Ganadería**: Ganado bovino, cerdos
• **Fibras**: Algodón

**Metales Industriales:**
• **Cobre**: "Doctor Copper" - indicador económico
• **Aluminio**: Construcción, transporte
• **Zinc**: Galvanización, aleaciones
• **Níquel**: Acero inoxidable, baterías

**Formas de Invertir:**

**1. Futuros de Commodities:**
• **Contratos Estandarizados**: Cantidad, calidad, fecha de entrega
• **Apalancamiento**: Control de grandes cantidades con margen pequeño
• **Liquidez**: Mercados activos para entrada/salida
• **Riesgo**: Pérdidas pueden exceder inversión inicial

**2. ETFs de Commodities:**
• **Diversificación**: Exposición a múltiples commodities
• **Liquidez**: Trading como acciones
• **Gestión Profesional**: Sin necesidad de expertise técnico
• **Costos**: Comisiones de gestión anuales

**3. Acciones de Empresas:**
• **Mineras**: Exposición indirecta a metales
• **Petroleras**: Beneficio de precios altos del petróleo
• **Agrícolas**: Empresas de procesamiento de alimentos
• **Riesgo Adicional**: Factores específicos de la empresa

**4. CFDs sobre Commodities:**
• **Flexibilidad**: Posiciones largas y cortas
• **Apalancamiento**: Menor capital requerido
• **Sin Vencimiento**: No hay fechas de expiración
• **Costos**: Spreads y comisiones overnight

**Factores que Afectan los Precios:**

**Oferta y Demanda:**
• **Producción**: Capacidad de extracción/cultivo
• **Consumo**: Demanda industrial y de consumo
• **Inventarios**: Niveles de stock disponibles
• **Sustitutos**: Alternativas disponibles

**Factores Climáticos:**
• **Agricultura**: Sequías, inundaciones, heladas
• **Energía**: Huracanes afectan refinación
• **Estacionalidad**: Patrones de consumo anuales

**Factores Geopolíticos:**
• **Conflictos**: Interrupciones en suministro
• **Sanciones**: Restricciones comerciales
• **Políticas**: Regulaciones gubernamentales
• **Estabilidad**: Riesgo país en productores

**Factores Económicos:**
• **Crecimiento Global**: Mayor demanda industrial
• **Inflación**: Commodities como cobertura
• **Tipo de Cambio**: Fortaleza del dólar
• **Tasas de Interés**: Costo de almacenamiento

**Ventajas de Invertir en Commodities:**

**Diversificación:**
• **Correlación Baja**: Con acciones y bonos
• **Protección**: Contra inflación
• **Ciclos Diferentes**: Rendimiento en diferentes fases económicas

**Cobertura contra Inflación:**
• **Valor Real**: Mantienen poder adquisitivo
• **Precios Subyacentes**: Base de productos finales
• **Historia**: Rendimiento superior en períodos inflacionarios

**Potencial de Rendimiento:**
• **Superciclos**: Períodos de crecimiento prolongado
• **Volatilidad**: Oportunidades de trading
• **Demanda Creciente**: Economías emergentes

**Riesgos a Considerar:**

**Volatilidad Extrema:**
• **Movimientos Bruscos**: Cambios rápidos de precio
• **Factores Externos**: Clima, geopolítica
• **Apalancamiento**: Amplifica pérdidas

**Factores de Almacenamiento:**
• **Costos**: Almacenamiento físico costoso
• **Deterioro**: Productos perecederos
• **Seguridad**: Riesgo de robo o daño

**Complejidad del Mercado:**
• **Conocimiento Especializado**: Cada commodity es único
• **Análisis Fundamental**: Múltiples variables
• **Curvas de Futuros**: Contango vs backwardation

**Estrategias de Inversión:**

**Buy and Hold:**
• **Largo Plazo**: Beneficio de superciclos
• **Diversificación**: Múltiples commodities
• **Rebalanceo**: Ajustes periódicos

**Trading Estacional:**
• **Patrones**: Comportamiento histórico
• **Agricultura**: Ciclos de siembra/cosecha
• **Energía**: Demanda estacional

**Momentum Trading:**
• **Tendencias**: Seguir movimientos fuertes
• **Breakouts**: Rupturas de rangos
• **Análisis Técnico**: Patrones de precio

**Consideraciones Prácticas:**

**Selección de Broker:**
• **Regulación**: Autoridades reconocidas
• **Spreads**: Competitivos en commodities
• **Plataforma**: Herramientas de análisis
• **Educación**: Recursos de aprendizaje

**Gestión de Riesgo:**
• **Posición Sizing**: No más del 5-10% del portafolio
• **Stop Loss**: Límites de pérdida claros
• **Diversificación**: Entre diferentes commodities
• **Monitoreo**: Seguimiento de factores fundamentales`
  },
  {
    id: 'indices-bursatiles',
    question: '¿Qué son los Índices Bursátiles y cómo operarlos?',
    category: 'Índices',
    difficulty: 'Básico',
    icon: <PieChart className="w-5 h-5" />,
    tags: ['índices', 'S&P 500', 'Dow Jones', 'diversificación'],
    relatedTopics: ['ETFs', 'Análisis Técnico', 'Economía Global'],
    answer: `**¿Qué son los Índices Bursátiles?**

Los índices bursátiles son indicadores que miden el rendimiento de un grupo seleccionado de acciones, representando un segmento específico del mercado de valores. Funcionan como termómetros de la salud económica y del sentimiento del mercado.

**Principales Índices Mundiales:**

**Estados Unidos:**
• **S&P 500**: 500 empresas más grandes por capitalización
• **Dow Jones Industrial Average**: 30 empresas industriales blue-chip
• **NASDAQ 100**: 100 empresas tecnológicas más grandes
• **Russell 2000**: Empresas de pequeña capitalización

**Europa:**
• **FTSE 100**: 100 empresas más grandes del Reino Unido
• **DAX 30**: 30 empresas alemanas principales
• **CAC 40**: 40 empresas francesas más grandes
• **IBEX 35**: 35 empresas españolas principales

**Asia-Pacífico:**
• **Nikkei 225**: 225 empresas japonesas
• **Hang Seng**: Empresas de Hong Kong
• **ASX 200**: 200 empresas australianas más grandes
• **KOSPI**: Índice principal de Corea del Sur

**Métodos de Cálculo:**

**Ponderación por Capitalización:**
• **Concepto**: Empresas más grandes tienen mayor peso
• **Ejemplo**: Apple tiene más influencia que empresas pequeñas en S&P 500
• **Ventaja**: Refleja valor real del mercado
• **Desventaja**: Concentración en pocas empresas grandes

**Ponderación por Precio:**
• **Concepto**: Acciones con mayor precio tienen más peso
• **Ejemplo**: Dow Jones usa este método
• **Problema**: Una división de acciones cambia el peso artificialmente
• **Uso**: Menos común en índices modernos

**Ponderación Igual:**
• **Concepto**: Todas las empresas tienen el mismo peso
• **Ventaja**: Diversificación real
• **Desventaja**: No refleja tamaño real de empresas
• **Uso**: Algunos ETFs especializados

**Formas de Operar Índices:**

**1. CFDs sobre Índices:**
• **Flexibilidad**: Posiciones largas y cortas
• **Apalancamiento**: Control de posiciones grandes
• **Sin Comisiones**: Solo spreads
• **Horarios Extendidos**: Trading fuera de horario bursátil

**2. Futuros de Índices:**
• **Contratos Estandarizados**: E-mini S&P 500, etc.
• **Alta Liquidez**: Mercados muy activos
• **Apalancamiento**: Margen requerido
• **Vencimientos**: Fechas específicas de expiración

**3. ETFs de Índices:**
• **Réplica Directa**: Siguen el índice exactamente
• **Liquidez**: Trading como acciones individuales
• **Dividendos**: Distribución de dividendos de componentes
• **Costos Bajos**: Comisiones de gestión mínimas

**4. Opciones sobre Índices:**
• **Flexibilidad**: Múltiples estrategias
• **Riesgo Limitado**: Para compradores de opciones
• **Complejidad**: Requiere conocimiento avanzado
• **Tiempo**: Decaimiento temporal afecta valor

**Ventajas del Trading de Índices:**

**Diversificación Automática:**
• **Riesgo Reducido**: No dependes de una sola empresa
• **Exposición Amplia**: A sectores completos de la economía
• **Eliminación de Riesgo Específico**: De empresas individuales

**Liquidez Excelente:**
• **Spreads Estrechos**: Diferencia bid-ask mínima
• **Ejecución Rápida**: Órdenes se ejecutan inmediatamente
• **Profundidad de Mercado**: Grandes volúmenes disponibles

**Análisis Simplificado:**
• **Menos Variables**: Que analizar acciones individuales
• **Correlación Económica**: Siguen tendencias macroeconómicas
• **Información Abundante**: Análisis y noticias disponibles

**Transparencia:**
• **Composición Conocida**: Empresas componentes públicas
• **Metodología Clara**: Criterios de inclusión/exclusión
• **Actualizaciones Regulares**: Cambios comunicados

**Factores que Afectan los Índices:**

**Factores Macroeconómicos:**
• **PIB**: Crecimiento económico impulsa índices
• **Inflación**: Afecta valoraciones y política monetaria
• **Tasas de Interés**: Inversamente correlacionadas
• **Empleo**: Datos de trabajo impactan sentimiento

**Política Monetaria:**
• **Bancos Centrales**: Decisiones de tasas
• **Estímulos**: QE impulsa mercados
• **Comunicación**: Forward guidance afecta expectativas

**Eventos Geopolíticos:**
• **Elecciones**: Incertidumbre política
• **Conflictos**: Aversión al riesgo
• **Acuerdos Comerciales**: Impacto en comercio global
• **Pandemias**: Disrupciones económicas

**Sentimiento del Mercado:**
• **VIX**: Índice de volatilidad como medidor de miedo
• **Flujos de Capital**: Entrada/salida de inversores
• **Noticias Corporativas**: Earnings de empresas grandes
• **Análisis Técnico**: Niveles de soporte/resistencia

**Estrategias de Trading:**

**Seguimiento de Tendencias:**
• **Medias Móviles**: Identificar dirección principal
• **Breakouts**: Rupturas de rangos importantes
• **Momentum**: Continuación de movimientos fuertes

**Trading de Reversión:**
• **Sobrecompra/Sobreventa**: RSI, Stochastic
• **Divergencias**: Entre precio e indicadores
• **Patrones**: Doble techo, doble suelo

**Trading de Noticias:**
• **Earnings Season**: Resultados trimestrales
• **Datos Económicos**: PIB, inflación, empleo
• **Decisiones de Bancos Centrales**: FOMC, ECB

**Arbitraje:**
• **ETF vs Índice**: Diferencias de precio
• **Futuros vs Spot**: Convergencia al vencimiento
• **Inter-mercado**: Correlaciones entre índices

**Gestión de Riesgo:**

**Diversificación Temporal:**
• **No concentrar**: Todas las operaciones en un momento
• **Escalonamiento**: Entradas y salidas graduales
• **Rebalanceo**: Ajustes periódicos de exposición

**Control de Apalancamiento:**
• **Máximo Recomendado**: 2:1 para principiantes
• **Gestión de Margen**: Evitar margin calls
• **Posición Sizing**: Basado en volatilidad del índice

**Monitoreo de Correlaciones:**
• **Entre Índices**: S&P 500 vs NASDAQ
• **Con Otros Activos**: Bonos, commodities, divisas
• **Cambios**: Correlaciones varían en el tiempo

**Consideraciones Especiales:**

**Horarios de Trading:**
• **Sesión Regular**: 9:30 AM - 4:00 PM EST
• **Pre-market**: 4:00 AM - 9:30 AM EST
• **After-hours**: 4:00 PM - 8:00 PM EST
• **Futuros**: Trading casi 24 horas

**Dividendos:**
• **Fechas Ex-dividend**: Ajustes en índices
• **Reinversión**: ETFs vs CFDs
• **Impacto Fiscal**: Consideraciones tributarias

**Rebalanceos:**
• **Fechas Programadas**: Cambios trimestrales/anuales
• **Volatilidad**: Durante períodos de rebalanceo
• **Oportunidades**: Trading alrededor de cambios`
  },
  {
    id: 'criptomonedas',
    question: '¿Cómo hacer trading de Criptomonedas de forma segura?',
    category: 'Crypto',
    difficulty: 'Intermedio',
    icon: <Zap className="w-5 h-5" />,
    tags: ['bitcoin', 'ethereum', 'blockchain', 'volatilidad'],
    relatedTopics: ['Tecnología Blockchain', 'Wallets', 'DeFi'],
    answer: `**¿Qué son las Criptomonedas?**

Las criptomonedas son activos digitales descentralizados que utilizan tecnología blockchain para garantizar transacciones seguras y controlar la creación de nuevas unidades. Operan independientemente de bancos centrales y gobiernos.

**Principales Criptomonedas:**

**Bitcoin (BTC):**
• **Primera Criptomoneda**: Creada en 2009 por Satoshi Nakamoto
• **Reserva de Valor Digital**: "Oro digital"
• **Suministro Limitado**: 21 millones de bitcoins máximo
• **Dominancia**: Mayor capitalización de mercado

**Ethereum (ETH):**
• **Plataforma de Contratos Inteligentes**: Aplicaciones descentralizadas
• **Segunda Mayor**: Por capitalización de mercado
• **Proof of Stake**: Transición de minería a staking
• **Ecosistema DeFi**: Base de finanzas descentralizadas

**Altcoins Principales:**
• **Binance Coin (BNB)**: Token del exchange Binance
• **Cardano (ADA)**: Blockchain de tercera generación
• **Solana (SOL)**: Blockchain de alta velocidad
• **Polkadot (DOT)**: Interoperabilidad entre blockchains

**Stablecoins:**
• **Tether (USDT)**: Vinculada al dólar americano
• **USD Coin (USDC)**: Respaldada por reservas auditadas
• **Binance USD (BUSD)**: Stablecoin de Binance
• **DAI**: Stablecoin descentralizada

**Características Únicas del Mercado Crypto:**

**Trading 24/7:**
• **Sin Cierre**: Mercado nunca cierra
• **Oportunidades Constantes**: Trading en cualquier momento
• **Volatilidad Continua**: Movimientos durante fines de semana
• **Gestión de Riesgo**: Monitoreo constante necesario

**Alta Volatilidad:**
• **Movimientos Extremos**: 10-50% en un día
• **Oportunidades**: Grandes ganancias potenciales
• **Riesgos**: Pérdidas significativas posibles
• **Apalancamiento Peligroso**: Amplifica volatilidad

**Mercado Joven:**
• **Menos Regulación**: Ambiente cambiante
• **Innovación Constante**: Nuevos proyectos
• **Manipulación**: Ballenas pueden mover mercados
• **Información Asimétrica**: Ventajas para insiders

**Formas de Trading:**

**Exchanges Centralizados (CEX):**
• **Binance**: Mayor volumen mundial
• **Coinbase**: Regulado en Estados Unidos
• **Kraken**: Enfoque en seguridad
• **FTX**: Productos derivados avanzados

**Ventajas CEX:**
• **Liquidez Alta**: Fácil compra/venta
• **Interfaz Amigable**: Plataformas intuitivas
• **Soporte**: Atención al cliente
• **Productos Diversos**: Spot, futuros, opciones

**Desventajas CEX:**
• **Custodia**: No controlas las claves privadas
• **Riesgo de Hack**: Historial de ataques
• **KYC/AML**: Verificación de identidad
• **Comisiones**: Fees por transacciones

**Exchanges Descentralizados (DEX):**
• **Uniswap**: AMM en Ethereum
• **PancakeSwap**: En Binance Smart Chain
• **SushiSwap**: Fork de Uniswap
• **1inch**: Agregador de DEXs

**Ventajas DEX:**
• **Custodia Propia**: Control de fondos
• **Sin KYC**: Trading anónimo
• **Resistencia a Censura**: Descentralizado
• **Nuevos Tokens**: Acceso temprano

**Desventajas DEX:**
• **Complejidad**: Curva de aprendizaje
• **Fees de Gas**: Costos de transacción
• **Liquidez Limitada**: En algunos pares
• **Riesgo de Smart Contract**: Bugs en código

**Estrategias de Trading:**

**HODLing (Hold On for Dear Life):**
• **Largo Plazo**: Mantener por años
• **Dollar Cost Averaging**: Compras regulares
• **Proyectos Sólidos**: Fundamentales fuertes
• **Paciencia**: Ignorar volatilidad diaria

**Day Trading:**
• **Movimientos Intradiarios**: Aprovechar volatilidad
• **Análisis Técnico**: Patrones y indicadores
• **Alta Frecuencia**: Múltiples operaciones
• **Gestión Estricta**: Stop loss obligatorio

**Swing Trading:**
• **Tendencias de Mediano Plazo**: Días a semanas
• **Análisis Combinado**: Técnico y fundamental
• **Menor Estrés**: Que day trading
• **Mejores R:R**: Ratios riesgo-beneficio

**Arbitraje:**
• **Diferencias de Precio**: Entre exchanges
• **Arbitraje Triangular**: Entre tres criptos
• **Funding Rate**: En futuros perpetuos
• **Riesgo Bajo**: Pero requiere capital grande

**Análisis Fundamental en Crypto:**

**Métricas On-Chain:**
• **Direcciones Activas**: Usuarios de la red
• **Volumen de Transacciones**: Actividad real
• **Hash Rate**: Seguridad de la red (Bitcoin)
• **Total Value Locked**: En protocolos DeFi

**Desarrollo del Proyecto:**
• **Actividad en GitHub**: Commits y desarrolladores
• **Roadmap**: Hitos y actualizaciones
• **Partnerships**: Colaboraciones estratégicas
• **Adopción**: Casos de uso reales

**Tokenomics:**
• **Suministro Total**: Cantidad máxima de tokens
• **Suministro Circulante**: Tokens en el mercado
• **Inflación/Deflación**: Emisión de nuevos tokens
• **Distribución**: Cómo se reparten los tokens

**Gestión de Riesgo Específica:**

**Volatilidad Extrema:**
• **Position Sizing**: Máximo 5% del portafolio por crypto
• **Stop Loss Amplios**: 15-25% para crypto volátiles
• **Diversificación**: Entre diferentes criptos
• **Rebalanceo**: Ajustes regulares de exposición

**Riesgo Regulatorio:**
• **Noticias Gubernamentales**: Impacto inmediato
• **Prohibiciones**: Riesgo de ilegalización
• **Taxation**: Cambios en tratamiento fiscal
• **Compliance**: Requisitos de exchanges

**Riesgo Tecnológico:**
• **Bugs en Smart Contracts**: Pérdida de fondos
• **Forks**: Divisiones de blockchain
• **Actualizaciones**: Cambios en protocolo
• **Quantum Computing**: Amenaza futura

**Seguridad en Trading:**

**Wallets Seguras:**
• **Hardware Wallets**: Ledger, Trezor
• **Software Wallets**: MetaMask, Trust Wallet
• **Paper Wallets**: Claves en papel
• **Multisig**: Múltiples firmas requeridas

**Mejores Prácticas:**
• **2FA**: Autenticación de dos factores
• **Passwords Únicos**: Para cada exchange
• **Phishing**: Verificar URLs correctas
• **Actualizaciones**: Software siempre actualizado

**Cold Storage:**
• **Fondos Offline**: Mayoría en almacenamiento frío
• **Hot Wallet Mínimo**: Solo para trading activo
• **Backup**: Múltiples copias de claves
• **Testeo**: Verificar recuperación de wallets

**Consideraciones Fiscales:**

**Tratamiento Tributario:**
• **Ganancias de Capital**: En muchas jurisdicciones
• **Trading Frecuente**: Puede ser ingreso ordinario
• **Staking Rewards**: Generalmente gravable
• **DeFi**: Complejidad fiscal adicional

**Registro de Transacciones:**
• **Todas las Operaciones**: Compras, ventas, trades
• **Fechas y Precios**: Para cálculo de ganancias
• **Software Especializado**: CoinTracker, Koinly
• **Asesoría Profesional**: Consultar contador

**Errores Comunes a Evitar:**

• **FOMO**: Fear of Missing Out en pumps
• **Revenge Trading**: Recuperar pérdidas rápidamente
• **Overleveraging**: Apalancamiento excesivo
• **No Research**: Invertir sin investigar
• **Emotional Trading**: Decisiones por emociones
• **Ignoring Security**: Descuidar medidas de seguridad
• **Chasing Pumps**: Comprar en máximos
• **No Exit Strategy**: Sin plan de salida

**Recursos de Información:**

**Análisis y Noticias:**
• **CoinDesk**: Noticias de la industria
• **CoinTelegraph**: Análisis y noticias
• **Messari**: Datos y research
• **Glassnode**: Métricas on-chain

**Herramientas de Trading:**
• **TradingView**: Gráficos y análisis técnico
• **CoinMarketCap**: Precios y datos de mercado
• **DeFiPulse**: Métricas de DeFi
• **Fear & Greed Index**: Sentimiento del mercado`
  },
  {
    id: 'reguladores-trading',
    question: '¿Qué reguladores supervisan el trading y por qué es importante?',
    category: 'Regulación',
    difficulty: 'Básico',
    icon: <Shield className="w-5 h-5" />,
    tags: ['regulación', 'SEC', 'FCA', 'protección'],
    relatedTopics: ['Brokers Regulados', 'Protección al Inversor', 'Compliance'],
    answer: `**¿Qué son los Reguladores Financieros?**

Los reguladores financieros son organismos gubernamentales encargados de supervisar y regular los mercados financieros, proteger a los inversores y mantener la integridad del sistema financiero. Establecen reglas, otorgan licencias y sancionan infracciones.

**Principales Reguladores Mundiales:**

**Estados Unidos:**

**SEC (Securities and Exchange Commission):**
• **Función**: Regula mercados de valores y brokers
• **Protección**: Inversores en acciones, bonos, ETFs
• **Poderes**: Investigación, sanciones, registro de entidades
• **Importancia**: Mayor mercado de capitales mundial

**CFTC (Commodity Futures Trading Commission):**
• **Función**: Regula mercados de futuros y derivados
• **Cobertura**: Commodities, Forex, criptomonedas
• **Registro NFA**: National Futures Association
• **Protección**: Contra fraude y manipulación

**FINRA (Financial Industry Regulatory Authority):**
• **Función**: Autorregulador de brokers-dealers
• **Supervisión**: Conducta de brokers y representantes
• **Exámenes**: Licencias para profesionales
• **Arbitraje**: Resolución de disputas

**Reino Unido:**

**FCA (Financial Conduct Authority):**
• **Función**: Regula servicios financieros
• **Cobertura**: Brokers, bancos, aseguradoras
• **Enfoque**: Protección al consumidor
• **Brexit**: Regulación post-UE independiente

**PRA (Prudential Regulation Authority):**
• **Función**: Supervisión prudencial de bancos
• **Enfoque**: Estabilidad financiera
• **Coordinación**: Con FCA en regulación dual

**Unión Europea:**

**ESMA (European Securities and Markets Authority):**
• **Función**: Coordinación regulatoria europea
• **MiFID II**: Directiva de mercados financieros
• **Pasaporte Europeo**: Licencias válidas en toda la UE
• **Protección**: Armonización de estándares

**Reguladores Nacionales:**
• **BaFin (Alemania)**: Bundesanstalt für Finanzdienstleistungsaufsicht
• **AMF (Francia)**: Autorité des Marchés Financiers
• **CNMV (España)**: Comisión Nacional del Mercado de Valores
• **CONSOB (Italia)**: Commissione Nazionale per le Società e la Borsa

**Australia y Asia-Pacífico:**

**ASIC (Australian Securities and Investments Commission):**
• **Función**: Regula servicios financieros australianos
• **Cobertura**: Brokers, asesores, mercados
• **Protección**: Inversores minoristas
• **Enforcement**: Sanciones por incumplimiento

**Otros Reguladores Asiáticos:**
• **FSA (Japón)**: Financial Services Agency
• **MAS (Singapur)**: Monetary Authority of Singapore
• **SFC (Hong Kong)**: Securities and Futures Commission

**¿Por qué es Importante la Regulación?**

**Protección al Inversor:**

**Segregación de Fondos:**
• **Cuentas Separadas**: Fondos de clientes separados del broker
• **Protección**: En caso de quiebra del broker
• **Auditorías**: Verificación regular de fondos
• **Compensación**: Esquemas de protección al inversor

**Transparencia:**
• **Divulgación**: Información clara sobre riesgos y costos
• **Reportes**: Estados financieros regulares
• **Conflictos de Interés**: Revelación obligatoria
• **Best Execution**: Mejor ejecución para clientes

**Integridad del Mercado:**

**Prevención de Fraude:**
• **Investigaciones**: Actividades sospechosas
• **Sanciones**: Multas y prohibiciones
• **Licencias**: Solo entidades calificadas
• **Monitoreo**: Supervisión continua

**Manipulación de Mercado:**
• **Detección**: Sistemas de vigilancia
• **Prohibiciones**: Prácticas abusivas
• **Insider Trading**: Uso de información privilegiada
• **Pump and Dump**: Esquemas de manipulación

**Estabilidad Financiera:**

**Requisitos de Capital:**
• **Capitalización Mínima**: Recursos suficientes
• **Ratios de Solvencia**: Medidas de salud financiera
• **Stress Tests**: Pruebas de resistencia
• **Reservas**: Fondos para contingencias

**Gestión de Riesgo:**
• **Límites de Exposición**: Concentración de riesgo
• **Diversificación**: Requisitos de cartera
• **Liquidez**: Capacidad de pago
• **Reporting**: Informes de riesgo regulares

**Cómo Verificar si un Broker está Regulado:**

**Pasos de Verificación:**

1. **Número de Licencia**: Verificar en sitio web del regulador
2. **Registro Oficial**: Buscar en base de datos regulatoria
3. **Estado Activo**: Confirmar que licencia está vigente
4. **Servicios Autorizados**: Qué actividades puede realizar
5. **Historial Disciplinario**: Sanciones o advertencias previas

**Señales de Alerta:**

**Brokers No Regulados:**
• **Promesas Irreales**: Ganancias garantizadas
• **Presión de Ventas**: Llamadas agresivas
• **Bonos Excesivos**: Ofertas demasiado buenas
• **Falta de Información**: Datos de contacto vagos

**Regulación Falsa:**
• **Reguladores Inexistentes**: Entidades ficticias
• **Licencias Falsas**: Números inventados
• **Jurisdicciones Dudosas**: Países sin regulación
• **Clones**: Copian identidad de brokers legítimos

**Beneficios de Operar con Brokers Regulados:**

**Protección Legal:**
• **Recurso Legal**: Vías de reclamación
• **Arbitraje**: Resolución de disputas
• **Compensación**: Esquemas de protección
• **Derechos**: Protección del consumidor

**Seguridad de Fondos:**
• **Segregación**: Fondos protegidos
• **Auditorías**: Verificación independiente
• **Seguros**: Cobertura adicional
• **Transparencia**: Reportes financieros

**Calidad de Servicio:**
• **Estándares**: Requisitos de calidad
• **Capacitación**: Personal calificado
• **Tecnología**: Sistemas confiables
• **Soporte**: Atención al cliente regulada

**Esquemas de Compensación:**

**FSCS (Reino Unido):**
• **Cobertura**: £85,000 por persona por firma
• **Elegibilidad**: Brokers autorizados por FCA
• **Proceso**: Reclamación directa
• **Tiempo**: Pagos dentro de 7 días

**SIPC (Estados Unidos):**
• **Cobertura**: $500,000 por cuenta ($250,000 en efectivo)
• **Protección**: Contra quiebra de broker
• **No Cubre**: Pérdidas por trading
• **Proceso**: Liquidación supervisada

**Otros Esquemas:**
• **ICF (Chipre)**: €20,000 por inversor
• **FSCS (Australia)**: AUD $500,000
• **Fondo de Garantía (España)**: €100,000

**Regulación de Productos Específicos:**

**Forex:**
• **Apalancamiento**: Límites para retail (30:1 en EU)
• **Advertencias**: Riesgos claramente expuestos
• **Negative Balance Protection**: Protección contra saldo negativo
• **Margin Close Out**: Cierre automático al 50%

**CFDs:**
• **Restricciones**: Productos complejos
• **Advertencias**: "X% de cuentas pierden dinero"
• **Marketing**: Limitaciones en publicidad
• **Idoneidad**: Evaluación de conocimiento

**Criptomonedas:**
• **Regulación Emergente**: Marcos en desarrollo
• **Clasificación**: Commodity vs security
• **AML/KYC**: Requisitos anti-lavado
• **Custodia**: Regulación de wallets

**Tendencias Regulatorias:**

**Mayor Protección:**
• **Transparencia**: Más divulgación requerida
• **Educación**: Programas obligatorios
• **Testing**: Evaluación de conocimiento
• **Cooling-off**: Períodos de reflexión

**Tecnología:**
• **RegTech**: Automatización de compliance
• **Reporting**: Sistemas en tiempo real
• **Supervisión**: Monitoreo algorítmico
• **Blockchain**: Regulación de DLT

**Globalización:**
• **Coordinación**: Entre reguladores internacionales
• **Estándares**: Armonización global
• **Equivalencia**: Reconocimiento mutuo
• **Cooperación**: Intercambio de información

**Consejos para Traders:**

**Due Diligence:**
• **Verificar Siempre**: Regulación antes de depositar
• **Múltiples Fuentes**: Confirmar información
• **Actualizaciones**: Cambios en estatus regulatorio
• **Comparar**: Diferentes opciones reguladas

**Documentación:**
• **Guardar Registros**: Todas las comunicaciones
• **Screenshots**: Evidencia de problemas
• **Contratos**: Términos y condiciones
• **Transacciones**: Historial completo

**Reclamaciones:**
• **Proceso Interno**: Primero con el broker
• **Ombudsman**: Servicios de mediación
• **Regulador**: Reportar problemas serios
• **Legal**: Asesoría profesional si necesario`
  },
  {
    id: 'banco-custodio',
    question: '¿Qué es un Banco Custodio y cuál es su función?',
    category: 'Servicios Financieros',
    difficulty: 'Intermedio',
    icon: <Shield className="w-5 h-5" />,
    tags: ['custodia', 'seguridad', 'activos', 'protección'],
    relatedTopics: ['Segregación de Fondos', 'Regulación', 'Protección al Inversor'],
    answer: `**¿Qué es un Banco Custodio?**

Un banco custodio es una institución financiera especializada en la custodia, administración y protección de activos financieros de terceros. Actúa como guardián independiente de valores, efectivo y otros instrumentos financieros, proporcionando una capa adicional de seguridad y transparencia.

**Funciones Principales:**

**Custodia de Activos:**
• **Almacenamiento Seguro**: Protección física y digital de valores
• **Registro de Propiedad**: Mantenimiento de registros precisos
• **Segregación**: Separación de activos por cliente
• **Inventario**: Control detallado de posiciones

**Administración de Valores:**
• **Liquidación**: Procesamiento de transacciones
• **Cobro de Dividendos**: Gestión de pagos corporativos
• **Derechos de Voto**: Ejercicio de derechos accionarios
• **Acciones Corporativas**: Gestión de splits, fusiones, etc.

**Servicios de Reporting:**
• **Estados de Cuenta**: Informes detallados de posiciones
• **Valoración**: Pricing independiente de activos
• **Performance**: Análisis de rendimiento
• **Compliance**: Reportes regulatorios

**Principales Bancos Custodios Globales:**

**Estados Unidos:**
• **State Street**: Líder mundial en custodia
• **BNY Mellon**: Servicios integrales de custodia
• **JPMorgan Chase**: Custodia y servicios fiduciarios
• **Citibank**: Servicios globales de custodia

**Europa:**
• **BNP Paribas Securities Services**: Custodia europea
• **Deutsche Bank**: Servicios de custodia alemanes
• **HSBC**: Custodia global con presencia europea
• **Société Générale**: Servicios especializados

**Asia-Pacífico:**
• **HSBC**: Fuerte presencia asiática
• **Standard Chartered**: Servicios en mercados emergentes
• **Mizuho**: Custodia japonesa
• **DBS**: Servicios en Singapur

**Beneficios de la Custodia Bancaria:**

**Seguridad Mejorada:**

**Protección Física:**
• **Bóvedas Seguras**: Instalaciones de alta seguridad
• **Sistemas de Seguridad**: Múltiples capas de protección
• **Seguros**: Cobertura contra pérdidas
• **Redundancia**: Múltiples ubicaciones

**Protección Digital:**
• **Ciberseguridad**: Sistemas avanzados de protección
• **Encriptación**: Datos protegidos
• **Acceso Controlado**: Autenticación múltiple
• **Monitoreo**: Vigilancia 24/7

**Segregación de Activos:**

**Separación Legal:**
• **Propiedad Distinta**: Activos no pertenecen al custodio
• **Protección en Quiebra**: Activos protegidos si custodio falla
• **Identificación Clara**: Cada cliente identificado
• **Registros Separados**: Contabilidad independiente

**Tipos de Segregación:**
• **Omnibus Account**: Múltiples clientes en una cuenta
• **Individual Account**: Cuenta separada por cliente
• **Sub-custodia**: Delegación a custodios locales
• **Direct Holding**: Registro directo en emisor

**Transparencia y Reporting:**

**Información Detallada:**
• **Posiciones en Tiempo Real**: Acceso inmediato a datos
• **Transacciones**: Registro completo de movimientos
• **Valoración Independiente**: Pricing objetivo
• **Auditorías**: Verificación externa regular

**Compliance Regulatorio:**
• **Reportes Obligatorios**: Cumplimiento automático
• **Estándares Internacionales**: Adherencia a mejores prácticas
• **Due Diligence**: Verificación de contrapartes
• **AML/KYC**: Cumplimiento anti-lavado

**Diferencias con Otros Servicios:**

**Custodio vs Broker:**

**Custodio:**
• **Función**: Guardar y administrar activos
• **Propiedad**: Cliente mantiene propiedad
• **Conflicto**: Mínimo conflicto de interés
• **Regulación**: Estricta supervisión fiduciaria

**Broker:**
• **Función**: Ejecutar transacciones
• **Propiedad**: Puede tener posiciones propias
• **Conflicto**: Potenciales conflictos de interés
• **Regulación**: Enfoque en conducta de mercado

**Custodio vs Banco Comercial:**

**Especialización:**
• **Custodio**: Servicios especializados en valores
• **Banco Comercial**: Servicios bancarios generales
• **Expertise**: Conocimiento profundo de mercados
• **Tecnología**: Sistemas especializados

**Regulación:**
• **Custodio**: Regulación fiduciaria estricta
• **Banco**: Regulación bancaria tradicional
• **Capital**: Requisitos específicos para custodia
• **Supervisión**: Enfoque en protección de activos

**Proceso de Custodia:**

**Onboarding:**
1. **Due Diligence**: Verificación del cliente
2. **Documentación**: Contratos y acuerdos
3. **Setup**: Configuración de cuentas
4. **Testing**: Pruebas de conectividad

**Operación Diaria:**
1. **Recepción**: Instrucciones de transacciones
2. **Validación**: Verificación de órdenes
3. **Ejecución**: Procesamiento de operaciones
4. **Confirmación**: Notificación de completado
5. **Reporting**: Informes de posiciones

**Reconciliación:**
• **Diaria**: Verificación de posiciones
• **Mensual**: Estados de cuenta detallados
• **Anual**: Auditorías completas
• **Ad-hoc**: Reportes especiales

**Costos de Custodia:**

**Estructura de Fees:**

**Fees de Custodia:**
• **Basis Points**: Porcentaje sobre activos bajo custodia
• **Rango Típico**: 0.01% - 0.25% anual
• **Escala**: Descuentos por volumen
• **Mínimos**: Fees mínimos mensuales

**Fees Transaccionales:**
• **Por Transacción**: Costo fijo por operación
• **Settlement**: Fees de liquidación
• **FX**: Costos de cambio de divisa
• **Corporativas**: Fees por acciones corporativas

**Fees Adicionales:**
• **Setup**: Costos de implementación
• **Reporting**: Informes especializados
• **Custody**: Servicios premium
• **Technology**: Conectividad especializada

**Selección de Custodio:**

**Criterios Clave:**

**Reputación y Estabilidad:**
• **Rating Crediticio**: Calificación de agencias
• **Historia**: Trayectoria en el mercado
• **Tamaño**: Activos bajo custodia
• **Solidez Financiera**: Estados financieros

**Capacidades Técnicas:**
• **Sistemas**: Tecnología robusta
• **Conectividad**: APIs y interfaces
• **Reporting**: Calidad de informes
• **Soporte**: Atención al cliente

**Cobertura Geográfica:**
• **Mercados**: Países cubiertos
• **Red de Sub-custodios**: Socios locales
• **Horarios**: Cobertura temporal
• **Idiomas**: Soporte multiidioma

**Regulación y Compliance:**
• **Licencias**: Autorizaciones regulatorias
• **Auditorías**: Certificaciones externas
• **Seguros**: Cobertura de protección
• **Compliance**: Adherencia a estándares

**Tendencias en Custodia:**

**Digitalización:**
• **Blockchain**: Custodia de criptoactivos
• **Smart Contracts**: Automatización de procesos
• **APIs**: Integración digital
• **Cloud**: Servicios en la nube

**Consolidación:**
• **Mega-custodios**: Concentración del mercado
• **Servicios Integrados**: One-stop-shop
• **Especialización**: Nichos específicos
• **Partnerships**: Alianzas estratégicas

**Regulación Evolutiva:**
• **Estándares Globales**: Armonización internacional
• **Ciberseguridad**: Requisitos más estrictos
• **Transparencia**: Mayor divulgación
• **Protección**: Mejores salvaguardas

**Riesgos de Custodia:**

**Riesgo Operacional:**
• **Errores**: Fallos en procesamiento
• **Fraude**: Actividades maliciosas
• **Sistemas**: Fallas tecnológicas
• **Personal**: Errores humanos

**Riesgo de Contraparte:**
• **Quiebra**: Falla del custodio
• **Sub-custodios**: Riesgo de terceros
• **Concentración**: Dependencia excesiva
• **Jurisdiccional**: Riesgos legales

**Mitigación de Riesgos:**
• **Diversificación**: Múltiples custodios
• **Due Diligence**: Evaluación continua
• **Seguros**: Cobertura adecuada
• **Monitoreo**: Supervisión activa

**Importancia para Traders:**

**Protección de Fondos:**
• **Segregación**: Fondos separados del broker
• **Transparencia**: Visibilidad de ubicación
• **Acceso**: Disponibilidad garantizada
• **Recuperación**: Proceso claro en crisis

**Confianza:**
• **Credibilidad**: Mayor confianza en broker
• **Regulación**: Cumplimiento mejorado
• **Estándares**: Mejores prácticas
• **Reputación**: Asociación con instituciones sólidas`
  },
  {
    id: 'cuenta-segregada',
    question: '¿Qué es una Cuenta Segregada y cómo me protege?',
    category: 'Protección',
    difficulty: 'Básico',
    icon: <Shield className="w-5 h-5" />,
    tags: ['segregación', 'protección', 'fondos', 'seguridad'],
    relatedTopics: ['Banco Custodio', 'Regulación', 'Protección al Inversor'],
    answer: `**¿Qué es una Cuenta Segregada?**

Una cuenta segregada es una cuenta bancaria separada donde un broker mantiene los fondos de sus clientes completamente apartados de sus propios activos operativos. Esta separación legal y física garantiza que el dinero de los clientes esté protegido y no pueda ser utilizado para las operaciones comerciales del broker.

**Tipos de Segregación:**

**Segregación Individual:**
• **Cuenta Propia**: Cada cliente tiene su cuenta separada
• **Identificación Clara**: Fondos identificados por cliente específico
• **Máxima Protección**: Aislamiento completo
• **Mayor Costo**: Para el broker mantener múltiples cuentas

**Segregación Omnibus:**
• **Cuenta Colectiva**: Todos los clientes en una cuenta segregada
• **Registros Detallados**: Contabilidad interna por cliente
• **Protección Grupal**: Fondos separados del broker
• **Eficiencia**: Menor costo administrativo

**Segregación Parcial:**
• **Porcentaje**: Solo parte de los fondos segregados
• **Límites**: Hasta cierto monto por cliente
• **Riesgo Residual**: Exposición parcial
• **Menos Común**: En jurisdicciones menos estrictas

**Marco Legal y Regulatorio:**

**Requisitos Regulatorios:**

**Estados Unidos (CFTC/NFA):**
• **100% Segregación**: Todos los fondos de clientes
• **Auditorías Diarias**: Verificación de saldos
• **Bancos Aprobados**: Solo instituciones autorizadas
• **Reportes**: Informes regulares a reguladores

**Reino Unido (FCA):**
• **Client Money Rules**: Reglas estrictas de segregación
• **Bancos Autorizados**: Instituciones aprobadas por FCA
• **Reconciliación**: Verificación diaria obligatoria
• **Protección FSCS**: Cobertura adicional hasta £85,000

**Unión Europea (MiFID II):**
• **Segregación Obligatoria**: Para todos los brokers
• **Bancos de Crédito**: Instituciones solventes
• **Información al Cliente**: Divulgación de arreglos
• **Derechos de Retirada**: Acceso garantizado a fondos

**Australia (ASIC):**
• **Trust Accounts**: Cuentas fiduciarias obligatorias
• **Bancos ADI**: Solo instituciones autorizadas
• **Auditorías**: Verificación externa regular
• **Compensación**: Esquema de protección disponible

**Beneficios de la Segregación:**

**Protección en Quiebra:**

**Aislamiento Legal:**
• **Propiedad Distinta**: Fondos no pertenecen al broker
• **Protección Crediticia**: Acreedores no pueden reclamar
• **Proceso Separado**: Liquidación independiente
• **Recuperación Prioritaria**: Clientes tienen prioridad

**Acceso Garantizado:**
• **Disponibilidad**: Fondos accesibles incluso en crisis
• **Transferencia**: Posibilidad de mover a otro broker
• **Tiempo**: Recuperación más rápida
• **Integridad**: Fondos intactos

**Transparencia y Control:**

**Visibilidad:**
• **Ubicación**: Conocimiento de dónde están los fondos
• **Banco Custodio**: Identificación de la institución
• **Saldos**: Verificación independiente
• **Movimientos**: Trazabilidad de transacciones

**Verificación:**
• **Estados de Cuenta**: Del banco custodio
• **Auditorías**: Verificación externa
• **Reportes**: Informes regulatorios públicos
• **Reconciliación**: Verificación cruzada

**Cómo Verificar la Segregación:**

**Documentación del Broker:**

**Términos y Condiciones:**
• **Cláusulas de Segregación**: Compromiso explícito
• **Banco Custodio**: Identificación clara
• **Tipo de Cuenta**: Individual u omnibus
• **Jurisdicción**: Ley aplicable

**Información Regulatoria:**
• **Licencias**: Verificar autorización
• **Reportes**: Estados financieros auditados
• **Compliance**: Cumplimiento de reglas
• **Historial**: Registro disciplinario

**Verificación Independiente:**

**Contacto Directo:**
• **Banco Custodio**: Confirmar existencia de cuenta
• **Saldos**: Verificar montos (si permitido)
• **Arreglos**: Confirmar términos de segregación
• **Acceso**: Procedimientos de recuperación

**Auditorías Externas:**
• **Reportes de Auditoría**: Verificación independiente
• **Certificaciones**: Confirmación de segregación
• **Frecuencia**: Auditorías regulares
• **Alcance**: Cobertura completa de fondos

**Señales de Alerta:**

**Falta de Segregación:**
• **Información Vaga**: Detalles poco claros
• **Sin Banco Custodio**: No identifican institución
• **Promesas Vagas**: Compromisos no específicos
• **Regulación Débil**: Jurisdicciones permisivas

**Prácticas Riesgosas:**
• **Uso de Fondos**: Para operaciones del broker
• **Préstamos**: Fondos prestados a terceros
• **Inversiones**: Fondos invertidos por el broker
• **Commingling**: Mezcla con activos propios

**Proceso de Recuperación:**

**En Caso de Quiebra:**

**Pasos Inmediatos:**
1. **Notificación**: Aviso a reguladores
2. **Congelamiento**: Protección de activos
3. **Administrador**: Nombramiento de liquidador
4. **Inventario**: Verificación de fondos segregados

**Recuperación de Fondos:**
1. **Reclamación**: Presentar documentación
2. **Verificación**: Confirmar propiedad
3. **Distribución**: Pago proporcional
4. **Transferencia**: Mover a nuevo broker

**Tiempo Estimado:**
• **Casos Simples**: 30-90 días
• **Casos Complejos**: 6-18 meses
• **Factores**: Complejidad, jurisdicción, documentación
• **Compensación**: Esquemas pueden acelerar

**Limitaciones de la Segregación:**

**No Cubre Pérdidas de Trading:**
• **Riesgo de Mercado**: Pérdidas por operaciones
• **Decisiones**: Responsabilidad del trader
• **Volatilidad**: Fluctuaciones normales
• **Apalancamiento**: Riesgos amplificados

**Riesgos Residuales:**
• **Banco Custodio**: Riesgo de la institución
• **Fraude**: Actividades criminales
• **Errores**: Fallos operacionales
• **Jurisdiccional**: Cambios legales

**Mejores Prácticas para Traders:**

**Selección de Broker:**

**Verificación Previa:**
• **Regulación**: Solo brokers regulados
• **Segregación**: Confirmación explícita
• **Banco Custodio**: Institución reconocida
• **Historial**: Sin problemas previos

**Due Diligence:**
• **Documentación**: Revisar términos
• **Regulador**: Verificar con autoridad
• **Reputación**: Investigar antecedentes
• **Comparación**: Evaluar alternativas

**Monitoreo Continuo:**

**Revisión Regular:**
• **Estados de Cuenta**: Verificar consistencia
• **Noticias**: Seguir información del broker
• **Regulación**: Cambios en estatus
• **Señales**: Alertas tempranas

**Diversificación:**
• **Múltiples Brokers**: No concentrar todo
• **Jurisdicciones**: Diferentes regulaciones
• **Límites**: Montos por broker
• **Backup**: Alternativas preparadas

**Documentación:**
• **Registros**: Mantener toda documentación
• **Screenshots**: Evidencia de saldos
• **Comunicaciones**: Emails y mensajes
• **Transacciones**: Historial completo

**Comparación Internacional:**

**Estándares Más Estrictos:**
• **Reino Unido**: Client Money Rules detalladas
• **Estados Unidos**: Segregación 100% obligatoria
• **Australia**: Trust accounts con auditorías
• **Singapur**: Requisitos estrictos de MAS

**Estándares Moderados:**
• **Unión Europea**: MiFID II armonizado
• **Canadá**: Requisitos provinciales
• **Japón**: Regulación FSA
• **Suiza**: FINMA supervision

**Jurisdicciones de Riesgo:**
• **Offshore**: Regulación limitada
• **Emergentes**: Marcos en desarrollo
• **No Reguladas**: Sin protección
• **Conflicto**: Zonas de inestabilidad

**Evolución Futura:**

**Tendencias Regulatorias:**
• **Armonización**: Estándares globales
• **Digitalización**: Verificación automática
• **Transparencia**: Mayor divulgación
• **Protección**: Mejores salvaguardas

**Tecnología:**
• **Blockchain**: Registros inmutables
• **Smart Contracts**: Automatización
• **Real-time**: Monitoreo continuo
• **APIs**: Verificación directa

**Educación del Inversor:**
• **Conciencia**: Mayor conocimiento
• **Herramientas**: Verificación fácil
• **Recursos**: Información accesible
• **Derechos**: Conocimiento de protecciones`
  },
  {
    id: 'usdt-tether',
    question: '¿Qué es USDT (Tether) y cómo se usa en trading?',
    category: 'Crypto',
    difficulty: 'Intermedio',
    icon: <Zap className="w-5 h-5" />,
    tags: ['USDT', 'stablecoin', 'tether', 'trading'],
    relatedTopics: ['Criptomonedas', 'Stablecoins', 'DeFi'],
    answer: `**¿Qué es USDT (Tether)?**

USDT (Tether) es una stablecoin, una criptomoneda diseñada para mantener un valor estable vinculado al dólar estadounidense. Cada token USDT está respaldado teóricamente por $1 USD en reservas, proporcionando estabilidad de precio en el volátil mundo de las criptomonedas.

**Características Principales:**

**Estabilidad de Precio:**
• **Paridad 1:1**: Cada USDT = $1 USD (teóricamente)
• **Baja Volatilidad**: Fluctuaciones mínimas vs otras cryptos
• **Refugio**: Activo seguro durante volatilidad extrema
• **Liquidez**: Fácil conversión a/desde otras criptomonedas

**Respaldo:**
• **Reservas**: Supuestamente respaldado por activos equivalentes
• **Transparencia**: Reportes periódicos de auditoría
• **Composición**: USD, equivalentes de efectivo, otros activos
• **Controversia**: Debates sobre respaldo completo

**Blockchains Soportadas:**

**Ethereum (ERC-20):**
• **Más Popular**: Mayor adopción y liquidez
• **DeFi**: Integración con protocolos descentralizados
• **Fees**: Costos de gas variables
• **Velocidad**: Dependiente de congestión de red

**Tron (TRC-20):**
• **Fees Bajos**: Transacciones muy económicas
• **Velocidad**: Confirmaciones rápidas
• **Adopción**: Popular en Asia
• **Exchanges**: Amplio soporte

**Otras Blockchains:**
• **Binance Smart Chain (BEP-20)**: Fees bajos, velocidad alta
• **Solana**: Transacciones ultrarrápidas
• **Polygon**: Solución de escalabilidad para Ethereum
• **Avalanche**: Red de alta performance

**Usos en Trading:**

**Par de Trading Base:**

**Crypto-to-USDT:**
• **BTC/USDT**: Par más líquido de Bitcoin
• **ETH/USDT**: Trading de Ethereum
• **ALT/USDT**: Altcoins vs USDT
• **Estabilidad**: Precio de referencia estable

**Ventajas como Par Base:**
• **Sin Volatilidad**: Precio estable vs USD
• **Liquidez**: Profundidad de mercado excelente
• **Disponibilidad**: En todos los exchanges principales
• **Cálculos**: Fácil conversión a valor USD

**Preservación de Valor:**

**Durante Volatilidad:**
• **Flight to Safety**: Refugio en mercados bajistas
• **Preservar Ganancias**: Convertir profits a USDT
• **Evitar Pérdidas**: Salir de posiciones riesgosas
• **Timing**: Esperar mejores oportunidades

**Estrategias:**
• **Dollar Cost Averaging**: Compras regulares con USDT
• **Swing Trading**: Entrar/salir usando USDT
• **Arbitraje**: Aprovechar diferencias de precio
• **Yield Farming**: Generar rendimientos con USDT

**Ventajas de USDT:**

**Estabilidad:**
• **Precio Predecible**: Fluctuaciones mínimas
• **Planificación**: Facilita estrategias de trading
• **Psicología**: Reduce estrés emocional
• **Referencia**: Valor claro en USD

**Liquidez:**
• **Volumen Alto**: Segundo crypto por capitalización
• **Disponibilidad**: En todos los exchanges principales
• **Pares**: Múltiples opciones de trading
• **Conversión**: Fácil entrada/salida

**Utilidad:**
• **Transferencias**: Envío rápido de valor
• **Pagos**: Aceptado por muchos servicios
• **DeFi**: Amplio uso en finanzas descentralizadas
• **Staking**: Oportunidades de rendimiento

**Riesgos y Controversias:**

**Riesgo de Respaldo:**

**Auditorías Limitadas:**
• **Transparencia**: Falta de auditorías completas
• **Composición**: Reservas no 100% en efectivo
• **Préstamos**: Parte de reservas prestadas
• **Riesgo de Contraparte**: Dependencia de Tether Ltd.

**Regulación:**
• **Investigaciones**: Escrutinio regulatorio
• **Multas**: Sanciones por falta de transparencia
• **Prohibiciones**: Riesgo de restricciones
• **Compliance**: Presión por mayor cumplimiento

**Riesgo Técnico:**

**Centralización:**
• **Control**: Tether Ltd. puede congelar tokens
• **Blacklist**: Direcciones pueden ser bloqueadas
• **Emisión**: Control centralizado de suministro
• **Dependencia**: De una sola entidad

**Smart Contract:**
• **Bugs**: Riesgos en código de contrato
• **Upgrades**: Cambios en funcionalidad
• **Hacks**: Vulnerabilidades potenciales
• **Network**: Dependencia de blockchain subyacente

**Alternativas a USDT:**

**USDC (USD Coin):**
• **Regulación**: Más regulado y transparente
• **Auditorías**: Reportes mensuales detallados
• **Respaldo**: 100% en efectivo y equivalentes
• **Coinbase**: Respaldado por exchange regulado

**BUSD (Binance USD):**
• **Binance**: Respaldado por mayor exchange
• **Regulación**: Aprobado por NYDFS
• **Auditorías**: Verificación regular
• **Integración**: Nativa en Binance ecosystem

**DAI:**
• **Descentralizada**: No controlada por entidad única
• **Colateral**: Respaldada por crypto assets
• **MakerDAO**: Protocolo descentralizado
• **Transparencia**: Completamente auditada on-chain

**Otras Stablecoins:**
• **TUSD**: TrueUSD con auditorías regulares
• **PAX**: Paxos Standard regulada
• **GUSD**: Gemini Dollar regulada
• **FRAX**: Stablecoin algorítmica parcial

**Cómo Usar USDT Seguramente:**

**Selección de Exchange:**
• **Regulados**: Preferir exchanges regulados
• **Reputación**: Historial sólido de seguridad
• **Liquidez**: Volumen alto en pares USDT
• **Soporte**: Múltiples blockchains soportadas

**Gestión de Riesgo:**
• **No Concentrar**: No mantener todo en USDT
• **Diversificar**: Entre diferentes stablecoins
• **Monitorear**: Noticias sobre Tether
• **Límites**: Exposición máxima recomendada

**Almacenamiento:**
• **Hot Wallets**: Solo para trading activo
• **Cold Storage**: Para holdings de largo plazo
• **Hardware Wallets**: Máxima seguridad
• **Backup**: Múltiples copias de claves

**Mejores Prácticas:**

**Para Trading:**
• **Liquidez**: Verificar profundidad de mercado
• **Spreads**: Comparar entre exchanges
• **Fees**: Considerar costos de transacción
• **Timing**: Usar para timing de mercado

**Para Transferencias:**
• **Red**: Elegir blockchain apropiada
• **Fees**: Comparar costos de transacción
• **Velocidad**: Considerar tiempo de confirmación
• **Compatibilidad**: Verificar soporte del destino

**Monitoreo:**
• **Precio**: Verificar paridad con USD
• **Noticias**: Seguir desarrollos regulatorios
• **Auditorías**: Revisar reportes de reservas
• **Competencia**: Evaluar alternativas

**Futuro de USDT:**

**Regulación Creciente:**
• **Compliance**: Mayor presión regulatoria
• **Transparencia**: Auditorías más frecuentes
• **Estándares**: Requisitos más estrictos
• **Competencia**: De stablecoins reguladas

**Innovación Técnica:**
• **Nuevas Blockchains**: Expansión a más redes
• **Interoperabilidad**: Bridges entre chains
• **DeFi**: Mayor integración
• **CBDCs**: Competencia de monedas digitales centrales

**Adopción:**
• **Institucional**: Mayor uso corporativo
• **Retail**: Crecimiento en usuarios individuales
• **Global**: Expansión internacional
• **Casos de Uso**: Nuevas aplicaciones

**Consideraciones Fiscales:**

**Tratamiento Tributario:**
• **Jurisdicción**: Varía por país
• **Ganancias**: Posibles implicaciones fiscales
• **Reporting**: Requisitos de declaración
• **Asesoría**: Consultar profesional fiscal

**Registro:**
• **Transacciones**: Mantener registros detallados
• **Conversiones**: Documentar cambios crypto-USDT
• **Fechas**: Timestamps precisos
• **Valores**: Precios de mercado al momento

**Conclusión:**

USDT es una herramienta valiosa en el ecosistema crypto, proporcionando estabilidad y liquidez. Sin embargo, los traders deben estar conscientes de sus riesgos y considerar alternativas. La clave está en usar USDT como parte de una estrategia diversificada, no como única solución de estabilidad.`
  }
];

// Categorías de FAQ
export const faqCategories = [
  'Todos',
  'Forex',
  'Commodities', 
  'Índices',
  'Crypto',
  'Regulación',
  'Servicios Financieros',
  'Protección'
];