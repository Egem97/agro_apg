#!/bin/bash

# 🚀 Script de Despliegue en Producción - AGRO APG
# Uso: ./deploy_production.sh [--env-file .env]

set -e

echo "🚀 Iniciando despliegue en producción de AGRO APG..."
echo "=================================================="

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

# Verificar si Docker está instalado
check_docker() {
    print_status "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi
    
    print_success "Docker y Docker Compose están instalados"
}

# Verificar archivo .env
check_env_file() {
    if [ -f ".env" ]; then
        print_success "Archivo .env encontrado"
        source .env
    else
        print_warning "Archivo .env no encontrado. Creando archivo .env por defecto..."
        cat > .env << 'EOF'
# Configuración de Django
DEBUG=False
SECRET_KEY=production-secret-key-change-this-immediately-2024
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Configuración de CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Configuración de PostgreSQL
POSTGRES_DB=agro_db_prod
POSTGRES_USER=agro_user_prod
POSTGRES_PASSWORD=agro_password_prod_2024
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Configuración del Frontend
REACT_APP_API_URL=http://localhost:8000/api
NODE_ENV=production
EOF
        print_warning "Archivo .env creado con valores por defecto. ¡IMPORTANTE: Cambia las contraseñas!"
    fi
}

# Detener contenedores existentes
stop_containers() {
    print_status "Deteniendo contenedores existentes..."
    docker-compose down --remove-orphans
    print_success "Contenedores detenidos"
}

# Limpiar recursos Docker
cleanup_docker() {
    print_status "Limpiando recursos Docker no utilizados..."
    docker system prune -f
    print_success "Limpieza completada"
}

# Construir y levantar contenedores
build_and_start() {
    print_status "Construyendo y levantando contenedores..."
    docker-compose up --build -d
    
    # Esperar a que los contenedores estén listos
    print_status "Esperando a que los contenedores estén listos..."
    sleep 30
    
    print_success "Contenedores construidos y levantados"
}

# Verificar estado de contenedores
check_containers() {
    print_status "Verificando estado de contenedores..."
    
    if docker-compose ps | grep -q "Up"; then
        print_success "Todos los contenedores están ejecutándose"
        docker-compose ps
    else
        print_error "Algunos contenedores no están ejecutándose correctamente"
        docker-compose ps
        docker-compose logs
        exit 1
    fi
}

# Ejecutar migraciones
run_migrations() {
    print_status "Ejecutando migraciones de Django..."
    
    # Esperar a que la base de datos esté lista
    print_status "Esperando a que PostgreSQL esté listo..."
    until docker-compose exec -T db pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
        sleep 2
    done
    
    docker-compose exec -T backend python manage.py migrate --noinput
    print_success "Migraciones ejecutadas"
}

# Recolectar archivos estáticos
collect_static() {
    print_status "Recolectando archivos estáticos..."
    docker-compose exec -T backend python manage.py collectstatic --noinput --clear
    print_success "Archivos estáticos recolectados"
}

# Crear superusuario si no existe
create_superuser() {
    print_status "Verificando superusuario..."
    
    # Verificar si ya existe un superusuario
    if docker-compose exec -T backend python manage.py shell -c "
from apps.authentication.models import User
if User.objects.filter(is_superuser=True).exists():
    print('Superusuario ya existe')
    exit(0)
else:
    print('No hay superusuario')
    exit(1)
" 2>/dev/null; then
        print_success "Superusuario ya existe"
    else
        print_warning "No hay superusuario. Creando uno por defecto..."
        docker-compose exec -T backend python manage.py shell -c "
from apps.authentication.models import User
User.objects.create_superuser(
    email='admin@agroapg.com',
    password='admin123',
    first_name='Admin',
    last_name='AGRO APG'
)
print('Superusuario creado: admin@agroapg.com / admin123')
"
        print_warning "¡IMPORTANTE: Cambia la contraseña del superusuario inmediatamente!"
    fi
}

# Verificar configuración de producción
check_production_config() {
    print_status "Verificando configuración de producción..."
    docker-compose exec -T backend python manage.py check --deploy
    print_success "Configuración de producción verificada"
}

# Mostrar información de acceso
show_access_info() {
    echo ""
    echo "🎉 ¡Despliegue completado exitosamente!"
    echo "======================================"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000/api"
    echo "📊 Admin Django: http://localhost:8000/admin"
    echo ""
    echo "👤 Credenciales por defecto:"
    echo "   Email: admin@agroapg.com"
    echo "   Password: admin123"
    echo ""
    echo "🗄️ Base de datos PostgreSQL:"
    echo "   Host: localhost"
    echo "   Puerto: 5432"
    echo "   Base de datos: $POSTGRES_DB"
    echo "   Usuario: $POSTGRES_USER"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Ver estado: docker-compose ps"
    echo "   Reiniciar: docker-compose restart"
    echo "   Detener: docker-compose down"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - Cambia las contraseñas por defecto"
    echo "   - Configura SSL para producción"
    echo "   - Configura un dominio real"
    echo "   - Habilita backups automáticos"
    echo ""
}

# Función principal
main() {
    echo "🚀 Script de Despliegue en Producción - AGRO APG"
    echo "================================================"
    echo ""
    
    # Verificar Docker
    check_docker
    
    # Verificar archivo .env
    check_env_file
    
    # Detener contenedores existentes
    stop_containers
    
    # Limpiar recursos
    cleanup_docker
    
    # Construir y levantar
    build_and_start
    
    # Verificar contenedores
    check_containers
    
    # Ejecutar migraciones
    run_migrations
    
    # Recolectar archivos estáticos
    collect_static
    
    # Crear superusuario
    create_superuser
    
    # Verificar configuración
    check_production_config
    
    # Mostrar información de acceso
    show_access_info
    
    print_success "¡Despliegue completado exitosamente!"
}

# Ejecutar función principal
main "$@"
