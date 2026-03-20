import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, BarChart2, BookOpen,
  LogOut, ChevronRight, Clock, Target, Shield, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, BookMarked, Zap,
  User, Activity, RefreshCw, Lock, Star, Menu, X,
  CheckCircle2, AlertCircle, Hash, Edit2, Save, XCircle,
  Check, Phone, Mail, AlertOctagon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { KYCVerification } from '@/components/KYCVerification';
import {
  TradingViewAdvancedChart,
  TradingViewSymbolOverview,
  TradingViewEconomicCalendar,
  TradingViewMarketScreener,
  TradingViewTickerTape,
} from '@/components/TradingViewWidgets';

// ─── CSS global: forzar fondo oscuro en contenedores TradingView + spin ───────
// isTransparent:true en los widgets hace que el iframe no ponga fondo propio.
// Este CSS garantiza que el div contenedor nunca muestre blanco.
const GLOBAL_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .tradingview-widget-container,
  .tradingview-widget-container__widget,
  .tradingview-widget-container iframe {
    background: #0d0f17 !important;
    color-scheme: dark !important;
  }
  .tradingview-widget-copyright { display: none !important; }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const directionConfig = {
  alcista: { label: 'Alcista',  color: '#00d084', Icon: ArrowUpRight,   bg: 'rgba(0,208,132,0.12)' },
  bajista: { label: 'Bajista',  color: '#ff4757', Icon: ArrowDownRight, bg: 'rgba(255,71,87,0.12)'  },
  lateral: { label: 'Lateral',  color: '#ffa502', Icon: Minus,          bg: 'rgba(255,165,2,0.12)'  },
  neutral: { label: 'Neutral',  color: '#a4b0be', Icon: Minus,          bg: 'rgba(164,176,190,0.12)'},
};
const categoryLabels: Record<string,string> = {
  analisis:'Análisis', estrategia:'Estrategia', educacion:'Educación',
  macroeconomia:'Macro', divisas:'Divisas', commodities:'Commodities', criptomonedas:'Cripto',
};
const categoryColors: Record<string,string> = {
  analisis:'#6c5ce7', estrategia:'#0984e3', educacion:'#00b894',
  macroeconomia:'#e17055', divisas:'#fdcb6e', commodities:'#a29bfe', criptomonedas:'#fd79a8',
};
const RISK_OPTIONS = ['conservador','moderado','agresivo'];
const NAV = [
  { id:'overview',  label:'Resumen',    Icon:LayoutDashboard },
  { id:'markets',   label:'Mercados',   Icon:TrendingUp      },
  { id:'screener',  label:'Screener',   Icon:BarChart2       },
  { id:'analysis',  label:'Análisis',   Icon:BarChart2       },
  { id:'articles',  label:'Exclusivos', Icon:BookOpen        },
  { id:'calendar',  label:'Calendario', Icon:Activity        },
  { id:'account',   label:'Mi Cuenta',  Icon:User            },
];
// Quick picks para el selector de instrumento
const QUICK_SYMBOLS = [
  { label:'EUR/USD', sym:'FX:EURUSD'        },
  { label:'GBP/USD', sym:'FX:GBPUSD'        },
  { label:'USD/JPY', sym:'FX:USDJPY'        },
  { label:'XAU/USD', sym:'OANDA:XAUUSD'     },
  { label:'BTC/USD', sym:'BITSTAMP:BTCUSD'  },
  { label:'ETH/USD', sym:'BITSTAMP:ETHUSD'  },
  { label:'S&P 500', sym:'OANDA:SPX500USD'  },
  { label:'NAS 100', sym:'OANDA:NAS100USD'  },
  { label:'NVDA',    sym:'NASDAQ:NVDA'      },
  { label:'TSLA',    sym:'NASDAQ:TSLA'      },
  { label:'AAPL',    sym:'NASDAQ:AAPL'      },
  { label:'WTI',     sym:'NYMEX:CL1!'       },
];

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
}

// ─── StatusCard ───────────────────────────────────────────────────────────────
const StatusCard = ({ label, value, Icon, accent='#6c5ce7', delay=0, iconBg, valueBg }: any) => (
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.35 }}
    style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))',
      border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'18px 20px',
      display:'flex', flexDirection:'column' as const, gap:12, position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:-20, right:-20, width:90, height:90,
      background:`radial-gradient(circle,${accent}28,transparent 70%)`, borderRadius:'50%' }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <p style={{ fontSize:10, fontWeight:600, color:'#7f8c9a', textTransform:'uppercase' as const, letterSpacing:'0.10em' }}>{label}</p>
      <div style={{ width:28, height:28, borderRadius:8, background:iconBg||`${accent}22`,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={14} color={accent} />
      </div>
    </div>
    <div style={{ display:'inline-flex', alignSelf:'flex-start',
      background:valueBg||`${accent}18`, border:`1px solid ${accent}35`, borderRadius:8, padding:'5px 12px' }}>
      <span style={{ fontSize:15, fontWeight:700, color:accent, letterSpacing:'0.02em' }}>{value}</span>
    </div>
  </motion.div>
);

// ─── WidgetCard — fondo oscuro igual al portal ────────────────────────────────
const WidgetCard = ({ title, children }: { title:string; children:React.ReactNode }) => (
  <div style={{ background:'#0d0f17', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12, padding:20, overflow:'hidden' }}>
    <h3 style={{ fontSize:14, fontWeight:600, color:'#dfe6e9', marginBottom:16 }}>{title}</h3>
    {children}
  </div>
);

// ─── ArticleCard ──────────────────────────────────────────────────────────────
const ArticleCard = ({ article, onClick }: { article:Article; onClick:()=>void }) => {
  const catColor = categoryColors[article.category] || '#6c5ce7';
  return (
    <motion.div whileHover={{ translateY:-2 }} onClick={onClick}
      style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
        border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, cursor:'pointer' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <span style={{ fontSize:11, fontWeight:600, color:catColor, textTransform:'uppercase' as const,
          letterSpacing:'0.08em', background:`${catColor}20`, padding:'3px 8px', borderRadius:4 }}>
          {categoryLabels[article.category]||article.category}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:4, color:'#636e72', fontSize:11 }}>
          <Clock size={11}/><span>{article.read_time_minutes} min</span>
        </div>
      </div>
      <h3 style={{ fontSize:15, fontWeight:600, color:'#f1f2f6', lineHeight:1.4, marginBottom:8 }}>{article.title}</h3>
      <p style={{ fontSize:13, color:'#a4b0be', lineHeight:1.6, marginBottom:16 }}>{article.summary}</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:12, fontWeight:600, color:'#dfe6e9' }}>{article.author_name}</p>
          <p style={{ fontSize:11, color:'#636e72' }}>{article.author_role}</p>
        </div>
        <div style={{ width:28, height:28, borderRadius:8, background:'rgba(108,92,231,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ChevronRight size={14} color="#6c5ce7"/>
        </div>
      </div>
    </motion.div>
  );
};

// ─── AnalysisCard ─────────────────────────────────────────────────────────────
const AnalysisCard = ({ analysis }: { analysis:MarketAnalysis }) => {
  const dir = directionConfig[analysis.direction]||directionConfig.neutral;
  const DirIcon = dir.Icon;
  const validUntil = new Date(analysis.valid_until);
  const expiringSoon = (validUntil.getTime()-Date.now()) < 24*3600*1000;
  return (
    <motion.div whileHover={{ translateY:-2 }}
      style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
        border:'1px solid rgba(255,255,255,0.07)', borderLeft:`3px solid ${dir.color}`,
        borderRadius:12, padding:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:16, fontWeight:700, color:'#f1f2f6' }}>{analysis.instrument}</span>
            <span style={{ fontSize:11, color:'#636e72', background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:4 }}>{analysis.timeframe}</span>
          </div>
          <p style={{ fontSize:13, color:'#a4b0be' }}>{analysis.title}</p>
        </div>
        <div style={{ textAlign:'right' as const }}>
          <div style={{ display:'flex', alignItems:'center', gap:4, background:dir.bg, padding:'4px 10px', borderRadius:6, marginBottom:4 }}>
            <DirIcon size={13} color={dir.color}/>
            <span style={{ fontSize:12, fontWeight:600, color:dir.color }}>{dir.label}</span>
          </div>
          <p style={{ fontSize:11, color:'#636e72' }}>{analysis.confidence_level}% confianza</p>
        </div>
      </div>
      <div style={{ height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, marginBottom:12 }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${analysis.confidence_level}%` }}
          transition={{ delay:0.3, duration:0.8 }} style={{ height:'100%', background:dir.color, borderRadius:2 }}/>
      </div>
      <p style={{ fontSize:13, color:'#a4b0be', marginBottom:14, lineHeight:1.5 }}>{analysis.summary}</p>
      {analysis.key_levels && (analysis.key_levels.entry||analysis.key_levels.sl) && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, marginBottom:12 }}>
          {analysis.key_levels.entry && <div style={{ fontSize:11, background:'rgba(108,92,231,0.15)', color:'#a29bfe', padding:'3px 8px', borderRadius:4 }}>Entrada: {analysis.key_levels.entry}</div>}
          {analysis.key_levels.sl && <div style={{ fontSize:11, background:'rgba(255,71,87,0.12)', color:'#ff6b81', padding:'3px 8px', borderRadius:4 }}>SL: {analysis.key_levels.sl}</div>}
          {analysis.key_levels.tp?.[0] && <div style={{ fontSize:11, background:'rgba(0,208,132,0.12)', color:'#00d084', padding:'3px 8px', borderRadius:4 }}>TP: {analysis.key_levels.tp[0]}</div>}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {expiringSoon && <AlertTriangle size={12} color="#ffa502"/>}
          <span style={{ fontSize:11, color:expiringSoon?'#ffa502':'#636e72' }}>Válido: {validUntil.toLocaleDateString('es-CL')}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#636e72' }}>
          <Target size={11}/><span>Pessaro Research</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── ArticleModal ─────────────────────────────────────────────────────────────
const ArticleModal = ({ article, onClose }: { article:Article|null; onClose:()=>void }) => {
  if (!article) return null;
  const catColor = categoryColors[article.category]||'#6c5ce7';
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:0.95 }} onClick={e=>e.stopPropagation()}
          style={{ background:'#13151f', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:16, padding:'24px 28px', maxWidth:680, width:'100%',
            maxHeight:'85vh', overflowY:'auto' as const }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:600, color:catColor, textTransform:'uppercase' as const,
              letterSpacing:'0.08em', background:`${catColor}20`, padding:'3px 8px', borderRadius:4 }}>
              {categoryLabels[article.category]}
            </span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#636e72', cursor:'pointer', fontSize:20 }}>×</button>
          </div>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f2f6', lineHeight:1.3, marginBottom:12 }}>{article.title}</h2>
          <div style={{ display:'flex', flexWrap:'wrap' as const, gap:12, marginBottom:20, paddingBottom:16, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#dfe6e9' }}>{article.author_name}</p>
              <p style={{ fontSize:12, color:'#636e72' }}>{article.author_role}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, color:'#636e72', fontSize:12 }}>
              <Clock size={12}/><span>{article.read_time_minutes} min</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, color:'#ffa502', fontSize:12 }}>
              <Lock size={12}/><span>Exclusivo</span>
            </div>
          </div>
          <p style={{ fontSize:15, color:'#a4b0be', lineHeight:1.8 }}>{article.summary}</p>
          {article.tags?.length > 0 && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginTop:20 }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ fontSize:11, color:'#6c5ce7', background:'rgba(108,92,231,0.15)', padding:'3px 8px', borderRadius:4 }}>#{tag}</span>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── AccountSection — editable ────────────────────────────────────────────────
const AccountSection = ({ profile, account, onSave, onContactAdvisor }: {
  profile:any; account:any; onSave:(d:any)=>Promise<void>; onContactAdvisor:()=>void;
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [kycUserId, setKycUserId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState({
    first_name:     profile.first_name    ||'',
    last_name:      profile.last_name     ||'',
    phone:          profile.phone         ||'',
    risk_tolerance: profile.risk_tolerance||'moderado',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setKycUserId(data.user.id);
    });
  }, []);

  const fieldStyle: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.06)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:8,
    padding:'9px 12px', color:'#f1f2f6', fontSize:14, outline:'none', boxSizing:'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize:11, color:'#636e72', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, display:'block',
  };
  const rowStyle: React.CSSProperties = { paddingBottom:16, marginBottom:16, borderBottom:'1px solid rgba(255,255,255,0.05)' };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await onSave(form);
      setSaved(true); setEditing(false);
      setTimeout(()=>setSaved(false), 2500);
    } catch(e:any) { setError(e.message||'Error al guardar'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap' as const, gap:12 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f2f6', marginBottom:4 }}>Mi Cuenta</h2>
          <p style={{ fontSize:13, color:'#636e72' }}>Información personal y detalles de trading</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {!editing ? (
            <button onClick={()=>setEditing(true)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
                background:'rgba(108,92,231,0.15)', border:'1px solid rgba(108,92,231,0.35)',
                borderRadius:8, color:'#a29bfe', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              <Edit2 size={13}/>Editar perfil
            </button>
          ) : (
            <>
              <button onClick={()=>{ setForm({ first_name:profile.first_name||'', last_name:profile.last_name||'', phone:profile.phone||'', risk_tolerance:profile.risk_tolerance||'moderado' }); setEditing(false); setError(''); }} disabled={saving}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:8, color:'#a4b0be', cursor:'pointer', fontSize:13 }}>
                <XCircle size={13}/>Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
                  background:'rgba(0,208,132,0.2)', border:'1px solid rgba(0,208,132,0.4)',
                  borderRadius:8, color:'#00d084', cursor:saving?'default':'pointer', fontSize:13, fontWeight:600 }}>
                {saving ? <RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }}/> : <Save size={13}/>}
                {saving?'Guardando…':'Guardar'}
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px',
              background:'rgba(0,208,132,0.12)', border:'1px solid rgba(0,208,132,0.3)',
              borderRadius:10, marginBottom:20, color:'#00d084', fontSize:13 }}>
            <Check size={15}/>Cambios guardados correctamente
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px',
              background:'rgba(255,71,87,0.1)', border:'1px solid rgba(255,71,87,0.3)',
              borderRadius:10, marginBottom:20, color:'#ff6b81', fontSize:13 }}>
            <AlertOctagon size={15}/>{error}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
        {/* Información Personal */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(108,92,231,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <User size={15} color="#6c5ce7"/>
            </div>
            <h3 style={{ fontSize:14, fontWeight:600, color:'#dfe6e9' }}>Información Personal</h3>
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Nombre</label>
            {editing ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))} placeholder="Nombre" style={fieldStyle}/>
                <input value={form.last_name}  onChange={e=>setForm(f=>({...f,last_name:e.target.value}))}  placeholder="Apellido" style={fieldStyle}/>
              </div>
            ) : (
              <p style={{ fontSize:14, color:'#f1f2f6', fontWeight:500 }}>{profile.first_name} {profile.last_name}</p>
            )}
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Email</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Mail size={13} color="#636e72"/>
              <p style={{ fontSize:14, color:'#a4b0be', fontWeight:500 }}>{profile.email}</p>
              <span style={{ fontSize:10, color:'#636e72', background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:4 }}>fijo</span>
            </div>
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Teléfono</label>
            {editing ? (
              <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+56 9 XXXX XXXX" style={fieldStyle}/>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Phone size={13} color="#636e72"/>
                <p style={{ fontSize:14, color:'#f1f2f6', fontWeight:500 }}>{profile.phone||'No registrado'}</p>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Tolerancia al riesgo</label>
            {editing ? (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const }}>
                {RISK_OPTIONS.map(opt=>(
                  <button key={opt} onClick={()=>setForm(f=>({...f,risk_tolerance:opt}))}
                    style={{ padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:500,
                      cursor:'pointer', textTransform:'capitalize' as const,
                      background:form.risk_tolerance===opt?'rgba(108,92,231,0.25)':'rgba(255,255,255,0.04)',
                      border:form.risk_tolerance===opt?'1px solid rgba(108,92,231,0.5)':'1px solid rgba(255,255,255,0.1)',
                      color:form.risk_tolerance===opt?'#a29bfe':'#a4b0be' }}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6,
                background:'rgba(108,92,231,0.15)', border:'1px solid rgba(108,92,231,0.3)',
                borderRadius:8, padding:'5px 12px' }}>
                <AlertCircle size={12} color="#a29bfe"/>
                <span style={{ fontSize:14, color:'#a29bfe', fontWeight:500, textTransform:'capitalize' as const }}>
                  {profile.risk_tolerance||'No definida'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verificación KYC */}
        <div style={{ marginBottom:0 }}>
          <KYCVerification
            userId={kycUserId}
            onComplete={(status, sessionId) => {
              console.log('[KYC] Completed:', status, sessionId);
            }}
          />
        </div>

        {/* Cuenta de Trading */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(9,132,227,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <TrendingUp size={15} color="#0984e3"/>
            </div>
            <h3 style={{ fontSize:14, fontWeight:600, color:'#dfe6e9' }}>Cuenta de Trading</h3>
          </div>
          {account ? ([
            ['N° Cuenta',      `PC-${account.account_number}`, '#6c5ce7'],
            ['Tipo',           account.account_type,           '#0984e3'],
            ['Moneda',         account.currency,               '#a4b0be'],
            ['Apalancamiento', account.leverage,               '#00d084'],
            ['Estado',         account.status==='active'?'Activa':account.status,
                               account.status==='active'?'#00d084':'#ffa502'],
          ] as [string,string,string][]).map(([label,value,color])=>(
            <div key={label} style={rowStyle}>
              <p style={{ fontSize:11, color:'#636e72', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:5 }}>{label}</p>
              <p style={{ fontSize:14, color, fontWeight:600, textTransform:'capitalize' as const }}>{value}</p>
            </div>
          )) : <p style={{ color:'#636e72', fontSize:13 }}>Sin cuenta de trading asociada.</p>}
          <div style={{ marginTop:8, padding:14, background:'rgba(108,92,231,0.08)',
            border:'1px solid rgba(108,92,231,0.2)', borderRadius:10 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'#a29bfe', marginBottom:4 }}>¿Necesitas ayuda?</p>
            <p style={{ fontSize:12, color:'#636e72', marginBottom:10 }}>Contacta a tu asesor Pessaro Capital</p>
            <button onClick={onContactAdvisor} style={{ display:'inline-flex', alignItems:'center', gap:6,
              fontSize:12, color:'#6c5ce7', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Contactar Asesor <ChevronRight size={12}/>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClientPortal: React.FC = () => {
  const [clientData, setClientData]           = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState('overview');
  const [articles, setArticles]               = useState<Article[]>([]);
  const [analysis, setAnalysis]               = useState<MarketAnalysis[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article|null>(null);
  const [lastRefresh, setLastRefresh]         = useState(new Date());
  const [showAdvisor, setShowAdvisor]         = useState(false);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  // Estado del instrumento para el gráfico de Mercados
  const [chartSymbol, setChartSymbol]         = useState('FX:EURUSD');
  const [symbolInput, setSymbolInput]         = useState('');
  const { isMobile, isDesktop }               = useBreakpoint();
  const navigate                              = useNavigate();

  // Inyectar CSS global
  useEffect(() => {
    const el = document.createElement('style');
    el.innerHTML = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch {} };
  }, []);

  // Cerrar sidebar en desktop
  useEffect(() => { if (isDesktop) setSidebarOpen(false); }, [isDesktop]);

  const loadAll = useCallback(async () => {
    try {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { navigate('/portal-cliente', { replace:true }); return; }
      const [profileRes, accountRes, articlesRes, analysisRes] = await Promise.all([
        supabase.from('client_profiles_2026_02_08_22_02').select('*').eq('user_id',user.id).single(),
        supabase.from('trading_accounts_2026_02_08_22_02').select('*').eq('user_id',user.id).eq('account_type','standard').single(),
        supabase.from('client_exclusive_articles_2026_03_11').select('id,title,summary,category,author_name,author_role,read_time_minutes,tags,published_at').eq('is_published',true).order('published_at',{ ascending:false }),
        supabase.from('client_market_analysis_2026_03_11').select('*').eq('is_published',true).order('published_at',{ ascending:false }),
      ]);
      if (profileRes.data) setClientData({ profile:profileRes.data, account:accountRes.data||null });
      if (articlesRes.data) setArticles(articlesRes.data as Article[]);
      if (analysisRes.data) setAnalysis(analysisRes.data as MarketAnalysis[]);
    } catch(err) { console.error('Portal load error:',err); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/portal-cliente', { replace:true });
  };

  const handleSaveProfile = async (data:any) => {
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');
    const { error } = await supabase
      .from('client_profiles_2026_02_08_22_02')
      .update({ first_name:data.first_name, last_name:data.last_name, phone:data.phone, risk_tolerance:data.risk_tolerance })
      .eq('user_id',user.id);
    if (error) throw error;
    setClientData((prev:any) => ({ ...prev, profile:{ ...prev.profile, ...data } }));
  };

  const navigateTo = (id:string) => { setActiveTab(id); setSidebarOpen(false); };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0d0f17', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }}
          style={{ width:40, height:40, border:'3px solid rgba(108,92,231,0.2)',
            borderTopColor:'#6c5ce7', borderRadius:'50%', margin:'0 auto 16px' }}/>
        <p style={{ color:'#636e72', fontSize:14 }}>Cargando portal seguro...</p>
      </div>
    </div>
  );

  if (!clientData?.profile) return (
    <div style={{ minHeight:'100vh', background:'#0d0f17', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:360, padding:24 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,71,87,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Shield size={28} color="#ff4757"/>
        </div>
        <h3 style={{ fontSize:18, fontWeight:600, color:'#f1f2f6', marginBottom:8 }}>Perfil no encontrado</h3>
        <p style={{ color:'#636e72', fontSize:14, marginBottom:24 }}>No se encontraron datos de tu cuenta. Contacta a soporte.</p>
        <button onClick={()=>navigate('/')} style={{ background:'#6c5ce7', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', cursor:'pointer', fontSize:14 }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );

  const { profile, account } = clientData;
  const accountStatus = account?.status==='active'?'Activa':(account?.status||'Activa');
  const accountType   = account?.account_type
    ? account.account_type.charAt(0).toUpperCase()+account.account_type.slice(1)
    : 'Estándar';
  const accountNumber = account?.account_number||'—';
  const initials      = [profile.first_name?.[0],profile.last_name?.[0]].filter(Boolean).join('').toUpperCase()||'PC';

  const SIDEBAR_W = 228;
  const contentPad = isMobile ? '16px' : '28px 32px';
  const twoCol     = isMobile ? '1fr' : '1fr 1fr';
  const threeCol   = isMobile ? '1fr' : 'repeat(3,1fr)';

  // ── Sidebar inner — reutilizado en desktop y mobile drawer ─────────────────
  // CRÍTICO: flexShrink:0 en header y footer para que el botón logout
  // siempre sea visible sin importar la altura del nav.
  const SidebarInner = () => (
    <>
      {/* Header — flexShrink:0 para que nunca se comprima */}
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
            background:'linear-gradient(135deg,#6c5ce7,#0984e3)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={17} color="#fff"/>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'#f1f2f6' }}>Pessaro</p>
            <p style={{ fontSize:9, color:'#636e72', textTransform:'uppercase' as const, letterSpacing:'0.08em' }}>Portal Cliente</p>
          </div>
        </div>
        {!isDesktop && (
          <button onClick={()=>setSidebarOpen(false)}
            style={{ background:'none', border:'none', color:'#636e72', cursor:'pointer', padding:4, flexShrink:0 }}>
            <X size={18}/>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding:'10px 10px', flex:1, overflowY:'auto' as const, minHeight:0 }}>
        {NAV.map(({ id, label, Icon }) => {
          const active = activeTab===id;
          return (
            <motion.button key={id} whileHover={{ x:2 }} onClick={()=>navigateTo(id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10,
                padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer',
                textAlign:'left' as const, marginBottom:2,
                background:active?'linear-gradient(135deg,rgba(108,92,231,0.22),rgba(9,132,227,0.13))':'transparent',
                color:active?'#a29bfe':'#636e72', fontWeight:active?600:400, fontSize:13,
                borderLeft:active?'2px solid #6c5ce7':'2px solid transparent', transition:'all 0.15s' }}>
              <Icon size={16}/>{label}
            </motion.button>
          );
        })}

        {/* ── Cerrar sesión — justo debajo de Mi Cuenta en el nav ── */}
        <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'8px 4px' }}/>
        <motion.button whileHover={{ x:2 }} onClick={handleSignOut}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer',
            textAlign:'left' as const, marginBottom:2,
            background:'rgba(255,71,87,0.06)',
            color:'#ff6b81', fontWeight:400, fontSize:13,
            borderLeft:'2px solid transparent', transition:'all 0.15s' }}>
          <LogOut size={16}/>Cerrar sesión
        </motion.button>
      </nav>

      {/* Footer — solo info del usuario, sin botón logout */}
      <div style={{ padding:'12px 14px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#6c5ce7,#0984e3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:700, color:'#fff' }}>
            {initials}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'#dfe6e9', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {profile.first_name}
            </p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'#00d084' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#00d084', display:'inline-block' }}/>
              {accountNumber}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0d0f17', display:'flex' }}>

      {/* ── SIDEBAR desktop: fixed ─────────────────────────────────────────── */}
      {isDesktop && (
        <aside style={{ width:SIDEBAR_W, background:'rgba(255,255,255,0.022)',
          borderRight:'1px solid rgba(255,255,255,0.06)',
          display:'flex', flexDirection:'column', position:'fixed', height:'100vh', zIndex:100 }}>
          <SidebarInner/>
        </aside>
      )}

      {/* ── SIDEBAR móvil/tablet: overlay + drawer ─────────────────────────── */}
      {!isDesktop && (
        <>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                onClick={()=>setSidebarOpen(false)}
                style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200 }}/>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside initial={{ x:-SIDEBAR_W }} animate={{ x:0 }} exit={{ x:-SIDEBAR_W }}
                transition={{ type:'tween', duration:0.22 }}
                style={{ width:SIDEBAR_W, background:'#12141c',
                  borderRight:'1px solid rgba(255,255,255,0.06)',
                  display:'flex', flexDirection:'column',
                  position:'fixed', height:'100vh', zIndex:201 }}>
                <SidebarInner/>
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <main style={{ marginLeft:isDesktop?SIDEBAR_W:0, flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar — background opaco para eliminar barra blanca al cargar */}
        <div style={{ position:'sticky', top:0, zIndex:50,
          background:'#0d0f17',
          borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding:isMobile?'12px 16px':'14px 32px',
            display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {!isDesktop && (
                <button onClick={()=>setSidebarOpen(true)}
                  style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                    borderRadius:8, width:36, height:36, display:'flex', alignItems:'center',
                    justifyContent:'center', cursor:'pointer', color:'#a4b0be', flexShrink:0 }}>
                  <Menu size={18}/>
                </button>
              )}
              <div>
                <h1 style={{ fontSize:isMobile?15:17, fontWeight:700, color:'#f1f2f6', letterSpacing:'-0.02em' }}>
                  {NAV.find(n=>n.id===activeTab)?.label}
                </h1>
                {!isMobile && (
                  <p style={{ fontSize:11, color:'#636e72' }}>
                    {new Date().toLocaleDateString('es-CL',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {!isMobile && (
                <span style={{ fontSize:11, color:'#636e72' }}>
                  Actualizado: {lastRefresh.toLocaleTimeString('es-CL',{ hour:'2-digit', minute:'2-digit' })}
                </span>
              )}
              <motion.button whileTap={{ rotate:180 }}
                onClick={()=>{ setLoading(true); setLastRefresh(new Date()); loadAll(); }}
                style={{ width:32, height:32, borderRadius:8, border:'1px solid rgba(255,255,255,0.08)',
                  background:'rgba(255,255,255,0.04)', color:'#a4b0be', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                <RefreshCw size={14}/>
              </motion.button>
              <div style={{ display:'flex', alignItems:'center', gap:5,
                background:'rgba(255,165,2,0.1)', border:'1px solid rgba(255,165,2,0.25)',
                borderRadius:8, padding:isMobile?'5px 8px':'5px 12px' }}>
                <Star size={11} color="#ffa502" fill="#ffa502"/>
                {!isMobile && <span style={{ fontSize:11, color:'#ffa502', fontWeight:600 }}>CLIENTE PREMIUM</span>}
              </div>
            </div>
          </div>
          {/* Ticker tape — background forzado oscuro para evitar flash blanco */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', background:'#0d0f17', minHeight:46 }}>
            <TradingViewTickerTape theme="dark"/>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:contentPad, flex:1 }}>
          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {activeTab==='overview' && (
              <motion.div key="overview" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                  style={{ background:'linear-gradient(135deg,rgba(108,92,231,0.13),rgba(9,132,227,0.08))',
                    border:'1px solid rgba(108,92,231,0.22)', borderRadius:14,
                    padding:isMobile?'16px 18px':'22px 28px', marginBottom:20,
                    overflow:'hidden', position:'relative' }}>
                  <div style={{ position:'absolute', right:-40, top:-40, width:200, height:200,
                    background:'radial-gradient(circle,rgba(108,92,231,0.18),transparent 70%)', borderRadius:'50%' }}/>
                  <p style={{ fontSize:12, color:'#a29bfe', fontWeight:500, marginBottom:4 }}>Bienvenido, {profile.first_name}</p>
                  <h2 style={{ fontSize:isMobile?17:20, fontWeight:700, color:'#f1f2f6', letterSpacing:'-0.02em' }}>
                    Aquí está el resumen de tu cuenta.
                  </h2>
                </motion.div>

                <div style={{ display:'grid', gridTemplateColumns:threeCol, gap:14, marginBottom:20 }}>
                  <StatusCard label="Estado" value={accountStatus} Icon={CheckCircle2} accent="#00d084" delay={0.05} iconBg="rgba(0,208,132,0.15)" valueBg="rgba(0,208,132,0.12)"/>
                  <StatusCard label="Tipo de Cuenta" value={accountType} Icon={AlertCircle} accent="#ffa502" delay={0.10} iconBg="rgba(255,165,2,0.15)" valueBg="rgba(255,165,2,0.12)"/>
                  <StatusCard label="Nº de Cuenta" value={`PC-${accountNumber}`} Icon={Hash} accent="#6c5ce7" delay={0.15} iconBg="rgba(108,92,231,0.18)" valueBg="rgba(108,92,231,0.13)"/>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:twoCol, gap:14, marginBottom:20 }}>
                  <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <h3 style={{ fontSize:13, fontWeight:600, color:'#dfe6e9' }}>Últimos análisis</h3>
                      <button onClick={()=>setActiveTab('analysis')} style={{ fontSize:11, color:'#6c5ce7', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                        Ver todos <ChevronRight size={11}/>
                      </button>
                    </div>
                    {analysis.slice(0,3).map(a=>{ const dir=directionConfig[a.direction]||directionConfig.neutral; const DirIcon=dir.Icon; return (
                      <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display:'flex', gap:8 }}>
                          <span style={{ fontWeight:700, fontSize:13, color:'#f1f2f6', minWidth:56 }}>{a.instrument}</span>
                          <span style={{ fontSize:12, color:'#636e72' }}>{a.timeframe}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:4, color:dir.color, fontSize:12, fontWeight:600 }}>
                          <DirIcon size={12}/>{dir.label}
                        </div>
                      </div>
                    );})}
                    {analysis.length===0 && <p style={{ fontSize:13, color:'#636e72' }}>Sin análisis.</p>}
                  </div>

                  <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <h3 style={{ fontSize:13, fontWeight:600, color:'#dfe6e9' }}>Artículos Exclusivos</h3>
                      <button onClick={()=>setActiveTab('articles')} style={{ fontSize:11, color:'#6c5ce7', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                        Ver todos <ChevronRight size={11}/>
                      </button>
                    </div>
                    {articles.slice(0,3).map(a=>(
                      <div key={a.id} onClick={()=>setSelectedArticle(a)}
                        style={{ padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer' }}>
                        <p style={{ fontSize:13, color:'#dfe6e9', marginBottom:3, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</p>
                        <div style={{ display:'flex', gap:8 }}>
                          <span style={{ fontSize:10, color:categoryColors[a.category]||'#6c5ce7', textTransform:'uppercase' as const, letterSpacing:'0.06em' }}>{categoryLabels[a.category]}</span>
                          <span style={{ fontSize:10, color:'#636e72' }}>{a.read_time_minutes} min</span>
                        </div>
                      </div>
                    ))}
                    {articles.length===0 && <p style={{ fontSize:13, color:'#636e72' }}>Sin artículos.</p>}
                  </div>
                </div>

                <WidgetCard title="Mini gráfico">
                  <TradingViewSymbolOverview height={isMobile?160:200} theme="dark"/>
                </WidgetCard>
              </motion.div>
            )}

            {/* MARKETS — selector de instrumento + gráfico avanzado */}
            {activeTab==='markets' && (
              <motion.div key="markets" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:'grid', gap:16 }}>

                {/* Panel selector */}
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 20px' }}>
                  <p style={{ fontSize:11, color:'#7f8c9a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
                    Buscar instrumento
                  </p>

                  {/* Quick picks */}
                  <div style={{ display:'flex', flexWrap:'wrap' as const, gap:6, marginBottom:14 }}>
                    {QUICK_SYMBOLS.map(({ label, sym }) => {
                      const active = chartSymbol===sym;
                      return (
                        <button key={sym} onClick={()=>setChartSymbol(sym)}
                          style={{ padding:'5px 12px', borderRadius:20, fontSize:12,
                            fontWeight:active?600:400, cursor:'pointer', transition:'all 0.15s',
                            background:active?'rgba(108,92,231,0.25)':'rgba(255,255,255,0.04)',
                            border:active?'1px solid rgba(108,92,231,0.55)':'1px solid rgba(255,255,255,0.09)',
                            color:active?'#a29bfe':'#a4b0be' }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input manual — acepta formato EXCHANGE:SYMBOL */}
                  <form onSubmit={e=>{ e.preventDefault(); const v=symbolInput.trim().toUpperCase(); if(!v) return;
                    setChartSymbol(v.includes(':')?v:`FX:${v}`); setSymbolInput(''); }}
                    style={{ display:'flex', gap:8 }}>
                    <input value={symbolInput} onChange={e=>setSymbolInput(e.target.value)}
                      placeholder="Ej: NASDAQ:AMZN · FX:USDCHF · BINANCE:SOLUSDT"
                      style={{ flex:1, background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
                        padding:'9px 14px', color:'#f1f2f6', fontSize:13, outline:'none' }}/>
                    <button type="submit"
                      style={{ padding:'9px 18px', borderRadius:8, border:'none',
                        background:'linear-gradient(135deg,#6c5ce7,#0984e3)',
                        color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' as const }}>
                      Ver gráfico
                    </button>
                  </form>
                  <p style={{ fontSize:11, color:'#636e72', marginTop:8 }}>
                    Activo: <span style={{ color:'#a29bfe', fontWeight:600 }}>{chartSymbol}</span>
                    <span style={{ color:'#636e72', marginLeft:8 }}>· También puedes buscar desde dentro del gráfico</span>
                  </p>
                </div>

                {/* Gráfico — key={chartSymbol} fuerza remount completo al cambiar símbolo
                    allow_symbol_change=true activa el buscador interno de TradingView */}
                <WidgetCard title={`Gráfico Avanzado · ${chartSymbol}`}>
                  <TradingViewAdvancedChart
                    key={chartSymbol}
                    symbol={chartSymbol}
                    height={isMobile?360:560}
                    theme="dark"
                    allow_symbol_change={true}
                  />
                </WidgetCard>
              </motion.div>
            )}

            {/* SCREENER */}
            {activeTab==='screener' && (
              <motion.div key="screener" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ marginBottom:20 }}>
                  <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f2f6', marginBottom:4 }}>Screener</h2>
                  <p style={{ fontSize:13, color:'#636e72' }}>Explora instrumentos por mercado</p>
                </div>
                <WidgetCard title="Screener de Mercados">
                  <TradingViewMarketScreener height={isMobile?420:560} theme="dark" market="forex"/>
                </WidgetCard>
              </motion.div>
            )}

            {/* ANALYSIS */}
            {activeTab==='analysis' && (
              <motion.div key="analysis" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap' as const, gap:10 }}>
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f2f6', marginBottom:4 }}>Análisis de Mercado</h2>
                    <p style={{ fontSize:13, color:'#636e72' }}>Setups exclusivos · {analysis.length} activos</p>
                  </div>
                  <div style={{ fontSize:11, color:'#ffa502', background:'rgba(255,165,2,0.1)',
                    border:'1px solid rgba(255,165,2,0.25)', padding:'4px 12px',
                    borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
                    <Lock size={10}/><span>Exclusivo</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:twoCol, gap:14 }}>
                  {analysis.map((a,i)=>(
                    <motion.div key={a.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                      <AnalysisCard analysis={a}/>
                    </motion.div>
                  ))}
                  {analysis.length===0 && (
                    <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:'#636e72' }}>
                      <BarChart2 size={40} style={{ margin:'0 auto 12px', opacity:0.4 }}/>
                      <p>No hay análisis publicados aún.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ARTICLES */}
            {activeTab==='articles' && (
              <motion.div key="articles" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap' as const, gap:10 }}>
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f2f6', marginBottom:4 }}>Artículos Exclusivos</h2>
                    <p style={{ fontSize:13, color:'#636e72' }}>{articles.length} artículos para clientes</p>
                  </div>
                  <div style={{ fontSize:11, color:'#ffa502', background:'rgba(255,165,2,0.1)',
                    border:'1px solid rgba(255,165,2,0.25)', padding:'4px 12px',
                    borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
                    <BookMarked size={10}/><span>Solo clientes</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:twoCol, gap:14 }}>
                  {articles.map((a,i)=>(
                    <motion.div key={a.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                      <ArticleCard article={a} onClick={()=>setSelectedArticle(a)}/>
                    </motion.div>
                  ))}
                  {articles.length===0 && (
                    <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:'#636e72' }}>
                      <BookOpen size={40} style={{ margin:'0 auto 12px', opacity:0.4 }}/>
                      <p>No hay artículos publicados aún.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CALENDAR */}
            {activeTab==='calendar' && (
              <motion.div key="calendar" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ marginBottom:20 }}>
                  <h2 style={{ fontSize:18, fontWeight:700, color:'#f1f2f6', marginBottom:4 }}>Calendario Económico</h2>
                  <p style={{ fontSize:13, color:'#636e72' }}>Eventos macroeconómicos y datos clave</p>
                </div>
                <WidgetCard title="Calendario">
                  <TradingViewEconomicCalendar height={isMobile?480:600} theme="dark"/>
                </WidgetCard>
              </motion.div>
            )}

            {/* ACCOUNT */}
            {activeTab==='account' && (
              <AccountSection
                key={JSON.stringify(clientData.profile)}
                profile={clientData.profile}
                account={account}
                onSave={handleSaveProfile}
                onContactAdvisor={()=>setShowAdvisor(true)}
              />
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Article modal */}
      <ArticleModal article={selectedArticle} onClose={()=>setSelectedArticle(null)}/>

      {/* Advisor popup */}
      {showAdvisor && (
        <div onClick={()=>setShowAdvisor(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex',
            alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:'#16213e', border:'1px solid rgba(108,92,231,0.3)',
              borderRadius:16, padding:isMobile?20:32, maxWidth:420, width:'100%',
              boxShadow:'0 25px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(108,92,231,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👤</div>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:'#f1f2f6', margin:0 }}>Asesor Comercial</p>
                  <p style={{ fontSize:12, color:'#a29bfe', margin:0 }}>Pessaro Capital</p>
                </div>
              </div>
              <button onClick={()=>setShowAdvisor(false)}
                style={{ background:'none', border:'none', color:'#636e72', cursor:'pointer', fontSize:20 }}>✕</button>
            </div>
            <p style={{ fontSize:13, color:'#b2bec3', marginBottom:20, lineHeight:1.6 }}>
              Estamos aquí para ayudarte. Elige cómo prefieres contactar a tu asesor:
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { href:'mailto:info@pessarocapital.com', bg:'rgba(108,92,231,0.12)', border:'rgba(108,92,231,0.25)', emoji:'✉️', label:'Enviar Email', sub:'info@pessarocapital.com' },
                { href:'https://wa.me/56922071511?text=Hola,%20soy%20cliente%20Pessaro%20Capital', bg:'rgba(37,211,102,0.1)', border:'rgba(37,211,102,0.25)', emoji:'💬', label:'WhatsApp', sub:'+56 9 2207 1511' },
                { href:'https://www.linkedin.com/company/pessarocapital', bg:'rgba(0,119,181,0.1)', border:'rgba(0,119,181,0.25)', emoji:'💼', label:'LinkedIn', sub:'Pessaro Capital' },
              ].map(({ href, bg, border, emoji, label, sub })=>(
                <a key={label} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                    background:bg, border:`1px solid ${border}`, borderRadius:10,
                    textDecoration:'none', color:'#f1f2f6', fontSize:13, fontWeight:500 }}>
                  <span style={{ fontSize:18 }}>{emoji}</span>
                  <div>
                    <p style={{ margin:0, fontWeight:600, fontSize:13 }}>{label}</p>
                    <p style={{ margin:0, fontSize:11, color:'#636e72' }}>{sub}</p>
                  </div>
                </a>
              ))}
            </div>
            <p style={{ fontSize:11, color:'#636e72', marginTop:20, textAlign:'center' }}>
              Lunes a Viernes · 09:00 – 18:00 hrs · Santiago, Chile
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientPortal;
