#!/bin/bash

# 🔧 Script para corregir acceso al admin - AGRO APG

echo "🔧 Corrigiendo acceso al admin de AGRO APG..."
echo "============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "No se encontró docker-compose.yml. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Detener contenedores
print_status "Deteniendo contenedores..."
docker-compose down

# Reconstruir backend con la nueva configuración
print_status "Reconstruyendo backend con nueva configuración..."
docker-compose up --build -d backend

# Esperar a que el backend esté listo
print_status "Esperando a que el backend esté listo..."
sleep 30

# Verificar que el backend esté corriendo
if docker-compose ps backend | grep -q "Up"; then
    print_success "Backend está corriendo"
else
    print_error "Backend no está corriendo. Revisando logs..."
    docker-compose logs backend
    exit 1
fi

# Verificar configuración de Django
print_status "Verificando configuración de Django..."
docker-compose exec backend python manage.py check --deploy

# Probar acceso al admin
print_status "Probando acceso al admin..."
curl -I http://localhost:8000/admin/ 2>/dev/null | head -1

# Mostrar información de acceso
echo ""
echo "🎉 Configuración corregida"
echo "=========================="
echo ""
echo "📱 URLs de acceso:"
echo "   Admin: http://34.136.15.241:8000/admin"
echo "   API: http://34.136.15.241:8000/api"
echo "   Frontend: http://34.136.15.241:3000"
echo ""
echo "👤 Credenciales:"
echo "   Email: admin@agroapg.com"
echo "   Password: admin123"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f backend"
echo "   Ver estado: docker-compose ps"
echo "   Reiniciar: docker-compose restart backend"
echo ""
echo "⚠️ IMPORTANTE:"
echo "   - Usa http:// no https://"
echo "   - Verifica que el firewall permita el puerto 8000"
echo "   - Si sigues teniendo problemas, ejecuta: ./diagnose_server.py"
