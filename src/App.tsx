import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ROUTE_PATHS } from '@/lib/index';

// --- INFRAESTRUCTURA CRÍTICA ---
import { Layout } from '@/components/Layout';
import DomainGuard from '@/components/DomainGuard';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import DomainRedirect from '@/components/DomainRedirect';
import ScrollToTop from '@/components/ScrollToTop';
import { WhatsAppProvider } from '@/hooks/useWhatsApp';
import { TooltipProvider } from '@/components/ui/tooltip';

// --- LOADER DE PÁGINA ---
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary rounded-full opacity-20"></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Pessaro Capital
        </h2>
        <p className="text-sm text-muted-foreground">
          Cargando...
        </p>
      </div>
    </div>
  </div>
);

// --- CARGA DIFERIDA (LAZY) ---
const Home = lazy(() => import('@/pages/Home'));
const Servicios = lazy(() => import('@/pages/Servicios'));
const Instrumentos = lazy(() => import('@/pages/Instrumentos'));
const Educacion = lazy(() => import('@/pages/Educacion'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const Nosotros = lazy(() => import('@/pages/Nosotros'));
const Contacto = lazy(() => import('@/pages/Contacto'));
const ClientLogin = lazy(() => import('@/pages/ClientLogin'));
const ClientPortal = lazy(() => import('@/pages/ClientPortal'));
const ClientRegister = lazy(() => import('@/pages/ClientRegister'));
const RecuperarContrasena = lazy(() => import('@/pages/RecuperarContrasena'));
const LoginLayout = lazy(() => import('@/components/LoginLayout'));
const SuperAdminLogin = lazy(() => import('@/pages/SuperAdminLogin'));
const InternalLogin = lazy(() => import('@/pages/InternalLogin'));
const SuperAdminPanel = lazy(() => import('@/pages/SuperAdminPanel'));
const InternalDashboard = lazy(() => import('@/pages/InternalDashboard'));
const WyckoffDashboard = lazy(() => import('@/pages/WyckoffDashboard'));
const AccessDiagnostic = lazy(() => import('@/pages/AccessDiagnostic'));
const Setup = lazy(() => import('@/pages/cms/Setup'));
const Login = lazy(() => import('@/pages/cms/Login'));
const Dashboard = lazy(() => import('@/pages/cms/DashboardOptimized'));
const PageContentManager = lazy(() => import('@/pages/cms/PageContentManager'));
const FAQManager = lazy(() => import('@/pages/cms/FAQManager'));
const BlogManager = lazy(() => import('@/pages/cms/BlogManager'));
const TeamManager = lazy(() => import('@/pages/cms/TeamManager'));
const ServicesManager = lazy(() => import('@/pages/cms/ServicesManagerOptimized'));
const InstrumentsManager = lazy(() => import('@/pages/cms/InstrumentsManager'));
const MediaLibrary = lazy(() => import('@/pages/cms/MediaLibrary'));
const Settings = lazy(() => import('@/pages/cms/Settings'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));
const TestResend = lazy(() => import('@/pages/TestResend'));
const TestResendComplete = lazy(() => import('@/pages/TestResendComplete'));
const SystemVerification = lazy(() => import('@/pages/SystemVerification'));
const IntegrationVerificationPage = lazy(() => import('@/pages/IntegrationVerificationPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

/**
 * App Component
 * Root component of Pessaro Capital platform.
 * Configures the design system providers, router, and layout orchestration.
 * © 2026 Pessaro Capital. All rights reserved.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WhatsAppProvider>
          <BrowserRouter>
            <ScrollToTop />
            <DomainRedirect />
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <DomainGuard>
                  {/* WEBSITE PRINCIPAL */}
                  <Routes>
                    <Route
                      path="/*"
                      element={
                        <Layout>
                          <Routes>
                            {/* Main Landing & Home Section */}
                            <Route path={ROUTE_PATHS.HOME} element={<Home />} />
                            
                            {/* Financial Services Section */}
                            <Route path={ROUTE_PATHS.SERVICIOS} element={<Servicios />} />
                            
                            {/* Market Instruments Section */}
                            <Route path={ROUTE_PATHS.INSTRUMENTOS} element={<Instrumentos />} />
                            
                            {/* Educational Resources Section */}
                            <Route path={ROUTE_PATHS.EDUCACION} element={<Educacion />} />
                            
                            {/* Blog & Market Analysis Section */}
                            <Route path={ROUTE_PATHS.BLOG} element={<Blog />} />
                            <Route path={ROUTE_PATHS.BLOG_POST} element={<BlogPostPage />} />
                            
                            {/* Corporate Identity Section */}
                            <Route path={ROUTE_PATHS.NOSOTROS} element={<Nosotros />} />
                            
                            {/* Client Support & Contact Section */}
                            <Route path={ROUTE_PATHS.CONTACTO} element={<Contacto />} />
                            
                            {/* Client Registration */}
                            <Route path={ROUTE_PATHS.CLIENT_REGISTER} element={<ClientRegister />} />
                            
                            {/* Password Recovery */}
                            <Route path={ROUTE_PATHS.RECUPERAR_CONTRASENA} element={<RecuperarContrasena />} />
                            
                            {/* Test Pages */}
                            <Route path={ROUTE_PATHS.RESEND_TEST} element={<TestResend />} />
                            <Route path={ROUTE_PATHS.RESEND_TEST_COMPLETE} element={<TestResendComplete />} />
                            <Route path={ROUTE_PATHS.SYSTEM_VERIFICATION} element={<SystemVerification />} />
                            <Route path={ROUTE_PATHS.INTEGRATION_VERIFICATION} element={<IntegrationVerificationPage />} />
                            
                            {/* Client Portal Section */}
                            {/* Login público para clientes */}
                            <Route 
                              path={ROUTE_PATHS.CLIENT_PORTAL} 
                              element={<ClientLogin />}
                            />
                            {/* Dashboard del portal (protegido) */}
                            <Route 
                              path="/portal-cliente/dashboard" 
                              element={
                                <ProtectedRoute requiredRoles="cliente">
                                  <ClientPortal />
                                </ProtectedRoute>
                              } 
                            />
                            
                            {/* Error Page */}
                            <Route path={ROUTE_PATHS.ERROR} element={<ErrorPage />} />
                          </Routes>
                        </Layout>
                      }
                    />
                    
                    {/* DOMINIO DE GESTIÓN (LOGIN / CMS) */}
                    {/* FIX: rutas con paths explícitos — el segundo <Route path="/*"> nunca matchea en RR v6 */}

                    {/* — Auth público — */}
                    <Route path={ROUTE_PATHS.SUPER_ADMIN_LOGIN} element={<LoginLayout><SuperAdminLogin /></LoginLayout>} />
                    <Route path={ROUTE_PATHS.INTERNAL_LOGIN}    element={<Navigate to={ROUTE_PATHS.CMS_LOGIN} replace />} />
                    <Route path={ROUTE_PATHS.ACCESS_DIAGNOSTIC}  element={
                      <LoginLayout>
                        <ProtectedRoute requiredRoles="super_admin,admin">
                          <AccessDiagnostic />
                        </ProtectedRoute>
                      </LoginLayout>
                    } />
                    <Route path={ROUTE_PATHS.CMS_SETUP}          element={<LoginLayout><Setup /></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_LOGIN}          element={<LoginLayout><Login /></LoginLayout>} />

                    {/* — Rutas protegidas Super Admin — */}
                    <Route
                      path={ROUTE_PATHS.SUPER_ADMIN_PANEL}
                      element={
                        <LoginLayout>
                          <ProtectedRoute requiredRoles="super_admin">
                            <SuperAdminPanel />
                          </ProtectedRoute>
                        </LoginLayout>
                      }
                    />

                    {/* — Rutas protegidas usuarios internos — */}
                    <Route
                      path={ROUTE_PATHS.INTERNAL_DASHBOARD}
                      element={
                        <LoginLayout>
                          <ProtectedRoute requiredRoles="interno,super_admin">
                            <InternalDashboard />
                          </ProtectedRoute>
                        </LoginLayout>
                      }
                    />
                    <Route
                      path={ROUTE_PATHS.WYCKOFF_DASHBOARD}
                      element={
                        <LoginLayout>
                          <ProtectedRoute requiredRoles="interno,super_admin">
                            <WyckoffDashboard />
                          </ProtectedRoute>
                        </LoginLayout>
                      }
                    />

                    {/* — CMS Dashboard y managers — */}
                    <Route
                      path={ROUTE_PATHS.CMS_DASHBOARD}
                      element={
                        <LoginLayout>
                          <ProtectedRoute requiredRoles="interno,super_admin">
                            <Dashboard />
                          </ProtectedRoute>
                        </LoginLayout>
                      }
                    />
                    <Route path="/cms/pages"   element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><PageContentManager /></ProtectedRoute></LoginLayout>} />
                    <Route path="/cms/faqs"    element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><FAQManager /></ProtectedRoute></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_BLOG}        element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><BlogManager /></ProtectedRoute></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_TEAM}        element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><TeamManager /></ProtectedRoute></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_SERVICES}    element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><ServicesManager /></ProtectedRoute></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_INSTRUMENTS} element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><InstrumentsManager /></ProtectedRoute></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_MEDIA}       element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><MediaLibrary /></ProtectedRoute></LoginLayout>} />
                    <Route path={ROUTE_PATHS.CMS_SETTINGS}    element={<LoginLayout><ProtectedRoute requiredRoles="interno,super_admin"><Settings /></ProtectedRoute></LoginLayout>} />
                    
                    {/* Catch-all route for 404 errors */}
                    <Route path="*" element={<ErrorPage />} />
                  </Routes>
                </DomainGuard>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
          
          {/* Feedback Components */}
          <Toaster />
        </WhatsAppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}