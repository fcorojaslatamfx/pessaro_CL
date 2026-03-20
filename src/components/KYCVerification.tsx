import { useState, useEffect, useRef } from 'react';
import { DiditSdk } from '@didit-protocol/sdk-web';
import { supabase } from '@/integrations/supabase/client';
import {
  ShieldCheck, ShieldX, Clock, Loader2,
  FileText, Upload, RefreshCw, Plus, AlertCircle, CheckCircle2
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type KYCStatus = 'not_started' | 'pending' | 'Approved' | 'Declined';
type DocStatus = 'pending_review' | 'approved' | 'rejected' | 'not_uploaded';

interface KYCDocument {
  id?: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: DocStatus;
  created_at?: string;
}

interface KYCVerificationProps {
  userId?: string;
  onComplete?: (status: string, sessionId: string) => void;
}

// ─── Config de tipos de documento ────────────────────────────────────────────
const DOC_TYPES: Record<string, { label: string; required: boolean }> = {
  dni_front:        { label: 'DNI / Cédula (frente)',    required: true  },
  dni_back:         { label: 'DNI / Cédula (reverso)',   required: false },
  passport:         { label: 'Pasaporte',                required: false },
  drivers_license:  { label: 'Licencia de conducir',     required: false },
  proof_of_address: { label: 'Comprobante de domicilio', required: true  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocStatusBadge({ status }: { status: DocStatus }) {
  const map: Record<DocStatus, { label: string; color: string; bg: string }> = {
    approved:       { label: 'Aprobado',    color: '#00d084', bg: 'rgba(0,208,132,0.1)'  },
    pending_review: { label: 'En revisión', color: '#ffa502', bg: 'rgba(255,165,2,0.1)'  },
    rejected:       { label: 'Rechazado',   color: '#ff4757', bg: 'rgba(255,71,87,0.1)'  },
    not_uploaded:   { label: 'No cargado',  color: '#636e72', bg: 'rgba(99,110,114,0.1)' },
  };
  const { label, color, bg } = map[status] || map.not_uploaded;
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 20,
      background: bg, color, border: `0.5px solid ${color}40`,
      fontWeight: 500, whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </span>
  );
}

function KYCStatusBadge({ status }: { status: KYCStatus }) {
  const map: Record<KYCStatus, { label: string; color: string; bg: string; Icon: any }> = {
    not_started: { label: 'Sin verificar', color: '#636e72', bg: 'rgba(99,110,114,0.1)', Icon: ShieldX     },
    pending:     { label: 'En revisión',   color: '#ffa502', bg: 'rgba(255,165,2,0.1)',  Icon: Clock       },
    Approved:    { label: 'Verificado',    color: '#00d084', bg: 'rgba(0,208,132,0.1)',  Icon: ShieldCheck },
    Declined:    { label: 'Rechazado',     color: '#ff4757', bg: 'rgba(255,71,87,0.1)',  Icon: ShieldX     },
  };
  const { label, color, bg, Icon } = map[status] || map.not_started;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, padding: '3px 10px', borderRadius: 20,
      background: bg, color, border: `0.5px solid ${color}40`, fontWeight: 500,
    }}>
      <Icon size={12} />
      {label}
    </span>
  );
}

// ─── Subcomponente: Lista de Documentos ──────────────────────────────────────
function KYCDocuments({ userId }: { userId: string }) {
  const [docs, setDocs]           = useState<KYCDocument[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [pendingDocType, setPendingDocType] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu]       = useState(false);

  useEffect(() => { loadDocs(); }, [userId]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_kyc_documents_2026_03_16')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocs(data || []);
    } catch {
      setError('Error cargando documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { setError('El archivo no puede superar 10 MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) { setError('Solo se permiten JPG, PNG, WEBP o PDF'); return; }

    setUploading(u => ({ ...u, [docType]: true }));
    setError(null); setSuccess(null);

    try {
      const ext      = file.name.split('.').pop() || 'bin';
      const safeName = `${docType}_${Date.now()}.${ext}`;
      const path     = `${userId}/${docType}/${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from('kyc-documents')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadErr) throw uploadErr;

      const existing = docs.find(d => d.document_type === docType);
      if (existing?.id) {
        const { error: dbErr } = await supabase
          .from('client_kyc_documents_2026_03_16')
          .update({ file_path: path, file_name: file.name, file_size: file.size,
            mime_type: file.type, status: 'pending_review', updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await supabase
          .from('client_kyc_documents_2026_03_16')
          .insert({ user_id: userId, document_type: docType, file_path: path,
            file_name: file.name, file_size: file.size, mime_type: file.type,
            status: 'pending_review', created_at: new Date().toISOString(),
            updated_at: new Date().toISOString() });
        if (dbErr) throw dbErr;
      }

      setSuccess(`${DOC_TYPES[docType]?.label || docType} cargado correctamente`);
      setTimeout(() => setSuccess(null), 3000);
      await loadDocs();
      setShowAddMenu(false);
    } catch (e: any) {
      setError(e.message || 'Error al subir el documento');
    } finally {
      setUploading(u => ({ ...u, [docType]: false }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (docType: string) => {
    setPendingDocType(docType);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const uploadedTypes = docs.map(d => d.document_type);
  const missingTypes  = Object.keys(DOC_TYPES).filter(t => !uploadedTypes.includes(t));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#636e72', fontSize: 13, padding: '8px 0' }}>
      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      Cargando documentos...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={e => pendingDocType && handleFileSelect(e, pendingDocType)}
      />

      {/* Alertas */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
          background: 'rgba(255,71,87,0.08)', border: '0.5px solid rgba(255,71,87,0.25)',
          borderRadius: 8, color: '#ff4757', fontSize: 12 }}>
          <AlertCircle size={12} />{error}
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
          background: 'rgba(0,208,132,0.08)', border: '0.5px solid rgba(0,208,132,0.25)',
          borderRadius: 8, color: '#00d084', fontSize: 12 }}>
          <CheckCircle2 size={12} />{success}
        </div>
      )}

      {/* Lista de documentos cargados */}
      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#636e72', fontSize: 12 }}>
          <FileText size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p>No has cargado documentos aún.</p>
          <p style={{ fontSize: 11, marginTop: 3 }}>Sube tu DNI y comprobante de domicilio.</p>
        </div>
      ) : (
        <div>
          {docs.map(doc => (
            <div key={doc.id || doc.document_type} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: doc.status === 'approved' ? 'rgba(0,208,132,0.1)'
                    : doc.status === 'rejected' ? 'rgba(255,71,87,0.1)'
                    : 'rgba(255,165,2,0.1)',
                }}>
                  <FileText size={12} color={
                    doc.status === 'approved' ? '#00d084'
                    : doc.status === 'rejected' ? '#ff4757' : '#ffa502'
                  } />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#f1f2f6', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {DOC_TYPES[doc.document_type]?.label || doc.document_type}
                  </div>
                  <div style={{ fontSize: 10, color: '#636e72' }}>
                    {formatBytes(doc.file_size)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                <DocStatusBadge status={doc.status as DocStatus} />
                <button
                  onClick={() => triggerUpload(doc.document_type)}
                  disabled={uploading[doc.document_type]}
                  title="Reemplazar documento"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: 10, padding: '3px 8px', borderRadius: 5,
                    border: '0.5px solid rgba(108,92,231,0.3)', background: 'transparent',
                    color: '#a29bfe', cursor: 'pointer',
                  }}
                >
                  {uploading[doc.document_type]
                    ? <><Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />Subiendo...</>
                    : <><RefreshCw size={10} />Reemplazar</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar nuevo tipo de documento */}
      {missingTypes.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAddMenu(m => !m)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '8px 12px', borderRadius: 8,
              border: '0.5px dashed rgba(255,255,255,0.15)', background: 'transparent',
              color: '#636e72', fontSize: 11, cursor: 'pointer',
            }}
          >
            <Plus size={11} />
            Agregar nuevo documento
          </button>

          {showAddMenu && (
            <div style={{
              position: 'absolute', bottom: '110%', left: 0, right: 0, zIndex: 50,
              background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              {missingTypes.map(t => (
                <button
                  key={t}
                  onClick={() => triggerUpload(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '10px 14px', background: 'transparent', border: 'none',
                    borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                    color: '#f1f2f6', fontSize: 12, cursor: 'pointer', textAlign: 'left' as const,
                  }}
                >
                  <Upload size={11} color="#a29bfe" />
                  {DOC_TYPES[t]?.label}
                  {DOC_TYPES[t]?.required && (
                    <span style={{ fontSize: 9, color: '#ff4757', marginLeft: 'auto' }}>requerido</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal exportado ──────────────────────────────────────────
export function KYCVerification({ userId, onComplete }: KYCVerificationProps) {
  const [status, setStatus]       = useState<KYCStatus>('not_started');
  const [loading, setLoading]     = useState(true);
  const [starting, setStarting]   = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uid, setUid]             = useState<string | null>(null);
  const [showDocs, setShowDocs]   = useState(false);

  useEffect(() => { loadKYCStatus(); }, [userId]);

  const loadKYCStatus = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const resolvedUid = userId || authUser?.id;
      if (!resolvedUid) return;
      setUid(resolvedUid);

      const { data } = await supabase
        .from('kyc_verifications')
        .select('status, didit_session_id')
        .eq('user_id', resolvedUid)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setStatus(data.status as KYCStatus);
        setSessionId(data.didit_session_id);
        setShowDocs(true);
      }
    } catch {
      // Sin registros — estado inicial
    } finally {
      setLoading(false);
    }
  };

  const startKYC = async () => {
    setStarting(true);

    DiditSdk.shared.onComplete = async (result) => {
      if (result.type === 'completed') {
        const sid = result.session.sessionId;
        const st  = result.session.status;
        setSessionId(sid);
        setStatus(st as KYCStatus);
        setShowDocs(true);

        const { data: { user: authUser } } = await supabase.auth.getUser();
        const resolvedUid = userId || authUser?.id;
        if (resolvedUid) {
          await supabase.from('kyc_verifications').upsert({
            user_id: resolvedUid, didit_session_id: sid,
            status: st, updated_at: new Date().toISOString(),
          }, { onConflict: 'didit_session_id' });
        }
        onComplete?.(st, sid);
      }
      setStarting(false);
    };

    DiditSdk.shared.onStateChange = (state) => {
      if (state === 'error') setStarting(false);
    };

    DiditSdk.shared.startVerification({
      url: import.meta.env.VITE_DIDIT_UNILINK,
      configuration: { closeModalOnComplete: true, showCloseButton: true },
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#636e72', fontSize: 13 }}>
      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      Cargando verificación...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Banner de estado KYC ── */}
      <div style={{
        background: 'rgba(108,92,231,0.06)', border: '0.5px solid rgba(108,92,231,0.2)',
        borderRadius: 10, padding: '13px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap' as const, gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8,
            background: 'rgba(108,92,231,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={15} color="#a29bfe" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#f1f2f6', fontWeight: 500 }}>Verificación de Identidad (KYC)</p>
            <p style={{ fontSize: 11, color: '#636e72' }}>Requerida para operar en la plataforma</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KYCStatusBadge status={status} />
          {(status === 'not_started' || status === 'Declined') && (
            <button
              onClick={startKYC}
              disabled={starting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, padding: '7px 14px', borderRadius: 7,
                background: '#6c5ce7', color: '#fff', border: 'none',
                cursor: starting ? 'default' : 'pointer', fontWeight: 500,
              }}
            >
              {starting
                ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />Iniciando...</>
                : <><ShieldCheck size={11} />{status === 'Declined' ? 'Reintentar' : 'Verificar identidad'}</>}
            </button>
          )}
        </div>
      </div>

      {/* Mensajes de estado */}
      {status === 'pending' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          background: 'rgba(255,165,2,0.08)', border: '0.5px solid rgba(255,165,2,0.2)',
          borderRadius: 8, color: '#ffa502', fontSize: 12 }}>
          <Clock size={13} />
          Tu verificación está en revisión. Te notificaremos cuando sea aprobada.
        </div>
      )}
      {status === 'Approved' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          background: 'rgba(0,208,132,0.08)', border: '0.5px solid rgba(0,208,132,0.2)',
          borderRadius: 8, color: '#00d084', fontSize: 12 }}>
          <CheckCircle2 size={13} />
          Identidad verificada correctamente.
        </div>
      )}

      {/* ── Sección documentos KYC ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: 10, padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={14} color="#a29bfe" />
            <p style={{ fontSize: 13, color: '#dfe6e9', fontWeight: 500 }}>Mis documentos KYC</p>
          </div>
          {!showDocs && (
            <button
              onClick={() => setShowDocs(true)}
              style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 5,
                border: '0.5px solid rgba(108,92,231,0.3)', background: 'transparent',
                color: '#a29bfe', cursor: 'pointer',
              }}
            >
              Ver / Subir
            </button>
          )}
        </div>

        {showDocs && uid
          ? <KYCDocuments userId={uid} />
          : <p style={{ fontSize: 11, color: '#636e72' }}>
              Sube tu DNI y comprobante de domicilio para completar la verificación.
            </p>
        }
      </div>

      {sessionId && (
        <p style={{ fontSize: 10, color: '#636e72' }}>
          Sesión Didit: <code style={{ fontFamily: 'monospace' }}>{sessionId.slice(0, 12)}...</code>
        </p>
      )}
    </div>
  );
}
