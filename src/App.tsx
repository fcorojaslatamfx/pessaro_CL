import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ROUTE_PATHS } from '@/lib/index';
import { Layout } from '@/components/Layout';
import { WhatsAppProvider } from '@/hooks/useWhatsApp';
import DomainRedirect from '@/components/DomainRedirect';
import DomainGuard from '@/components/DomainGuard';
import ErrorBoundary from '@/components/ErrorBoundary';

// Main website pages
import Home from '@/pages/Home';
import Servicios from '@/pages/Servicios';
import Instrumentos from '@/pages/Instrumentos';
import Educacion from '@/pages/Educacion';
import Blog from '@/pages/Blog';
import Nosotros from '@/pages/Nosotros';
import Contacto from '@/pages/Contacto';
import ErrorPage from '@/pages/ErrorPage';

// Internal Dashboard
import InternalDashboard from '@/pages/InternalDashboard';
import InternalLogin from '@/pages/InternalLogin';

// Wyckoff Dashboard
import WyckoffDashboard from '@/pages/WyckoffDashboard';

// Client Portal
import ClientPortal from '@/pages/ClientPortal';
import ClientRegister from '@/pages/ClientRegister';

// Super Admin System
import SuperAdminLogin from '@/pages/SuperAdminLogin';
import SuperAdminPanel from '@/pages/SuperAdminPanel';

// Password Recovery
import RecuperarContrasena from '@/pages/RecuperarContrasena';

// CMS pages
import Setup from '@/pages/cms/Setup';
import Login from '@/pages/cms/Login';
import Dashboard from '@/pages/cms/Dashboard';

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import BlogManager from '@/pages/cms/BlogManager';
import TeamManager from '@/pages/cms/TeamManager';
import ServicesManager from '@/pages/cms/ServicesManager';
import InstrumentsManager from '@/pages/cms/InstrumentsManager';
import MediaLibrary from '@/pages/cms/MediaLibrary';
import Settings from '@/pages/cms/Settings';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * App Component
 * Root component of Pessaro Capital platform.
 * Configures the design system providers, router, and layout orchestration.
 * © 2026 Pessaro Capital. All rights reserved.
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WhatsAppProvider>
          <BrowserRouter>
            <DomainRedirect />
            <ScrollToTop />
            <DomainGuard>
              <ErrorBoundary>
                <Layout>
                  <Routes>

                    {/* Main Landing & Home Section */}
                    <Route
                      path={ROUTE_PATHS.HOME}
                      element={<Home />}
                    />

                    {/* Financial Services Section */}
                    <Route
                      path={ROUTE_PATHS.SERVICIOS}
                      element={<Servicios />}
                    />

                    {/* Market Instruments Section */}
                    <Route
                      path={ROUTE_PATHS.INSTRUMENTOS}
                      element={<Instrumentos />}
                    />

                    {/* Educational Resources Section */}
                    <Route
                      path={ROUTE_PATHS.EDUCACION}
                      element={<Educacion />}
                    />

                    {/* Blog & Market Analysis Section */}
                    <Route
                      path={ROUTE_PATHS.BLOG}
                      element={<Blog />}
                    />

                    {/* Corporate Identity Section */}
                    <Route
                      path={ROUTE_PATHS.NOSOTROS}
                      element={<Nosotros />}
                    />

                    {/* Client Support & Contact Section */}
                    <Route
                      path={ROUTE_PATHS.CONTACTO}
                      element={<Contacto />}
                    />

                    {/* Error Page */}
                    <Route
                      path={ROUTE_PATHS.ERROR}
                      element={<ErrorPage />}
                    />

                    {/* Client Portal Section */}
                    <Route
                      path={ROUTE_PATHS.CLIENT_PORTAL}
                      element={
                        <ProtectedRoute requiredRoles="cliente">
                          <ClientPortal />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CLIENT_REGISTER}
                      element={<ClientRegister />}
                    />

                    {/* Super Admin System */}
                    <Route
                      path={ROUTE_PATHS.SUPER_ADMIN_LOGIN}
                      element={<SuperAdminLogin />}
                    />

                    <Route
                      path={ROUTE_PATHS.SUPER_ADMIN_PANEL}
                      element={
                        <ProtectedRoute requiredRoles={["super_admin"]}>
                          <SuperAdminPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* Internal Dashboard Section */}
                    <Route
                      path={ROUTE_PATHS.INTERNAL_LOGIN}
                      element={<InternalLogin />}
                    />

                    <Route
                      path={ROUTE_PATHS.INTERNAL_DASHBOARD}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin', 'cliente']}>
                          <InternalDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Wyckoff Dashboard - Internal Only */}
                    <Route
                      path={ROUTE_PATHS.WYCKOFF_DASHBOARD}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <WyckoffDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* CMS Routes */}
                    <Route
                      path={ROUTE_PATHS.CMS_SETUP}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <Setup />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_LOGIN}
                      element={<Login />}
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_DASHBOARD}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_BLOG}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <BlogManager />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_TEAM}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <TeamManager />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_SERVICES}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <ServicesManager />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_INSTRUMENTS}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <InstrumentsManager />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_MEDIA}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <MediaLibrary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path={ROUTE_PATHS.CMS_SETTINGS}
                      element={
                        <ProtectedRoute requiredRoles={['interno', 'admin', 'super_admin']}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />

                    {/* Password Recovery */}
                    <Route
                      path={ROUTE_PATHS.RECUPERAR_CONTRASENA}
                      element={<RecuperarContrasena />}
                    />

                    {/* Catch-all route */}
                    <Route
                      path="*"
                      element={<Navigate to={ROUTE_PATHS.ERROR} replace />}
                    />

                  </Routes>
                </Layout>
              </ErrorBoundary>
            </DomainGuard>
          </BrowserRouter>

          {/* Feedback Components */}
          <Toaster />
          <Sonner position="top-right" expand={false} richColors />

        </WhatsAppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
