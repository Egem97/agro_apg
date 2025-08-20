#!/bin/bash

# Script de despliegue para AGRO APG
# Uso: ./deploy.sh [dev|prod]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  AGRO APG - Script de Despliegue${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para verificar requisitos
check_requirements() {
    print_message "Verificando requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi
    
    # Verificar que Docker esté ejecutándose
    if ! docker info &> /dev/null; then
        print_error "Docker no está ejecutándose. Por favor inicia Docker."
        exit 1
    fi
    
    print_message "✅ Requisitos verificados correctamente"
}

# Función para limpiar contenedores anteriores
cleanup() {
    print_message "Limpiando contenedores anteriores..."
    docker-compose down --remove-orphans
    print_message "✅ Limpieza completada"
}

# Función para construir imágenes
build_images() {
    print_message "Construyendo imágenes Docker..."
    
    # Construir backend
    print_message "Construyendo imagen del backend..."
    docker-compose build backend
    
    # Construir frontend
    print_message "Construyendo imagen del frontend..."
    docker-compose build frontend
    
    print_message "✅ Imágenes construidas correctamente"
}

# Función para iniciar servicios
start_services() {
    print_message "Iniciando servicios..."
    docker-compose up -d
    
    print_message "✅ Servicios iniciados correctamente"
}

# Función para verificar estado de servicios
check_services() {
    print_message "Verificando estado de servicios..."
    
    # Esperar un poco para que los servicios se inicien
    sleep 10
    
    # Verificar backend
    if curl -f http://localhost:8000/admin/ > /dev/null 2>&1; then
        print_message "✅ Backend (Django) está funcionando en http://localhost:8000"
    else
        print_warning "⚠️ Backend no responde aún, puede tardar unos segundos más"
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        print_message "✅ Frontend (React) está funcionando en http://localhost:3000"
    else
        print_warning "⚠️ Frontend no responde aún, puede tardar unos segundos más"
    fi
}

# Función para mostrar información de acceso
show_access_info() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Información de Acceso${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}🌐 Frontend (React):${NC} http://localhost:3000"
    echo -e "${GREEN}🔧 Backend (Django):${NC} http://localhost:8000"
    echo -e "${GREEN}⚙️ Admin Django:${NC} http://localhost:8000/admin/"
    echo -e "${GREEN}📊 API:${NC} http://localhost:8000/api/"
    echo ""
    echo -e "${YELLOW}🔑 Credenciales por defecto:${NC}"
    echo -e "   Email: admin@agroapg.com"
    echo -e "   Contraseña: admin123"
    echo ""
    echo -e "${YELLOW}📋 Comandos útiles:${NC}"
    echo -e "   Ver logs: docker-compose logs -f"
    echo -e "   Parar servicios: docker-compose down"
    echo -e "   Reiniciar: docker-compose restart"
    echo ""
}

# Función para modo desarrollo
deploy_dev() {
    print_header
    print_message "Iniciando despliegue en modo DESARROLLO..."
    
    check_requirements
    cleanup
    build_images
    start_services
    check_services
    show_access_info
    
    print_message "🎉 Despliegue completado exitosamente!"
}

# Función para modo producción
deploy_prod() {
    print_header
    print_message "Iniciando despliegue en modo PRODUCCIÓN..."
    
    check_requirements
    cleanup
    build_images
    
    # Iniciar servicios incluyendo nginx
    print_message "Iniciando servicios con nginx..."
    docker-compose --profile production up -d
    
    check_services
    show_access_info
    
    print_message "🎉 Despliegue en producción completado exitosamente!"
}

# Función para mostrar ayuda
show_help() {
    print_header
    echo ""
    echo "Uso: $0 [dev|prod|help]"
    echo ""
    echo "Opciones:"
    echo "  dev     - Despliegue en modo desarrollo (sin nginx)"
    echo "  prod    - Despliegue en modo producción (con nginx)"
    echo "  help    - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev     # Despliegue desarrollo"
    echo "  $0 prod    # Despliegue producción"
    echo ""
}

# Función principal
main() {
    case "${1:-dev}" in
        "dev")
            deploy_dev
            ;;
        "prod")
            deploy_prod
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Opción inválida: $1"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"


