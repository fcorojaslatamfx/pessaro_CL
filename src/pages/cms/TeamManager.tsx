import React, { useState } from 'react';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { MediaUploader } from '@/components/cms/MediaUploader';
import { useCMS } from '@/hooks/useCMS';
import { TeamMember, MediaFile } from '@/lib/cms-types';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Linkedin, 
  Twitter, 
  MoreVertical, 
  UserPlus,
  Save,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function TeamManager() {
  const { team } = useCMS();
  const { data: members, isLoading } = team.useMembers();
  const upsertMutation = team.useUpsert();
  const deleteMutation = team.useDelete();

  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember> | null>(null);

  const handleOpenEdit = (member?: TeamMember) => {
    setCurrentMember(member || {
      name: '',
      role: '',
      bio: '',
      image_url: '',
      linkedin_url: '',
      twitter_url: '',
      order_index: (members?.length || 0) + 1
    });
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setCurrentMember(null);
  };

  const handleSave = async () => {
    if (!currentMember?.name || !currentMember?.role) {
      toast.error('Nombre y cargo son obligatorios');
      return;
    }

    try {
      await upsertMutation.mutateAsync(currentMember);
      toast.success(currentMember.id ? 'Miembro actualizado' : 'Miembro creado');
      handleCloseEdit();
    } catch (error) {
      toast.error('Error al guardar el miembro del equipo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este miembro?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Miembro eliminado');
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleImageSelect = (file: MediaFile) => {
    setCurrentMember(prev => prev ? { ...prev, image_url: file.url } : null);
  };

  const moveMember = async (member: TeamMember, direction: 'up' | 'down') => {
    if (!members) return;
    const currentIndex = members.findIndex(m => m.id === member.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= members.length) return;

    const targetMember = members[targetIndex];
    
    try {
      await Promise.all([
        upsertMutation.mutateAsync({ ...member, order_index: targetMember.order_index }),
        upsertMutation.mutateAsync({ ...targetMember, order_index: member.order_index })
      ]);
      toast.success('Orden actualizado');
    } catch (error) {
      toast.error('Error al reordenar');
    }
  };

  return (
    <CMSLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión del Equipo</h1>
            <p className="text-muted-foreground">Administra los profesionales que forman parte de Pessaro Capital.</p>
          </div>
          <Button 
            onClick={() => handleOpenEdit()} 
            className="bg-primary hover:bg-primary/90 text-white font-semibold transition-all"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Añadir Miembro
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {members?.map((member, index) => (
                <motion.div 
                  key={member.id} 
                  variants={staggerItem}
                  layout
                >
                  <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors group h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {member.image_url ? (
                        <img 
                          src={member.image_url} 
                          alt={member.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Sin Imagen
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => moveMember(member, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => moveMember(member, 'down')}
                          disabled={index === members.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardHeader className="flex-none">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{member.name}</CardTitle>
                          <CardDescription className="text-primary font-medium mt-1">
                            {member.role}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(member)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {member.bio}
                      </p>
                    </CardContent>

                    <CardFooter className="flex-none gap-2 border-t border-border/50 mt-auto pt-4">
                      {member.linkedin_url && (
                        <a 
                          href={member.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.twitter_url && (
                        <a 
                          href={member.twitter_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      <Badge variant="outline" className="ml-auto">
                        Orden: {member.order_index}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentMember?.id ? 'Editar Miembro' : 'Nuevo Miembro del Equipo'}
              </DialogTitle>
              <DialogDescription>
                Completa la información del profesional. Estos datos aparecerán en la sección "Nuestro Equipo".
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <Input 
                    placeholder="Ej: Francisco Rojas Aranda"
                    value={currentMember?.name || ''}
                    onChange={(e) => setCurrentMember(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo / Rol</label>
                  <Input 
                    placeholder="Ej: CEO & Fundador"
                    value={currentMember?.role || ''}
                    onChange={(e) => setCurrentMember(prev => prev ? { ...prev, role: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Biografía</label>
                <Textarea 
                  placeholder="Breve descripción de su trayectoria y especialidad..."
                  className="min-h-[120px]"
                  value={currentMember?.bio || ''}
                  onChange={(e) => setCurrentMember(prev => prev ? { ...prev, bio: e.target.value } : null)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagen de Perfil</label>
                  <div className="flex flex-col gap-4">
                    {currentMember?.image_url && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                        <img 
                          src={currentMember.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"
                          onClick={() => setCurrentMember(prev => prev ? { ...prev, image_url: '' } : null)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <MediaUploader 
                      onFileSelect={handleImageSelect}
                      accept="image/*"
                      maxSize={50 * 1024 * 1024}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL LinkedIn</label>
                    <Input 
                      placeholder="https://linkedin.com/in/..."
                      value={currentMember?.linkedin_url || ''}
                      onChange={(e) => setCurrentMember(prev => prev ? { ...prev, linkedin_url: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL Twitter / X</label>
                    <Input 
                      placeholder="https://x.com/..."
                      value={currentMember?.twitter_url || ''}
                      onChange={(e) => setCurrentMember(prev => prev ? { ...prev, twitter_url: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Orden de Visualización</label>
                    <Input 
                      type="number"
                      value={currentMember?.order_index || 0}
                      onChange={(e) => setCurrentMember(prev => prev ? { ...prev, order_index: parseInt(e.target.value) } : null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCloseEdit}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={upsertMutation.isPending}
                className="bg-primary text-white"
              >
                {upsertMutation.isPending ? 'Guardando...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CMSLayout>
  );
}
