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
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { useCMS } from '@/hooks/useCMS';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { blog, team, services, instruments, media } = useCMS();

  const postsQuery = blog.usePosts();
  const membersQuery = team.useMembers();
  const servicesQuery = services.useAll();
  const instrumentsQuery = instruments.useAll();
  const mediaQuery = media.useFiles();

  const isLoading = 
    postsQuery.isLoading || 
    membersQuery.isLoading || 
    servicesQuery.isLoading || 
    instrumentsQuery.isLoading || 
    mediaQuery.isLoading;

  const stats = [
    {
      label: 'Artículos',
      value: postsQuery.data?.length || 0,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Equipo',
      value: membersQuery.data?.length || 0,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Servicios',
      value: servicesQuery.data?.length || 0,
      icon: Briefcase,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Instrumentos',
      value: instrumentsQuery.data?.length || 0,
      icon: LineChart,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  const quickActions = [
    {
      title: 'Gestionar Blog',
      description: 'Crea y edita artículos para las noticias del mercado.',
      icon: FileText,
      link: '/cms/blog',
      actionLabel: 'Ver artículos'
    },
    {
      title: 'Miembros del Equipo',
      description: 'Actualiza el perfil de los expertos de la firma.',
      icon: Users,
      link: '/cms/team',
      actionLabel: 'Gestionar equipo'
    },
    {
      title: 'Servicios',
      description: 'Edita la oferta de servicios financieros y de gestión.',
      icon: Briefcase,
      link: '/cms/services',
      actionLabel: 'Ver servicios'
    },
    {
      title: 'Instrumentos',
      description: 'Actualiza la lista de activos de trading disponibles.',
      icon: LineChart,
      link: '/cms/instruments',
      actionLabel: 'Gestionar activos'
    },
    {
      title: 'Biblioteca de Medios',
      description: 'Sube y organiza imágenes y archivos del sitio.',
      icon: Image,
      link: '/cms/media',
      actionLabel: 'Abrir biblioteca'
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales, SEO e información de contacto.',
      icon: Settings,
      link: '/cms/settings',
      actionLabel: 'Ir a ajustes'
    }
  ];

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <CMSLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              {today}
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/cms/blog" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Nuevo Artículo
            </Link>
          </Button>
        </header>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Accesos Rápidos
              </h2>
            </div>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {quickActions.map((action, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-2">
                        <action.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="ghost" className="w-full justify-between group-hover:text-primary">
                        <Link to={action.link}>
                          {action.actionLabel}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Actividad Reciente
            </h2>
            <Card className="border-none shadow-md">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))
                  ) : (
                    postsQuery.data?.slice(0, 5).map((post) => (
                      <div key={post.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">{post.category}</span>
                          <span className="text-xs text-muted-foreground">{new Date(post.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                  {(!isLoading && (!postsQuery.data || postsQuery.data.length === 0)) && (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No hay actividad reciente</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-border">
                  <Button asChild variant="link" className="w-full h-auto p-0">
                    <Link to="/cms/blog" className="flex items-center gap-2 text-xs">
                      Ver todo el historial
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Infraestructura Pessaro Capital v2.0
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Conexión Supabase</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-mint-accent animate-pulse" />
                    Activo
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Espacio Storage</span>
                  <span>42.5 MB / 1 GB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CMSLayout>
  );
}
