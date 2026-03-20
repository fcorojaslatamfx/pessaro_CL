import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, X, Download, RefreshCw, Eye,
  UserCheck, Clock, Globe, FileText, Phone, Mail,
  Calendar, ChevronDown, ChevronUp, TrendingUp,
  CheckCircle, AlertCircle, ArrowLeft, Clock3,
  File, Image, FileCheck, ShieldAlert, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface KycDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  status: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface Client {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  risk_tolerance: string | null;
  experience_level: string | null;
  investment_capital: string | null;
  investment_horizon: string | null;
  interested_instruments: string[] | null;
  investment_goals: string[] | null;
  account_status: string | null;
  account_type: string | null;
  created_via: string | null;
  created_at: string;
  // joined
  account_number: string | null;
  balance: number | null;
  account_trading_status: string | null;
  risk_profile_tolerance: string | null;
  trading_experience: string | null;
  profile_completed: boolean | null;
  // KYC
  kyc_documents?: KycDocument[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const RISK_COLORS: Record<string, string> = {
  conservador: 'bg-blue-100 text-blue-700',
  moderado:    'bg-yellow-100 text-yellow-700',
  agresivo:    'bg-red-100 text-red-700',
};

const VIA_LABELS: Record<string, string> = {
  web_registration: 'Registro Web',
  risk_profile:     'Perfil de Riesgo',
  manual:           'Manual',
};

const DOC_LABELS: Record<string, string> = {
  dni_front:        'DNI / Cédula (frente)',
  dni_back:         'DNI / Cédula (reverso)',
  passport:         'Pasaporte',
  drivers_license:  'Licencia de conducir',
  proof_of_address: 'Comprobante de domicilio',
};

const KYC_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_review: { label: 'Pendiente revisión', color: 'bg-amber-100 text-amber-700',  icon: <Clock3 className="w-3 h-3" /> },
  approved:       { label: 'Aprobado',            color: 'bg-emerald-100 text-emerald-700', icon: <FileCheck className="w-3 h-3" /> },
  rejected:       { label: 'Rechazado',            color: 'bg-red-100 text-red-700',     icon: <ShieldAlert className="w-3 h-3" /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string | null) {
  if (!mime) return <File className="w-4 h-4" />;
  if (mime.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (mime === 'application/pdf') return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ClientsManager() {
  const navigate = useNavigate();

  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [filterRisk, setFilterRisk]     = useState('');
  const [filterVia, setFilterVia]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<keyof Client>('created_at');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected]   = useState<Client | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 15;

  // ── Cargar clientes ──────────────────────────────────────────────────────
  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('client_profiles_2026_02_08_22_02')
        .select(`
          id, user_id, first_name, last_name, email, phone,
          risk_tolerance, experience_level, investment_capital,
          investment_horizon, interested_instruments, investment_goals,
          account_status, account_type, created_via, created_at,
          trading_accounts_2026_02_08_22_02 (account_number, balance, status),
          risk_profiles_2026_02_08_21_16 (risk_tolerance, trading_experience, profile_completed)
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped: Client[] = (data || []).map((c: any) => ({
        ...c,
        account_number:         c.trading_accounts_2026_02_08_22_02?.[0]?.account_number ?? null,
        balance:                c.trading_accounts_2026_02_08_22_02?.[0]?.balance ?? null,
        account_trading_status: c.trading_accounts_2026_02_08_22_02?.[0]?.status ?? null,
        risk_profile_tolerance: c.risk_profiles_2026_02_08_21_16?.[0]?.risk_tolerance ?? null,
        trading_experience:     c.risk_profiles_2026_02_08_21_16?.[0]?.trading_experience ?? null,
        profile_completed:      c.risk_profiles_2026_02_08_21_16?.[0]?.profile_completed ?? null,
      }));
      setClients(mapped);
    } catch (e: any) {
      setError(e.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  // ── Cargar documentos KYC al abrir detalle ────────────────────────────────
  async function loadKycDocuments(client: Client) {
    setSelected({ ...client, kyc_documents: undefined });
    if (!client.user_id) return;
    setKycLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('client_kyc_documents_2026_03_16')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: true });

      if (err) throw err;
      setSelected(prev => prev ? { ...prev, kyc_documents: data || [] } : null);
    } catch (e: any) {
      console.error('KYC load error:', e.message);
      setSelected(prev => prev ? { ...prev, kyc_documents: [] } : null);
    } finally {
      setKycLoading(false);
    }
  }

  // ── Descargar documento KYC ───────────────────────────────────────────────
  async function downloadDocument(doc: KycDocument) {
    try {
      const { data, error: err } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(doc.file_path, 60); // URL válida 60 segundos

      if (err) throw err;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (e: any) {
      alert('Error al generar enlace de descarga: ' + e.message);
    }
  }

  // ── Actualizar estado de documento KYC (aprobar/rechazar) ─────────────────
  async function updateDocumentStatus(docId: string, status: 'approved' | 'rejected', reason?: string) {
    const { error: err } = await supabase
      .from('client_kyc_documents_2026_03_16')
      .update({
        status,
        rejection_reason: reason || null,
        reviewed_at:      new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      })
      .eq('id', docId);

    if (err) { alert('Error al actualizar: ' + err.message); return; }

    // Actualizar estado local
    setSelected(prev => {
      if (!prev) return null;
      return {
        ...prev,
        kyc_documents: prev.kyc_documents?.map(d =>
          d.id === docId ? { ...d, status, rejection_reason: reason || null } : d
        ),
      };
    });
  }

  // ── Filtrado y ordenación ────────────────────────────────────────────────
  const filtered = clients
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').includes(q);
      const matchRisk   = !filterRisk   || (c.risk_tolerance || c.risk_profile_tolerance || '') === filterRisk;
      const matchVia    = !filterVia    || c.created_via === filterVia;
      const matchStatus = !filterStatus || c.account_status === filterStatus;
      return matchSearch && matchRisk && matchVia && matchStatus;
    })
    .sort((a, b) => {
      const av = (a[sortField] ?? '') as string;
      const bv = (b[sortField] ?? '') as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:  clients.length,
    active: clients.filter(c => c.account_status === 'active').length,
    webReg: clients.filter(c => c.created_via === 'web_registration').length,
    today:  clients.filter(c => new Date(c.created_at) > new Date(Date.now() - 86400000)).length,
  };

  function toggleSort(field: keyof Client) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function SortIcon({ field }: { field: keyof Client }) {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 text-blue-600" />;
  }

  function exportCSV() {
    const headers = ['Nombre','Email','Teléfono','Riesgo','Experiencia','Capital','Horizonte','N° Cuenta','Balance','Estado','Vía','Fecha'];
    const rows = filtered.map(c => [
      `${c.first_name} ${c.last_name}`, c.email, c.phone || '',
      c.risk_tolerance || c.risk_profile_tolerance || '',
      c.experience_level || c.trading_experience || '',
      c.investment_capital || '', c.investment_horizon || '',
      c.account_number || '', c.balance?.toString() || '',
      c.account_status || '', VIA_LABELS[c.created_via || ''] || '',
      formatDate(c.created_at),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `clientes_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(ROUTE_PATHS.CMS_DASHBOARD)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Gestión de Clientes
              </h1>
              <p className="text-sm text-gray-500">Registros, perfiles de riesgo, cuentas y documentos KYC</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={loadClients} className="gap-1.5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Clientes',   value: stats.total,  icon: Users,     color: 'text-blue-600',    bg: 'bg-blue-50'    },
            { label: 'Cuentas Activas',  value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Registro Web',     value: stats.webReg, icon: Globe,     color: 'text-purple-600',  bg: 'bg-purple-50'  },
            { label: 'Últimas 24 horas', value: stats.today,  icon: Clock,     color: 'text-orange-600',  bg: 'bg-orange-50'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white">
              <option value="">Todos los riesgos</option>
              <option value="conservador">Conservador</option>
              <option value="moderado">Moderado</option>
              <option value="agresivo">Agresivo</option>
            </select>
            <select value={filterVia} onChange={e => { setFilterVia(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white">
              <option value="">Todas las fuentes</option>
              <option value="web_registration">Registro Web</option>
              <option value="risk_profile">Perfil de Riesgo</option>
              <option value="manual">Manual</option>
            </select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white">
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            {(search || filterRisk || filterVia || filterStatus) && (
              <button onClick={() => { setSearch(''); setFilterRisk(''); setFilterVia(''); setFilterStatus(''); setPage(1); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
            <span className="text-sm text-gray-400 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    { label: 'Cliente',      field: 'first_name'         as keyof Client },
                    { label: 'Contacto',     field: 'email'              as keyof Client },
                    { label: 'Riesgo',       field: 'risk_tolerance'     as keyof Client },
                    { label: 'Capital',      field: 'investment_capital' as keyof Client },
                    { label: 'N° Cuenta',    field: 'account_number'     as keyof Client },
                    { label: 'Balance',      field: 'balance'            as keyof Client },
                    { label: 'Fuente',       field: 'created_via'        as keyof Client },
                    { label: 'Registro',     field: 'created_at'         as keyof Client },
                    { label: '',             field: null },
                  ].map(col => (
                    <th key={col.label} onClick={() => col.field && toggleSort(col.field)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${col.field ? 'cursor-pointer hover:text-gray-700 select-none' : ''}`}>
                      <span className="flex items-center gap-1">{col.label}{col.field && <SortIcon field={col.field} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No se encontraron clientes</p>
                  </td></tr>
                ) : (
                  paginated.map(client => {
                    const riskKey = (client.risk_tolerance || client.risk_profile_tolerance || '').toLowerCase();
                    return (
                      <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {client.first_name[0]}{client.last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                              <p className="text-xs">{client.account_trading_status === 'active'
                                ? <span className="text-emerald-600">● Activo</span>
                                : <span className="text-gray-400">● Inactivo</span>}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">{client.email}</p>
                          {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {riskKey ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${RISK_COLORS[riskKey] || 'bg-gray-100 text-gray-600'}`}>{riskKey}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{client.investment_capital || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{client.account_number || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {client.balance != null ? `USD ${Number(client.balance).toLocaleString('es-CL')}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            client.created_via === 'web_registration' ? 'bg-purple-100 text-purple-700' :
                            client.created_via === 'risk_profile'     ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {VIA_LABELS[client.created_via || ''] || client.created_via || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(client.created_at)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => loadKycDocuments(client)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">Página {page} de {totalPages} · {filtered.length} clientes</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de detalle + documentos KYC ──────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1f6e] to-[#2d3480] px-6 py-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  {selected.first_name[0]}{selected.last_name[0]}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{selected.first_name} {selected.last_name}</h2>
                  <p className="text-blue-200 text-sm">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Datos personales */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Datos Personales
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Email',    value: selected.email,           icon: Mail     },
                    { label: 'Teléfono', value: selected.phone,           icon: Phone    },
                    { label: 'Registro', value: formatDate(selected.created_at), icon: Calendar },
                    { label: 'Fuente',   value: VIA_LABELS[selected.created_via || ''] || selected.created_via, icon: Globe },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <f.icon className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-400 font-medium">{f.label}</p>
                      </div>
                      <p className="text-sm text-gray-800 font-medium truncate">{f.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Perfil de inversión */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Perfil de Inversión
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tolerancia al riesgo', value: selected.risk_tolerance || selected.risk_profile_tolerance, highlight: true },
                    { label: 'Nivel de experiencia', value: selected.experience_level || selected.trading_experience },
                    { label: 'Capital',              value: selected.investment_capital },
                    { label: 'Horizonte',            value: selected.investment_horizon },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-medium mb-1">{f.label}</p>
                      {f.highlight && f.value ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${RISK_COLORS[(f.value || '').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{f.value}</span>
                      ) : (
                        <p className="text-sm text-gray-800 font-medium">{f.value || '—'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Cuenta de trading */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Cuenta de Trading
                </h3>
                <div className="bg-gradient-to-r from-[#1a1f6e]/5 to-[#2d3480]/5 border border-[#1a1f6e]/10 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">N° de Cuenta</p>
                      <p className="font-mono font-bold text-gray-800 text-sm mt-0.5">{selected.account_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">
                        {selected.balance != null ? `USD ${Number(selected.balance).toLocaleString('es-CL')}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Estado</p>
                      <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${selected.account_trading_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {selected.account_trading_status || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Documentos KYC ─────────────────────────────────────────── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Documentos KYC
                </h3>

                {kycLoading ? (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Cargando documentos...
                  </div>
                ) : !selected.kyc_documents || selected.kyc_documents.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">Sin documentos cargados</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        El cliente no ha subido documentos de verificación. Puede hacerlo desde Mi Cuenta.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selected.kyc_documents.map(doc => {
                      const statusInfo = KYC_STATUS[doc.status || ''] || KYC_STATUS['pending_review'];
                      return (
                        <div key={doc.id} className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
                          {/* Ícono de tipo de archivo */}
                          <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                            {fileIcon(doc.mime_type)}
                          </div>

                          {/* Info del archivo */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {DOC_LABELS[doc.document_type] || doc.document_type}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {doc.file_name} · {formatBytes(doc.file_size)} · {formatDate(doc.created_at)}
                            </p>
                          </div>

                          {/* Badge de estado */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>

                          {/* Acciones */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => downloadDocument(doc)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Descargar / ver archivo"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {doc.status === 'pending_review' && (
                              <>
                                <button
                                  onClick={() => updateDocumentStatus(doc.id, 'approved')}
                                  className="p-1.5 rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-colors"
                                  title="Aprobar documento"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Motivo de rechazo (opcional):');
                                    updateDocumentStatus(doc.id, 'rejected', reason || undefined);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Rechazar documento"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Resumen KYC */}
                    <div className="flex items-center gap-4 pt-1 text-xs text-gray-400">
                      <span>{selected.kyc_documents.filter(d => d.status === 'approved').length} aprobados</span>
                      <span>{selected.kyc_documents.filter(d => d.status === 'pending_review').length} pendientes</span>
                      <span>{selected.kyc_documents.filter(d => d.status === 'rejected').length} rechazados</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Perfil completado */}
              <div className="flex items-center gap-2 text-sm">
                {selected.profile_completed
                  ? <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 font-medium">Perfil de riesgo completado</span></>
                  : <><AlertCircle className="w-4 h-4 text-amber-500" /><span className="text-amber-600">Perfil de riesgo pendiente</span></>
                }
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
