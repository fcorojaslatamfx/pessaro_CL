import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  LineChart,
  Image,
  Settings,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Globe,
  HelpCircle,
  Edit3,
  BarChart3,
  Zap,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { CMSAccessGuard } from '@/components/cms/CMSAccessGuard';
import { useCMSOptimized } from '@/hooks/useCMSOptimized';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const cms = useCMSOptimized();

  // ── NUEVO: contador de clientes ─────────────────────────────────────────
  const [clientsCount, setClientsCount] = useState<number>(0);

  useEffect(() => {
    const fetchClientsCount = async () => {
      const { count } = await supabase
        .from('client_profiles_2026_02_08_22_02')
        .select('*', { count: 'exact', head: true });
      setClientsCount(count || 0);
    };
    fetchClientsCount();
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  // Queries para estadísticas
  const blogQuery = cms.blog.useAll();
  const servicesQuery = cms.services.useAll();
  const instrumentsQuery = cms.instruments.useAll();
  const teamQuery = cms.team.useAll();
  const faqsQuery = cms.faqs.useAll();
  const settingsQuery = cms.settings.useAll();

  const isLoading =
    blogQuery.isLoading ||
    servicesQuery.isLoading ||
    instrumentsQuery.isLoading ||
    teamQuery.isLoading ||
    faqsQuery.isLoading ||
    settingsQuery.isLoading;

  // Estadísticas del dashboard
  const stats = [
    {
      label: 'Artículos del Blog',
      value: blogQuery.data?.length || 0,
      published: blogQuery.data?.filter(post => post.status === 'published').length || 0,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      link: '/cms/blog'
    },
    {
      label: 'Servicios',
      value: servicesQuery.data?.length || 0,
      active: servicesQuery.data?.filter(service => service.is_active).length || 0,
      icon: Briefcase,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      link: '/cms/services'
    },
    {
      label: 'Instrumentos',
      value: instrumentsQuery.data?.length || 0,
      popular: instrumentsQuery.data?.filter(instrument => instrument.is_popular).length || 0,
      icon: LineChart,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      link: '/cms/instruments'
    },
    {
      label: 'Miembros del Equipo',
      value: teamQuery.data?.length || 0,
      active: teamQuery.data?.filter(member => member.is_active).length || 0,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      link: '/cms/team'
    },
    {
      label: 'FAQs',
      value: faqsQuery.data?.length || 0,
      active: faqsQuery.data?.filter(faq => faq.is_active).length || 0,
      icon: HelpCircle,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      link: '/cms/faqs'
    },
    {
      label: 'Configuraciones',
      value: settingsQuery.data?.length || 0,
      active: settingsQuery.data?.filter(setting => setting.is_active).length || 0,
      icon: Settings,
      color: 'text-gray-500',
      bg: 'bg-gray-500/10',
      link: '/cms/settings'
    },
    // ── NUEVO: Card Clientes ──────────────────────────────────────────────
    {
      label: 'Clientes',
      value: clientsCount,
      registered: clientsCount,
      icon: UserCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-600/10',
      link: '/cms/clientes'
    }
    // ─────────────────────────────────────────────────────────────────────
  ];

  // Acciones rápidas
  const quickActions = [
    {
      title: 'Gestionar Contenido de Páginas',
      description: 'Edita títulos, descripciones y contenido de las páginas principales del sitio.',
      icon: Globe,
      link: '/cms/pages',
      actionLabel: 'Editar páginas',
      color: 'bg-blue-500'
    },
    {
      title: 'Gestionar Blog',
      description: 'Crea y edita artículos para las noticias del mercado y análisis financieros.',
      icon: FileText,
      link: '/cms/blog',
      actionLabel: 'Ver artículos',
      color: 'bg-emerald-500'
    },
    {
      title: 'Gestionar Servicios',
      description: 'Administra los servicios financieros: Forex, Commodities, Índices y Criptomonedas.',
      icon: Briefcase,
      link: '/cms/services',
      actionLabel: 'Ver servicios',
      color: 'bg-purple-500'
    },
    {
      title: 'Gestionar Instrumentos',
      description: 'Administra los instrumentos de trading disponibles en la plataforma.',
      icon: LineChart,
      link: '/cms/instruments',
      actionLabel: 'Ver instrumentos',
      color: 'bg-orange-500'
    },
    {
      title: 'Gestionar Equipo',
      description: 'Administra los perfiles de los miembros del equipo de Pessaro Capital.',
      icon: Users,
      link: '/cms/team',
      actionLabel: 'Ver equipo',
      color: 'bg-indigo-500'
    },
    {
      title: 'Gestionar FAQs',
      description: 'Administra las preguntas frecuentes sobre servicios y trading.',
      icon: HelpCircle,
      link: '/cms/faqs',
      actionLabel: 'Ver FAQs',
      color: 'bg-pink-500'
    },
    {
      title: 'Biblioteca de Medios',
      description: 'Gestiona imágenes, documentos y otros archivos multimedia.',
      icon: Image,
      link: '/cms/media',
      actionLabel: 'Ver medios',
      color: 'bg-cyan-500'
    },
    {
      title: 'Configuraciones',
      description: 'Administra configuraciones generales del sitio web.',
      icon: Settings,
      link: '/cms/settings',
      actionLabel: 'Ver configuraciones',
      color: 'bg-gray-500'
    },
    // ── NUEVO: Acción rápida Clientes ─────────────────────────────────────
    {
      title: 'Gestionar Clientes',
      description: 'Lista de clientes registrados, perfiles de riesgo y cuentas de trading.',
      icon: UserCheck,
      link: '/cms/clientes',
      actionLabel: 'Ver clientes',
      color: 'bg-blue-600'
    }
    // ─────────────────────────────────────────────────────────────────────
  ];

  // Actividad reciente (simulada)
  const recentActivity = [
    {
      id: 1,
      action: 'Artículo publicado',
      description: 'Nuevo análisis de mercado sobre Bitcoin',
      time: 'Hace 2 horas',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      id: 2,
      action: 'Servicio actualizado',
      description: 'Forex Trading - Descripción modificada',
      time: 'Hace 4 horas',
      icon: Briefcase,
      color: 'text-emerald-500'
    },
    {
      id: 3,
      action: 'Instrumento agregado',
      description: 'Nuevo par EUR/GBP disponible',
      time: 'Hace 1 día',
      icon: LineChart,
      color: 'text-orange-500'
    },
    {
      id: 4,
      action: 'Configuración actualizada',
      description: 'Información de contacto modificada',
      time: 'Hace 2 días',
      icon: Settings,
      color: 'text-gray-500'
    }
  ];

  return (
    <CMSAccessGuard>
      <CMSLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard CMS</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona todo el contenido del sitio web de Pessaro Capital
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/" target="_blank">
                  <Globe className="w-4 h-4 mr-2" />
                  Ver Sitio Web
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/cms/blog">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nuevo Artículo
                </Link>
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div key={stat.label} variants={fadeInUp}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.label}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {isLoading && stat.label !== 'Clientes' ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              <span className="text-2xl font-bold text-foreground">
                                {stat.value}
                              </span>
                            )}
                            {(stat as any).published !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {(stat as any).published} publicados
                              </Badge>
                            )}
                            {(stat as any).active !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {(stat as any).active} activos
                              </Badge>
                            )}
                            {(stat as any).popular !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {(stat as any).popular} populares
                              </Badge>
                            )}
                            {(stat as any).registered !== undefined && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                {(stat as any).registered} registrados
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={stat.link}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Acciones Rápidas */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">Acciones Rápidas</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {quickActions.map((action, index) => (
                <motion.div key={action.title} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={action.link}>
                          {action.actionLabel}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Actividad Reciente y Métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas modificaciones en el contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`p-2 rounded-lg bg-background`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métricas del Sitio
                </CardTitle>
                <CardDescription>
                  Estadísticas generales del contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Artículos Publicados</p>
                        <p className="text-xs text-muted-foreground">Este mes</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-500">
                      {blogQuery.data?.filter(post => post.status === 'published').length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Briefcase className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Servicios Activos</p>
                        <p className="text-xs text-muted-foreground">Total disponibles</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-emerald-500">
                      {servicesQuery.data?.filter(service => service.is_active).length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <LineChart className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Instrumentos Populares</p>
                        <p className="text-xs text-muted-foreground">Destacados</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-500">
                      {instrumentsQuery.data?.filter(instrument => instrument.is_popular).length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Users className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Miembros del Equipo</p>
                        <p className="text-xs text-muted-foreground">Perfiles activos</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-500">
                      {teamQuery.data?.filter(member => member.is_active).length || 0}
                    </span>
                  </div>

                  {/* ── NUEVO: Métrica Clientes ───────────────────────────── */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-600/10">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Clientes Registrados</p>
                        <p className="text-xs text-muted-foreground">Total en plataforma</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {clientsCount}
                    </span>
                  </div>
                  {/* ──────────────────────────────────────────────────────── */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acceso Rápido a Funciones Críticas */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Funciones Críticas
              </CardTitle>
              <CardDescription>
                Acceso rápido a las funciones más importantes del CMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/cms/pages">
                    <Edit3 className="w-6 h-6" />
                    <span className="text-sm font-medium">Editar Páginas</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/cms/blog">
                    <PlusCircle className="w-6 h-6" />
                    <span className="text-sm font-medium">Nuevo Artículo</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/cms/services">
                    <Briefcase className="w-6 h-6" />
                    <span className="text-sm font-medium">Gestionar Servicios</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/cms/clientes">
                    <UserCheck className="w-6 h-6" />
                    <span className="text-sm font-medium">Gestionar Clientes</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CMSLayout>
    </CMSAccessGuard>
  );
}
