import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const Nosotros = lazy(() => import('@/pages/Nosotros'));
const Contacto = lazy(() => import('@/pages/Contacto'));
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

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
                            <Route path={ROUTE_PATHS.HOME} element={<Home />} />
                            <Route path={ROUTE_PATHS.SERVICIOS} element={<Servicios />} />
                            <Route path={ROUTE_PATHS.INSTRUMENTOS} element={<Instrumentos />} />
                            <Route path={ROUTE_PATHS.EDUCACION} element={<Educacion />} />
                            <Route path={ROUTE_PATHS.BLOG} element={<Blog />} />
                            <Route path={ROUTE_PATHS.NOSOTROS} element={<Nosotros />} />
                            <Route path={ROUTE_PATHS.CONTACTO} element={<Contacto />} />
                            <Route path={ROUTE_PATHS.CLIENT_REGISTER} element={<ClientRegister />} />
                            <Route path={ROUTE_PATHS.RECUPERAR_CONTRASENA} element={<RecuperarContrasena />} />
                            <Route path={ROUTE_PATHS.RESEND_TEST} element={<TestResend />} />
                            <Route path={ROUTE_PATHS.RESEND_TEST_COMPLETE} element={<TestResendComplete />} />
                            <Route path={ROUTE_PATHS.SYSTEM_VERIFICATION} element={<SystemVerification />} />
                            <Route 
                              path={ROUTE_PATHS.CLIENT_PORTAL} 
                              element={
                                <ProtectedRoute requiredRoles="cliente">
                                  <ClientPortal />
                                </ProtectedRoute>
                              } 
                            />
                            <Route path={ROUTE_PATHS.ERROR} element={<ErrorPage />} />
                          </Routes>
                        </Layout>
                      }
                    />
                    {/* DOMINIO DE GESTIÓN (LOGIN / CMS) */}
                    <Route
                      path="/*"
                      element={
                        <LoginLayout>
                          <Routes>
                            <Route path={ROUTE_PATHS.SUPER_ADMIN_LOGIN} element={<SuperAdminLogin />} />
                            <Route path={ROUTE_PATHS.INTERNAL_LOGIN} element={<InternalLogin />} />
                            <Route path={ROUTE_PATHS.ACCESS_DIAGNOSTIC} element={<AccessDiagnostic />} />
                            <Route path={ROUTE_PATHS.CMS_SETUP} element={<Setup />} />
                            {/* RUTAS PROTEGIDAS */}
                            <Route 
                              path={ROUTE_PATHS.SUPER_ADMIN_PANEL} 
                              element={
                                <ProtectedRoute requiredRoles="super_admin">
                                  <SuperAdminPanel />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path={ROUTE_PATHS.INTERNAL_DASHBOARD} 
                              element={
                                <ProtectedRoute requiredRoles="interno,super_admin">
                                  <InternalDashboard />
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
                                <ProtectedRoute requiredRoles="interno,super_admin">
                                  <Dashboard />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path={ROUTE_PATHS.WYCKOFF_DASHBOARD} 
                              element={
                                <ProtectedRoute requiredRoles="interno,super_admin">
                                  <WyckoffDashboard />
                                </ProtectedRoute>
                              } 
                            />
                            {/* CMS MANAGER */}
                            <Route path="/cms/pages" element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <PageContentManager />
                              </ProtectedRoute>
                            } />
                            <Route path="/cms/faqs" element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <FAQManager />
                              </ProtectedRoute>
                            } />
                            <Route path={ROUTE_PATHS.CMS_BLOG} element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <BlogManager />
                              </ProtectedRoute>
                            } />
                            <Route path={ROUTE_PATHS.CMS_TEAM} element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <TeamManager />
                              </ProtectedRoute>
                            } />
                            <Route path={ROUTE_PATHS.CMS_SERVICES} element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <ServicesManager />
                              </ProtectedRoute>
                            } />
                            <Route path={ROUTE_PATHS.CMS_INSTRUMENTS} element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <InstrumentsManager />
                              </ProtectedRoute>
                            } />
                            <Route path={ROUTE_PATHS.CMS_MEDIA} element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <MediaLibrary />
                              </ProtectedRoute>
                            } />
                            <Route path={ROUTE_PATHS.CMS_SETTINGS} element={
                              <ProtectedRoute requiredRoles="interno,super_admin">
                                <Settings />
                              </ProtectedRoute>
                            } />
                          </Routes>
                        </LoginLayout>
                      }
                    />
                    <Route path="*" element={<ErrorPage />} />
                  </Routes>
                </DomainGuard>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
          <Toaster />
        </WhatsAppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}