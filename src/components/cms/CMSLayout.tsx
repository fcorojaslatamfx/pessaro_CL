import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  Users,
  Briefcase,
  BarChart3,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCMSAccess } from '@/hooks/useCMSAccess';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CMSLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: ('interno' | 'admin' | 'super_admin')[];
  requiredRoles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/cms',
    icon: LayoutGrid
  },
  {
    label: 'Blog',
    path: '/cms/blog',
    icon: FileText
  },
  {
    label: 'Equipo',
    path: '/cms/team',
    icon: Users
  },
  {
    label: 'Servicios',
    path: '/cms/services',
    icon: Briefcase
  },
  {
    label: 'Instrumentos',
    path: '/cms/instruments',
    icon: BarChart3
  },
  {
    label: 'Multimedia',
    path: '/cms/media',
    icon: ImageIcon
  },
  // ── NUEVO: Gestión de Clientes ──────────────────────────────────────────
  {
    label: 'Clientes',
    path: '/cms/clientes',
    icon: UserCheck,
    roles: ['interno', 'admin', 'super_admin']
  },
  // ────────────────────────────────────────────────────────────────────────
  {
    label: 'Configuración',
    path: '/cms/settings',
    icon: Settings,
    roles: ['admin', 'super_admin']
  }
];

export function CMSLayout({ children }: CMSLayoutProps) {
  const { user, signOut, loading } = useAuth();
  const { hasAccess, canAccessSettings } = useCMSAccess();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/cms/login');
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/cms/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-foreground">Pessaro CMS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-tight">Pessaro Capital</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            // Verificar acceso usando el hook
            if (item.roles) {
              if (item.path === '/cms/settings' && !canAccessSettings) {
                return null;
              }
            }

            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", !isActive && "group-hover:scale-110 transition-transform")} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto"
                  >
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-border overflow-hidden">
              {user?.profile?.avatar_url ? (
                <img src={user.profile.avatar_url} alt={user.email} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-secondary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-3"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-3/4 h-full bg-card border-r border-border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">P</span>
                </div>
                <span className="font-bold text-foreground text-lg">Pessaro CMS</span>
              </div>

              <nav className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  if (item.roles && !item.roles.includes(user?.role as any)) return null;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-4 px-4 py-4 rounded-xl transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="font-semibold">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="absolute bottom-8 left-6 right-6">
                <Button
                  variant="destructive"
                  className="w-full gap-3 py-6 rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Desktop Title Bar */}
        <header className="hidden md:flex h-16 items-center px-8 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
          <h2 className="text-lg font-semibold text-foreground">
            {NAV_ITEMS.find(item => location.pathname.startsWith(item.path))?.label || 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-xs text-muted-foreground">Iniciado como</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="h-8 w-[1px] bg-border mx-2"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse"></div>
              <span>Conectado</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="py-4 px-8 border-t border-border bg-card/30 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Pessaro Capital. Todos los derechos reservados. Sistema de Gestión de Contenidos v2.0
          </p>
        </footer>
      </main>
    </div>
  );
}
