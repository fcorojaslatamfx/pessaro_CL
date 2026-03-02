import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Edit3, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Filter,
  Plus
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EditingContent {
  id?: string;
  page_slug: string;
  section_key: string;
  content_type: 'text' | 'html' | 'image' | 'json';
  title?: string;
  content?: string;
  image_url?: string;
  metadata?: any;
  is_active: boolean;
}

export default function PageContentManager() {
  const cms = useCMSOptimized();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [editingContent, setEditingContent] = useState<EditingContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Queries
  const contentQuery = cms.pageContent.useAll();
  const upsertMutation = cms.pageContent.useUpsert();
  const deleteMutation = cms.pageContent.useDelete();

  // Páginas disponibles
  const availablePages = [
    { value: 'all', label: 'Todas las páginas' },
    { value: 'home', label: 'Página de Inicio' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'instrumentos', label: 'Instrumentos' },
    { value: 'educacion', label: 'Educación' },
    { value: 'blog', label: 'Blog' },
    { value: 'nosotros', label: 'Nosotros' },
    { value: 'contacto', label: 'Contacto' }
  ];

  // Tipos de contenido
  const contentTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'html', label: 'HTML' },
    { value: 'image', label: 'Imagen' },
    { value: 'json', label: 'JSON' }
  ];

  // Filtrar contenido
  const filteredContent = contentQuery.data?.filter(content => {
    const matchesSearch = !searchTerm || 
      content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.section_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.page_slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPage = selectedPage === 'all' || content.page_slug === selectedPage;
    
    return matchesSearch && matchesPage;
  }) || [];

  // Manejar edición
  const handleEdit = (content: any) => {
    setEditingContent({
      id: content.id,
      page_slug: content.page_slug,
      section_key: content.section_key,
      content_type: content.content_type,
      title: content.title || '',
      content: content.content || '',
      image_url: content.image_url || '',
      metadata: content.metadata || {},
      is_active: content.is_active
    });
    setIsDialogOpen(true);
  };

  // Manejar nuevo contenido
  const handleNew = () => {
    setEditingContent({
      page_slug: 'home',
      section_key: '',
      content_type: 'text',
      title: '',
      content: '',
      image_url: '',
      metadata: {},
      is_active: true
    });
    setIsDialogOpen(true);
  };

  // Guardar contenido
  const handleSave = async () => {
    if (!editingContent) return;

    try {
      await upsertMutation.mutateAsync(editingContent);
      toast.success('Contenido guardado exitosamente');
      setIsDialogOpen(false);
      setEditingContent(null);
    } catch (error) {
      toast.error('Error al guardar el contenido');
      console.error('Error saving content:', error);
    }
  };

  // Eliminar contenido
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Contenido eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el contenido');
      console.error('Error deleting content:', error);
    }
  };

  // Alternar estado activo
  const toggleActive = async (content: any) => {
    try {
      await upsertMutation.mutateAsync({
        ...content,
        is_active: !content.is_active
      });
      toast.success(`Contenido ${!content.is_active ? 'activado' : 'desactivado'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado');
      console.error('Error toggling active state:', error);
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
                <Globe className="w-8 h-8" />
                Contenido de Páginas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona el contenido editable de todas las páginas del sitio web
              </p>
            </div>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contenido
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar contenido</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Buscar por título, sección o página..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-64">
                  <Label htmlFor="page-filter">Filtrar por página</Label>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar página" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePages.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {page.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de contenido */}
          <div className="grid gap-4">
            {contentQuery.isLoading ? (
              // Skeleton loading
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
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
            ) : filteredContent.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No se encontró contenido
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedPage !== 'all' 
                      ? 'No hay contenido que coincida con los filtros aplicados.'
                      : 'Aún no hay contenido creado. Crea el primer elemento.'}
                  </p>
                  <Button onClick={handleNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Contenido
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredContent.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`transition-all duration-200 ${
                    content.is_active ? 'border-border' : 'border-muted bg-muted/30'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {availablePages.find(p => p.value === content.page_slug)?.label || content.page_slug}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {contentTypes.find(t => t.value === content.content_type)?.label || content.content_type}
                            </Badge>
                            {!content.is_active && (
                              <Badge variant="destructive" className="text-xs">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {content.title || content.section_key}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Sección: <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                {content.section_key}
                              </code>
                            </p>
                          </div>

                          {content.content && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-sm text-foreground line-clamp-2">
                                {content.content_type === 'html' 
                                  ? content.content.replace(/<[^>]*>/g, '') 
                                  : content.content}
                              </p>
                            </div>
                          )}

                          {content.image_url && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="w-4 h-4" />
                              <span>Imagen: {content.image_url}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(content)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          
                          <Button
                            variant={content.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleActive(content)}
                            disabled={upsertMutation.isPending}
                          >
                            {upsertMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : content.is_active ? (
                              <EyeOff className="w-4 h-4 mr-2" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            {content.is_active ? 'Ocultar' : 'Mostrar'}
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContent?.id ? 'Editar Contenido' : 'Nuevo Contenido'}
                </DialogTitle>
                <DialogDescription>
                  {editingContent?.id 
                    ? 'Modifica el contenido de la página seleccionada.'
                    : 'Crea nuevo contenido para una página del sitio web.'}
                </DialogDescription>
              </DialogHeader>

              {editingContent && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="page_slug">Página</Label>
                      <Select 
                        value={editingContent.page_slug} 
                        onValueChange={(value) => setEditingContent({
                          ...editingContent,
                          page_slug: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePages.filter(p => p.value !== 'all').map((page) => (
                            <SelectItem key={page.value} value={page.value}>
                              {page.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="content_type">Tipo de Contenido</Label>
                      <Select 
                        value={editingContent.content_type} 
                        onValueChange={(value: 'text' | 'html' | 'image' | 'json') => setEditingContent({
                          ...editingContent,
                          content_type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="section_key">Clave de Sección</Label>
                    <Input
                      id="section_key"
                      value={editingContent.section_key}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        section_key: e.target.value
                      })}
                      placeholder="ej: hero_title, about_description"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Identificador único para esta sección de contenido
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="title">Título (Opcional)</Label>
                    <Input
                      id="title"
                      value={editingContent.title || ''}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        title: e.target.value
                      })}
                      placeholder="Título descriptivo del contenido"
                    />
                  </div>

                  {editingContent.content_type === 'image' ? (
                    <div>
                      <Label htmlFor="image_url">URL de la Imagen</Label>
                      <Input
                        id="image_url"
                        value={editingContent.image_url || ''}
                        onChange={(e) => setEditingContent({
                          ...editingContent,
                          image_url: e.target.value
                        })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="content">Contenido</Label>
                      <Textarea
                        id="content"
                        value={editingContent.content || ''}
                        onChange={(e) => setEditingContent({
                          ...editingContent,
                          content: e.target.value
                        })}
                        placeholder={
                          editingContent.content_type === 'html' 
                            ? '<p>Contenido HTML...</p>'
                            : editingContent.content_type === 'json'
                            ? '{"key": "value"}'
                            : 'Contenido de texto...'
                        }
                        rows={6}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editingContent.is_active}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        is_active: e.target.checked
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">Contenido activo</Label>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={upsertMutation.isPending || !editingContent?.section_key}
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