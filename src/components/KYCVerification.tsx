import { useState, useEffect } from 'react';
import { DiditSdk } from '@didit-protocol/sdk-web';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldX, Clock, Loader2 } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type KYCStatus = 'not_started' | 'pending' | 'Approved' | 'Declined';

interface KYCVerificationProps {
  userId?: string;       // si se pasa, se usa; si no, se usa el usuario actual
  onComplete?: (status: string, sessionId: string) => void;
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: KYCStatus }) {
  const map: Record<KYCStatus, { label: string; className: string; icon: JSX.Element }> = {
    not_started: {
      label: 'Sin verificar',
      className: 'bg-gray-100 text-gray-600',
      icon: <ShieldX className="w-4 h-4" />,
    },
    pending: {
      label: 'En revisión',
      className: 'bg-yellow-100 text-yellow-700',
      icon: <Clock className="w-4 h-4" />,
    },
    Approved: {
      label: 'Verificado',
      className: 'bg-green-100 text-green-700',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    Declined: {
      label: 'Rechazado',
      className: 'bg-red-100 text-red-700',
      icon: <ShieldX className="w-4 h-4" />,
    },
  };

  const { label, className, icon } = map[status] || map.not_started;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function KYCVerification({ userId, onComplete }: KYCVerificationProps) {
  const [status, setStatus]     = useState<KYCStatus>('not_started');
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Cargar estado KYC existente al montar
  useEffect(() => {
    loadKYCStatus();
  }, [userId]);

  const loadKYCStatus = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const uid = userId || authUser?.id;
      if (!uid) return;

      const { data } = await supabase
        .from('kyc_verifications')
        .select('status, didit_session_id')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setStatus(data.status as KYCStatus);
        setSessionId(data.didit_session_id);
      }
    } catch {
      // Sin registros KYC — estado inicial
    } finally {
      setLoading(false);
    }
  };

  const startKYC = async () => {
    setStarting(true);

    // Configurar callbacks del SDK
    DiditSdk.shared.onComplete = async (result) => {
      if (result.type === 'completed') {
        const sid = result.session.sessionId;
        const st  = result.session.status;

        setSessionId(sid);
        setStatus(st as KYCStatus);

        // Guardar en Supabase
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const uid = userId || authUser?.id;

        if (uid) {
          await supabase.from('kyc_verifications').upsert({
            user_id:          uid,
            didit_session_id: sid,
            status:           st,
            updated_at:       new Date().toISOString(),
          }, { onConflict: 'didit_session_id' });
        }

        onComplete?.(st, sid);
      } else if (result.type === 'cancelled') {
        setStatus('pending');
      }

      setStarting(false);
    };

    DiditSdk.shared.onStateChange = (state) => {
      if (state === 'error') setStarting(false);
    };

    // Iniciar verificación con UniLink
    DiditSdk.shared.startVerification({
      url: import.meta.env.VITE_DIDIT_UNILINK,
      configuration: {
        closeModalOnComplete: true,
        showCloseButton: true,
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando estado KYC...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-foreground">Verificación de Identidad</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            KYC requerido para operar en la plataforma
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === 'not_started' && (
        <Button
          size="sm"
          onClick={startKYC}
          disabled={starting}
          className="w-full"
        >
          {starting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Iniciando...</>
          ) : (
            <><ShieldCheck className="w-4 h-4 mr-2" />Verificar Identidad</>
          )}
        </Button>
      )}

      {status === 'pending' && (
        <div className="text-xs text-yellow-700 bg-yellow-50 rounded-lg p-3">
          Tu verificación está en revisión. Te notificaremos cuando sea aprobada.
        </div>
      )}

      {status === 'Approved' && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg p-3">
          ✅ Identidad verificada correctamente.
        </div>
      )}

      {status === 'Declined' && (
        <div className="space-y-2">
          <div className="text-xs text-red-700 bg-red-50 rounded-lg p-3">
            Tu verificación fue rechazada. Puedes intentarlo nuevamente.
          </div>
          <Button size="sm" variant="outline" onClick={startKYC} disabled={starting} className="w-full">
            Reintentar verificación
          </Button>
        </div>
      )}

      {sessionId && (
        <p className="text-xs text-muted-foreground">
          Sesión: <code className="font-mono">{sessionId.slice(0, 8)}...</code>
        </p>
      )}
    </div>
  );
}
