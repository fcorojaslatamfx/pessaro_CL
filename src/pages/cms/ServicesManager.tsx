import React, { useState } from 'react';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { useCMS } from '@/hooks/useCMS';
import { Service } from '@/lib/cms-types';
import { 
  Plus, 
  Edit2, 
  LayoutGrid, 
  ListTodo, 
  MoveVertical, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const serviceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe ser más detallada'),
  icon_name: z.string().min(1, 'El nombre del icono es requerido'),
  order: z.number().int().default(0),
  features: z.array(z.string().min(1, 'La característica no puede estar vacía'))
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function ServicesManager() {
  const { services } = useCMS();
  const { data: allServices, isLoading } = services.useAll();
  const upsertMutation = services.useUpsert();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: 'BarChart3',
      order_index: 0,
      features: ['']
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control as any,
    name: 'features'
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.reset({
        id: service.id,
        title: service.title,
        description: service.description,
        icon: service.icon,
        order_index: service.order_index,
        features: service.features || ['']
      });
    } else {
      setEditingService(null);
      form.reset({
        title: '',
        description: '',
        icon: 'BarChart3',
        order_index: (allServices?.length || 0) + 1,
        features: ['']
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      await upsertMutation.mutateAsync(values as Partial<Service>);
      toast.success(editingService ? 'Servicio actualizado' : 'Servicio creado correctamente');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el servicio');
      console.error(error);
    }
  };

  return (
    <CMSLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Servicios</h1>
            <p className="text-muted-foreground">Administra los servicios financieros y características ofrecidas en la plataforma.</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar Servicio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {allServices?.map((service) => (
              <Card key={service.id} className="overflow-hidden border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">Orden: {service.order_index}</Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(service)}
                      className="hover:bg-muted"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Características:</Label>
                    <ul className="grid grid-cols-1 gap-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle2 className="mr-2 h-3 w-3 text-[var(--title-accent)]" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-muted-foreground italic">+ {service.features.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            {allServices?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No hay servicios</h3>
                <p className="text-muted-foreground">Comienza agregando el primer servicio financiero.</p>
              </div>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
              <DialogDescription>
                Define los detalles del servicio y sus características principales.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Servicio</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej: Trading de Forex" 
                    {...form.register('title')} 
                  />
                  {form.formState.errors.title && (
                    <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icono (Lucide ID)</Label>
                  <Input 
                    id="icon" 
                    placeholder="Ej: TrendingUp" 
                    {...form.register('icon')} 
                  />
                  {form.formState.errors.icon_name && (
                    <p className="text-xs text-destructive">{form.formState.errors.icon.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  rows={3}
                  placeholder="Describe brevemente en qué consiste este servicio..." 
                  {...form.register('description')} 
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>Características / Beneficios</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append('')}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Agregar
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input 
                          placeholder={`Característica ${index + 1}`}
                          {...form.register(`features.${index}` as const)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {form.formState.errors.features && (
                    <p className="text-xs text-destructive">{form.formState.errors.features.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 w-32">
                <Label htmlFor="order">Orden de visualización</Label>
                <Input 
                  id="order" 
                  type="number" 
                  {...form.register('order', { valueAsNumber: true })} 
                />
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={upsertMutation.isPending} 
                  className="bg-primary text-primary-foreground"
                >
                  {upsertMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {editingService ? 'Actualizar Servicio' : 'Crear Servicio'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CMSLayout>
  );
}
