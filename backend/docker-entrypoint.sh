#!/bin/bash
set -e

echo "🚀 Iniciando AGRO APG Backend..."

# Función para esperar a que la base de datos esté lista
wait_for_db() {
    echo "⏳ Verificando base de datos..."
    
    # Verificar si estamos usando PostgreSQL
    if [ "$DJANGO_SETTINGS_MODULE" = "agro_backend.settings_production" ] || [ -n "$POSTGRES_DB" ]; then
        echo "🗄️ Verificando conexión a PostgreSQL..."
        until python manage.py dbshell --database=default 2>&1 | grep -q "psql"; do
            echo "⏳ Esperando a que PostgreSQL esté listo..."
            sleep 2
        done
        echo "✅ PostgreSQL está listo"
    else
        echo "📝 Verificando base de datos SQLite..."
        if [ -f "/app/db.sqlite3" ]; then
            echo "✅ Base de datos SQLite encontrada"
        else
            echo "📝 Creando nueva base de datos SQLite..."
            python manage.py migrate
        fi
    fi
}

# Función para ejecutar migraciones
run_migrations() {
    echo "🔄 Ejecutando migraciones..."
    python manage.py migrate --noinput
}

# Función para recolectar archivos estáticos
collect_static() {
    echo "📦 Recolectando archivos estáticos..."
    
    # Asegurar que el directorio existe y tiene permisos correctos
    mkdir -p /app/staticfiles
    chmod -R 755 /app/staticfiles
    
    # Limpiar archivos estáticos existentes
    rm -rf /app/staticfiles/*
    
    # Recolectar archivos estáticos
    python manage.py collectstatic --noinput --clear --verbosity=2
    
    # Verificar que se recolectaron correctamente
    if [ -d "/app/staticfiles/admin" ]; then
        echo "✅ Archivos estáticos recolectados correctamente"
        ls -la /app/staticfiles/
    else
        echo "⚠️ Advertencia: No se encontraron archivos estáticos de admin"
    fi
}

# Función para crear superusuario si no existe
create_superuser() {
    echo "👤 Verificando superusuario..."
    python manage.py shell -c "
from apps.authentication.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('Creando superusuario...')
    User.objects.create_superuser(
        email='admin@agroapg.com',
        password='admin123',
        first_name='Admin',
        last_name='AGRO APG'
    )
    print('Superusuario creado: admin@agroapg.com / admin123')
else:
    print('Superusuario ya existe')
"
}

# Función para verificar la salud del sistema
health_check() {
    echo "🏥 Verificando salud del sistema..."
    python manage.py check --deploy
}

# Ejecutar inicialización
echo "🔧 Inicializando aplicación..."

# Verificar base de datos
wait_for_db

# Ejecutar migraciones
run_migrations

# Recolectar archivos estáticos
collect_static

# Crear superusuario si no existe
create_superuser

# Verificar salud del sistema
health_check

echo "✅ Inicialización completada"
echo "🌐 Iniciando servidor Gunicorn..."

# Iniciar Gunicorn
exec gunicorn agro_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --worker-class sync \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --keep-alive 2 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
