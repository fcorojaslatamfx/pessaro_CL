import React, { useState, useEffect } from 'react';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { MediaUploader } from '@/components/cms/MediaUploader';
import { useCMS } from '@/hooks/useCMS';
import { BlogPost, MediaFile } from '@/lib/cms-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  FileEdit,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_BADGES = {
  published: { label: 'Publicado', variant: 'default' as const, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  draft: { label: 'Borrador', variant: 'secondary' as const, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  archived: { label: 'Archivado', variant: 'destructive' as const, color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
};

export default function BlogManager() {
  const { blog } = useCMS();
  const { data: posts, isLoading } = blog.usePosts();
  const upsertMutation = blog.useUpsert();
  const deleteMutation = blog.useDelete();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  // Initial state for a new post
  const emptyPost: Partial<BlogPost> = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    category: 'Análisis',
    cover_image: '',
    tags: [],
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingPost(emptyPost);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Artículo eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el artículo');
      }
    }
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.slug) {
      toast.error('El título y el slug son obligatorios');
      return;
    }

    try {
      await upsertMutation.mutateAsync(editingPost);
      toast.success(editingPost.id ? 'Artículo actualizado' : 'Artículo creado');
      setIsEditorOpen(false);
      setEditingPost(null);
    } catch (error) {
      toast.error('Error al guardar el artículo');
    }
  };

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (editingPost && !editingPost.id && editingPost.title && !editingPost.slug) {
      const slug = editingPost.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setEditingPost(prev => prev ? { ...prev, slug } : null);
    }
  }, [editingPost?.title]);

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Blog</h1>
            <p className="text-muted-foreground mt-1">
              Crea, edita y publica artículos para Pessaro Capital.
            </p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Artículo
          </Button>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o categoría..."
                  className="pl-10 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-background/50">
                  <SelectValue placeholder="Filtrar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando artículos...</p>
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[100px]">Portada</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredPosts.map((post) => (
                        <TableRow key={post.id} className="hover:bg-muted/30 transition-colors group">
                          <TableCell>
                            <div className="w-12 h-12 rounded bg-muted overflow-hidden">
                              {post.cover_image ? (
                                <img 
                                  src={post.cover_image} 
                                  alt={post.title} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{post.title}</span>
                              <span className="text-xs text-muted-foreground font-mono">/{post.slug}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {post.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`font-medium border shadow-none ${STATUS_BADGES[post.status].color}`}
                            >
                              {STATUS_BADGES[post.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(post.created_at).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => handleEdit(post)}
                              >
                                <FileEdit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(post.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No se encontraron artículos</h3>
                <p className="text-muted-foreground max-w-xs">
                  {searchQuery ? `No hay resultados para "${searchQuery}"` : "Empieza creando tu primer artículo para el blog."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddNew} variant="outline" className="mt-4">
                    Crear Artículo
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingPost?.id ? 'Editar Artículo' : 'Nuevo Artículo'}
              </DialogTitle>
              <DialogDescription>
                Completa la información del artículo. Los cambios se guardarán como borrador por defecto.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Artículo</Label>
                  <Input
                    id="title"
                    placeholder="Ej: El futuro del trading en 2026"
                    value={editingPost?.title || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev!, title: e.target.value }))}
                    className="text-lg font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumen / Extracto</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Una breve descripción para los listados y redes sociales..."
                    rows={3}
                    value={editingPost?.excerpt || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev!, excerpt: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenido del Artículo</Label>
                  <div className="min-h-[400px] border border-border rounded-md">
                    <RichTextEditor
                      value={editingPost?.content || ''}
                      onChange={(content) => setEditingPost(prev => ({ ...prev!, content }))}
                      placeholder="Escribe aquí el contenido principal de tu artículo..."
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Settings Area */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Imagen de Portada</Label>
                  <div className="relative aspect-video rounded-md border-2 border-dashed border-border overflow-hidden bg-muted/30 group">
                    {editingPost?.cover_image ? (
                      <>
                        <img 
                          src={editingPost.cover_image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => setEditingPost(prev => ({ ...prev!, cover_image: '' }))}
                          className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <MediaUploader 
                          onFileSelect={(file) => setEditingPost(prev => ({ ...prev!, cover_image: file.url }))}
                          accept="image/*"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="el-futuro-del-trading"
                    value={editingPost?.slug || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev!, slug: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado de Publicación</Label>
                  <Select 
                    value={editingPost?.status || 'draft'}
                    onValueChange={(value: BlogPost['status']) => setEditingPost(prev => ({ ...prev!, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={editingPost?.category || 'Análisis'}
                    onValueChange={(value) => setEditingPost(prev => ({ ...prev!, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Análisis">Análisis</SelectItem>
                      <SelectItem value="Mercados">Mercados</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Empresa">Empresa</SelectItem>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Card className="bg-muted/30 border-none">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-2 rounded bg-primary/10 text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <p>Los artículos publicados aparecerán inmediatamente en el sitio web principal.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setIsEditorOpen(false)}
                disabled={upsertMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {editingPost?.id ? 'Actualizar' : 'Publicar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CMSLayout>
  );
}

// Missing icon imports helper
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
