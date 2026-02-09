import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  BarChart3, 
  PieChart, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  Eye,
  UserCheck,
  Briefcase,
  CreditCard,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
// Datos simulados para el dashboard
const dashboardData = {
  // Métricas principales
  totalAUM: 125000000, // Assets Under Management
  totalClients: 2847,
  activeTraders: 1923,
  monthlyVolume: 89500000,
  profitLoss: 2340000,
  
  // Métricas de rendimiento
  performance: {
    totalReturn: 18.5,
    sharpeRatio: 1.42,
    maxDrawdown: -8.3,
    winRate: 67.8,
    avgTrade: 1250,
    monthlyGrowth: 12.4
  },
  
  // Distribución de activos
  assetAllocation: [
    { name: 'Forex', value: 45, amount: 56250000, color: '#0A2687' },
    { name: 'Índices', value: 25, amount: 31250000, color: '#5e17eb' },
    { name: 'Commodities', value: 20, amount: 25000000, color: '#24d594' },
    { name: 'Acciones', value: 10, amount: 12500000, color: '#f59e0b' }
  ],
  
  // Clientes por región
  clientsByRegion: [
    { region: 'América Latina', clients: 1420, percentage: 49.9 },
    { region: 'Europa', clients: 854, percentage: 30.0 },
    { region: 'Asia-Pacífico', clients: 398, percentage: 14.0 },
    { region: 'Norteamérica', clients: 175, percentage: 6.1 }
  ],
  
  // Actividad reciente
  recentActivity: [
    { type: 'new_client', message: 'Nuevo cliente registrado: María González', time: '2 min ago', status: 'success' },
    { type: 'large_trade', message: 'Operación grande: EUR/USD $250,000', time: '5 min ago', status: 'info' },
    { type: 'risk_alert', message: 'Alerta de riesgo: Cliente excede límite', time: '12 min ago', status: 'warning' },
    { type: 'withdrawal', message: 'Retiro procesado: $50,000', time: '18 min ago', status: 'success' },
    { type: 'system', message: 'Mantenimiento programado completado', time: '1 hora ago', status: 'info' }
  ],
  
  // Top traders
  topTraders: [
    { name: 'Carlos Mendoza', profit: 45000, trades: 234, winRate: 78.5, risk: 'Moderado' },
    { name: 'Ana Ruiz', profit: 38500, trades: 189, winRate: 72.1, risk: 'Conservador' },
    { name: 'Luis Torres', profit: 32100, trades: 156, winRate: 69.8, risk: 'Agresivo' },
    { name: 'Sofia Martinez', profit: 28900, trades: 201, winRate: 65.4, risk: 'Moderado' }
  ],
  
  // Métricas de riesgo
  riskMetrics: {
    var95: 2.1, // Value at Risk 95%
    expectedShortfall: 3.2,
    leverageRatio: 1.8,
    marginUtilization: 45.6,
    riskScore: 6.8 // sobre 10
  },
  
  // Instrumentos más operados
  topInstruments: [
    { symbol: 'EUR/USD', volume: 25600000, trades: 1234, spread: 0.8 },
    { symbol: 'GBP/USD', volume: 18900000, trades: 987, spread: 1.2 },
    { symbol: 'USD/JPY', volume: 16700000, trades: 876, spread: 0.9 },
    { symbol: 'Gold', volume: 12300000, trades: 654, spread: 2.1 },
    { symbol: 'S&P 500', volume: 8900000, trades: 432, spread: 0.5 }
  ]
};

const InternalDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user, signOut, isInternalUser, isClient } = useAuth();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdate(new Date());
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Conservador': return 'bg-green-100 text-green-800';
      case 'Moderado': return 'bg-blue-100 text-blue-800';
      case 'Agresivo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isInternalUser() ? 'Dashboard Interno' : 'Dashboard del Cliente'}
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* User Info */}
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              Rol: {user?.role}
            </p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Día</SelectItem>
              <SelectItem value="7d">7 Días</SelectItem>
              <SelectItem value="30d">30 Días</SelectItem>
              <SelectItem value="90d">90 Días</SelectItem>
              <SelectItem value="1y">1 Año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalAUM)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +{dashboardData.performance.monthlyGrowth}% este mes
                </span>
              </p>
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
              <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(dashboardData.totalClients)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <UserCheck className="w-3 h-3 mr-1" />
                  {formatNumber(dashboardData.activeTraders)} activos
                </span>
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
              <CardTitle className="text-sm font-medium">Volumen Mensual</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData.monthlyVolume)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {formatNumber(dashboardData.topInstruments.reduce((sum, inst) => sum + inst.trades, 0))} operaciones
                </span>
              </p>
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
              <CardTitle className="text-sm font-medium">P&L Mensual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.profitLoss)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Win Rate: {dashboardData.performance.winRate}%
                </span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="risk">Gestión de Riesgo</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de Activos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribución de Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.assetAllocation.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{asset.value}%</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(asset.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clientes por Región */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Distribución de Clientes por Región
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.clientsByRegion.map((region, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{formatNumber(region.clients)}</div>
                    <div className="text-sm font-medium">{region.region}</div>
                    <div className="text-xs text-muted-foreground">{region.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Rendimiento */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Retorno Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  +{dashboardData.performance.totalReturn}%
                </div>
                <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sharpe Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData.performance.sharpeRatio}</div>
                <p className="text-xs text-muted-foreground">Riesgo ajustado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {dashboardData.performance.maxDrawdown}%
                </div>
                <p className="text-xs text-muted-foreground">Pérdida máxima</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Traders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Traders del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topTraders.map((trader, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{trader.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {trader.trades} operaciones
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(trader.profit)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{trader.winRate}% win</span>
                        <Badge className={getRiskColor(trader.risk)} variant="secondary">
                          {trader.risk}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gestión de Riesgo */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  VaR 95%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.riskMetrics.var95}%</div>
                <p className="text-xs text-muted-foreground">Value at Risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Shortfall</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.riskMetrics.expectedShortfall}%</div>
                <p className="text-xs text-muted-foreground">Pérdida esperada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Leverage Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.riskMetrics.leverageRatio}x</div>
                <p className="text-xs text-muted-foreground">Apalancamiento promedio</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utilización de Margen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Margen Utilizado</span>
                    <span className="font-semibold">{dashboardData.riskMetrics.marginUtilization}%</span>
                  </div>
                  <Progress value={dashboardData.riskMetrics.marginUtilization} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Límite recomendado: 70%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score de Riesgo General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Riesgo Actual</span>
                    <span className="font-semibold">{dashboardData.riskMetrics.riskScore}/10</span>
                  </div>
                  <Progress value={dashboardData.riskMetrics.riskScore * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Nivel: Moderado-Alto
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Clientes */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Nuevos Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tasa de Retención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.2%</div>
                <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AUM Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(43900)}</div>
                <p className="text-xs text-muted-foreground">Por cliente</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Trading */}
        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Instrumentos Más Operados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topInstruments.map((instrument, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{instrument.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(instrument.trades)} operaciones
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(instrument.volume)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Spread: {instrument.spread} pips
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InternalDashboard;