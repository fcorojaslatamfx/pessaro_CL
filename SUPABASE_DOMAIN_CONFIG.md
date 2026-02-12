# 🔐 CONFIGURACIÓN DE SUPABASE PARA DOMINIOS PESSARO CAPITAL

## 📋 **CONFIGURACIÓN REQUERIDA EN SUPABASE DASHBOARD**

### **🌐 Authentication Settings**

Acceder a: **Supabase Dashboard → Authentication → Settings**

#### **1. Site URL**
```
Site URL: https://pessaro.cl
```

#### **2. Additional Redirect URLs**
Agregar las siguientes URLs en la sección "Additional Redirect URLs":

```
https://login.pessaro.cl/super-admin-panel
https://login.pessaro.cl/super-admin-login
https://login.pessaro.cl/dashboard-interno
https://login.pessaro.cl/cms/dashboard
https://login.pessaro.cl/cms/login
```

#### **3. Email Templates**
Configurar las plantillas de email para usar el dominio correcto:

**Confirm signup:**
```html
<h2>Confirma tu registro</h2>
<p>Sigue este enlace para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar cuenta</a></p>
```

**Reset password:**
```html
<h2>Restablecer contraseña</h2>
<p>Sigue este enlace para restablecer tu contraseña:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
```

### **🔧 Auth Configuration**

#### **4. Enable Email Confirmations**
- ✅ Enable email confirmations
- ✅ Enable secure email change
- ✅ Double confirm email changes

#### **5. Password Settings**
```
Minimum password length: 8
Require uppercase: Yes
Require lowercase: Yes
Require numbers: Yes
Require special characters: No
```

#### **6. Session Settings**
```
JWT expiry: 3600 (1 hour)
Refresh token rotation: Enabled
Refresh token reuse interval: 10
```

---

## 🔑 **VARIABLES DE ENTORNO EN VERCEL**

### **Variables Requeridas**

En **Vercel Dashboard → Settings → Environment Variables**:

```bash
# Variables oficiales de la integración Vercel-Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ldlflxujrjihiybrcree.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbGZseHVqcmppaGl5YnJjcmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDEzMTksImV4cCI6MjA4NTM3NzMxOX0._P7GGsOBMnG3xzGVWi9FZX4z3a12txMX52nKwNYgquE

# Variables de dominio (opcionales - usa defaults si no se configuran)
NEXT_PUBLIC_MAIN_DOMAIN=pessaro.cl
NEXT_PUBLIC_LOGIN_DOMAIN=login.pessaro.cl
```

### **Variables Opcionales**
```bash
# Para override de configuración
VITE_MAIN_DOMAIN=pessaro.cl
VITE_LOGIN_DOMAIN=login.pessaro.cl
VITE_ENVIRONMENT=production
```

---

## 🛡️ **ROW LEVEL SECURITY (RLS) POLICIES**

### **Políticas Recomendadas**

#### **1. user_profiles table**
```sql
-- Política para que los usuarios solo vean su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Política para que los super admins vean todos los perfiles
CREATE POLICY "Super admins can view all profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles_2026_02_08_22_02 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);
```

#### **2. user_roles_2026_02_08_22_02 table**
```sql
-- Solo super admins pueden ver roles
CREATE POLICY "Super admins can manage roles" ON user_roles_2026_02_08_22_02
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles_2026_02_08_22_02 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);
```

---

## 🔄 **FLUJO DE AUTENTICACIÓN**

### **1. Login Flow**
```
1. Usuario accede a login.pessaro.cl
2. Redirige automáticamente a /super-admin-login
3. Usuario ingresa credenciales
4. Supabase valida y autentica
5. Redirect automático a /super-admin-panel
6. Verificación de roles en frontend
7. Acceso concedido o denegado
```

### **2. Logout Flow**
```
1. Usuario hace logout
2. Supabase limpia sesión
3. Redirect a /super-admin-login
4. Mensaje de logout exitoso
```

### **3. Password Reset Flow**
```
1. Usuario solicita reset desde /super-admin-login
2. Supabase envía email con link
3. Link redirige a login.pessaro.cl/super-admin-login
4. Usuario ingresa nueva contraseña
5. Redirect a /super-admin-panel
```

---

## 🧪 **TESTING DE CONFIGURACIÓN**

### **✅ Checklist de Validación**

#### **1. Variables de Entorno**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada en Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada en Vercel
- [ ] Variables detectadas correctamente en el cliente

#### **2. Auth Redirects**
- [ ] Login exitoso redirige a `login.pessaro.cl/super-admin-panel`
- [ ] Logout redirige a `login.pessaro.cl/super-admin-login`
- [ ] Password reset redirige correctamente

#### **3. Dominios**
- [ ] `pessaro.cl` carga sitio principal
- [ ] `login.pessaro.cl` redirige a `/super-admin-login`
- [ ] Rutas administrativas solo accesibles en `login.pessaro.cl`

#### **4. Seguridad**
- [ ] RLS policies funcionando
- [ ] Solo super admins acceden al panel
- [ ] Sesiones expiran correctamente

### **🔍 Comandos de Testing**

#### **Verificar Variables de Entorno:**
```javascript
// En la consola del navegador
console.log('Supabase URL:', import.meta.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

#### **Verificar Dominio Actual:**
```javascript
// En la consola del navegador
import { getCurrentDomain, shouldForceLoginDomain } from '@/lib/domains';
console.log('Current domain:', getCurrentDomain());
console.log('Force login domain:', shouldForceLoginDomain());
```

#### **Verificar Auth State:**
```javascript
// En la consola del navegador
import { supabase } from '@/integrations/supabase/client';
supabase.auth.getSession().then(({ data }) => {
  console.log('Current session:', data.session);
});
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comunes**

#### **1. "Invalid redirect URL"**
**Causa:** URL no configurada en Supabase
**Solución:** Agregar la URL en "Additional Redirect URLs"

#### **2. "Variables de entorno no detectadas"**
**Causa:** Variables no configuradas en Vercel
**Solución:** Configurar `NEXT_PUBLIC_SUPABASE_*` en Vercel

#### **3. "Redirect loop infinito"**
**Causa:** Configuración incorrecta de dominios
**Solución:** Verificar lógica en `domains.ts`

#### **4. "Access denied después de login"**
**Causa:** Usuario no tiene rol de super_admin
**Solución:** Verificar tabla `user_roles_2026_02_08_22_02`

### **Logs de Debug**

#### **Habilitar logs de dominio:**
```javascript
// Los logs aparecen automáticamente en consola con prefijo [DOMAIN]
// Ejemplo: [DOMAIN] Enforcing login domain: /servicios -> /super-admin-login
```

#### **Verificar auth state:**
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

---

## 📋 **CHECKLIST FINAL DE CONFIGURACIÓN**

### **✅ En Supabase Dashboard:**
- [ ] Site URL configurada: `https://pessaro.cl`
- [ ] Redirect URLs agregadas para `login.pessaro.cl`
- [ ] Email templates configuradas
- [ ] RLS policies habilitadas
- [ ] Password settings configuradas

### **✅ En Vercel Dashboard:**
- [ ] Variables `NEXT_PUBLIC_SUPABASE_*` configuradas
- [ ] Dominios `pessaro.cl` y `login.pessaro.cl` agregados
- [ ] Build y deployment exitoso

### **✅ Testing:**
- [ ] Login funciona y redirige correctamente
- [ ] Logout funciona correctamente
- [ ] Password reset funciona
- [ ] Rutas protegidas correctamente
- [ ] Variables de entorno detectadas

**✅ CONFIGURACIÓN COMPLETA Y LISTA PARA PRODUCCIÓN**