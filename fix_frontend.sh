#!/bin/bash

# 🔧 Script para solucionar problema del frontend - AGRO APG

echo "🔧 Solucionando problema del frontend..."
echo "======================================="

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

# Verificar estado actual
print_status "Verificando estado actual de contenedores..."
docker-compose ps

echo ""
print_status "Verificando logs del frontend..."
docker-compose logs frontend

echo ""
print_status "Verificando si hay contenedores frontend fallidos..."
docker ps -a | grep frontend

# Limpiar contenedores fallidos
print_status "Limpiando contenedores fallidos..."
docker-compose down
docker system prune -f

# Verificar archivos del frontend
print_status "Verificando archivos del frontend..."
if [ -f "frontend/Dockerfile" ]; then
    print_success "Dockerfile del frontend encontrado"
else
    print_error "Dockerfile del frontend no encontrado"
    exit 1
fi

if [ -f "frontend/package.json" ]; then
    print_success "package.json encontrado"
else
    print_error "package.json no encontrado"
    exit 1
fi

# Reconstruir frontend
print_status "Reconstruyendo frontend..."
docker-compose up --build -d frontend

# Esperar a que el frontend esté listo
print_status "Esperando a que el frontend esté listo..."
sleep 30

# Verificar estado
print_status "Verificando estado después de la reconstrucción..."
docker-compose ps

# Verificar logs nuevamente
print_status "Verificando logs del frontend después de la reconstrucción..."
docker-compose logs frontend

# Probar conectividad
print_status "Probando conectividad del frontend..."
if curl -I http://localhost:3000/ 2>/dev/null | head -1; then
    print_success "Frontend responde correctamente"
else
    print_warning "Frontend no responde, revisando logs..."
    docker-compose logs frontend --tail=20
fi

echo ""
echo "🎉 Proceso completado"
echo "===================="
echo ""
echo "📱 URLs de acceso:"
echo "   Frontend: http://34.136.15.241:3000"
echo "   Backend: http://34.136.15.241:8000"
echo "   Admin: http://34.136.15.241:8000/admin"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs frontend: docker-compose logs -f frontend"
echo "   Ver estado: docker-compose ps"
echo "   Reiniciar frontend: docker-compose restart frontend"
echo ""
echo "⚠️ Si el problema persiste:"
echo "   - Verificar espacio en disco: df -h"
echo "   - Verificar memoria: free -h"
echo "   - Verificar logs completos: docker-compose logs frontend"
