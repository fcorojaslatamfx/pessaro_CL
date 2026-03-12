import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, BarChart2, BookOpen,
  LogOut, ChevronRight, Clock, Target, Shield, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, BookMarked, Zap,
  User, CreditCard, Activity, RefreshCw, Lock, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  TradingViewAdvancedChart,
  TradingViewSymbolOverview,
  TradingViewEconomicCalendar,
  TradingViewMarketScreener,
  TradingViewTickerTape,
  TwelveDataPriceCard
} from '@/components/TradingViewWidgets';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  author_name: string;
  author_role: string;
  read_time_minutes: number;
  tags: string[];
  published_at: string;
}

interface MarketAnalysis {
  id: string;
  title: string;
  instrument: string;
  direction: 'alcista' | 'bajista' | 'lateral' | 'neutral';
  timeframe: string;
  summary: string;
  key_levels: any;
  confidence_level: number;
  valid_until: string;
  published_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(amount);

const directionConfig = {
  alcista: { label: 'Alcista',  color: '#00d084', Icon: ArrowUpRight,   bg: 'rgba(0,208,132,0.12)' },
  bajista: { label: 'Bajista',  color: '#ff4757', Icon: ArrowDownRight, bg: 'rgba(255,71,87,0.12)'  },
  lateral: { label: 'Lateral',  color: '#ffa502', Icon: Minus,          bg: 'rgba(255,165,2,0.12)'  },
  neutral: { label: 'Neutral',  color: '#a4b0be', Icon: Minus,          bg: 'rgba(164,176,190,0.12)'},
};

const categoryLabels: Record<string, string> = {
  analisis: 'Análisis', estrategia: 'Estrategia', educacion: 'Educación',
  macroeconomia: 'Macro', divisas: 'Divisas', commodities: 'Commodities', criptomonedas: 'Cripto',
};

const categoryColors: Record<string, string> = {
  analisis: '#6c5ce7', estrategia: '#0984e3', educacion: '#00b894',
  macroeconomia: '#e17055', divisas: '#fdcb6e', commodities: '#a29bfe', criptomonedas: '#fd79a8',
};

const NAV = [
  { id: 'overview',  label: 'Resumen',    Icon: LayoutDashboard },
  { id: 'markets',   label: 'Mercados',   Icon: TrendingUp      },
  { id: 'analysis',  label: 'Análisis',   Icon: BarChart2       },
  { id: 'articles',  label: 'Exclusivos', Icon: BookOpen        },
  { id: 'calendar',  label: 'Calendario', Icon: Activity        },
  { id: 'account',   label: 'Mi Cuenta',  Icon: User            },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, Icon, accent = '#6c5ce7', delay = 0 }: any) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80,
      background: `radial-gradient(circle at 80% 20%,${accent}22,transparent 70%)` }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 11, color: '#a4b0be', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em' }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: '#a4b0be', marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={accent} />
      </div>
    </div>
  </motion.div>
);

const ArticleCard = ({ article, onClick }: { article: Article; onClick: () => void }) => {
  const catColor = categoryColors[article.category] || '#6c5ce7';
  return (
    <motion.div whileHover={{ translateY: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }} onClick={onClick}
      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: catColor, textTransform: 'uppercase',
          letterSpacing: '0.08em', background: `${catColor}20`, padding: '3px 8px', borderRadius: 4 }}>
          {categoryLabels[article.category] || article.category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#636e72', fontSize: 11 }}>
          <Clock size={11} /><span>{article.read_time_minutes} min</span>
        </div>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f1f2f6', lineHeight: 1.4, marginBottom: 8 }}>{article.title}</h3>
      <p style={{ fontSize: 13, color: '#a4b0be', lineHeight: 1.6, marginBottom: 16 }}>{article.summary}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#dfe6e9' }}>{article.author_name}</p>
          <p style={{ fontSize: 11, color: '#636e72' }}>{article.author_role}</p>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(108,92,231,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={14} color="#6c5ce7" />
        </div>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f2f6', letterSpacing: '0.04em' }}>{analysis.instrument}</span>
            <span style={{ fontSize: 11, color: '#636e72', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{analysis.timeframe}</span>
          </div>
          <p style={{ fontSize: 13, color: '#a4b0be' }}>{analysis.title}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: dir.bg,
            padding: '4px 10px', borderRadius: 6, marginBottom: 4 }}>
            <DirIcon size={13} color={dir.color} />
            <span style={{ fontSize: 12, fontWeight: 600, color: dir.color }}>{dir.label}</span>
          </div>
          <p style={{ fontSize: 11, color: '#636e72' }}>{analysis.confidence_level}% confianza</p>
        </div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 12 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.confidence_level}%` }}
          transition={{ delay: 0.3, duration: 0.8 }} style={{ height: '100%', background: dir.color, borderRadius: 2 }} />
      </div>
      <p style={{ fontSize: 13, color: '#a4b0be', marginBottom: 14, lineHeight: 1.5 }}>{analysis.summary}</p>
      {analysis.key_levels && (analysis.key_levels.entry || analysis.key_levels.sl) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 12 }}>
          {analysis.key_levels.entry && <div style={{ fontSize: 11, background: 'rgba(108,92,231,0.15)', color: '#a29bfe', padding: '3px 8px', borderRadius: 4 }}>Entrada: {analysis.key_levels.entry}</div>}
          {analysis.key_levels.sl && <div style={{ fontSize: 11, background: 'rgba(255,71,87,0.12)', color: '#ff6b81', padding: '3px 8px', borderRadius: 4 }}>SL: {analysis.key_levels.sl}</div>}
          {analysis.key_levels.tp?.[0] && <div style={{ fontSize: 11, background: 'rgba(0,208,132,0.12)', color: '#00d084', padding: '3px 8px', borderRadius: 4 }}>TP: {analysis.key_levels.tp[0]}</div>}
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

const ArticleModal = ({ article, onClose }: { article: Article | null; onClose: () => void }) => {
  if (!article) return null;
  const catColor = categoryColors[article.category] || '#6c5ce7';
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}
          style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 32, maxWidth: 680, width: '100%', maxHeight: '80vh', overflowY: 'auto' as const }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: catColor, textTransform: 'uppercase',
              letterSpacing: '0.08em', background: `${catColor}20`, padding: '3px 8px', borderRadius: 4 }}>
              {categoryLabels[article.category]}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#636e72', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f2f6', lineHeight: 1.3, marginBottom: 12 }}>{article.title}</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#dfe6e9' }}>{article.author_name}</p>
              <p style={{ fontSize: 12, color: '#636e72' }}>{article.author_role}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#636e72', fontSize: 12 }}>
              <Clock size={12} /><span>{article.read_time_minutes} min de lectura</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffa502', fontSize: 12 }}>
              <Lock size={12} /><span>Contenido exclusivo</span>
            </div>
          </div>
          <p style={{ fontSize: 15, color: '#a4b0be', lineHeight: 1.8 }}>{article.summary}</p>
          {article.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginTop: 20 }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, color: '#6c5ce7', background: 'rgba(108,92,231,0.15)', padding: '3px 8px', borderRadius: 4 }}>#{tag}</span>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ClientPortal: React.FC = () => {
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [analysis, setAnalysis] = useState<MarketAnalysis[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/portal-cliente', { replace: true }); return; }
      setUser(user);

      const [profileRes, accountRes, articlesRes, analysisRes] = await Promise.all([
        supabase.from('client_profiles_2026_02_08_22_02').select('*').eq('user_id', user.id).single(),
        supabase.from('trading_accounts_2026_02_08_22_02').select('*').eq('user_id', user.id).eq('account_type', 'standard').single(),
        supabase.from('client_exclusive_articles_2026_03_11').select('id,title,summary,category,author_name,author_role,read_time_minutes,tags,published_at').eq('is_published', true).order('published_at', { ascending: false }),
        supabase.from('client_market_analysis_2026_03_11').select('*').eq('is_published', true).order('published_at', { ascending: false }),
      ]);

      if (profileRes.data) setClientData({ profile: profileRes.data, account: accountRes.data || null });
      if (articlesRes.data) setArticles(articlesRes.data as Article[]);
      if (analysisRes.data) setAnalysis(analysisRes.data as MarketAnalysis[]);
    } catch (err) {
      console.error('Error loading portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/portal-cliente', { replace: true }); };
  const handleRefresh = () => { setLoading(true); setLastRefresh(new Date()); loadAll(); };

  // Inyectar keyframe para spinner de Twelve Data
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0f17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '3px solid rgba(108,92,231,0.2)', borderTopColor: '#6c5ce7',
            borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#636e72', fontSize: 14 }}>Cargando portal seguro...</p>
      </div>
    </div>
  );

  if (!clientData?.profile) return (
    <div style={{ minHeight: '100vh', background: '#0d0f17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,71,87,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Shield size={28} color="#ff4757" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f1f2f6', marginBottom: 8 }}>Perfil no encontrado</h3>
        <p style={{ color: '#636e72', fontSize: 14, marginBottom: 24 }}>No se encontraron datos de tu cuenta. Contacta a soporte.</p>
        <button onClick={() => navigate('/')} style={{ background: '#6c5ce7', color: '#fff',
          border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 14 }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );

  const { profile, account } = clientData;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f17', display: 'flex' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{ width: 220, background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg,#6c5ce7,#0984e3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.01em' }}>Pessaro</p>
              <p style={{ fontSize: 10, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal Cliente</p>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 10px', flex: 1 }}>
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
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6c5ce7,#0984e3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {profile.first_name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#dfe6e9' }}>{profile.first_name}</p>
              <p style={{ fontSize: 10, color: '#636e72' }}>{account?.account_number || 'N/A'}</p>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#00d084', background: 'rgba(0,208,132,0.1)',
            padding: '2px 8px', borderRadius: 20, display: 'inline-block', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 10 }}>● Activo</div>
          <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,71,87,0.3)',
            background: 'rgba(255,71,87,0.08)', color: '#ff6b81', cursor: 'pointer', fontSize: 12 }}>
            <LogOut size={14} />Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ marginLeft: 220, flex: 1 }}>
        
        {/* Topbar */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em' }}>
              {NAV.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: 12, color: '#636e72' }}>
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#636e72' }}>Actualizado: {lastRefresh.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
            <motion.button whileTap={{ rotate: 180 }} onClick={handleRefresh}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#a4b0be', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={14} />
            </motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,165,2,0.1)',
              border: '1px solid rgba(255,165,2,0.2)', borderRadius: 8, padding: '6px 12px' }}>
              <Star size={12} color="#ffa502" fill="#ffa502" />
              <span style={{ fontSize: 11, color: '#ffa502', fontWeight: 600 }}>CLIENTE PREMIUM</span>
            </div>
          </div>
        </div>


        {/* Ticker en tiempo real */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
          <TradingViewTickerTape theme="dark" />
        </div>

        <div style={{ padding: '28px 32px' }}>
          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                
                {/* Banner */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'linear-gradient(135deg,rgba(108,92,231,0.15),rgba(9,132,227,0.1))',
                    border: '1px solid rgba(108,92,231,0.25)', borderRadius: 14, padding: '20px 28px',
                    marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180,
                    background: 'radial-gradient(circle,rgba(108,92,231,0.2),transparent 70%)', borderRadius: '50%' }} />
                  <div>
                    <p style={{ fontSize: 13, color: '#a29bfe', fontWeight: 500, marginBottom: 4 }}>Bienvenido de vuelta</p>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em' }}>
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <p style={{ fontSize: 13, color: '#636e72', marginTop: 4 }}>
                      Cuenta #{account?.account_number || 'N/A'} · Apalancamiento {account?.leverage || '1:100'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tipo de Cuenta</p>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#6c5ce7', background: 'rgba(108,92,231,0.15)',
                      padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(108,92,231,0.3)', textTransform: 'capitalize' }}>
                      {account?.account_type || 'Standard'}
                    </div>
                  </div>
                </motion.div>

                {/* Precios en tiempo real - Twelve Data */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Precios en Tiempo Real</p>
                  <TwelveDataPriceCard symbols={['EUR/USD','GBP/USD','XAU/USD','BTC/USD']} />
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
                  <StatCard label="Balance" value={formatCurrency(account?.balance || 0)} sub="Saldo total" Icon={CreditCard} accent="#6c5ce7" delay={0.05} />
                  <StatCard label="Equity" value={formatCurrency(account?.equity || 0)} sub="Valor de cuenta" Icon={TrendingUp} accent="#0984e3" delay={0.1} />
                  <StatCard label="Margen Libre" value={formatCurrency(account?.free_margin || 0)} sub="Para nuevas posiciones" Icon={Activity} accent="#00d084" delay={0.15} />
                  <StatCard label="Nivel Margen" value={`${account?.margin_level || 0}%`} sub={account?.margin_level > 200 ? 'Saludable' : 'Revisar'} Icon={Shield} accent={account?.margin_level > 200 ? '#00d084' : '#ffa502'} delay={0.2} />
                </div>

                {/* Quick panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9' }}>Análisis Reciente</h3>
                      <button onClick={() => setActiveTab('analysis')} style={{ fontSize: 11, color: '#6c5ce7',
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Ver todos <ChevronRight size={12} />
                      </button>
                    </div>
                    {analysis.slice(0, 3).map(a => {
                      const dir = directionConfig[a.direction] || directionConfig.neutral;
                      const DirIcon = dir.Icon;
                      return (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f2f6', minWidth: 60 }}>{a.instrument}</span>
                            <span style={{ fontSize: 12, color: '#636e72' }}>{a.timeframe}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: dir.color, fontSize: 12, fontWeight: 600 }}>
                            <DirIcon size={12} />{dir.label}
                          </div>
                        </div>
                      );
                    })}
                    {analysis.length === 0 && <p style={{ fontSize: 13, color: '#636e72' }}>Sin análisis publicados.</p>}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9' }}>Artículos Exclusivos</h3>
                      <button onClick={() => setActiveTab('articles')} style={{ fontSize: 11, color: '#6c5ce7',
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Ver todos <ChevronRight size={12} />
                      </button>
                    </div>
                    {articles.slice(0, 3).map(a => (
                      <div key={a.id} onClick={() => setSelectedArticle(a)}
                        style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                        <p style={{ fontSize: 13, color: '#dfe6e9', marginBottom: 3, fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: 10, color: categoryColors[a.category] || '#6c5ce7',
                            textTransform: 'uppercase', letterSpacing: '0.06em' }}>{categoryLabels[a.category]}</span>
                          <span style={{ fontSize: 10, color: '#636e72' }}>{a.read_time_minutes} min</span>
                        </div>
                      </div>
                    ))}
                    {articles.length === 0 && <p style={{ fontSize: 13, color: '#636e72' }}>Sin artículos publicados.</p>}
                  </div>
                </div>

                {/* Mini chart */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9', marginBottom: 16 }}>Vista Rápida de Mercado</h3>
                  <TradingViewSymbolOverview height={200} theme="dark" />
                </div>
              </motion.div>
            )}

            {/* MARKETS */}
            {activeTab === 'markets' && (
              <motion.div key="markets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'grid', gap: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9', marginBottom: 16 }}>Gráfico Avanzado</h3>
                  <TradingViewAdvancedChart symbol="EURUSD" height={520} theme="dark" allow_symbol_change={true} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9', marginBottom: 16 }}>Screener de Mercados</h3>
                  <TradingViewMarketScreener height={500} theme="dark" market="forex" />
                </div>
              </motion.div>
            )}

            {/* ANALYSIS */}
            {activeTab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Análisis de Mercado</h2>
                    <p style={{ fontSize: 13, color: '#636e72' }}>Setups exclusivos del equipo Pessaro Research · {analysis.length} activos</p>
                  </div>
                  <div style={{ fontSize: 11, color: '#ffa502', background: 'rgba(255,165,2,0.1)',
                    border: '1px solid rgba(255,165,2,0.25)', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={10} /><span>Contenido Exclusivo</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {analysis.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <AnalysisCard analysis={a} />
                    </motion.div>
                  ))}
                  {analysis.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#636e72' }}>
                      <BarChart2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p>No hay análisis publicados aún.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ARTICLES */}
            {activeTab === 'articles' && (
              <motion.div key="articles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Artículos Exclusivos</h2>
                    <p style={{ fontSize: 13, color: '#636e72' }}>Investigación y análisis profundo para clientes · {articles.length} artículos</p>
                  </div>
                  <div style={{ fontSize: 11, color: '#ffa502', background: 'rgba(255,165,2,0.1)',
                    border: '1px solid rgba(255,165,2,0.25)', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BookMarked size={10} /><span>Solo para clientes</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                  {articles.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <ArticleCard article={a} onClick={() => setSelectedArticle(a)} />
                    </motion.div>
                  ))}
                  {articles.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#636e72' }}>
                      <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p>No hay artículos publicados aún.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CALENDAR */}
            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Calendario Económico</h2>
                  <p style={{ fontSize: 13, color: '#636e72' }}>Eventos macroeconómicos y publicaciones de datos clave</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                  <TradingViewEconomicCalendar height={600} theme="dark" />
                </div>
              </motion.div>
            )}

            {/* ACCOUNT */}
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', marginBottom: 4 }}>Mi Cuenta</h2>
                  <p style={{ fontSize: 13, color: '#636e72' }}>Información personal y detalles de trading</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9', marginBottom: 20 }}>Información Personal</h3>
                    {[
                      ['Nombre', `${profile.first_name} ${profile.last_name}`],
                      ['Email', profile.email],
                      ['Teléfono', profile.phone || 'No registrado'],
                      ['Tolerancia al riesgo', profile.risk_tolerance || 'No definida'],
                      ['Estado', profile.account_status || 'Activa'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 14, color: '#f1f2f6', fontWeight: 500, textTransform: 'capitalize' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#dfe6e9', marginBottom: 20 }}>Cuenta de Trading</h3>
                    {account ? [
                      ['N° Cuenta', account.account_number],
                      ['Tipo', account.account_type],
                      ['Moneda', account.currency],
                      ['Apalancamiento', account.leverage],
                      ['Estado', account.status],
                    ].map(([label, value]) => (
                      <div key={label} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 14, color: '#f1f2f6', fontWeight: 500, textTransform: 'capitalize' }}>{value}</p>
                      </div>
                    )) : <p style={{ color: '#636e72', fontSize: 13 }}>Sin cuenta de trading asociada.</p>}
                    <div style={{ marginTop: 16, padding: 14, background: 'rgba(108,92,231,0.1)',
                      border: '1px solid rgba(108,92,231,0.2)', borderRadius: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#a29bfe', marginBottom: 6 }}>¿Necesitas ayuda?</p>
                      <p style={{ fontSize: 12, color: '#636e72', marginBottom: 10 }}>Contacta a tu asesor Pessaro Capital</p>
                      <a href="mailto:info@pessarocapital.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, color: '#6c5ce7', fontWeight: 600, textDecoration: 'none' }}>
                        Contactar Asesor <ChevronRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
};

export default ClientPortal;
