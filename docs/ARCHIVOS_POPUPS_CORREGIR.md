# 📁 ARCHIVOS PARA CORREGIR POPUPS Y RECUPERACIÓN DE CONTRASEÑA

## 📅 Fecha: 23 de Febrero de 2026
## 🎯 Archivos que debes reemplazar o agregar en tu proyecto

---

## 🔄 **ARCHIVOS A REEMPLAZAR**

### **1. ContactPopup.tsx - REEMPLAZAR**
**Ruta:** `src/components/ContactPopup.tsx`
**Cambio:** Actualizar Edge Function a `unified_forms_handler_2026_02_23_19_35`

### **2. usePasswordRecovery.ts - REEMPLAZAR**
**Ruta:** `src/hooks/usePasswordRecovery.ts`
**Cambio:** Actualizar Edge Function a `password_recovery_fixed_2026_02_23_19_30`

### **3. useNewsletter.ts - REEMPLAZAR**
**Ruta:** `src/hooks/useNewsletter.ts`
**Cambio:** Actualizar Edge Function a `unified_forms_handler_2026_02_23_19_35`

### **4. useRiskProfile.ts - REEMPLAZAR**
**Ruta:** `src/hooks/useRiskProfile.ts`
**Cambio:** Actualizar Edge Function a `unified_forms_handler_2026_02_23_19_35`

---

## 🆕 **ARCHIVOS NUEVOS A AGREGAR**

### **Edge Functions (ya desplegadas en Supabase)**
- ✅ `unified_forms_handler_2026_02_23_19_35.ts` - **YA DESPLEGADA**
- ✅ `password_recovery_fixed_2026_02_23_19_30.ts` - **YA DESPLEGADA**

### **Migraciones SQL (ya ejecutadas en Supabase)**
- ✅ `contact_submissions_table_2026_02_23_19_30.sql` - **YA EJECUTADA**
- ✅ `newsletter_subscriptions_table_2026_02_23_19_30.sql` - **YA EJECUTADA**

---

## 📋 **INSTRUCCIONES DE IMPLEMENTACIÓN**

### **Paso 1: Descargar Archivos**
1. Descarga el proyecto completo usando el botón de descarga (↓)
2. Los archivos actualizados estarán en sus respectivas carpetas

### **Paso 2: Reemplazar Archivos**
Reemplaza estos 4 archivos en tu proyecto local:

1. **`src/components/ContactPopup.tsx`**
   - Línea 86: Cambia `contact_popup_fixed_2026_02_23_19_30` por `unified_forms_handler_2026_02_23_19_35`

2. **`src/hooks/usePasswordRecovery.ts`**
   - Líneas 34, 68, 108: Cambia `password_recovery_system_2026_02_13` por `password_recovery_fixed_2026_02_23_19_30`

3. **`src/hooks/useNewsletter.ts`**
   - Líneas 65, 96: Cambia `send_confirmation_email_updated_2026_02_09` por `unified_forms_handler_2026_02_23_19_35`

4. **`src/hooks/useRiskProfile.ts`**
   - Línea 86: Cambia `send_confirmation_email_updated_2026_02_09` por `unified_forms_handler_2026_02_23_19_35`

### **Paso 3: Verificar**
1. Ejecuta `npm run build` para verificar que no hay errores
2. Prueba los popups en el sitio web
3. Prueba la recuperación de contraseña

---

## 🔧 **CAMBIOS ESPECÍFICOS POR ARCHIVO**

### **ContactPopup.tsx**
```typescript
// ANTES (línea 86):
const { data: result, error } = await supabase.functions.invoke('contact_popup_fixed_2026_02_23_19_30', {

// DESPUÉS:
const { data: result, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
```

### **usePasswordRecovery.ts**
```typescript
// ANTES (líneas 34, 68, 108):
await supabase.functions.invoke('password_recovery_system_2026_02_13', {

// DESPUÉS:
await supabase.functions.invoke('password_recovery_fixed_2026_02_23_19_30', {
```

### **useNewsletter.ts**
```typescript
// ANTES (líneas 65, 96):
await supabase.functions.invoke('send_confirmation_email_updated_2026_02_09', {

// DESPUÉS:
await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
```

### **useRiskProfile.ts**
```typescript
// ANTES (línea 86):
await supabase.functions.invoke('send_confirmation_email_updated_2026_02_09', {

// DESPUÉS:
await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
```

---

## ✅ **VERIFICACIÓN POST-IMPLEMENTACIÓN**

### **Checklist de Funcionalidades:**

#### **Popups de Contacto:**
- [ ] Popup "Abrir Cuenta Real" envía email y guarda en BD
- [ ] Popup "Cuenta Demo" procesa solicitud correctamente
- [ ] Popup "Guía de Trading" registra interés
- [ ] Todos los popups muestran confirmación de éxito

#### **Recuperación de Contraseña:**
- [ ] Página `/recuperar-contrasena` carga correctamente
- [ ] Solicitud de recuperación envía email
- [ ] Enlace de recuperación funciona
- [ ] Actualización de contraseña exitosa
- [ ] Email de confirmación de cambio recibido

#### **Newsletter:**
- [ ] Suscripción al newsletter funciona
- [ ] Email de confirmación recibido
- [ ] No se crean suscripciones duplicadas

#### **Perfil de Riesgo:**
- [ ] Formulario multipaso funciona
- [ ] Email de confirmación enviado
- [ ] Redirección al registro de clientes

---

## 🚨 **NOTAS IMPORTANTES**

### **Backend (Supabase):**
- ✅ **Edge Functions ya desplegadas** - No necesitas hacer nada
- ✅ **Tablas ya creadas** - Base de datos lista
- ✅ **Políticas RLS configuradas** - Seguridad implementada

### **Frontend (React):**
- 🔄 **Solo necesitas reemplazar 4 archivos** mencionados arriba
- 🔄 **Cambios mínimos** - Solo nombres de Edge Functions
- 🔄 **Sin nuevas dependencias** - Todo usa librerías existentes

### **Emails (Resend):**
- ✅ **Configuración automática** - Usa variables de entorno existentes
- ✅ **Templates incluidos** - HTML y texto plano
- ✅ **Fallbacks configurados** - Manejo de errores robusto

---

## 🎯 **RESULTADO ESPERADO**

Una vez implementados estos cambios:

1. **Todos los popups funcionarán perfectamente:**
   - Formularios se envían correctamente
   - Emails se envían automáticamente
   - Datos se guardan en base de datos
   - Confirmaciones visuales funcionan

2. **Recuperación de contraseña operativa:**
   - Solicitudes se procesan correctamente
   - Emails de recuperación se envían
   - Cambios de contraseña funcionan
   - Confirmaciones por email

3. **Newsletter completamente funcional:**
   - Suscripciones se procesan
   - Emails de bienvenida se envían
   - Gestión de duplicados funciona

4. **Perfil de riesgo integrado:**
   - Evaluación completa funciona
   - Emails de confirmación
   - Integración con registro

---

## 📞 **SOPORTE**

Si encuentras algún problema después de implementar los cambios:

1. **Verifica la consola del navegador** para errores JavaScript
2. **Revisa los logs de Supabase** en el dashboard
3. **Confirma que las Edge Functions están activas** en Supabase
4. **Verifica las variables de entorno** (RESEND_API_KEY, etc.)

---

## 🎊 **CONCLUSIÓN**

**Solo necesitas reemplazar 4 archivos** para que todo funcione perfectamente:

1. `src/components/ContactPopup.tsx`
2. `src/hooks/usePasswordRecovery.ts`
3. `src/hooks/useNewsletter.ts`
4. `src/hooks/useRiskProfile.ts`

**Todo el backend (Edge Functions, tablas, políticas) ya está configurado y operativo en Supabase.**

**Para descargar:** Usa el botón de descarga (↓) en la barra superior derecha del editor para obtener todos los archivos actualizados del proyecto.