import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

const PortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <img src="/images/pessaro-logo-header.png" alt="Pessaro" className="h-8" />
          <span className="font-bold text-lg">Portal Cliente</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavLink
            to="/portal-cliente/dashboard"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/portal-cliente/resumen"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`
            }
          >
            Resumen
          </NavLink>

          <NavLink
            to="/portal-cliente/mi-cuenta"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`
            }
          >
            Mi Cuenta
          </NavLink>

          <NavLink
            to={ROUTE_PATHS.CONTACTO}
            className="mt-4 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
          >
            Contacto
          </NavLink>
        </nav>

        <div className="mt-4">
          <a
            href="/"
            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Volver al sitio
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
