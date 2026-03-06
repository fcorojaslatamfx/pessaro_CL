import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ─── Protección por token de setup ────────────────────────────────────────────
// Para acceder a esta página, la URL debe incluir ?setup_token=TU_TOKEN_SECRETO
// Define ese token como variable de entorno en Vercel:
//   VITE_SETUP_TOKEN=tu_token_secreto_largo_y_aleatorio
// Si no está definido, la ruta queda completamente bloqueada.
const SETUP_TOKEN = import.meta.env.VITE_SETUP_TOKEN as string | undefined;

function isSetupAuthorized(): boolean {
  if (!SETUP_TOKEN) return false; // Sin token configurado = bloqueado siempre
  const params = new URLSearchParams(window.location.search);
  return params.get('setup_token') === SETUP_TOKEN;
}

// ─── Validación de contraseña segura ──────────────────────────────────────────
function validatePassword(password: string): string | null {
  if (password.length < 12) return 'La contraseña debe tener al menos 12 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(password)) return 'Debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Debe incluir al menos un símbolo especial.';
  return null;
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function CMSSetup() {
  const [authorized] = useState(() => isSetupAuthorized());
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Campos del formulario — el admin define sus propias credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (authorized) checkAdminExists();
  }, [authorized]);

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'create_admin_user_2026_01_30_20_41',
        { method: 'GET' }
      );
      if (error) throw error;
      setAdminExists(data.admin_exists);
    } catch (err) {
      console.error('Error verificando admin:', err);
      setAdminExists(false);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordError(validatePassword(val) ?? '');
  };

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdErr = validatePassword(password);
    if (pwdErr) { setPasswordError(pwdErr); return; }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke(
        'create_admin_user_2026_01_30_20_41',
        {
          body: {
            email: email.trim().toLowerCase(),
            password,          // la contraseña la define el admin aquí, nunca en el código
            full_name: fullName.trim(),
          },
        }
      );

      if (error) throw error;

      if (data.success) {
        setMessage('✅ Usuario administrador creado exitosamente. Guarda tus credenciales en un gestor de contraseñas y cierra esta página.');
        setAdminExists(true);
        // Limpiar campos del formulario
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('Error creando admin:', err);
      setError(err.message || 'Error al crear el usuario administrador');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Vista: acceso denegado ──
  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <Lock className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Acceso Denegado</h2>
            <p className="text-muted-foreground text-sm">
              Esta página de configuración no está disponible públicamente.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Volver al Sitio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Vista: admin ya existe ──
  if (adminExists === true) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle>Sistema Configurado</CardTitle>
            <CardDescription>Pessaro Capital CMS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                El usuario administrador ya existe. El sistema está listo.
              </AlertDescription>
            </Alert>
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <Button className="w-full" onClick={() => window.location.href = '/cms/login'}>
              Ir al Panel CMS
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => window.location.href = '/'}>
              Volver al Sitio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Vista: formulario de creación ──
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">Configuración Inicial</CardTitle>
          <CardDescription>
            Pessaro Capital — Crear cuenta de administrador
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta página solo debe usarse una vez. Después de crear el admin, revoca el token de setup en Vercel.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={createAdminUser} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ej: Francisco Rojas"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pessarocapital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña segura</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mín. 12 caracteres, mayús., número y símbolo"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
              {password && !passwordError && (
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Contraseña segura
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!passwordError || !email || !password || !fullName}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Usuario Administrador
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Cancelar — Volver al Sitio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
