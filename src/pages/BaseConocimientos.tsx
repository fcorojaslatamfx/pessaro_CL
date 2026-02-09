import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, TrendingUp, DollarSign, Target, Clock, User, ChevronRight, Star, Play, Book } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RiskProfileModal from '@/components/RiskProfileModal';

const BaseConocimientos: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { isProfileComplete, showProfileModal, setShowProfileModal, saveProfile, requireProfile } = useRiskProfile();

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Verificar perfil al cargar la página
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isProfileComplete) {
        setShowProfileModal(true);
      }
    }, 1000); // Mostrar después de 1 segundo para mejor UX

    return () => clearTimeout(timer);
  }, [isProfileComplete, setShowProfileModal]);

  const categories = [
    { id: 'todos', label: 'Todos', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'fundamentos', label: 'Fundamentos Forex', icon: <Target className="w-4 h-4" /> },
    { id: 'analisis', label: 'Análisis Técnico', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'estrategias', label: 'Estrategias', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'psicologia', label: 'Psicología Trading', icon: <User className="w-4 h-4" /> },
    { id: 'glosario', label: 'Glosario Técnico', icon: <Book className="w-4 h-4" /> },
  ];

  const knowledgeBase = [
    {
      id: 'que-es-forex',
      title: '¿Qué es el Mercado Forex?',
      category: 'fundamentos',
      level: 'Principiante',
      readTime: 5,
      description: 'Introducción completa al mercado de divisas más grande del mundo.',
      content: `
        <h2>¿Qué es Forex?</h2>
        <p>El mercado Forex (Foreign Exchange) es el mercado financiero más grande y líquido del mundo, con un volumen diario de transacciones superior a $7.5 billones.</p>
        
        <h3>Características Principales</h3>
        <ul>
          <li><strong>Mercado 24/5:</strong> Opera las 24 horas, 5 días a la semana</li>
          <li><strong>Alta Liquidez:</strong> Facilita la entrada y salida de posiciones</li>
          <li><strong>Apalancamiento:</strong> Permite operar con más capital del disponible</li>
          <li><strong>Spreads Bajos:</strong> Costos de transacción reducidos</li>
        </ul>
        
        <h3>Principales Participantes</h3>
        <ul>
          <li>Bancos Centrales</li>
          <li>Bancos Comerciales</li>
          <li>Fondos de Inversión</li>
          <li>Corporaciones Multinacionales</li>
          <li>Traders Individuales</li>
        </ul>
        
        <h3>Pares de Divisas Principales</h3>
        <ul>
          <li><strong>EUR/USD:</strong> Euro vs Dólar Estadounidense</li>
          <li><strong>GBP/USD:</strong> Libra Esterlina vs Dólar</li>
          <li><strong>USD/JPY:</strong> Dólar vs Yen Japonés</li>
          <li><strong>USD/CHF:</strong> Dólar vs Franco Suizo</li>
        </ul>
      `,
      tags: ['forex', 'principiante', 'fundamentos'],
      author: 'Francisco Rojas-Aranda',
      lastUpdated: '2026-01-30'
    },
    {
      id: 'pips-spreads',
      title: 'Pips y Spreads: Conceptos Esenciales',
      category: 'fundamentos',
      level: 'Principiante',
      readTime: 7,
      description: 'Aprende a calcular pips, spreads y su impacto en tus operaciones.',
      content: `
        <h2>¿Qué es un Pip?</h2>
        <p>Un pip (Percentage in Point) es la unidad de medida más pequeña del precio de un par de divisas.</p>
        
        <h3>Cálculo de Pips</h3>
        <ul>
          <li><strong>Pares con 4 decimales:</strong> 1 pip = 0.0001</li>
          <li><strong>Pares con JPY (2 decimales):</strong> 1 pip = 0.01</li>
          <li><strong>Ejemplo:</strong> EUR/USD de 1.1050 a 1.1055 = 5 pips</li>
        </ul>
        
        <h3>¿Qué es el Spread?</h3>
        <p>El spread es la diferencia entre el precio de compra (Ask) y el precio de venta (Bid).</p>
        
        <h3>Tipos de Spread</h3>
        <ul>
          <li><strong>Spread Fijo:</strong> No cambia independientemente de las condiciones del mercado</li>
          <li><strong>Spread Variable:</strong> Fluctúa según la liquidez y volatilidad</li>
        </ul>
        
        <h3>Impacto en el Trading</h3>
        <ul>
          <li>Spreads bajos = menores costos de transacción</li>
          <li>Importante para estrategias de scalping</li>
          <li>Varía según el par de divisas y el broker</li>
        </ul>
      `,
      tags: ['pips', 'spreads', 'cálculos'],
      author: 'Francisco Rojas-Aranda',
      lastUpdated: '2026-01-29'
    },
    {
      id: 'analisis-tecnico-basico',
      title: 'Análisis Técnico: Fundamentos',
      category: 'analisis',
      level: 'Intermedio',
      readTime: 12,
      description: 'Domina los conceptos básicos del análisis técnico en Forex.',
      content: `
        <h2>¿Qué es el Análisis Técnico?</h2>
        <p>El análisis técnico es el estudio de los movimientos de precios históricos para predecir futuros movimientos del mercado.</p>
        
        <h3>Principios Fundamentales</h3>
        <ul>
          <li><strong>El precio lo descuenta todo:</strong> Toda la información está reflejada en el precio</li>
          <li><strong>Los precios se mueven en tendencias:</strong> Las tendencias tienden a continuar</li>
          <li><strong>La historia se repite:</strong> Los patrones tienden a repetirse</li>
        </ul>
        
        <h3>Tipos de Gráficos</h3>
        <ul>
          <li><strong>Gráfico de Líneas:</strong> Conecta precios de cierre</li>
          <li><strong>Gráfico de Barras:</strong> Muestra apertura, máximo, mínimo y cierre</li>
          <li><strong>Velas Japonesas:</strong> Representación visual más completa</li>
        </ul>
        
        <h3>Indicadores Técnicos Básicos</h3>
        <ul>
          <li><strong>Medias Móviles:</strong> Suavizan la acción del precio</li>
          <li><strong>RSI:</strong> Mide condiciones de sobrecompra/sobreventa</li>
          <li><strong>MACD:</strong> Identifica cambios de tendencia</li>
          <li><strong>Bandas de Bollinger:</strong> Miden volatilidad</li>
        </ul>
        
        <h3>Soporte y Resistencia</h3>
        <ul>
          <li><strong>Soporte:</strong> Nivel donde el precio tiende a rebotar hacia arriba</li>
          <li><strong>Resistencia:</strong> Nivel donde el precio tiende a rebotar hacia abajo</li>
          <li><strong>Ruptura:</strong> Cuando el precio atraviesa estos niveles</li>
        </ul>
      `,
      tags: ['análisis técnico', 'gráficos', 'indicadores'],
      author: 'Francisco Rojas-Aranda',
      lastUpdated: '2026-01-28'
    },
    {
      id: 'gestion-riesgo',
      title: 'Gestión de Riesgo en Forex',
      category: 'estrategias',
      level: 'Intermedio',
      readTime: 10,
      description: 'Estrategias esenciales para proteger tu capital en el trading.',
      content: `
        <h2>¿Por qué es Importante la Gestión de Riesgo?</h2>
        <p>La gestión de riesgo es el aspecto más crítico del trading exitoso. Protege tu capital y asegura la longevidad en los mercados.</p>
        
        <h3>Regla del 1-2%</h3>
        <ul>
          <li>Nunca arriesgues más del 1-2% de tu capital en una sola operación</li>
          <li>Con $10,000, máximo riesgo por operación: $100-200</li>
          <li>Permite sobrevivir a rachas perdedoras</li>
        </ul>
        
        <h3>Stop Loss</h3>
        <ul>
          <li><strong>Definición:</strong> Orden que cierra automáticamente una posición perdedora</li>
          <li><strong>Ubicación:</strong> Basado en análisis técnico, no en emociones</li>
          <li><strong>Tipos:</strong> Fijo, trailing, basado en ATR</li>
        </ul>
        
        <h3>Take Profit</h3>
        <ul>
          <li>Define tu objetivo de ganancia antes de entrar</li>
          <li>Ratio riesgo/beneficio mínimo 1:2</li>
          <li>Considera tomar ganancias parciales</li>
        </ul>
        
        <h3>Position Sizing</h3>
        <ul>
          <li><strong>Fórmula:</strong> Tamaño = (Capital × % Riesgo) / (Precio Entrada - Stop Loss)</li>
          <li>Ajusta el tamaño según la volatilidad del par</li>
          <li>Considera la correlación entre posiciones</li>
        </ul>
        
        <h3>Diversificación</h3>
        <ul>
          <li>No concentres todo en un solo par</li>
          <li>Evita pares altamente correlacionados</li>
          <li>Considera diferentes marcos temporales</li>
        </ul>
      `,
      tags: ['gestión riesgo', 'stop loss', 'position sizing'],
      author: 'Francisco Rojas-Aranda',
      lastUpdated: '2026-01-27'
    },
    {
      id: 'psicologia-trading',
      title: 'Psicología del Trading',
      category: 'psicologia',
      level: 'Avanzado',
      readTime: 15,
      description: 'Domina tus emociones y desarrolla la mentalidad ganadora.',
      content: `
        <h2>La Importancia de la Psicología</h2>
        <p>El 80% del éxito en trading depende de la psicología. Los aspectos técnicos son solo el 20%.</p>
        
        <h3>Emociones Destructivas</h3>
        <ul>
          <li><strong>Miedo:</strong> Impide tomar decisiones racionales</li>
          <li><strong>Codicia:</strong> Lleva a asumir riesgos excesivos</li>
          <li><strong>Esperanza:</strong> Mantiene posiciones perdedoras abiertas</li>
          <li><strong>Arrepentimiento:</strong> Genera decisiones impulsivas</li>
        </ul>
        
        <h3>Sesgos Cognitivos Comunes</h3>
        <ul>
          <li><strong>Sesgo de Confirmación:</strong> Buscar solo información que confirme nuestras creencias</li>
          <li><strong>Aversión a las Pérdidas:</strong> Sentir más dolor por las pérdidas que placer por las ganancias</li>
          <li><strong>Efecto Manada:</strong> Seguir a la multitud sin análisis propio</li>
        </ul>
        
        <h3>Desarrollo de Disciplina</h3>
        <ul>
          <li>Crear y seguir un plan de trading</li>
          <li>Mantener un diario de operaciones</li>
          <li>Establecer rutinas pre y post mercado</li>
          <li>Practicar mindfulness y meditación</li>
        </ul>
        
        <h3>Gestión del Estrés</h3>
        <ul>
          <li>Tomar descansos regulares</li>
          <li>Mantener vida equilibrada fuera del trading</li>
          <li>Ejercicio físico regular</li>
          <li>Buscar apoyo de otros traders</li>
        </ul>
        
        <h3>Mentalidad de Crecimiento</h3>
        <ul>
          <li>Ver las pérdidas como oportunidades de aprendizaje</li>
          <li>Enfocarse en el proceso, no solo en los resultados</li>
          <li>Educación continua</li>
          <li>Paciencia y perseverancia</li>
        </ul>
      `,
      tags: ['psicología', 'emociones', 'disciplina'],
      author: 'Francisco Rojas-Aranda',
      lastUpdated: '2026-01-26'
    },
    {
      id: 'estrategia-scalping',
      title: 'Estrategia de Scalping en Forex',
      category: 'estrategias',
      level: 'Avanzado',
      readTime: 18,
      description: 'Técnicas avanzadas para operaciones de corto plazo.',
      content: `
        <h2>¿Qué es el Scalping?</h2>
        <p>El scalping es una estrategia de trading que busca obtener pequeñas ganancias en períodos muy cortos, típicamente de segundos a minutos.</p>
        
        <h3>Características del Scalping</h3>
        <ul>
          <li>Operaciones de 1-15 minutos</li>
          <li>Objetivos de 5-20 pips por operación</li>
          <li>Alto número de operaciones diarias</li>
          <li>Requiere spreads muy bajos</li>
        </ul>
        
        <h3>Mejores Pares para Scalping</h3>
        <ul>
          <li><strong>EUR/USD:</strong> Spreads bajos, alta liquidez</li>
          <li><strong>GBP/USD:</strong> Buena volatilidad</li>
          <li><strong>USD/JPY:</strong> Movimientos predecibles</li>
          <li><strong>AUD/USD:</strong> Volatilidad moderada</li>
        </ul>
        
        <h3>Mejores Horarios</h3>
        <ul>
          <li><strong>Sesión de Londres:</strong> 08:00-12:00 GMT</li>
          <li><strong>Solapamiento Londres-Nueva York:</strong> 12:00-16:00 GMT</li>
          <li>Evitar horarios de baja liquidez</li>
        </ul>
        
        <h3>Indicadores para Scalping</h3>
        <ul>
          <li><strong>EMA 5 y 10:</strong> Señales de entrada rápidas</li>
          <li><strong>Estocástico:</strong> Condiciones de sobrecompra/sobreventa</li>
          <li><strong>Bandas de Bollinger:</strong> Volatilidad y reversiones</li>
          <li><strong>Volume:</strong> Confirmación de movimientos</li>
        </ul>
        
        <h3>Reglas de Entrada</h3>
        <ul>
          <li>EMA 5 cruza por encima de EMA 10 = Señal de compra</li>
          <li>Estocástico sale de zona de sobreventa</li>
          <li>Precio toca banda inferior de Bollinger</li>
          <li>Confirmación con volumen</li>
        </ul>
        
        <h3>Gestión de Riesgo en Scalping</h3>
        <ul>
          <li>Stop loss de 5-10 pips</li>
          <li>Take profit de 10-20 pips</li>
          <li>Ratio riesgo/beneficio 1:2 mínimo</li>
          <li>Máximo 2-3% de riesgo total por día</li>
        </ul>
      `,
      tags: ['scalping', 'estrategias', 'corto plazo'],
      author: 'Francisco Rojas-Aranda',
      lastUpdated: '2026-01-25'
    }
  ];

  // Glosario Técnico
  const glossaryTerms = [
    {
      id: 'pamm',
      term: 'PAMM (Percentage Allocation Management Module)',
      category: 'glosario',
      definition: 'Sistema de gestión de cuentas que permite a un trader profesional (Money Manager) operar con el capital de múltiples inversores, distribuyendo automáticamente las ganancias y pérdidas proporcionalmente según el capital invertido por cada cliente.',
      details: `
        <h3>Características del PAMM:</h3>
        <ul>
          <li><strong>Gestión Profesional:</strong> Un trader experimentado maneja todas las operaciones</li>
          <li><strong>Distribución Proporcional:</strong> Ganancias y pérdidas se reparten según el capital invertido</li>
          <li><strong>Transparencia:</strong> Los inversores pueden ver el historial de operaciones en tiempo real</li>
          <li><strong>Control de Riesgo:</strong> Los inversores pueden retirar su capital en cualquier momento</li>
          <li><strong>Comisiones:</strong> El Money Manager cobra un porcentaje de las ganancias (típicamente 20-30%)</li>
        </ul>
        
        <h3>Ventajas para Inversores:</h3>
        <ul>
          <li>Acceso a estrategias profesionales sin conocimiento técnico</li>
          <li>Diversificación automática del riesgo</li>
          <li>Menor tiempo requerido para gestión activa</li>
          <li>Posibilidad de invertir con capitales pequeños</li>
        </ul>
      `,
      tags: ['pamm', 'gestión', 'inversión'],
      relatedTerms: ['MAM', 'Copy Trading', 'Money Manager']
    },
    {
      id: 'mam',
      term: 'MAM (Multi Account Manager)',
      category: 'glosario',
      definition: 'Plataforma que permite a un trader profesional gestionar múltiples cuentas de trading simultáneamente, ejecutando operaciones que se replican automáticamente en todas las cuentas vinculadas con diferentes tamaños de lote según el capital de cada cuenta.',
      details: `
        <h3>Funcionamiento del MAM:</h3>
        <ul>
          <li><strong>Cuenta Master:</strong> El Money Manager opera desde una cuenta principal</li>
          <li><strong>Cuentas Slave:</strong> Las operaciones se replican automáticamente en cuentas de inversores</li>
          <li><strong>Escalado Proporcional:</strong> El tamaño de las operaciones se ajusta según el capital de cada cuenta</li>
          <li><strong>Ejecución Simultánea:</strong> Todas las operaciones se ejecutan al mismo tiempo</li>
        </ul>
        
        <h3>Diferencias con PAMM:</h3>
        <ul>
          <li><strong>Cuentas Separadas:</strong> Cada inversor mantiene su propia cuenta individual</li>
          <li><strong>Mayor Control:</strong> Los inversores pueden ver y controlar sus operaciones específicas</li>
          <li><strong>Flexibilidad:</strong> Posibilidad de personalizar parámetros por cuenta</li>
          <li><strong>Transparencia Total:</strong> Acceso completo al historial de la cuenta individual</li>
        </ul>
        
        <h3>Ventajas del MAM:</h3>
        <ul>
          <li>Mantenimiento de cuentas individuales</li>
          <li>Mayor transparencia y control</li>
          <li>Posibilidad de personalización</li>
          <li>Mejor para inversores institucionales</li>
        </ul>
      `,
      tags: ['mam', 'multi-account', 'gestión'],
      relatedTerms: ['PAMM', 'Copy Trading', 'Master Account']
    },
    {
      id: 'copy-trading',
      term: 'Copy Trading',
      category: 'glosario',
      definition: 'Sistema que permite a los inversores copiar automáticamente las operaciones de traders exitosos en tiempo real. Cada operación ejecutada por el trader copiado se replica instantáneamente en la cuenta del seguidor con el tamaño proporcional al capital disponible.',
      details: `
        <h3>Cómo Funciona el Copy Trading:</h3>
        <ul>
          <li><strong>Selección de Trader:</strong> Los inversores eligen traders basándose en su historial y rendimiento</li>
          <li><strong>Copia Automática:</strong> Las operaciones se replican automáticamente en tiempo real</li>
          <li><strong>Proporcionalidad:</strong> El tamaño de las operaciones se ajusta al capital del seguidor</li>
          <li><strong>Control Total:</strong> Los seguidores pueden pausar, modificar o cerrar operaciones</li>
        </ul>
        
        <h3>Métricas Importantes:</h3>
        <ul>
          <li><strong>Drawdown Máximo:</strong> Mayor pérdida desde un pico hasta un valle</li>
          <li><strong>Profit Factor:</strong> Relación entre ganancias brutas y pérdidas brutas</li>
          <li><strong>Win Rate:</strong> Porcentaje de operaciones ganadoras</li>
          <li><strong>Sharpe Ratio:</strong> Rendimiento ajustado por riesgo</li>
        </ul>
        
        <h3>Ventajas del Copy Trading:</h3>
        <ul>
          <li>Acceso inmediato a estrategias probadas</li>
          <li>Aprendizaje observando traders exitosos</li>
          <li>Diversificación copiando múltiples traders</li>
          <li>Control total sobre la cuenta propia</li>
        </ul>
        
        <h3>Consideraciones de Riesgo:</h3>
        <ul>
          <li>El rendimiento pasado no garantiza resultados futuros</li>
          <li>Importante diversificar entre múltiples traders</li>
          <li>Monitorear regularmente el rendimiento</li>
          <li>Establecer límites de pérdida</li>
        </ul>
      `,
      tags: ['copy-trading', 'social-trading', 'automatización'],
      relatedTerms: ['PAMM', 'MAM', 'Signal Provider']
    },
    {
      id: 'money-manager',
      term: 'Money Manager',
      category: 'glosario',
      definition: 'Trader profesional certificado que gestiona el capital de otros inversores a través de sistemas como PAMM, MAM o Copy Trading. Tiene la responsabilidad fiduciaria de operar de manera profesional y transparente, cobrando comisiones basadas en el rendimiento.',
      details: `
        <h3>Responsabilidades del Money Manager:</h3>
        <ul>
          <li><strong>Gestión Profesional:</strong> Aplicar estrategias de trading consistentes y probadas</li>
          <li><strong>Gestión de Riesgo:</strong> Implementar medidas de control de riesgo apropiadas</li>
          <li><strong>Transparencia:</strong> Proporcionar informes regulares y acceso al historial</li>
          <li><strong>Comunicación:</strong> Mantener informados a los inversores sobre estrategias y cambios</li>
        </ul>
        
        <h3>Cualificaciones Típicas:</h3>
        <ul>
          <li>Experiencia mínima de 2-5 años en trading</li>
          <li>Historial verificable de rendimiento</li>
          <li>Certificaciones financieras relevantes</li>
          <li>Conocimiento profundo de gestión de riesgo</li>
        </ul>
        
        <h3>Estructura de Comisiones:</h3>
        <ul>
          <li><strong>Performance Fee:</strong> 20-30% de las ganancias netas</li>
          <li><strong>Management Fee:</strong> 1-2% anual del capital gestionado (opcional)</li>
          <li><strong>High Water Mark:</strong> Solo cobra comisiones después de recuperar pérdidas previas</li>
        </ul>
      `,
      tags: ['money-manager', 'gestión-profesional', 'comisiones'],
      relatedTerms: ['PAMM', 'MAM', 'Performance Fee']
    },
    {
      id: 'drawdown',
      term: 'Drawdown',
      category: 'glosario',
      definition: 'Medida de la pérdida máxima experimentada por una cuenta de trading desde su pico más alto hasta su punto más bajo, expresada como porcentaje. Es un indicador crucial para evaluar el riesgo de una estrategia de trading.',
      details: `
        <h3>Tipos de Drawdown:</h3>
        <ul>
          <li><strong>Drawdown Máximo:</strong> La mayor pérdida desde un pico hasta un valle</li>
          <li><strong>Drawdown Actual:</strong> La pérdida actual desde el último pico</li>
          <li><strong>Drawdown Relativo:</strong> Pérdida como porcentaje del capital inicial</li>
        </ul>
        
        <h3>Importancia en Gestión de Cuentas:</h3>
        <ul>
          <li>Indicador clave de riesgo para inversores</li>
          <li>Determina la tolerancia al riesgo necesaria</li>
          <li>Influye en las decisiones de asignación de capital</li>
          <li>Criterio para evaluar Money Managers</li>
        </ul>
        
        <h3>Niveles de Drawdown Típicos:</h3>
        <ul>
          <li><strong>Conservador:</strong> 5-10% drawdown máximo</li>
          <li><strong>Moderado:</strong> 10-20% drawdown máximo</li>
          <li><strong>Agresivo:</strong> 20-30% drawdown máximo</li>
          <li><strong>Alto Riesgo:</strong> >30% drawdown máximo</li>
        </ul>
      `,
      tags: ['drawdown', 'riesgo', 'evaluación'],
      relatedTerms: ['Risk Management', 'Performance', 'Volatilidad']
    },
    {
      id: 'high-water-mark',
      term: 'High Water Mark',
      category: 'glosario',
      definition: 'Nivel más alto de valor que ha alcanzado una cuenta de inversión. Los Money Managers solo pueden cobrar comisiones de rendimiento después de superar este nivel, asegurando que no cobren comisiones por recuperar pérdidas previas.',
      details: `
        <h3>Funcionamiento del High Water Mark:</h3>
        <ul>
          <li><strong>Establecimiento:</strong> Se fija en el valor más alto alcanzado por la cuenta</li>
          <li><strong>Actualización:</strong> Solo se actualiza cuando se alcanza un nuevo máximo</li>
          <li><strong>Protección:</strong> Evita que se cobren comisiones por recuperar pérdidas</li>
          <li><strong>Reinicio:</strong> Generalmente se mantiene durante toda la relación de inversión</li>
        </ul>
        
        <h3>Ejemplo Práctico:</h3>
        <ul>
          <li>Capital inicial: $10,000 (High Water Mark inicial)</li>
          <li>Crece a $12,000: Nuevo High Water Mark, comisión sobre $2,000</li>
          <li>Baja a $11,000: High Water Mark permanece en $12,000</li>
          <li>Sube a $13,000: Nuevo High Water Mark, comisión solo sobre $1,000</li>
        </ul>
        
        <h3>Beneficios para Inversores:</h3>
        <ul>
          <li>Protección contra doble cobro de comisiones</li>
          <li>Incentiva al Money Manager a recuperar pérdidas</li>
          <li>Alinea intereses entre inversor y gestor</li>
          <li>Estándar de la industria en gestión profesional</li>
        </ul>
      `,
      tags: ['high-water-mark', 'comisiones', 'protección'],
      relatedTerms: ['Performance Fee', 'Money Manager', 'Comisiones']
    }
  ];

  const allContent = [...knowledgeBase, ...glossaryTerms];

  const filteredArticles = allContent.filter(article => {
    const matchesCategory = selectedCategory === 'todos' || article.category === selectedCategory;
    const title = 'title' in article ? article.title : article.term;
    const description = 'description' in article ? article.description : article.definition;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Principiante': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Avanzado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.BUSINESS_OFFICE_4} alt="Base de Conocimientos Forex" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary px-4 py-1">
              Base de Conocimientos Forex
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Domina el <span className="text-primary">Trading Forex</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Accede a nuestra biblioteca completa de conocimientos sobre Forex, desde conceptos básicos hasta estrategias avanzadas.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos, conceptos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base Articles */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron artículos</h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda o selecciona una categoría diferente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <KnowledgeArticleCard article={article} getLevelColor={getLevelColor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para Aplicar estos Conocimientos?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Pon en práctica lo aprendido con nuestra plataforma de trading y el apoyo de nuestros expertos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Abrir Cuenta Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={() => setShowProfileModal(true)}
              >
                Contactar Asesor
              </Button>
            </div>
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
};

// Knowledge Article Card Component
const KnowledgeArticleCard = ({ article, getLevelColor }: { 
  article: any, 
  getLevelColor: (level: string) => string 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isGlossaryTerm = 'term' in article;

  return (
    <Card className="h-full border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/40 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          {isGlossaryTerm ? (
            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
              Glosario
            </Badge>
          ) : (
            'level' in article && (
              <Badge className={`text-xs ${getLevelColor(article.level)}`}>
                {article.level}
              </Badge>
            )
          )}
          {!isGlossaryTerm && 'readTime' in article && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min
            </div>
          )}
        </div>
        
        <CardTitle className="text-xl font-bold text-foreground leading-tight">
          {'title' in article ? article.title : article.term}
        </CardTitle>
        
        <CardDescription className="text-sm leading-relaxed">
          {'description' in article ? article.description : article.definition}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        <div className="flex flex-wrap gap-1 mb-4">
          {(article.tags || []).slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs border-primary/30 text-primary">
              {tag}
            </Badge>
          ))}
        </div>
        
        {isGlossaryTerm && 'relatedTerms' in article && article.relatedTerms && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Términos relacionados:</p>
            <div className="flex flex-wrap gap-1">
              {article.relatedTerms.slice(0, 3).map((term: string) => (
                <Badge key={term} variant="secondary" className="text-xs">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-border/50">
          {!isGlossaryTerm && 'author' in article && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <span>{new Date(article.lastUpdated).toLocaleDateString('es-ES', { 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full text-primary hover:text-primary-foreground hover:bg-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Leer menos' : (isGlossaryTerm ? 'Ver definición completa' : 'Leer artículo')}
            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardContent>
      
      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-6"
        >
          <div 
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: 'details' in article ? article.details : article.content }}
          />
        </motion.div>
      )}
    </Card>
  );
};

export default BaseConocimientos;