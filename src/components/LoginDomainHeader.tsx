import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, BarChart3 } from 'lucide-react';
import { PESSARO_LOGO_HEADER } from '@/lib/index';
import { getMainDomainUrl } from '@/lib/domains';
import { Button } from '@/components/ui/button';

/**
 * Header específico para el dominio de login (login.pessaro.cl)
 * Incluye navegación entre las diferentes secciones administrativas
 */
const LoginDomainHeader: React.FC = () => {
  const adminLinks = [
    {
      path: '/cms/login',
      label: 'CMS',
      icon: <Settings className="w-4 h-4" />
    },
    {
      path: '/diagnostico-acceso',
      label: 'Diagnóstico',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src={PESSARO_LOGO_HEADER} alt="Pessaro Capital" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-muted-foreground">Portal de Administración</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {adminLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Back to Main Site */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = getMainDomainUrl()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sitio Principal</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {adminLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 rounded-md transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoginDomainHeader;