# REVISIÓN DE ENLACES Y RUTAS - PESSARO CAPITAL

## 🌐 CONFIGURACIÓN DE DOMINIOS

### Dominios Principales:
- **Sitio Principal**: `https://pessaro.cl`
- **Portal Administrativo**: `https://login.pessaro.cl`

## 📋 ENLACES DEL SITIO PRINCIPAL (pessaro.cl)

### ✅ Enlaces Públicos Correctos:
```
https://pessaro.cl/                    → Inicio
https://pessaro.cl/servicios           → Servicios
https://pessaro.cl/instrumentos        → Instrumentos
https://pessaro.cl/educacion           → Educación
https://pessaro.cl/base-conocimientos  → Base de Conocimientos
https://pessaro.cl/blog                → Blog
https://pessaro.cl/nosotros            → Nosotros
https://pessaro.cl/contacto            → Contacto
https://pessaro.cl/registro-cliente    → Registro de Cliente
https://pessaro.cl/portal-cliente      → Portal de Cliente
```

## 🔐 ENLACES ADMINISTRATIVOS (login.pessaro.cl)

### ✅ Enlaces de Acceso Restringido:
```
https://login.pessaro.cl/super-admin-login    → Super Admin Login
https://login.pessaro.cl/super-admin-panel    → Panel Super Admin
https://login.pessaro.cl/login-interno        → Login Interno
https://login.pessaro.cl/dashboard-interno    → Dashboard Interno
https://login.pessaro.cl/wyckoff-dashboard    → Dashboard Wyckoff
https://login.pessaro.cl/diagnostico-acceso  → Diagnóstico de Acceso
https://login.pessaro.cl/cms/setup            → CMS Setup
https://login.pessaro.cl/cms/login            → CMS Login
https://login.pessaro.cl/cms/dashboard        → CMS Dashboard
```

## 🔍 PROBLEMAS IDENTIFICADOS

### ❌ Enlaces que necesitan corrección:

1. **Footer - Enlaces Legales**: Actualmente usan `navigate()` interno, deben generar URLs absolutas
2. **LoginMenu**: Enlaces internos que deben redirigir a dominios correctos
3. **Botones de acceso**: Necesitan verificación de autenticación con Supabase
4. **Enlaces de redes sociales**: Deben apuntar a URLs reales

## 🛠️ CORRECCIONES NECESARIAS

### 1. Footer - Enlaces Legales
```tsx
// ANTES (incorrecto)
<button onClick={() => navigate(ROUTE_PATHS.CLIENT_REGISTER)}>
  Registro de Clientes
</button>

// DESPUÉS (correcto)
<a href="https://pessaro.cl/registro-cliente" target="_blank">
  Registro de Clientes
</a>
```

### 2. LoginMenu - Enlaces de Acceso
```tsx
// ANTES (incorrecto)
href: ROUTE_PATHS.CLIENT_REGISTER  // Ruta relativa

// DESPUÉS (correcto)
href: "https://pessaro.cl/registro-cliente"  // URL absoluta
```

### 3. Enlaces Administrativos
```tsx
// ANTES (incorrecto)
href: ROUTE_PATHS.INTERNAL_LOGIN  // Ruta relativa

// DESPUÉS (correcto)
href: "https://login.pessaro.cl/login-interno"  // URL absoluta
```

## 🔐 AUTENTICACIÓN CON SUPABASE

### Roles y Permisos:
- **super_admin**: Acceso completo a todas las funciones
- **admin**: Acceso a funciones administrativas
- **interno**: Acceso a dashboard interno y Wyckoff
- **cliente**: Acceso solo a portal de cliente

### Tablas de Supabase:
- `user_profiles`: Perfiles de usuario
- `user_roles_2026_02_08_22_02`: Roles de usuario
- `access_logs_2026_02_08_22_02`: Logs de acceso

### Verificación de Acceso:
```tsx
// Ejemplo de verificación de rol
const { user } = useAuth();
const hasAccess = user && ['interno', 'admin', 'super_admin'].includes(user.role);
```

## 📱 RESPONSIVE Y ACCESIBILIDAD

### ✅ Consideraciones:
- Todos los enlaces deben funcionar en mobile y desktop
- Enlaces externos deben abrir en nueva pestaña
- Atributos `rel="noopener noreferrer"` para seguridad
- Aria-labels apropiados para accesibilidad

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: Actualizar componentes principales
1. Layout.tsx - Footer y navegación
2. LoginMenu.tsx - Enlaces de acceso
3. ExternalLink.tsx - Componente helper

### Fase 2: Verificar autenticación
1. Hooks de autenticación
2. Verificación de roles
3. Redirecciones apropiadas

### Fase 3: Testing
1. Verificar todos los enlaces
2. Probar en diferentes dispositivos
3. Validar autenticación y permisos