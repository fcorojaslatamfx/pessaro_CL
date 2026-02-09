import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Users, 
  Activity, 
  Lock, 
  AlertTriangle,
  Download,
  Search,
  Filter,
  LogOut,
  Settings,
  FileText,
  Image as ImageIcon,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '@/assets/images';

interface ConfidentialContent {
  id: string;
  title: string;
  content_type: string;
  file_path: string;
  description: string;
  classification_level: string;
  created_at: string;
}

interface AccessLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}

const SuperAdminPanel: React.FC = () => {
  const [confidentialContent, setConfidentialContent] = useState<ConfidentialContent[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<ConfidentialContent | null>(null);

  const { 
    user, 
    isSuperAdmin, 
    signOut, 
    getConfidentialContent, 
    getAccessLogs,
    logAccess 
  } = useSuperAdmin();
  
  const navigate = useNavigate();

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!user || !isSuperAdmin) {
      navigate('/super-admin-login');
      return;
    }

    loadData();
  }, [user, isSuperAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Cargar contenido confidencial
      const contentData = await getConfidentialContent();
      setConfidentialContent(contentData);

      // Cargar logs de acceso
      const logsData = await getAccessLogs(50);
      setAccessLogs(logsData);

      // Registrar acceso al panel
      if (user) {
        await logAccess(user.id, 'ACCESS_SUPER_ADMIN_PANEL', 'admin_panel');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewContent = async (content: ConfidentialContent) => {
    setSelectedContent(content);
    
    // Registrar acceso al contenido específico
    if (user) {
      await logAccess(
        user.id, 
        'VIEW_CONFIDENTIAL_ITEM', 
        'confidential_content', 
        content.id
      );
    }
  };

  const getClassificationColor = (level: string) => {
    switch (level) {
      case 'top_secret': return 'bg-red-100 text-red-800 border-red-200';
      case 'confidential': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'restricted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredContent = confidentialContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando panel de super administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Panel de Super Administrador</h1>
                <p className="text-primary-foreground/80">
                  Bienvenido, {user?.email} | Acceso Total
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Badge className="bg-red-600 text-white">
                NIVEL MÁXIMO
              </Badge>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alerta de seguridad */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>ADVERTENCIA DE SEGURIDAD:</strong> Está accediendo a información clasificada. 
            Todos los accesos son monitoreados y registrados. Use esta información responsablemente.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contenido Confidencial</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confidentialContent.length}</div>
              <p className="text-xs text-muted-foreground">Elementos clasificados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accesos Recientes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessLogs.length}</div>
              <p className="text-xs text-muted-foreground">Últimas 50 actividades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nivel de Acceso</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">TOP SECRET</div>
              <p className="text-xs text-muted-foreground">Acceso total autorizado</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="confidential" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="confidential">Contenido Confidencial</TabsTrigger>
            <TabsTrigger value="logs">Logs de Acceso</TabsTrigger>
          </TabsList>

          {/* Tab: Contenido Confidencial */}
          <TabsContent value="confidential" className="space-y-6">
            {/* Barra de búsqueda */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contenido confidencial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Lista de contenido confidencial */}
            <div className="grid grid-cols-1 gap-4">
              {filteredContent.map((content) => (
                <Card key={content.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-semibold text-lg">{content.title}</h3>
                          <Badge className={getClassificationColor(content.classification_level)}>
                            {content.classification_level.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {content.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Tipo: {content.content_type}</span>
                          <span>•</span>
                          <span>Creado: {new Date(content.created_at).toLocaleDateString('es-CL')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewContent(content)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontró contenido que coincida con la búsqueda' : 'No hay contenido confidencial disponible'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab: Logs de Acceso */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Registro de Actividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <div className="font-medium">{log.action.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {log.resource_type && `Recurso: ${log.resource_type}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{new Date(log.created_at).toLocaleString('es-CL')}</div>
                        <div>Usuario: {log.user_id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para ver contenido */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedContent.title}</h2>
                    <Badge className={getClassificationColor(selectedContent.classification_level)}>
                      {selectedContent.classification_level.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedContent(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-auto max-h-[70vh]">
                {selectedContent.content_type.startsWith('image/') ? (
                  <div className="text-center">
                    <img
                      src={selectedContent.file_path}
                      alt={selectedContent.title}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                    <p className="mt-4 text-muted-foreground">
                      {selectedContent.description}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-4">
                      {selectedContent.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Archivo: {selectedContent.file_path}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;