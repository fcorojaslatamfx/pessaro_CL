import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, TrendingUp, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib/index';
import { getMainSiteUrl } from '@/lib/domains';
import { useSEO } from '@/hooks/useSEO';
import { PAGE_SEO } from '@/lib/seo-config';


const ClientLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión activa de cliente, ir directo al portal
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Verificar que es cliente
        const { data: roleData } = await supabase
          .from('user_roles_2026_02_08_22_02')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData?.role === 'cliente') {
          navigate('/portal-cliente/dashboard', { replace: true });
          return;
        }
        // Si es staff, igual podemos dejarlo pasar o redirigir
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos. Por favor verifica tus datos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Tu cuenta aún no ha sido confirmada. Revisa tu correo electrónico.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        // Verificar rol
        const { data: roleData } = await supabase
          .from('user_roles_2026_02_08_22_02')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        const role = roleData?.role || data.user.user_metadata?.role;

        if (role === 'cliente') {
          navigate('/portal-cliente/dashboard', { replace: true });
        } else if (['super_admin', 'admin', 'interno'].includes(role)) {
          // Staff que entra por el portal de clientes → redirigir al CMS
          navigate('/cms/dashboard', { replace: true });
        } else {
          setError('Tu cuenta no tiene acceso al portal de clientes. Contacta a soporte.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Fondo con gradiente */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Panel izquierdo — info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col gap-8"
          >
            {/* Logo + nombre */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Portal</p>
                <p className="text-sm font-bold text-foreground">Pessaro Capital</p>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
                Tu capital,<br />
                <span className="text-accent">en tus manos.</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Accede a tu cuenta para monitorear tus inversiones, 
                revisar tu perfil de riesgo y seguir el mercado en tiempo real.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: <TrendingUp className="w-4 h-4" />, text: 'Seguimiento de posiciones en tiempo real' },
                { icon: <Shield className="w-4 h-4" />, text: 'Acceso seguro con cifrado de extremo a extremo' },
                { icon: <Eye className="w-4 h-4" />, text: 'Análisis de mercado exclusivos para clientes' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  {item.text}
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                ¿Aún no eres cliente?{' '}
                <a
                  href={getMainSiteUrl(ROUTE_PATHS.CLIENT_REGISTER)}
                  className="text-accent hover:underline font-medium"
                >
                  Abre tu cuenta aquí →
                </a>
              </p>
            </div>
          </motion.div>

          {/* Panel derecho — formulario */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/10 p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Portal Cliente</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Iniciar Sesión</h2>
                <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales para acceder</p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-destructive/8 border border-destructive/20 mb-6"
                >
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              {/* Formulario */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="pl-10 h-11 bg-background/50 border-border/60 focus:border-accent/60"
                      disabled={loading}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña
                    </Label>
                    <Link
                      to={ROUTE_PATHS.RECUPERAR_CONTRASENA}
                      className="text-xs text-accent hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-background/50 border-border/60 focus:border-accent/60"
                      disabled={loading}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Ingresar al Portal
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-border/40 space-y-3">
                <p className="text-center text-xs text-muted-foreground">
                  ¿Aún no tienes cuenta?{' '}
                  <a
                    href={getMainSiteUrl(ROUTE_PATHS.CLIENT_REGISTER)}
                    className="text-accent hover:underline font-medium"
                  >
                    Regístrate gratis
                  </a>
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
                  <Shield className="w-3 h-3" />
                  Acceso cifrado y seguro · Pessaro Capital © 2026
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
