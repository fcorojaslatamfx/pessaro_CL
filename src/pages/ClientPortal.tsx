import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, BarChart2, BookOpen,
  LogOut, ChevronRight, Clock, Target, Shield, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, Zap,
  User, Activity, RefreshCw, Lock, Star, Edit3, Save, X,
  Search, TrendingDown, DollarSign, Check, Maximize2, Minimize2,
  Bell, Newspaper, Cpu, BookMarked, Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  TradingViewAdvancedChart,
  TradingViewSymbolOverview,
  TradingViewEconomicCalendar,
  TradingViewMarketScreener,
  TradingViewTickerTape
} from '@/components/TradingViewWidgets';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Article {
  id: string; title: string; summary: string; category: string;
  author_name: string; author_role: string; read_time_minutes: number;
  tags: string[]; published_at: string;
}
interface MarketAnalysis {
  id: string; title: string; instrument: string;
  direction: 'alcista' | 'bajista' | 'lateral' | 'neutral';
  timeframe: string; summary: string; key_levels: any;
  confidence_level: number; valid_until: string; published_at: string;
}
interface QuoteData {
  symbol: string; name: string; price: number; change: number;
  changePercent: number; high: number; low: number; currency: string;
  category: string;
}
interface NewsItem {
  id: string; title: string; summary?: string; url?: string;
  source: string; sentiment?: string; published_at?: string;
}
interface TechAlert {
  id: string; instrument: string; alert_type: string; level?: number;
  description: string; severity: string; created_at: string;
}

// ─── Twelve Data config ───────────────────────────────────────────────────────
const TD_KEY  = '6c1b8102beef4f668bbfef129df3bcf9';
const TD_BASE = 'https://api.twelvedata.com';

// Todos los instrumentos — sin límite
const ALL_INSTRUMENTS = [
  // Forex majors
  { symbol: 'EUR/USD', name: 'Euro / Dólar',           cat: 'Forex'      },
  { symbol: 'GBP/USD', name: 'Libra / Dólar',          cat: 'Forex'      },
  { symbol: 'USD/JPY', name: 'Dólar / Yen',             cat: 'Forex'      },
  { symbol: 'USD/CHF', name: 'Dólar / Franco',          cat: 'Forex'      },
  { symbol: 'AUD/USD', name: 'Australiano / Dólar',     cat: 'Forex'      },
  { symbol: 'NZD/USD', name: 'Neozelandés / Dólar',     cat: 'Forex'      },
  { symbol: 'USD/CAD', name: 'Dólar / Canadiense',      cat: 'Forex'      },
  // Forex minors
  { symbol: 'EUR/GBP', name: 'Euro / Libra',            cat: 'Forex'      },
  { symbol: 'EUR/JPY', name: 'Euro / Yen',              cat: 'Forex'      },
  { symbol: 'GBP/JPY', name: 'Libra / Yen',             cat: 'Forex'      },
  { symbol: 'EUR/CHF', name: 'Euro / Franco',           cat: 'Forex'      },
  { symbol: 'AUD/JPY', name: 'Australiano / Yen',       cat: 'Forex'      },
  // Commodities
  { symbol: 'XAU/USD', name: 'Oro',                     cat: 'Commodities'},
  { symbol: 'XAG/USD', name: 'Plata',                   cat: 'Commodities'},
  { symbol: 'WTI/USD', name: 'Petróleo WTI',            cat: 'Commodities'},
  { symbol: 'XPT/USD', name: 'Platino',                 cat: 'Commodities'},
  // Índices
  { symbol: 'SPX',     name: 'S&P 500',                 cat: 'Índices'    },
  { symbol: 'IXIC',    name: 'Nasdaq 100',              cat: 'Índices'    },
  { symbol: 'DJI',     name: 'Dow Jones',               cat: 'Índices'    },
  { symbol: 'FTSE',    name: 'FTSE 100',                cat: 'Índices'    },
  { symbol: 'DAX',     name: 'DAX 40',                  cat: 'Índices'    },
  { symbol: 'NI225',   name: 'Nikkei 225',              cat: 'Índices'    },
  // Crypto
  { symbol: 'BTC/USD', name: 'Bitcoin',                 cat: 'Crypto'     },
  { symbol: 'ETH/USD', name: 'Ethereum',                cat: 'Crypto'     },
  { symbol: 'SOL/USD', name: 'Solana',                  cat: 'Crypto'     },
  { symbol: 'XRP/USD', name: 'Ripple',                  cat: 'Crypto'     },
  { symbol: 'BNB/USD', name: 'BNB',                     cat: 'Crypto'     },
  { symbol: 'ADA/USD', name: 'Cardano',                 cat: 'Crypto'     },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const directionConfig = {
  alcista: { label: 'Alcista', color: '#00d084', Icon: ArrowUpRight,   bg: 'rgba(0,208,132,0.12)'  },
  bajista: { label: 'Bajista', color: '#ff4757', Icon: ArrowDownRight, bg: 'rgba(255,71,87,0.12)'  },
  lateral: { label: 'Lateral', color: '#ffa502', Icon: Minus,          bg: 'rgba(255,165,2,0.12)'  },
  neutral: { label: 'Neutral', color: '#a4b0be', Icon: Minus,          bg: 'rgba(164,176,190,0.12)'},
};
const alertSeverityConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#ff4757', bg: 'rgba(255,71,87,0.12)',   label: '🔴 Crítica'  },
  high:     { color: '#ffa502', bg: 'rgba(255,165,2,0.12)',   label: '🟠 Alta'     },
  medium:   { color: '#fdcb6e', bg: 'rgba(253,203,110,0.12)', label: '🟡 Media'    },
  low:      { color: '#a4b0be', bg: 'rgba(164,176,190,0.12)', label: '⚪ Baja'     },
};
const categoryColors: Record<string, string> = {
  analisis: '#6c5ce7', estrategia: '#0984e3', educacion: '#00b894',
  macroeconomia: '#e17055', divisas: '#fdcb6e', commodities: '#a29bfe', criptomonedas: '#fd79a8',
};
const categoryLabels: Record<string, string> = {
  analisis: 'Análisis', estrategia: 'Estrategia', educacion: 'Educación',
  macroeconomia: 'Macro', divisas: 'Divisas', commodities: 'Commodities', criptomonedas: 'Cripto',
};
const RISK_OPTIONS    = ['conservador','moderado','moderado-agresivo','agresivo'];
const EXP_OPTIONS     = ['principiante','intermedio','avanzado','experto'];
const CAPITAL_OPTIONS = ['menos de $5,000','$5,000 - $25,000','$25,000 - $100,000','más de $100,000'];
const HORIZON_OPTIONS = ['corto plazo (< 1 año)','mediano plazo (1-3 años)','largo plazo (> 3 años)'];

const NAV = [
  { id: 'overview',  label: 'Resumen',    Icon: LayoutDashboard },
  { id: 'markets',   label: 'Mercados',   Icon: TrendingUp      },
  { id: 'chart',     label: 'Gráfico',    Icon: BarChart2       },
  { id: 'screener',  label: 'Screener',   Icon: Search          },
  { id: 'analysis',  label: 'Análisis AI',Icon: Cpu             },
  { id: 'exclusive', label: 'Exclusivos', Icon: BookOpen        },
  { id: 'calendar',  label: 'Calendario', Icon: Activity        },
  { id: 'account',   label: 'Mi Cuenta',  Icon: User            },
];

const SUPABASE_URL = 'https://ldlflxujrjihiybrcree.supabase.co';

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, Icon, accent = '#6c5ce7', delay = 0 }: any) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)` }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 11, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em' }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: '#a4b0be', marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={accent} />
      </div>
    </div>
  </motion.div>
);

const QuoteCard = ({ q, onClick }: { q: QuoteData; onClick?: () => void }) => {
  const up = q.changePercent >= 0;
  return (
    <motion.div whileHover={{ translateY: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} onClick={onClick}
      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
        border: `1px solid ${up ? 'rgba(0,208,132,0.2)' : 'rgba(255,71,87,0.2)'}`,
        borderRadius: 12, padding: '14px 16px', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f2f6', letterSpacing: '0.04em', marginBottom: 2 }}>{q.symbol}</p>
          <p style={{ fontSize: 10, color: '#636e72' }}>{q.name}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: up ? 'rgba(0,208,132,0.12)' : 'rgba(255,71,87,0.12)',
          padding: '2px 7px', borderRadius: 6 }}>
          {up ? <ArrowUpRight size={11} color="#00d084" /> : <ArrowDownRight size={11} color="#ff4757" />}
          <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#00d084' : '#ff4757' }}>
            {up ? '+' : ''}{q.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em', marginBottom: 6 }}>
        {q.price > 1000 ? q.price.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : q.price.toFixed(q.price < 10 ? 5 : 3)}
        <span style={{ fontSize: 10, color: '#636e72', marginLeft: 4 }}>{q.currency}</span>
      </p>
      <div style={{ display: 'flex', gap: 14 }}>
        <div><p style={{ fontSize: 9, color: '#636e72', marginBottom: 2 }}>Máx.</p><p style={{ fontSize: 11, color: '#00d084' }}>{q.high > 1000 ? q.high.toFixed(2) : q.high.toFixed(5)}</p></div>
        <div><p style={{ fontSize: 9, color: '#636e72', marginBottom: 2 }}>Mín.</p><p style={{ fontSize: 11, color: '#ff4757' }}>{q.low > 1000 ? q.low.toFixed(2) : q.low.toFixed(5)}</p></div>
        <div><p style={{ fontSize: 9, color: '#636e72', marginBottom: 2 }}>Cambio</p><p style={{ fontSize: 11, color: up ? '#00d084' : '#ff4757' }}>{up ? '+' : ''}{q.change > 1 ? q.change.toFixed(2) : q.change.toFixed(5)}</p></div>
      </div>
    </motion.div>
  );
};

const AnalysisCard = ({ analysis }: { analysis: MarketAnalysis }) => {
  const dir = directionConfig[analysis.direction] || directionConfig.neutral;
  const DirIcon = dir.Icon;
  const validUntil = new Date(analysis.valid_until);
  const expiringSoon = (validUntil.getTime() - Date.now()) < 24 * 3600 * 1000;
  return (
    <motion.div whileHover={{ translateY: -2 }}
      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${dir.color}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f2f6', letterSpacing: '0.04em' }}>{analysis.instrument}</span>
            <span style={{ fontSize: 11, color: '#636e72', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{analysis.timeframe}</span>
            <span style={{ fontSize: 10, color: '#a29bfe', background: 'rgba(108,92,231,0.12)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Cpu size={9} />AI
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#a4b0be' }}>{analysis.title}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: dir.bg, padding: '4px 10px', borderRadius: 6, marginBottom: 4 }}>
            <DirIcon size={13} color={dir.color} />
            <span style={{ fontSize: 12, fontWeight: 600, color: dir.color }}>{dir.label}</span>
          </div>
          <p style={{ fontSize: 11, color: '#636e72' }}>{analysis.confidence_level}% confianza</p>
        </div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 10 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.confidence_level}%` }}
          transition={{ delay: 0.3, duration: 0.8 }} style={{ height: '100%', background: dir.color, borderRadius: 2 }} />
      </div>
      <p style={{ fontSize: 13, color: '#a4b0be', marginBottom: 12, lineHeight: 1.6 }}>{analysis.summary}</p>
      {analysis.key_levels && (analysis.key_levels.entry || analysis.key_levels.sl) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 10 }}>
          {analysis.key_levels.entry && <div style={{ fontSize: 11, background: 'rgba(108,92,231,0.15)', color: '#a29bfe', padding: '3px 8px', borderRadius: 4 }}>Entrada: {analysis.key_levels.entry}</div>}
          {analysis.key_levels.sl     && <div style={{ fontSize: 11, background: 'rgba(255,71,87,0.12)',  color: '#ff6b81', padding: '3px 8px', borderRadius: 4 }}>SL: {analysis.key_levels.sl}</div>}
          {analysis.key_levels.tp?.[0] && <div style={{ fontSize: 11, background: 'rgba(0,208,132,0.12)', color: '#00d084', padding: '3px 8px', borderRadius: 4 }}>TP1: {analysis.key_levels.tp[0]}</div>}
          {analysis.key_levels.tp?.[1] && <div style={{ fontSize: 11, background: 'rgba(0,208,132,0.12)', color: '#00d084', padding: '3px 8px', borderRadius: 4 }}>TP2: {analysis.key_levels.tp[1]}</div>}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {expiringSoon && <AlertTriangle size={12} color="#ffa502" />}
          <span style={{ fontSize: 11, color: expiringSoon ? '#ffa502' : '#636e72' }}>Válido: {validUntil.toLocaleDateString('es-CL')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#636e72' }}>
          <Target size={11} /><span>Pessaro Research</span>
        </div>
      </div>
    </motion.div>
  );
};

const ArticleCard = ({ article, onClick }: { article: Article; onClick: () => void }) => {
  const catColor = categoryColors[article.category] || '#6c5ce7';
  return (
    <motion.div whileHover={{ translateY: -2 }} onClick={onClick}
      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: catColor, textTransform: 'uppercase', letterSpacing: '0.08em', background: `${catColor}20`, padding: '3px 8px', borderRadius: 4 }}>
          {categoryLabels[article.category] || article.category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#636e72', fontSize: 11 }}>
          <Clock size={11} /><span>{article.read_time_minutes} min</span>
        </div>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f2f6', lineHeight: 1.4, marginBottom: 8 }}>{article.title}</h3>
      <p style={{ fontSize: 12, color: '#a4b0be', lineHeight: 1.6, marginBottom: 14 }}>{article.summary}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><p style={{ fontSize: 12, fontWeight: 600, color: '#dfe6e9' }}>{article.author_name}</p><p style={{ fontSize: 11, color: '#636e72' }}>{article.author_role}</p></div>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(108,92,231,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={13} color="#6c5ce7" />
        </div>
      </div>
    </motion.div>
  );
};

const ArticleModal = ({ article, onClose }: { article: Article | null; onClose: () => void }) => {
  if (!article) return null;
  const catColor = categoryColors[article.category] || '#6c5ce7';
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
            padding: 32, maxWidth: 700, width: '100%', maxHeight: '80vh', overflowY: 'auto' as const }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: catColor, textTransform: 'uppercase',
              background: `${catColor}20`, padding: '3px 8px', borderRadius: 4 }}>
              {categoryLabels[article.category]}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#636e72', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f2f6', lineHeight: 1.3, marginBottom: 12 }}>{article.title}</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div><p style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9' }}>{article.author_name}</p><p style={{ fontSize: 12, color: '#636e72' }}>{article.author_role}</p></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#636e72', fontSize: 12 }}><Clock size={12} /><span>{article.read_time_minutes} min</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffa502', fontSize: 12 }}><Lock size={12} /><span>Exclusivo</span></div>
          </div>
          <p style={{ fontSize: 15, color: '#a4b0be', lineHeight: 1.8 }}>{article.summary}</p>
          {article.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginTop: 20 }}>
              {article.tags.map(tag => <span key={tag} style={{ fontSize: 11, color: '#6c5ce7', background: 'rgba(108,92,231,0.15)', padding: '3px 8px', borderRadius: 4 }}>#{tag}</span>)}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClientPortal: React.FC = () => {
  const [clientData, setClientData]           = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState('overview');
  const [articles, setArticles]               = useState<Article[]>([]);
  const [analysis, setAnalysis]               = useState<MarketAnalysis[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [lastRefresh, setLastRefresh]         = useState(new Date());
  const [showAdvisorPopup, setShowAdvisorPopup] = useState(false);

  // Mercados
  const [quotes, setQuotes]               = useState<QuoteData[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError]     = useState('');
  const [marketFilter, setMarketFilter]   = useState('Todos');
  const [marketSearch, setMarketSearch]   = useState('');

  // Gráfico fullscreen
  const [chartSymbol, setChartSymbol]   = useState('EURUSD');
  const [chartFull, setChartFull]       = useState(false);

  // Screener
  const [screenerMarket, setScreenerMarket] = useState<'forex' | 'crypto' | 'america'>('forex');

  // Análisis AI
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState('');
  const [generating, setGenerating]   = useState(false);
  const [alerts, setAlerts]           = useState<TechAlert[]>([]);
  const [news, setNews]               = useState<NewsItem[]>([]);

  // Exclusivos
  const [exclusiveTab, setExclusiveTab] = useState<'articles' | 'recommendations' | 'news' | 'alerts'>('articles');
  const [recommendations, setRecommendations] = useState<MarketAnalysis[]>([]);

  // Mi Cuenta
  const [editMode, setEditMode]     = useState(false);
  const [editData, setEditData]     = useState<any>({});
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const navigate = useNavigate();

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/portal-cliente', { replace: true }); return; }

      const [profileRes, accountRes, articlesRes, analysisRes] = await Promise.all([
        supabase.from('client_profiles_2026_02_08_22_02').select('*').eq('user_id', user.id).single(),
        supabase.from('trading_accounts_2026_02_08_22_02').select('*').eq('user_id', user.id).single(),
        supabase.from('client_exclusive_articles_2026_03_11').select('id,title,summary,category,author_name,author_role,read_time_minutes,tags,published_at').eq('is_published', true).order('published_at', { ascending: false }),
        supabase.from('client_market_analysis_2026_03_11').select('*').eq('is_published', true).order('published_at', { ascending: false }),
      ]);

      if (profileRes.data) {
        setClientData({ profile: profileRes.data, account: accountRes.data || null });
        setEditData({
          first_name: profileRes.data.first_name || '', last_name: profileRes.data.last_name || '',
          phone: profileRes.data.phone || '', risk_tolerance: profileRes.data.risk_tolerance || '',
          experience_level: profileRes.data.experience_level || '',
          investment_capital: profileRes.data.investment_capital || '',
          investment_horizon: profileRes.data.investment_horizon || '',
        });
      }
      if (articlesRes.data) setArticles(articlesRes.data as Article[]);
      if (analysisRes.data) {
        setAnalysis(analysisRes.data as MarketAnalysis[]);
        setRecommendations(analysisRes.data as MarketAnalysis[]);
      }
    } catch (err) { console.error('loadAll:', err); }
    finally { setLoading(false); }
  };

  // ── Cotizaciones Twelve Data (batching de 8) ──────────────────────────────
  const loadQuotes = useCallback(async () => {
    setQuotesLoading(true); setQuotesError('');
    try {
      const BATCH = 8;
      const allResults: QuoteData[] = [];
      for (let i = 0; i < ALL_INSTRUMENTS.length; i += BATCH) {
        const batch = ALL_INSTRUMENTS.slice(i, i + BATCH);
        const symbols = batch.map(s => s.symbol).join(',');
        const res = await fetch(`${TD_BASE}/quote?symbol=${encodeURIComponent(symbols)}&apikey=${TD_KEY}`);
        if (!res.ok) continue;
        const data = await res.json();
        batch.forEach(ins => {
          const d = data[ins.symbol] || data[ins.symbol.replace('/','')] || {};
          if (d.close || d.price) {
            allResults.push({
              symbol: ins.symbol, name: ins.name, category: ins.cat,
              price:         parseFloat(d.close || d.price || '0'),
              change:        parseFloat(d.change || '0'),
              changePercent: parseFloat(d.percent_change || '0'),
              high:          parseFloat(d.high || '0'),
              low:           parseFloat(d.low || '0'),
              currency:      d.currency || 'USD',
            });
          }
        });
        // Pequeño delay entre batches para no saturar la API
        if (i + BATCH < ALL_INSTRUMENTS.length) await new Promise(r => setTimeout(r, 300));
      }
      setQuotes(allResults);
    } catch (e: any) { setQuotesError('No se pudieron cargar cotizaciones.'); }
    finally { setQuotesLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'markets') loadQuotes(); }, [activeTab, loadQuotes]);

  // ── Cargar alertas y noticias ────────────────────────────────────────────
  const loadAlertsAndNews = useCallback(async () => {
    try {
      const { data: alertsData } = await supabase
        .from('client_technical_alerts_2026_03_13').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (alertsData) setAlerts(alertsData as TechAlert[]);

      const { data: newsData } = await supabase
        .from('client_news_cache_2026_03_13').select('*').order('fetched_at', { ascending: false }).limit(20);
      if (newsData) setNews(newsData as NewsItem[]);
    } catch (e) { console.error('loadAlertsAndNews:', e); }
  }, []);

  useEffect(() => {
    if (activeTab === 'exclusive' || activeTab === 'analysis') loadAlertsAndNews();
  }, [activeTab, loadAlertsAndNews]);

  // ── Generar análisis AI ──────────────────────────────────────────────────
  const generateAiAnalysis = async () => {
    setGenerating(true); setAiError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sin sesión');
      const res = await fetch(`${SUPABASE_URL}/functions/v1/portal_ai_analysis_2026_03_13`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'generate', instruments: ['EUR/USD','GBP/USD','XAU/USD','BTC/USD','USD/JPY','SPX','ETH/USD'] }),
      });
      const json = await res.json();
      if (json.data) { setAnalysis(json.data); setRecommendations(json.data); }
    } catch (e: any) { setAiError('Error al generar análisis. Intenta de nuevo.'); }
    finally { setGenerating(false); }
  };

  // ── Guardar perfil ───────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true); setSaveStatus('idle');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      const { error } = await supabase.from('client_profiles_2026_02_08_22_02').update({
        ...editData, updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
      if (error) throw error;
      setClientData((prev: any) => ({ ...prev, profile: { ...prev.profile, ...editData } }));
      setSaveStatus('ok'); setEditMode(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch { setSaveStatus('error'); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/portal-cliente', { replace: true }); };
  const handleRefresh = () => { setLoading(true); setLastRefresh(new Date()); loadAll(); };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0f17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '3px solid rgba(108,92,231,0.2)', borderTopColor: '#6c5ce7', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#636e72', fontSize: 14 }}>Cargando portal seguro...</p>
      </div>
    </div>
  );
  if (!clientData?.profile) return (
    <div style={{ minHeight: '100vh', background: '#0d0f17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <Shield size={40} color="#ff4757" style={{ margin: '0 auto 16px', display: 'block' }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f1f2f6', marginBottom: 8 }}>Perfil no encontrado</h3>
        <p style={{ color: '#636e72', fontSize: 14, marginBottom: 24 }}>Contacta a soporte@pessarocapital.com</p>
        <button onClick={() => navigate('/')} style={{ background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 14 }}>Volver al inicio</button>
      </div>
    </div>
  );

  const { profile, account } = clientData;
  const CATS = ['Todos', ...Array.from(new Set(quotes.map(q => q.category)))];
  const filteredQuotes = quotes.filter(q => {
    const matchCat = marketFilter === 'Todos' || q.category === marketFilter;
    const matchSearch = !marketSearch || q.symbol.toLowerCase().includes(marketSearch.toLowerCase()) || q.name.toLowerCase().includes(marketSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0d0f17', display: 'flex', position: 'relative' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      {!chartFull && (
        <aside style={{ width: 220, background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#6c5ce7,#0984e3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.01em' }}>Pessaro</p>
                <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal Cliente</p>
              </div>
            </div>
          </div>
          <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' as const }}>
            {NAV.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <motion.button key={id} whileHover={{ x: 2 }} onClick={() => setActiveTab(id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: active ? 'linear-gradient(135deg,rgba(108,92,231,0.25),rgba(9,132,227,0.15))' : 'transparent',
                    color: active ? '#a29bfe' : '#636e72', fontWeight: active ? 600 : 400, fontSize: 13, marginBottom: 2,
                    borderLeft: active ? '2px solid #6c5ce7' : '2px solid transparent', transition: 'all 0.15s' }}>
                  <Icon size={16} />{label}
                </motion.button>
              );
            })}
          </nav>
          <div style={{ padding: '16px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6c5ce7,#0984e3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {profile.first_name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#dfe6e9' }}>{profile.first_name}</p>
                <p style={{ fontSize: 10, color: '#636e72' }}>{account?.account_number || 'N/A'}</p>
              </div>
            </div>
            <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,71,87,0.3)',
              background: 'rgba(255,71,87,0.08)', color: '#ff6b81', cursor: 'pointer', fontSize: 12 }}>
              <LogOut size={14} />Cerrar sesión
            </button>
          </div>
        </aside>
      )}

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ marginLeft: chartFull ? 0 : 220, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Ticker tape */}
        {!chartFull && (
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0f0f1a' }}>
            <TradingViewTickerTape theme="dark" />
          </div>
        )}

        {/* Topbar */}
        {!chartFull && (
          <div style={{ padding: '12px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', position: 'sticky', top: 46, zIndex: 50 }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em' }}>
                {NAV.find(n => n.id === activeTab)?.label}
              </h1>
              <p style={{ fontSize: 12, color: '#636e72' }}>
                {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#636e72' }}>{lastRefresh.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
              <motion.button whileTap={{ rotate: 180 }} onClick={handleRefresh}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: '#a4b0be', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={14} />
              </motion.button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,165,2,0.1)',
                border: '1px solid rgba(255,165,2,0.2)', borderRadius: 8, padding: '6px 12px' }}>
                <Star size={12} color="#ffa502" fill="#ffa502" />
                <span style={{ fontSize: 11, color: '#ffa502', fontWeight: 600 }}>PREMIUM</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: chartFull ? 0 : '24px 32px', flex: 1 }}>
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Bienvenido, {profile.first_name} 👋</h2>
                  <p style={{ fontSize: 13, color: '#636e72' }}>Resumen de tu cuenta al {new Date().toLocaleDateString('es-CL')}.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                  <StatCard label="Estado" value={profile.account_status || 'Activa'} Icon={Shield} accent="#00d084" delay={0} />
                  <StatCard label="Tipo de cuenta" value={profile.account_type || 'Estándar'} Icon={Star} accent="#ffa502" delay={0.1} />
                  <StatCard label="N° de cuenta" value={account?.account_number || '—'} Icon={DollarSign} accent="#6c5ce7" delay={0.2} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9' }}>Mini Gráfico</h3>
                      <button onClick={() => setActiveTab('chart')} style={{ fontSize: 11, color: '#6c5ce7', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                        Abrir <Maximize2 size={11} />
                      </button>
                    </div>
                    <TradingViewSymbolOverview height={180} theme="dark" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9' }}>Alertas técnicas</h3>
                      <button onClick={() => { setActiveTab('exclusive'); setExclusiveTab('alerts'); }} style={{ fontSize: 11, color: '#6c5ce7', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todas</button>
                    </div>
                    {alerts.slice(0, 3).map(a => {
                      const sev = alertSeverityConfig[a.severity] || alertSeverityConfig.medium;
                      return (
                        <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#f1f2f6' }}>{a.instrument}</p>
                            <p style={{ fontSize: 11, color: '#636e72', lineHeight: 1.4 }}>{a.description.slice(0, 50)}...</p>
                          </div>
                          <span style={{ fontSize: 10, color: sev.color, background: sev.bg, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' as const, marginLeft: 8 }}>{a.alert_type}</span>
                        </div>
                      );
                    })}
                    {alerts.length === 0 && <p style={{ color: '#636e72', fontSize: 12 }}>Sin alertas activas.</p>}
                  </div>
                  <div style={{ gridColumn: '1/-1', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9' }}>Últimos análisis AI</h3>
                      <button onClick={() => setActiveTab('analysis')} style={{ fontSize: 11, color: '#6c5ce7', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {analysis.slice(0, 4).map(a => {
                        const dir = directionConfig[a.direction] || directionConfig.neutral;
                        const DirIcon = dir.Icon;
                        return (
                          <div key={a.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${dir.color}`, borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f2f6' }}>{a.instrument}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: dir.bg, padding: '2px 6px', borderRadius: 4 }}>
                                <DirIcon size={10} color={dir.color} /><span style={{ fontSize: 10, color: dir.color, fontWeight: 600 }}>{dir.label}</span>
                              </div>
                            </div>
                            <p style={{ fontSize: 10, color: '#636e72' }}>{a.timeframe} · {a.confidence_level}% conf.</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── MERCADOS ─────────────────────────────────────────────────── */}
            {activeTab === 'markets' && (
              <motion.div key="markets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' as const, gap: 10 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Cotizaciones en tiempo real</h2>
                    <p style={{ fontSize: 12, color: '#636e72' }}>Twelve Data · {quotes.length} de {ALL_INSTRUMENTS.length} instrumentos cargados</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <input value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Buscar..."
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', color: '#f1f2f6', fontSize: 12, outline: 'none', width: 130 }} />
                    {CATS.map(cat => (
                      <button key={cat} onClick={() => setMarketFilter(cat)}
                        style={{ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11,
                          background: marketFilter === cat ? '#6c5ce7' : 'rgba(255,255,255,0.06)',
                          color: marketFilter === cat ? '#fff' : '#a4b0be', fontWeight: marketFilter === cat ? 600 : 400 }}>
                        {cat}
                      </button>
                    ))}
                    <button onClick={loadQuotes} disabled={quotesLoading}
                      style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', color: '#a4b0be', cursor: 'pointer', fontSize: 11,
                        display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RefreshCw size={11} />{quotesLoading ? 'Cargando...' : 'Actualizar'}
                    </button>
                  </div>
                </div>

                {quotesLoading && (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ width: 32, height: 32, border: '2px solid rgba(108,92,231,0.2)', borderTopColor: '#6c5ce7', borderRadius: '50%', margin: '0 auto 12px' }} />
                    <p style={{ color: '#636e72', fontSize: 12 }}>Cargando {ALL_INSTRUMENTS.length} instrumentos en batches...</p>
                  </div>
                )}

                {quotesError && (
                  <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 12 }}>
                    <AlertTriangle size={28} color="#ff4757" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ color: '#ff4757', fontSize: 13, marginBottom: 12 }}>{quotesError}</p>
                    <button onClick={loadQuotes} style={{ background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>Reintentar</button>
                  </div>
                )}

                {!quotesLoading && filteredQuotes.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {filteredQuotes.map(q => (
                      <QuoteCard key={q.symbol} q={q} onClick={() => {
                        setChartSymbol(q.symbol.replace('/', ''));
                        setActiveTab('chart');
                      }} />
                    ))}
                  </div>
                )}

                {!quotesLoading && !quotesError && quotes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <TrendingDown size={40} color="#636e72" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                    <p style={{ color: '#636e72', fontSize: 13, marginBottom: 12 }}>Haz clic en "Actualizar" para cargar los {ALL_INSTRUMENTS.length} instrumentos.</p>
                    <button onClick={loadQuotes} style={{ background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>Cargar cotizaciones</button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── GRÁFICO FULLSCREEN ────────────────────────────────────────── */}
            {activeTab === 'chart' && (
              <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ height: chartFull ? '100vh' : 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', margin: chartFull ? 0 : '-24px -32px' }}>
                {/* Toolbar del gráfico */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                  background: '#0d0f17', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, flex: 1 }}>
                    {['EURUSD','GBPUSD','USDJPY','XAUUSD','BTCUSD','ETHUSD','SPX','NAS100'].map(sym => (
                      <button key={sym} onClick={() => setChartSymbol(sym)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                          background: chartSymbol === sym ? '#6c5ce7' : 'rgba(255,255,255,0.06)',
                          color: chartSymbol === sym ? '#fff' : '#a4b0be', fontWeight: chartSymbol === sym ? 600 : 400 }}>
                        {sym}
                      </button>
                    ))}
                    <input value={chartSymbol} onChange={e => setChartSymbol(e.target.value.toUpperCase())}
                      placeholder="Símbolo..."
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', color: '#f1f2f6', fontSize: 11, width: 100, outline: 'none' }} />
                  </div>
                  <button onClick={() => setChartFull(f => !f)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.12)', background: chartFull ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.04)',
                      color: chartFull ? '#a29bfe' : '#a4b0be', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
                    {chartFull ? <><Minimize2 size={13} />Salir de pantalla completa</> : <><Maximize2 size={13} />Pantalla completa</>}
                  </button>
                </div>
                {/* Gráfico de velas con TODAS las herramientas TradingView */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <TradingViewAdvancedChart
                    symbol={chartSymbol}
                    height={chartFull ? window.innerHeight - 50 : window.innerHeight - 210}
                    theme="dark"
                    allow_symbol_change={true}
                  />
                </div>
              </motion.div>
            )}

            {/* ── SCREENER ─────────────────────────────────────────────────── */}
            {activeTab === 'screener' && (
              <motion.div key="screener" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Screener de mercados</h2>
                    <p style={{ fontSize: 12, color: '#636e72' }}>Filtra y analiza instrumentos en tiempo real</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([['forex','Forex'],['crypto','Crypto'],['america','Acciones']] as const).map(([val, lbl]) => (
                      <button key={val} onClick={() => setScreenerMarket(val)}
                        style={{ padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                          background: screenerMarket === val ? '#6c5ce7' : 'rgba(255,255,255,0.06)',
                          color: screenerMarket === val ? '#fff' : '#a4b0be', fontWeight: screenerMarket === val ? 600 : 400 }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                  <TradingViewMarketScreener height={580} theme="dark" market={screenerMarket} />
                </div>
              </motion.div>
            )}

            {/* ── ANÁLISIS AI ───────────────────────────────────────────────── */}
            {activeTab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Análisis AI</h2>
                    <p style={{ fontSize: 12, color: '#636e72' }}>Generados por búsqueda web + Claude · {analysis.length} activos</p>
                  </div>
                  <button onClick={generateAiAnalysis} disabled={generating}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                      background: generating ? 'rgba(108,92,231,0.3)' : 'linear-gradient(135deg,#6c5ce7,#0984e3)',
                      border: 'none', borderRadius: 8, color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                    {generating
                      ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />Generando...</>
                      : <><Cpu size={14} />Generar análisis AI</>}
                  </button>
                </div>

                {aiError && (
                  <div style={{ padding: '10px 16px', marginBottom: 16, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} color="#ff4757" /><span style={{ fontSize: 13, color: '#ff4757' }}>{aiError}</span>
                  </div>
                )}

                {generating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ padding: 24, background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      style={{ width: 32, height: 32, border: '2px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7', borderRadius: '50%', margin: '0 auto 12px' }} />
                    <p style={{ color: '#a29bfe', fontSize: 13, marginBottom: 4 }}>Buscando noticias en tiempo real...</p>
                    <p style={{ color: '#636e72', fontSize: 11 }}>Claude está analizando el mercado y generando setups</p>
                  </motion.div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {analysis.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <AnalysisCard analysis={a} />
                    </motion.div>
                  ))}
                  {analysis.length === 0 && !generating && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#636e72' }}>
                      <Cpu size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                      <p style={{ marginBottom: 16 }}>Haz clic en "Generar análisis AI" para obtener setups actualizados.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── EXCLUSIVOS ───────────────────────────────────────────────── */}
            {activeTab === 'exclusive' && (
              <motion.div key="exclusive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Contenido Exclusivo</h2>
                    <p style={{ fontSize: 12, color: '#636e72' }}>Noticias, recomendaciones, artículos y alertas para clientes Pessaro</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,165,2,0.1)', border: '1px solid rgba(255,165,2,0.25)', padding: '4px 12px', borderRadius: 20 }}>
                    <Star size={10} fill="#ffa502" color="#ffa502" /><span style={{ fontSize: 11, color: '#ffa502', fontWeight: 600 }}>Solo clientes</span>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
                  {([
                    ['articles',        'Artículos CMS',      BookMarked],
                    ['recommendations', 'Recomendaciones AI', Cpu       ],
                    ['news',            'Noticias',           Newspaper ],
                    ['alerts',          'Alertas técnicas',   Bell      ],
                  ] as const).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setExclusiveTab(id as any)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                        background: exclusiveTab === id ? '#6c5ce7' : 'transparent',
                        color: exclusiveTab === id ? '#fff' : '#636e72', fontWeight: exclusiveTab === id ? 600 : 400 }}>
                      <Icon size={13} />{label}
                    </button>
                  ))}
                </div>

                {/* Articles CMS */}
                {exclusiveTab === 'articles' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {articles.map((a, i) => (
                      <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <ArticleCard article={a} onClick={() => setSelectedArticle(a)} />
                      </motion.div>
                    ))}
                    {articles.length === 0 && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#636e72' }}>
                        <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                        <p>No hay artículos publicados aún.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recomendaciones AI */}
                {exclusiveTab === 'recommendations' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: '#636e72' }}>Recomendaciones de operaciones generadas por IA</p>
                      <button onClick={generateAiAnalysis} disabled={generating}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                          background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.3)',
                          borderRadius: 8, color: '#a29bfe', cursor: 'pointer', fontSize: 12 }}>
                        <Cpu size={12} />{generating ? 'Generando...' : 'Actualizar'}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {recommendations.map((r, i) => (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                          <AnalysisCard analysis={r} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Noticias */}
                {exclusiveTab === 'news' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {news.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 60, color: '#636e72' }}>
                        <Newspaper size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                        <p style={{ marginBottom: 12 }}>Las noticias se cargan automáticamente al generar análisis AI.</p>
                        <button onClick={generateAiAnalysis} style={{ background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>
                          Cargar noticias
                        </button>
                      </div>
                    )}
                    {news.map((n, i) => {
                      const sentimentColor = n.sentiment === 'bullish' ? '#00d084' : n.sentiment === 'bearish' ? '#ff4757' : '#a4b0be';
                      return (
                        <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: '#6c5ce7', background: 'rgba(108,92,231,0.15)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{n.source}</span>
                              {n.sentiment && <span style={{ fontSize: 10, color: sentimentColor, background: `${sentimentColor}18`, padding: '2px 6px', borderRadius: 4 }}>{n.sentiment}</span>}
                            </div>
                            <p style={{ fontSize: 13, color: '#f1f2f6', fontWeight: 500, lineHeight: 1.4 }}>{n.title}</p>
                          </div>
                          {n.url && (
                            <a href={n.url} target="_blank" rel="noopener noreferrer"
                              style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                              <ChevronRight size={13} color="#a4b0be" />
                            </a>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Alertas técnicas */}
                {exclusiveTab === 'alerts' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {alerts.map((a, i) => {
                      const sev = alertSeverityConfig[a.severity] || alertSeverityConfig.medium;
                      const alertTypeLabels: Record<string, string> = {
                        support: 'Soporte', resistance: 'Resistencia', breakout: 'Ruptura',
                        pattern: 'Patrón', divergence: 'Divergencia', news: 'Noticia',
                      };
                      return (
                        <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${sev.color}30`, borderLeft: `3px solid ${sev.color}`, borderRadius: 10, padding: '14px 18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f2f6' }}>{a.instrument}</span>
                              <span style={{ fontSize: 11, color: '#636e72', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: 4 }}>
                                {alertTypeLabels[a.alert_type] || a.alert_type}
                              </span>
                              {a.level && <span style={{ fontSize: 12, color: '#a4b0be', fontWeight: 600 }}>{a.level.toLocaleString()}</span>}
                            </div>
                            <span style={{ fontSize: 11, color: sev.color, background: sev.bg, padding: '3px 9px', borderRadius: 6, fontWeight: 600 }}>{sev.label}</span>
                          </div>
                          <p style={{ fontSize: 13, color: '#a4b0be', lineHeight: 1.5 }}>{a.description}</p>
                          <p style={{ fontSize: 10, color: '#636e72', marginTop: 8 }}>{new Date(a.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                        </motion.div>
                      );
                    })}
                    {alerts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 60, color: '#636e72' }}>
                        <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                        <p>No hay alertas técnicas activas.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── CALENDARIO ───────────────────────────────────────────────── */}
            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Calendario Económico</h2>
                  <p style={{ fontSize: 12, color: '#636e72' }}>Eventos macroeconómicos y noticias relevantes — TradingView</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 4 }}>
                  <TradingViewEconomicCalendar height={620} theme="dark" />
                </div>
              </motion.div>
            )}

            {/* ── MI CUENTA ────────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Mi Cuenta</h2>
                    <p style={{ fontSize: 12, color: '#636e72' }}>Información personal y perfil de inversión</p>
                  </div>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 8, color: '#a29bfe', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      <Edit3 size={14} />Editar perfil
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditMode(false); setSaveStatus('idle'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#a4b0be', cursor: 'pointer', fontSize: 13 }}>
                        <X size={14} />Cancelar
                      </button>
                      <button onClick={handleSaveProfile} disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: saving ? 'rgba(108,92,231,0.3)' : '#6c5ce7', border: 'none', borderRadius: 8, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                        {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={14} />}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  )}
                </div>

                {saveStatus === 'ok' && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', marginBottom: 16, background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', borderRadius: 8 }}><Check size={14} color="#00d084" /><span style={{ fontSize: 13, color: '#00d084' }}>Perfil actualizado correctamente.</span></motion.div>}
                {saveStatus === 'error' && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', marginBottom: 16, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 8 }}><AlertTriangle size={14} color="#ff4757" /><span style={{ fontSize: 13, color: '#ff4757' }}>Error al guardar. Intenta de nuevo.</span></div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Info personal */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 22 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9', marginBottom: 18 }}>Información Personal</h3>
                    {/* Nombre */}
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Nombre</p>
                      {editMode ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={editData.first_name} onChange={e => setEditData((p: any) => ({ ...p, first_name: e.target.value }))} placeholder="Nombre" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#f1f2f6', fontSize: 13, outline: 'none' }} />
                          <input value={editData.last_name} onChange={e => setEditData((p: any) => ({ ...p, last_name: e.target.value }))} placeholder="Apellido" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#f1f2f6', fontSize: 13, outline: 'none' }} />
                        </div>
                      ) : <p style={{ fontSize: 14, color: '#f1f2f6', fontWeight: 500 }}>{profile.first_name} {profile.last_name}</p>}
                    </div>
                    {/* Email */}
                    <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</p>
                      <p style={{ fontSize: 14, color: '#a4b0be' }}>{profile.email}</p>
                      {editMode && <p style={{ fontSize: 10, color: '#636e72', marginTop: 3 }}>El email no se puede modificar aquí.</p>}
                    </div>
                    {/* Teléfono */}
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Teléfono</p>
                      {editMode ? (
                        <input value={editData.phone} onChange={e => setEditData((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+56 9 XXXX XXXX" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#f1f2f6', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
                      ) : <p style={{ fontSize: 14, color: '#f1f2f6', fontWeight: 500 }}>{profile.phone || 'No registrado'}</p>}
                    </div>
                    {/* Estado */}
                    <div>
                      <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Estado</p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.2)', borderRadius: 20, padding: '3px 10px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d084' }} />
                        <span style={{ fontSize: 12, color: '#00d084', fontWeight: 600 }}>{profile.account_status || 'Activa'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perfil inversión */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 22 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9', marginBottom: 18 }}>Perfil de Inversión</h3>
                    {[
                      ['Tolerancia al riesgo', 'risk_tolerance', RISK_OPTIONS],
                      ['Nivel de experiencia', 'experience_level', EXP_OPTIONS],
                      ['Capital de inversión',  'investment_capital', CAPITAL_OPTIONS],
                      ['Horizonte de inversión','investment_horizon', HORIZON_OPTIONS],
                    ].map(([label, field, options]: any) => (
                      <div key={field} style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                        {editMode ? (
                          <select value={editData[field]} onChange={e => setEditData((p: any) => ({ ...p, [field]: e.target.value }))}
                            style={{ width: '100%', background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: '#f1f2f6', fontSize: 13, outline: 'none' }}>
                            <option value="">Seleccionar...</option>
                            {options.map((o: string) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                          </select>
                        ) : (
                          <p style={{ fontSize: 14, color: '#f1f2f6', fontWeight: 500, textTransform: 'capitalize' }}>{profile[field] || 'No definido'}</p>
                        )}
                      </div>
                    ))}
                    {/* Contactar asesor */}
                    <div style={{ marginTop: 8, padding: 12, background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#a29bfe', marginBottom: 4 }}>¿Necesitas ayuda?</p>
                      <button onClick={() => setShowAdvisorPopup(true)} style={{ fontSize: 12, color: '#6c5ce7', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        Contactar asesor <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Cuenta trading */}
                  <div style={{ gridColumn: '1/-1', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 22 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9', marginBottom: 16 }}>Cuenta de Trading</h3>
                    {account ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                        {[['N° Cuenta', account.account_number],['Tipo', account.account_type],['Moneda', account.currency],['Apalancamiento', account.leverage],['Estado', account.status]].map(([l, v]) => (
                          <div key={l}>
                            <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{l}</p>
                            <p style={{ fontSize: 15, color: '#f1f2f6', fontWeight: 600, textTransform: 'capitalize' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ color: '#636e72', fontSize: 13 }}>Sin cuenta de trading asociada.</p>}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />

      {/* ── POPUP ASESOR ──────────────────────────────────────────────────── */}
      {showAdvisorPopup && (
        <div onClick={() => setShowAdvisorPopup(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#16213e', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(108,92,231,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                <div><p style={{ fontSize: 14, fontWeight: 700, color: '#f1f2f6', margin: 0 }}>Asesor Comercial</p><p style={{ fontSize: 11, color: '#a29bfe', margin: 0 }}>Pessaro Capital</p></div>
              </div>
              <button onClick={() => setShowAdvisorPopup(false)} style={{ background: 'none', border: 'none', color: '#636e72', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: '#b2bec3', marginBottom: 16, lineHeight: 1.6 }}>Elige cómo prefieres contactar a tu asesor:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '✉️', label: 'Enviar email', sub: 'info@pessarocapital.com', href: 'mailto:info@pessarocapital.com', bg: 'rgba(108,92,231,0.12)', border: 'rgba(108,92,231,0.25)' },
                { icon: '💬', label: 'WhatsApp', sub: '+56 9 2207 1511', href: 'https://wa.me/56922071511', bg: 'rgba(37,211,102,0.1)', border: 'rgba(37,211,102,0.25)' },
                { icon: '💼', label: 'LinkedIn', sub: 'Pessaro Capital', href: 'https://www.linkedin.com/company/pessarocapital', bg: 'rgba(0,119,181,0.1)', border: 'rgba(0,119,181,0.25)' },
              ].map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: item.bg, border: `1px solid ${item.border}`, borderRadius: 9, textDecoration: 'none', color: '#f1f2f6', fontSize: 13, fontWeight: 500 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div><p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>{item.label}</p><p style={{ margin: 0, fontSize: 10, color: '#636e72' }}>{item.sub}</p></div>
                </a>
              ))}
            </div>
            <p style={{ fontSize: 10, color: '#636e72', marginTop: 16, textAlign: 'center' }}>Lunes a Viernes · 09:00 – 18:00 hrs · Santiago</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
