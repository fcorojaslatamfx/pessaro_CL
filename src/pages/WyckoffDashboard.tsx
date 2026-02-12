import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';

export default function WyckoffDashboard() {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verificar si el usuario es interno o admin
    if (user && (user.role === 'interno' || user.role === 'admin' || user.role === 'super_admin')) {
      setIsAuthorized(true);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F2C] flex items-center justify-center">
        <div className="text-white">Verificando acceso...</div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return <Navigate to={ROUTE_PATHS.INTERNAL_LOGIN} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-[#1A4BFF]/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#1A4BFF]">
                Playbook Institucional – Pessaro Capital
              </h1>
              <p className="text-gray-300 mt-1">
                Versión 2.0 – Integrado con Identidad Visual Oficial
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-[#1A4BFF] text-[#1A4BFF]">
            Acceso Restringido
          </Badge>
        </div>

        {/* Paleta Institucional */}
        <Card className="mb-8 bg-[#111627] border-[#1A4BFF]">
          <CardHeader>
            <CardTitle className="text-[#1A4BFF] flex items-center gap-2">
              <Activity className="w-5 h-5" />
              1. Paleta Institucional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Primarios:</h4>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#0A0F2C] border border-gray-600"></div>
                  <span className="text-sm">#0A0F2C</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#1A4BFF] border border-gray-600"></div>
                  <span className="text-sm">#1A4BFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#D9D9E0] border border-gray-600"></div>
                  <span className="text-sm">#D9D9E0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#0F111A] border border-gray-600"></div>
                  <span className="text-sm">#0F111A</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Soporte:</h4>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#00C98D] border border-gray-600"></div>
                  <span className="text-sm">#00C98D</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#F2C94C] border border-gray-600"></div>
                  <span className="text-sm">#F2C94C</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FF4D4D] border border-gray-600"></div>
                  <span className="text-sm">#FF4D4D</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#4DA3FF] border border-gray-600"></div>
                  <span className="text-sm">#4DA3FF</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Trading:</h4>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#00FF9C] border border-gray-600"></div>
                  <span className="text-sm">#00FF9C</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FF5C5C] border border-gray-600"></div>
                  <span className="text-sm">#FF5C5C</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FFD93D] border border-gray-600"></div>
                  <span className="text-sm">#FFD93D</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FF9F1C] border border-gray-600"></div>
                  <span className="text-sm">#FF9F1C</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#A259FF] border border-gray-600"></div>
                  <span className="text-sm">#A259FF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#B00020] border border-gray-600"></div>
                  <span className="text-sm">#B00020</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estructura Multi-Timeframe */}
        <Card className="mb-8 bg-[#111627] border-[#1A4BFF]">
          <CardHeader>
            <CardTitle className="text-[#1A4BFF] flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              2. Estructura Multi‑Timeframe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A4BFF] mb-3">1D – Sesgo Macro</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Identificar SC, AR, ST, Spring/Test, LPS, SOS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Definir fase A–E
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Marcar rango institucional
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A4BFF] mb-3">4H – Sesgo Operativo</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Confirmar reacumulación o redistribución
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Detectar Spring/Test o UTAD
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Confirmar BOS/CHoCH
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A4BFF] mb-3">1H–15M–5M – Ejecución</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Validar microestructura
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Esperar corrección institucional
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                  Confirmar entrada con CHoCH/BOS
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Setups Institucionales */}
          <Card className="bg-[#111627] border-[#1A4BFF]">
            <CardHeader>
              <CardTitle className="text-[#1A4BFF] flex items-center gap-2">
                <Target className="w-5 h-5" />
                3. Setups Institucionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00C98D]" />
                  Setup Largo
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-[#00C98D] text-black">Spring/Test</Badge>
                  <Badge className="bg-[#4DA3FF] text-black">CHoCH alcista</Badge>
                  <Badge className="bg-[#F2C94C] text-black">Corrección</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[#FF4D4D]" />
                  Setup Corto
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-[#FF4D4D] text-black">UT/UTAD</Badge>
                  <Badge className="bg-[#4DA3FF] text-black">CHoCH bajista</Badge>
                  <Badge className="bg-[#F2C94C] text-black">Retroceso débil</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Riesgo */}
          <Card className="bg-[#111627] border-[#1A4BFF]">
            <CardHeader>
              <CardTitle className="text-[#1A4BFF] flex items-center gap-2">
                <Shield className="w-5 h-5" />
                4. Gestión de Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F2C94C]" />
                  Riesgo por operación: 0.25% – 0.50%
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F2C94C]" />
                  Máximo diario: 1%
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F2C94C]" />
                  Máximo semanal: 2%
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF4D4D]" />
                  No mover stop en contra
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Checklist Diario */}
        <Card className="bg-[#111627] border-[#1A4BFF]">
          <CardHeader>
            <CardTitle className="text-[#1A4BFF] flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              5. Checklist Diario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1A4BFF] mb-3">Antes de la sesión</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                    Caja 1D y 4H dibujadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                    Sesgo macro y operativo definidos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00C98D]" />
                    Zonas institucionales marcadas
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1A4BFF] mb-3">Durante la sesión</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F2C94C]" />
                    Esperar corrección
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F2C94C]" />
                    Validar volumen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F2C94C]" />
                    Confirmar estructura
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1A4BFF] mb-3">Después de la sesión</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4DA3FF]" />
                    Registrar operación
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4DA3FF]" />
                    Actualizar playbook
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2026 Pessaro Capital - Playbook Institucional - Acceso Restringido</p>
        </div>
      </div>
    </div>
  );
}