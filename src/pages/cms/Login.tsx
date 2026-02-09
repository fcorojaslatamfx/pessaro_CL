import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import { LoginForm } from '@/components/cms/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { IMAGES } from '@/assets/images';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/cms/dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/cms/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={IMAGES.BUSINESS_OFFICE_4} 
            alt="Pessaro Capital Office" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/60 to-transparent z-10" />
        
        <div className="relative z-20 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <ShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              PESSARO <span className="text-mint-accent">CAPITAL</span>
            </span>
          </div>

          <div className="space-y-6 max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-extrabold text-white leading-tight"
            >
              Panel de Gestión <br />
              <span className="text-mint-accent">Institucional</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-white/80 leading-relaxed"
            >
              Acceda al centro de control de Pessaro Capital para gestionar contenidos, 
              miembros del equipo y análisis de mercado con precisión profesional.
            </motion.p>
          </div>

          <div className="text-white/40 text-sm font-medium">
            © 2026 Pessaro Capital. Todos los derechos reservados.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background relative">
        <div className="absolute top-8 right-8 md:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-md">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">PESSARO</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-muted md:hidden mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground">
              Ingrese sus credenciales para acceder al panel administrativo.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-primary/5">
            <LoginForm />
          </div>

          <div className="flex items-center justify-center gap-4 py-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Acceso Seguro</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿Problemas para acceder? Contacte con el <a href="mailto:soporte@pessarocapital.com" className="text-primary font-semibold hover:underline transition-all">departamento de TI</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;