import React from 'react';
import { 
  getCurrentDomain, 
  isMainDomain, 
  isLoginDomain, 
  isDevelopment,
  getMainDomainUrl,
  getLoginDomainUrl 
} from '@/lib/domains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Shield } from 'lucide-react';

/**
 * Componente de información de dominio
 * Útil para debugging y para mostrar información sobre la configuración actual
 */
const DomainInfo: React.FC = () => {
  const currentDomain = getCurrentDomain();
  const isMain = isMainDomain();
  const isLogin = isLoginDomain();
  const isDev = isDevelopment();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Información de Dominio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dominio Actual */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Dominio Actual:</span>
          <Badge variant={isDev ? "secondary" : "default"}>
            {currentDomain}
          </Badge>
        </div>

        {/* Tipo de Dominio */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Tipo:</span>
          <Badge variant={isMain ? "default" : isLogin ? "destructive" : "secondary"}>
            {isMain ? "Principal" : isLogin ? "Administración" : "Desarrollo"}
          </Badge>
        </div>

        {/* Estado de Desarrollo */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Modo:</span>
          <Badge variant={isDev ? "outline" : "default"}>
            {isDev ? "Desarrollo" : "Producción"}
          </Badge>
        </div>

        {/* Enlaces de Navegación */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Enlaces Rápidos:</h4>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getMainDomainUrl(), '_blank')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Sitio Principal
              <ExternalLink className="w-3 h-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getLoginDomainUrl('/super-admin-login'), '_blank')}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Portal Admin
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Información Técnica */}
        {isDev && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Información Técnica:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• En desarrollo, todas las rutas están disponibles</p>
              <p>• Las redirecciones automáticas están deshabilitadas</p>
              <p>• Usar rutas directas para probar funcionalidad</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainInfo;