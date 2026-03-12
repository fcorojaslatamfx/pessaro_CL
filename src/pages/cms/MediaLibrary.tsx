import React, { useState } from "react";
import { CMSLayout } from "@/components/cms/CMSLayout";
import { MediaUploader } from "@/components/cms/MediaUploader";
import { useCMS } from "@/hooks/useCMS";
import { MediaFile } from "@/lib/cms-types";
import {
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Download,
  Copy,
  Search,
  Grid,
  List,
  MoreVertical,
  FileQuestion
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MediaLibrary() {
  const { media } = useCMS();
  const { data: files, isLoading } = media.useFiles();
  const deleteMutation = media.useDelete();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada al portapapeles");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Archivo eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar el archivo");
      }
    }
  };

  const filteredFiles = files?.filter((file) =>
    file.original_name || file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <CMSLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biblioteca de Medios</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus imágenes y documentos del sitio
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MediaUploader />
          </div>
        </header>

        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar archivos..."
                className="pl-10 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-2 h-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-2 h-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="docs">Documentos</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <TabsContent value="all" className="m-0">
              {filteredFiles && filteredFiles.length > 0 ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className={viewMode === "grid" 
                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" 
                    : "space-y-2"
                  }
                >
                  <AnimatePresence mode="popLayout">
                    {filteredFiles.map((file) => (
                      <motion.div key={file.id} variants={staggerItem} layout>
                        {viewMode === "grid" ? (
                          <FileCard 
                            file={file} 
                            onCopy={() => handleCopyUrl(file.file_path)} 
                            onDelete={() => handleDelete(file.id)} 
                            isImage={isImage(file.mime_type)}
                          />
                        ) : (
                          <FileRow 
                            file={file} 
                            onCopy={() => handleCopyUrl(file.file_path)} 
                            onDelete={() => handleDelete(file.id)} 
                            isImage={isImage(file.mime_type)}
                            formatSize={formatFileSize}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                  <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No se encontraron archivos</h3>
                  <p className="text-muted-foreground">Sube archivos para empezar a construir tu biblioteca</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </CMSLayout>
  );
}

function FileCard({ 
  file, 
  onCopy, 
  onDelete, 
  isImage 
}: { 
  file: MediaFile; 
  onCopy: () => void; 
  onDelete: () => void; 
  isImage: boolean; 
}) {
  return (
    <Card className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
      <div className="aspect-square flex items-center justify-center bg-muted/30 overflow-hidden">
        {isImage ? (
          <img 
            src={file.file_path} 
            alt={file.original_name || file.filename} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <span className="text-[10px] uppercase font-bold">{file.mime_type.split('/')[1]}</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
        <p className="text-xs font-medium text-center line-clamp-2 mb-2">{file.original_name || file.filename}</p>
        <div className="flex gap-2">
          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={onCopy} title="Copiar URL">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8" asChild title="Ver">
            <a href={file.file_path} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onDelete} title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FileRow({ 
  file, 
  onCopy, 
  onDelete, 
  isImage, 
  formatSize 
}: { 
  file: MediaFile; 
  onCopy: () => void; 
  onDelete: () => void; 
  isImage: boolean; 
  formatSize: (b: number) => string;
}) {
  return (
    <Card className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors border-border">
      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {isImage ? (
          <img src={file.file_path} alt={file.original_name || file.filename} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.original_name || file.filename}</p>
        <p className="text-xs text-muted-foreground">{formatSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onCopy} title="Copiar URL">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a href={file.file_path} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
