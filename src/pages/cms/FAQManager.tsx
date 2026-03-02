import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Edit3, 
  Save, 
  Plus, 
  Eye, 
  EyeOff,
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
  Filter
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EditingFAQ {
  id?: string;
  faq_id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

export default function FAQManager() {
  const cms = useCMSOptimized();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingFAQ, setEditingFAQ] = useState<EditingFAQ | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Queries
  const faqsQuery = cms.faqs.useAll();
  const upsertMutation = cms.faqs.useUpsert();
  const deleteMutation = cms.faqs.useDelete();

  // Categorías disponibles
  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'trading', label: 'Trading' },
    { value: 'cuenta', label: 'Cuenta' },
    { value: 'plataforma', label: 'Plataforma' },
    { value: 'depositos', label: 'Depósitos y Retiros' },
    { value: 'general', label: 'General' }
  ];

  // Filtrar FAQs
  const filteredFAQs = faqsQuery.data?.filter(faq => {
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.faq_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Manejar edición
  const handleEdit = (faq: any) => {
    setEditingFAQ({
      id: faq.id,
      faq_id: faq.faq_id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order_index: faq.order_index,
      is_active: faq.is_active
    });
    setIsDialogOpen(true);
  };

  // Manejar nueva FAQ
  const handleNew = () => {
    const nextOrder = Math.max(...(faqsQuery.data?.map(f => f.order_index) || [0])) + 1;
    setEditingFAQ({
      faq_id: '',
      question: '',
      answer: '',
      category: 'general',
      order_index: nextOrder,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  // Guardar FAQ
  const handleSave = async () => {
    if (!editingFAQ) return;

    if (!editingFAQ.faq_id || !editingFAQ.question || !editingFAQ.answer) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await upsertMutation.mutateAsync(editingFAQ);
      toast.success('FAQ guardada exitosamente');
      setIsDialogOpen(false);
      setEditingFAQ(null);
    } catch (error) {
      toast.error('Error al guardar la FAQ');
      console.error('Error saving FAQ:', error);
    }
  };

  // Alternar estado activo
  const toggleActive = async (faq: any) => {
    try {
      await upsertMutation.mutateAsync({
        ...faq,
        is_active: !faq.is_active
      });
      toast.success(`FAQ ${!faq.is_active ? 'activada' : 'desactivada'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado');
      console.error('Error toggling active state:', error);
    }
  };

  // Cambiar orden
  const changeOrder = async (faq: any, direction: 'up' | 'down') => {
    const faqs = filteredFAQs.sort((a, b) => a.order_index - b.order_index);
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const targetFAQ = faqs[targetIndex];
    
    try {
      // Intercambiar order_index
      await Promise.all([
        upsertMutation.mutateAsync({
          ...faq,
          order_index: targetFAQ.order_index
        }),
        upsertMutation.mutateAsync({
          ...targetFAQ,
          order_index: faq.order_index
        })
      ]);
      toast.success('Orden actualizado');
    } catch (error) {
      toast.error('Error al cambiar el orden');
      console.error('Error changing order:', error);
    }
  };

  return (
    <CMSAccessGuard>
      <CMSLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-8 h-8" />
                Gestión de FAQs
              </h1>
              <p className="text-muted-foreground mt-1">
                Administra las preguntas frecuentes del sitio web
              </p>
            </div>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva FAQ
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar FAQs</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Buscar por pregunta, respuesta o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-64">
                  <Label htmlFor="category-filter">Filtrar por categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de FAQs */}
          <div className="grid gap-4">
            {faqsQuery.isLoading ? (
              // Skeleton loading
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No se encontraron FAQs
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'No hay FAQs que coincidan con los filtros aplicados.'
                      : 'Aún no hay FAQs creadas. Crea la primera FAQ.'}
                  </p>
                  <Button onClick={handleNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear FAQ
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs
                .sort((a, b) => a.order_index - b.order_index)
                .map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`transition-all duration-200 ${
                      faq.is_active ? 'border-border' : 'border-muted bg-muted/30'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                #{faq.order_index}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {categories.find(c => c.value === faq.category)?.label || faq.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {faq.faq_id}
                              </Badge>
                              {!faq.is_active && (
                                <Badge variant="destructive" className="text-xs">
                                  Inactiva
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold text-foreground mb-2">
                                {faq.question}
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeOrder(faq, 'up')}
                                disabled={index === 0 || upsertMutation.isPending}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeOrder(faq, 'down')}
                                disabled={index === filteredFAQs.length - 1 || upsertMutation.isPending}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(faq)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            
                            <Button
                              variant={faq.is_active ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleActive(faq)}
                              disabled={upsertMutation.isPending}
                            >
                              {upsertMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : faq.is_active ? (
                                <EyeOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Eye className="w-4 h-4 mr-2" />
                              )}
                              {faq.is_active ? 'Ocultar' : 'Mostrar'}
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
                  {editingFAQ?.id ? 'Editar FAQ' : 'Nueva FAQ'}
                </DialogTitle>
                <DialogDescription>
                  {editingFAQ?.id 
                    ? 'Modifica la pregunta frecuente seleccionada.'
                    : 'Crea una nueva pregunta frecuente para el sitio web.'}
                </DialogDescription>
              </DialogHeader>

              {editingFAQ && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faq_id">ID de la FAQ *</Label>
                      <Input
                        id="faq_id"
                        value={editingFAQ.faq_id}
                        onChange={(e) => setEditingFAQ({
                          ...editingFAQ,
                          faq_id: e.target.value
                        })}
                        placeholder="ej: faq-forex-spreads"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Identificador único (sin espacios, usar guiones)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select 
                        value={editingFAQ.category} 
                        onValueChange={(value) => setEditingFAQ({
                          ...editingFAQ,
                          category: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c.value !== 'all').map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="question">Pregunta *</Label>
                    <Input
                      id="question"
                      value={editingFAQ.question}
                      onChange={(e) => setEditingFAQ({
                        ...editingFAQ,
                        question: e.target.value
                      })}
                      placeholder="¿Cuál es tu pregunta?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="answer">Respuesta *</Label>
                    <Textarea
                      id="answer"
                      value={editingFAQ.answer}
                      onChange={(e) => setEditingFAQ({
                        ...editingFAQ,
                        answer: e.target.value
                      })}
                      placeholder="Respuesta detallada a la pregunta..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="order_index">Orden</Label>
                      <Input
                        id="order_index"
                        type="number"
                        value={editingFAQ.order_index}
                        onChange={(e) => setEditingFAQ({
                          ...editingFAQ,
                          order_index: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={editingFAQ.is_active}
                        onChange={(e) => setEditingFAQ({
                          ...editingFAQ,
                          is_active: e.target.checked
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">FAQ activa</Label>
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
                  disabled={upsertMutation.isPending || !editingFAQ?.faq_id || !editingFAQ?.question || !editingFAQ?.answer}
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