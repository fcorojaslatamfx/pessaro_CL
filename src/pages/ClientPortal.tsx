import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Settings, 
  Bell,
  CreditCard,
  BarChart3,
  Download,
  Eye,
  Calendar,
  Shield,
  LogOut,
  LineChart,
  Globe,
  Newspaper,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientRegistration } from '@/hooks/useClientRegistration';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  TradingViewAdvancedChart, 
  TradingViewSymbolOverview, 
  TradingViewEconomicCalendar, 
  TradingViewMarketScreener 
} from '@/components/TradingViewWidgets';

const ClientPortal: React.FC = () => {
  const [clientData, setClientData] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { getClientData, getClientPositions, getClientHistory } = useClientRegistration();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      setUser(user);

      // Cargar datos del cliente
      const [clientResult, positionsResult, historyResult] = await Promise.all([
        getClientData(),
        getClientPositions(),
        getClientHistory(10)
      ]);

      if (clientResult.success) {
        setClientData(clientResult);
      }

      if (positionsResult.success) {
        setPositions(positionsResult.positions || []);
      }

      if (historyResult.success) {
        setHistory(historyResult.history || []);
      }

    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando portal del cliente...</p>
        </div>
      </div>
    );
  }

  if (!clientData || !clientData.profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No se encontraron datos del cliente</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const profile = clientData.profile;
  const account = clientData.account;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Portal del Cliente</h1>
              <p className="text-primary-foreground/80">
                Bienvenido, {profile.first_name} {profile.last_name} | Cuenta: {account?.account_number || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Badge className="bg-[#24d594] text-white">
                {account?.account_type || 'Standard'}
              </Badge>
              <Button variant="secondary" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notificaciones
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navegación por pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Mercados
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              Noticias
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cuenta
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Resumen */}
          <TabsContent value="overview" className="space-y-8">
            {/* Métricas de cuenta */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(account?.balance || 0)}</div>
                    <p className="text-xs text-muted-foreground">Saldo disponible</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Equity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(account?.equity || 0)}</div>
                    <p className="text-xs text-green-600">
                      +{formatCurrency((account?.equity || 0) - (account?.balance || 0))} P&L
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Margen Libre</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(account?.free_margin || 0)}</div>
                    <p className="text-xs text-muted-foreground">Disponible para trading</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nivel de Margen</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{account?.margin_level || 0}%</div>
                    <p className="text-xs text-muted-foreground">Saludable</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Posiciones y Historial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Posiciones Abiertas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Posiciones Abiertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {positions.map((position, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            position.position_type === 'buy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {position.position_type === 'buy' ? 'Buy' : 'Sell'}
                          </div>
                          <div>
                            <div className="font-medium">{position.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {position.lots} lotes @ {position.open_price}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{position.current_price}</div>
                          <div className={`text-sm font-medium ${
                            position.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(position.profit_loss)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total P&L:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(positions.reduce((sum, pos) => sum + (pos.profit_loss || 0), 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de Operaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Historial Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.position_type === 'buy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.position_type === 'buy' ? 'Buy' : 'Sell'}
                          </div>
                          <div>
                            <div className="font-medium">{trade.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {trade.lots} lotes
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            trade.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(trade.profit_loss)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(trade.close_time).toLocaleString('es-CL')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña Trading */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Gráfico Principal */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Trading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TradingViewAdvancedChart 
                      symbol="EURUSD"
                      height={500}
                      theme="light"
                      allow_symbol_change={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Panel de Símbolos */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Símbolos Principales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TradingViewSymbolOverview 
                      height={500}
                      theme="light"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña Mercados */}
          <TabsContent value="markets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Screener de Mercados</CardTitle>
              </CardHeader>
              <CardContent>
                <TradingViewMarketScreener 
                  height={600}
                  theme="light"
                  market="forex"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Noticias */}
          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendario Económico</CardTitle>
              </CardHeader>
              <CardContent>
                <TradingViewEconomicCalendar 
                  height={600}
                  theme="light"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Cuenta */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                    <p className="text-lg">{profile.first_name} {profile.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="text-lg">{profile.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Perfil de Riesgo</label>
                    <p className="text-lg capitalize">{profile.risk_tolerance}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Notificaciones por Email</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Autenticación de Dos Factores</span>
                    <Button variant="outline" size="sm">Activar</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Chat en Vivo</span>
                    <Button variant="outline" size="sm">Contactar Asesor</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientPortal;