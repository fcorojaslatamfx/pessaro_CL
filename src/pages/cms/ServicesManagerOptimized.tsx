import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Edit3, 
  Save, 
  Plus, 
  Trash2,
  Eye, 
  EyeOff,
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EditingService {
  id?: string;
  service_id: string;
  title: string;
  description: string;
  long_description?: string;
  icon_name: string;
  benefits: string[];
  features?: any;
  order_index: number;
  is_active: boolean;
}

export default function ServicesManagerOptimized() {
  const cms = useCMSOptimized();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<EditingService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');

  // Queries
  const servicesQuery = cms.services.useAll();
  const upsertMutation = cms.services.useUpsert();
  const deleteMutation = cms.services.useDelete();

  // Iconos disponibles
  const availableIcons = [
    'LineChart', 'Briefcase', 'TrendingUp', 'Zap', 'Globe', 'BarChart3',
    'DollarSign', 'PieChart', 'Activity', 'Target', 'Shield', 'Star'
  ];

  // Filtrar servicios
  const filteredServices = servicesQuery.data?.filter(service => {
    return !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_id.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Manejar edición
  const handleEdit = (service: any) => {
    setEditingService({
      id: service.id,
      service_id: service.service_id,
      title: service.title,
      description: service.description,
      long_description: service.long_description || '',
      icon_name: service.icon_name,
      benefits: service.benefits || [],
      features: service.features || {},
      order_index: service.order_index,
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  // Manejar nuevo servicio
  const handleNew = () => {
    const nextOrder = Math.max(...(servicesQuery.data?.map(s => s.order_index) || [0])) + 1;
    setEditingService({
      service_id: '',
      title: '',
      description: '',
      long_description: '',
      icon_name: 'Briefcase',
      benefits: [],
      features: {},
      order_index: nextOrder,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  // Guardar servicio
  const handleSave = async () => {
    if (!editingService) return;

    if (!editingService.service_id || !editingService.title || !editingService.description) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await upsertMutation.mutateAsync(editingService);
      toast.success('Servicio guardado exitosamente');
      setIsDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      toast.error('Error al guardar el servicio');
      console.error('Error saving service:', error);
    }
  };

  // Alternar estado activo
  const toggleActive = async (service: any) => {
    try {
      await upsertMutation.mutateAsync({
        ...service,
        is_active: !service.is_active
      });
      toast.success(`Servicio ${!service.is_active ? 'activado' : 'desactivado'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado');
      console.error('Error toggling active state:', error);
    }
  };

  // Cambiar orden
  const changeOrder = async (service: any, direction: 'up' | 'down') => {
    const services = servicesQuery.data || [];
    const currentIndex = services.findIndex(s => s.id === service.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const targetService = services[targetIndex];
    
    try {
      // Intercambiar order_index
      await Promise.all([
        upsertMutation.mutateAsync({
          ...service,
          order_index: targetService.order_index
        }),
        upsertMutation.mutateAsync({
          ...targetService,
          order_index: service.order_index
        })
      ]);
      toast.success('Orden actualizado');
    } catch (error) {
      toast.error('Error al cambiar el orden');
      console.error('Error changing order:', error);
    }
  };

  // Agregar beneficio
  const addBenefit = () => {
    if (!newBenefit.trim() || !editingService) return;
    
    setEditingService({
      ...editingService,
      benefits: [...editingService.benefits, newBenefit.trim()]
    });
    setNewBenefit('');
  };

  // Remover beneficio
  const removeBenefit = (index: number) => {
    if (!editingService) return;
    
    setEditingService({
      ...editingService,
      benefits: editingService.benefits.filter((_, i) => i !== index)
    });
  };

  return (
    <CMSAccessGuard>
      <CMSLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-8 h-8" />
                Gestión de Servicios
              </h1>
              <p className="text-muted-foreground mt-1">
                Administra los servicios financieros de Pessaro Capital
              </p>
            </div>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>

          {/* Buscador */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de servicios */}
          <div className="grid gap-4">
            {servicesQuery.isLoading ? (
              // Skeleton loading
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredServices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No se encontraron servicios
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'No hay servicios que coincidan con la búsqueda.'
                      : 'Aún no hay servicios creados. Crea el primer servicio.'}
                  </p>
                  <Button onClick={handleNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Servicio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredServices
                .sort((a, b) => a.order_index - b.order_index)
                .map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={`transition-all duration-200 ${
                      service.is_active ? 'border-border' : 'border-muted bg-muted/30'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                #{service.order_index}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {service.service_id}
                              </Badge>
                              {!service.is_active && (
                                <Badge variant="destructive" className="text-xs">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <span className="text-2xl">
                                  {service.icon_name === 'LineChart' && '📈'}
                                  {service.icon_name === 'Briefcase' && '💼'}
                                  {service.icon_name === 'TrendingUp' && '📊'}
                                  {service.icon_name === 'Zap' && '⚡'}
                                  {service.icon_name === 'Globe' && '🌐'}
                                  {service.icon_name === 'BarChart3' && '📊'}
                                  {service.icon_name === 'DollarSign' && '💰'}
                                  {service.icon_name === 'PieChart' && '🥧'}
                                  {service.icon_name === 'Activity' && '📈'}
                                  {service.icon_name === 'Target' && '🎯'}
                                  {service.icon_name === 'Shield' && '🛡️'}
                                  {service.icon_name === 'Star' && '⭐'}
                                </span>
                                {service.title}
                              </h3>
                              <p className="text-muted-foreground mt-1">
                                {service.description}
                              </p>
                            </div>

                            {service.benefits && service.benefits.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">Beneficios:</p>
                                <div className="flex flex-wrap gap-2">
                                  {service.benefits.slice(0, 3).map((benefit, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      {benefit}
                                    </Badge>
                                  ))}
                                  {service.benefits.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{service.benefits.length - 3} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeOrder(service, 'up')}
                                disabled={index === 0 || upsertMutation.isPending}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeOrder(service, 'down')}
                                disabled={index === filteredServices.length - 1 || upsertMutation.isPending}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            
                            <Button
                              variant={service.is_active ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleActive(service)}
                              disabled={upsertMutation.isPending}
                            >
                              {upsertMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : service.is_active ? (
                                <EyeOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Eye className="w-4 h-4 mr-2" />
                              )}
                              {service.is_active ? 'Ocultar' : 'Mostrar'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
            )}
          </div>

          {/* Dialog de edición */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService?.id ? 'Editar Servicio' : 'Nuevo Servicio'}
                </DialogTitle>
                <DialogDescription>
                  {editingService?.id 
                    ? 'Modifica la información del servicio financiero.'
                    : 'Crea un nuevo servicio financiero para Pessaro Capital.'}
                </DialogDescription>
              </DialogHeader>

              {editingService && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_id">ID del Servicio *</Label>
                      <Input
                        id="service_id"
                        value={editingService.service_id}
                        onChange={(e) => setEditingService({
                          ...editingService,
                          service_id: e.target.value
                        })}
                        placeholder="ej: forex-trading"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Identificador único (sin espacios, usar guiones)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="icon_name">Icono</Label>
                      <select
                        id="icon_name"
                        value={editingService.icon_name}
                        onChange={(e) => setEditingService({
                          ...editingService,
                          icon_name: e.target.value
                        })}
                        className="w-full p-2 border border-border rounded-md bg-background"
                      >
                        {availableIcons.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={editingService.title}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        title: e.target.value
                      })}
                      placeholder="ej: Forex Trading"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción Corta *</Label>
                    <Textarea
                      id="description"
                      value={editingService.description}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        description: e.target.value
                      })}
                      placeholder="Descripción breve del servicio..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="long_description">Descripción Detallada</Label>
                    <Textarea
                      id="long_description"
                      value={editingService.long_description || ''}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        long_description: e.target.value
                      })}
                      placeholder="Descripción detallada del servicio..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Beneficios</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          placeholder="Agregar beneficio..."
                          onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                        />
                        <Button type="button" onClick={addBenefit} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {editingService.benefits.length > 0 && (
                        <div className="space-y-1">
                          {editingService.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                              <span className="text-sm">{benefit}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBenefit(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="order_index">Orden</Label>
                      <Input
                        id="order_index"
                        type="number"
                        value={editingService.order_index}
                        onChange={(e) => setEditingService({
                          ...editingService,
                          order_index: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={editingService.is_active}
                        onChange={(e) => setEditingService({
                          ...editingService,
                          is_active: e.target.checked
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">Servicio activo</Label>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={upsertMutation.isPending || !editingService?.service_id || !editingService?.title}
                >
                  {upsertMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CMSLayout>
    </CMSAccessGuard>
  );
}