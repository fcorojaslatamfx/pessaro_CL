import React, { useState, useRef, useCallback } from 'react';
import { Upload, File as FileIcon, X, Check, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useCMS } from "@/hooks/useCMS";
import { supabase } from "@/integrations/supabase/client";
import { MediaFile } from "@/lib/cms-types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  onFileSelect?: (file: MediaFile) => void;
  accept?: string;
  maxSize?: number; // en bytes, default 5MB
}

export function MediaUploader({ 
  onFileSelect, 
  accept = "image/*,video/*,application/pdf", 
  maxSize = 5 * 1024 * 1024 
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { media } = useCMS();
  const uploadMutation = media.useUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, []);

  const handleUpload = async (file: File) => {
    if (file.size > maxSize) {
      toast.error(`El archivo es demasiado grande. Máximo ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    try {
      setUploadingFile(file);
      setIsSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debe iniciar sesión para subir archivos");

      const result = await uploadMutation.mutateAsync({
        file,
        folder: 'general',
        userId: user.id
      });

      setIsSuccess(true);
      toast.success("Archivo subido correctamente");
      
      if (onFileSelect) {
        onFileSelect(result);
      }

      // Limpiar estado después de éxito
      setTimeout(() => {
        setUploadingFile(null);
        setIsSuccess(false);
      }, 2000);

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error al subir el archivo");
      setUploadingFile(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!uploadingFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-xl p-10 transition-all duration-300",
              "flex flex-col items-center justify-center text-center gap-4",
              isDragging 
                ? "border-primary bg-primary/5 scale-[1.01]" 
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium">Arrastra archivos aquí o haz clic</p>
              <p className="text-sm text-muted-foreground">
                Imágenes, videos o documentos (máx. {(maxSize / (1024 * 1024)).toFixed(0)}MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border rounded-xl p-6 bg-card flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {uploadingFile.type.startsWith('image/') ? (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              ) : (
                <FileIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{uploadingFile.name}</p>
                <span className="text-xs text-muted-foreground">
                  {(uploadingFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              
              <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                {uploadMutation.isPending ? (
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                ) : isSuccess ? (
                  <div className="absolute inset-0 bg-green-500 w-full" />
                ) : (
                  <div className="absolute inset-0 bg-destructive w-full" />
                )}
              </div>
            </div>

            <div className="shrink-0">
              {uploadMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : isSuccess ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {uploadMutation.isError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 px-1">
          <AlertCircle className="w-3 h-3" />
          Error al subir el archivo. Por favor, intente de nuevo.
        </p>
      )}
    </div>
  );
}
