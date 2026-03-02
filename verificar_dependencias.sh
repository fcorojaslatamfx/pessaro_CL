#!/bin/bash

# 🔍 VERIFICACIÓN DE DEPENDENCIAS - PESSARO CAPITAL
# Script para verificar que todos los archivos necesarios existen

echo "🔍 Verificando dependencias del proyecto Pessaro Capital..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 - FALTANTE${NC}"
        ((ERRORS++))
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1/${NC}"
    else
        echo -e "${RED}❌ $1/ - FALTANTE${NC}"
        ((ERRORS++))
    fi
}

echo ""
echo "📁 VERIFICANDO ESTRUCTURA DE DIRECTORIOS:"
echo "----------------------------------------"
check_dir "src"
check_dir "src/components"
check_dir "src/pages"
check_dir "src/pages/cms"
check_dir "src/hooks"
check_dir "src/lib"

echo ""
echo "🧩 VERIFICANDO COMPONENTES CRÍTICOS:"
echo "-----------------------------------"
check_file "src/components/Layout.tsx"
check_file "src/components/LoginLayout.tsx"
check_file "src/components/ProtectedRoute.tsx"
check_file "src/components/DomainGuard.tsx"
check_file "src/components/DomainRedirect.tsx"
check_file "src/components/ErrorBoundary.tsx"
check_file "src/components/ScrollToTop.tsx"

echo ""
echo "📄 VERIFICANDO PÁGINAS PRINCIPALES:"
echo "----------------------------------"
check_file "src/pages/Home.tsx"
check_file "src/pages/Servicios.tsx"
check_file "src/pages/Instrumentos.tsx"
check_file "src/pages/Educacion.tsx"
check_file "src/pages/Blog.tsx"
check_file "src/pages/Nosotros.tsx"
check_file "src/pages/Contacto.tsx"
check_file "src/pages/ErrorPage.tsx"

echo ""
echo "🔐 VERIFICANDO PÁGINAS DE AUTENTICACIÓN:"
echo "---------------------------------------"
check_file "src/pages/SuperAdminLogin.tsx"
check_file "src/pages/InternalLogin.tsx"
check_file "src/pages/SuperAdminPanel.tsx"
check_file "src/pages/InternalDashboard.tsx"
check_file "src/pages/WyckoffDashboard.tsx"
check_file "src/pages/AccessDiagnostic.tsx"

echo ""
echo "👥 VERIFICANDO PORTAL DE CLIENTES:"
echo "---------------------------------"
check_file "src/pages/ClientPortal.tsx"
check_file "src/pages/ClientRegister.tsx"
check_file "src/pages/RecuperarContrasena.tsx"

echo ""
echo "🛠️ VERIFICANDO SISTEMA CMS:"
echo "---------------------------"
check_file "src/pages/cms/Setup.tsx"
check_file "src/pages/cms/Login.tsx"
check_file "src/pages/cms/DashboardOptimized.tsx"
check_file "src/pages/cms/PageContentManager.tsx"
check_file "src/pages/cms/FAQManager.tsx"
check_file "src/pages/cms/BlogManager.tsx"
check_file "src/pages/cms/TeamManager.tsx"
check_file "src/pages/cms/ServicesManagerOptimized.tsx"
check_file "src/pages/cms/InstrumentsManager.tsx"
check_file "src/pages/cms/MediaLibrary.tsx"
check_file "src/pages/cms/Settings.tsx"

echo ""
echo "🧪 VERIFICANDO PÁGINAS DE PRUEBA:"
echo "--------------------------------"
check_file "src/pages/TestResend.tsx"
check_file "src/pages/TestResendComplete.tsx"
check_file "src/pages/SystemVerification.tsx"

echo ""
echo "🎣 VERIFICANDO HOOKS:"
echo "-------------------"
check_file "src/hooks/useWhatsApp.tsx"
check_file "src/hooks/useAuth.ts"

echo ""
echo "📚 VERIFICANDO LIBRERÍAS:"
echo "-----------------------"
check_file "src/lib/index.ts"
check_file "src/lib/domains.ts"

echo ""
echo "⚙️ VERIFICANDO ARCHIVOS DE CONFIGURACIÓN:"
echo "----------------------------------------"
check_file "package.json"
check_file "vite.config.ts"
check_file "vercel.json"
check_file "tsconfig.json"

echo ""
echo "🎨 VERIFICANDO UI COMPONENTS:"
echo "---------------------------"
check_file "src/components/ui/tooltip.tsx"
check_file "src/components/ui/toaster.tsx"
check_file "src/components/ui/sonner.tsx"

echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡VERIFICACIÓN COMPLETA! Todos los archivos necesarios están presentes.${NC}"
    echo -e "${GREEN}✅ El proyecto está listo para funcionar correctamente.${NC}"
else
    echo -e "${RED}⚠️  Se encontraron $ERRORS archivos faltantes.${NC}"
    echo -e "${YELLOW}📝 Revisa los archivos marcados como FALTANTES arriba.${NC}"
fi
echo "=================================================="