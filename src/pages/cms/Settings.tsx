import React, { useState, useEffect } from 'react';
import { CMSLayout } from '@/components/cms/CMSLayout';
import { useCMS } from '@/hooks/useCMS';
import { SiteSetting } from '@/lib/cms-types';
import { 
  Settings as SettingsIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Share2, 
  Search, 
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Settings() {
  const { settings } = useCMS();
  const { data: allSettings, isLoading } = settings.useAll();
  const updateSetting = settings.useUpdate();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    if (allSettings) {
      const initialData: Record<string, any> = {};
      allSettings.forEach((s) => {
        initialData[s.setting_key] = s.setting_value;
      });
      setFormData(initialData);
    }
  }, [allSettings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (category: SiteSetting['category']) => {
    setIsSaving(category);
    try {
      const categorySettings = allSettings?.filter((s) => s.category === category) || [];
      
      const promises = categorySettings.map((s) => {
        return updateSetting.mutateAsync({
          id: s.id,
          setting_value: formData[s.setting_key],
        });
      });

      await Promise.all(promises);
      toast.success(`Configuración de ${category} guardada correctamente`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <CMSLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CMSLayout>
    );
  }

  const renderSettingField = (setting: SiteSetting) => {
    const value = formData[setting.setting_key] || '';
    
    return (
      <div key={setting.id} className="space-y-2">
        <Label htmlFor={setting.setting_key} className="text-sm font-medium">
          {setting.description || setting.setting_key}
        </Label>
        {setting.setting_key.includes('description') || setting.setting_key.includes('address') ? (
          <Textarea
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            className="min-h-[100px] resize-none"
            placeholder={`Ingrese ${setting.description || setting.setting_key}`}
          />
        ) : (
          <Input
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`Ingrese ${setting.description || setting.setting_key}`}
          />
        )}
      </div>
    );
  };

  return (
    <CMSLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Configuración del Sitio
          </h1>
          <p className="text-muted-foreground">
            Gestiona la información global de Pessaro Capital, datos de contacto y parámetros de SEO.
          </p>
        </header>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-muted/50 p-1">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {/* General Settings */}
            <TabsContent value="general">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Ajustes Generales</CardTitle>
                  <CardDescription>
                    Información básica sobre la identidad de la empresa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {allSettings?.filter(s => s.category === 'general').map(renderSettingField)}
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSave('general')} 
                      disabled={isSaving === 'general'}
                      className="min-w-[140px]"
                    >
                      {isSaving === 'general' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Settings */}
            <TabsContent value="contact">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>
                    Datos que aparecerán en el pie de página y página de contacto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {allSettings?.filter(s => s.category === 'contact').map(renderSettingField)}
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSave('contact')} 
                      disabled={isSaving === 'contact'}
                      className="min-w-[140px]"
                    >
                      {isSaving === 'contact' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Media Settings */}
            <TabsContent value="social">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Redes Sociales</CardTitle>
                  <CardDescription>
                    Enlaces a los perfiles oficiales de la empresa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {allSettings?.filter(s => s.category === 'social').map(renderSettingField)}
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSave('social')} 
                      disabled={isSaving === 'social'}
                      className="min-w-[140px]"
                    >
                      {isSaving === 'social' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Optimización SEO</CardTitle>
                  <CardDescription>
                    Controla cómo aparece el sitio en los motores de búsqueda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    {allSettings?.filter(s => s.category === 'seo').map(renderSettingField)}
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSave('seo')} 
                      disabled={isSaving === 'seo'}
                      className="min-w-[140px]"
                    >
                      {isSaving === 'seo' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>

        {/* Preview Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado del Sitio</p>
                  <p className="text-lg font-bold">En Línea</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-accent/10 rounded-full">
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">URL Principal</p>
                  <p className="text-lg font-bold truncate">pessarocapital.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary/10 rounded-full">
                  <SettingsIcon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Versión CMS</p>
                  <p className="text-lg font-bold">v2.1.0-2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CMSLayout>
  );
}
