import React, { useState } from 'react';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { useCMS } from '@/hooks/useCMS';
import { TradingInstrument } from '@/lib/cms-types';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  Coins,
  BarChart3,
  Globe,
  Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets, fadeInUp } from '@/lib/motion';

const CATEGORIES = [
  { value: 'forex', label: 'Forex', icon: Globe },
  { value: 'crypto', label: 'Criptomonedas', icon: Coins },
  { value: 'stocks', label: 'Acciones', icon: TrendingUp },
  { value: 'commodities', label: 'Materias Primas', icon: Gem },
  { value: 'indices', label: 'Índices', icon: BarChart3 },
];

export default function InstrumentsManager() {
  const { instruments } = useCMS();
  const { data: allInstruments, isLoading } = instruments.useAll();
  const upsertMutation = instruments.useUpsert();
  const deleteMutation = instruments.useDelete();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Partial<TradingInstrument> | null>(null);

  const filteredInstruments = allInstruments?.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (instrument?: TradingInstrument) => {
    setEditingInstrument(instrument || {
      name: '',
      symbol: '',
      category: 'forex',
      spread: '0.1',
      leverage: '1:30',
      is_popular: false,
      order: 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstrument) return;

    try {
      await upsertMutation.mutateAsync(editingInstrument);
      toast.success('Instrumento guardado correctamente');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el instrumento');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este instrumento?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Instrumento eliminado');
      } catch (error) {
        toast.error('Error al eliminar el instrumento');
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    const Icon = cat?.icon || Globe;
    return <Icon className="h-4 w-4 mr-2" />;
  };

  return (
    <CMSLayout>
      <div className="space-y-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Instrumentos de Trading</h1>
            <p className="text-muted-foreground mt-1">Gestiona los activos financieros disponibles en la plataforma.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Instrumento
          </Button>
        </motion.div>

        <div className="flex items-center space-x-2 bg-card p-4 rounded-xl border border-border shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o símbolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-base"
          />
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando instrumentos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Símbolo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Spread</TableHead>
                  <TableHead>Apalancamiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode='popLayout'>
                  {filteredInstruments?.map((instrument) => (
                    <TableRow key={instrument.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono font-bold text-primary">
                        {instrument.symbol}
                      </TableCell>
                      <TableCell className="font-medium">
                        {instrument.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getCategoryIcon(instrument.category)}
                          <span className="capitalize">{instrument.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{instrument.spread}</TableCell>
                      <TableCell className="font-mono">{instrument.leverage}</TableCell>
                      <TableCell>
                        {instrument.is_popular && (
                          <Badge variant="secondary" className="bg-mint-accent/20 text-mint-accent border-mint-accent/30">
                            Popular
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(instrument)}
                            className="hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(instrument.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
                {filteredInstruments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No se encontraron instrumentos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingInstrument?.id ? 'Editar Instrumento' : 'Añadir Nuevo Instrumento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Símbolo (ej: EURUSD)</Label>
                  <Input
                    id="symbol"
                    value={editingInstrument?.symbol || ''}
                    onChange={(e) => setEditingInstrument(prev => ({ ...prev!, symbol: e.target.value }))}
                    placeholder="EURUSD"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={editingInstrument?.name || ''}
                    onChange={(e) => setEditingInstrument(prev => ({ ...prev!, name: e.target.value }))}
                    placeholder="Euro / US Dollar"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={editingInstrument?.category}
                  onValueChange={(val: any) => setEditingInstrument(prev => ({ ...prev!, category: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center">
                          {React.createElement(cat.icon, { className: "h-4 w-4 mr-2" })}
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spread">Spread Típico</Label>
                  <Input
                    id="spread"
                    value={editingInstrument?.spread || ''}
                    onChange={(e) => setEditingInstrument(prev => ({ ...prev!, spread: e.target.value }))}
                    placeholder="0.1 pips"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leverage">Apalancamiento Máx.</Label>
                  <Input
                    id="leverage"
                    value={editingInstrument?.leverage || ''}
                    onChange={(e) => setEditingInstrument(prev => ({ ...prev!, leverage: e.target.value }))}
                    placeholder="1:30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="is_popular">Marcar como Popular</Label>
                  <p className="text-xs text-muted-foreground">
                    Aparecerá en las secciones destacadas del sitio.
                  </p>
                </div>
                <Switch
                  id="is_popular"
                  checked={editingInstrument?.is_popular || false}
                  onCheckedChange={(val) => setEditingInstrument(prev => ({ ...prev!, is_popular: val }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Orden de Visualización</Label>
                <Input
                  id="order"
                  type="number"
                  value={editingInstrument?.order || 0}
                  onChange={(e) => setEditingInstrument(prev => ({ ...prev!, order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? 'Guardando...' : 'Guardar Instrumento'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CMSLayout>
  );
}
