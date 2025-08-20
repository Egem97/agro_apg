#!/bin/bash

echo "🚀 Inicializando el entorno local de Agro APG..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Detener contenedores si están corriendo
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.local.yml down

# Construir y levantar contenedores
echo "🔨 Construyendo y levantando contenedores..."
docker-compose -f docker-compose.local.yml up --build -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Verificar que la base de datos esté lista
echo "🔍 Verificando conexión a la base de datos..."
docker-compose -f docker-compose.local.yml exec -T db pg_isready -U agro_user_dev -d agro_db_dev

if [ $? -ne 0 ]; then
    echo "❌ La base de datos no está lista. Esperando más tiempo..."
    sleep 10
fi

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
docker-compose -f docker-compose.local.yml exec -T backend python manage.py migrate

# Recolectar archivos estáticos
echo "📁 Recolectando archivos estáticos..."
docker-compose -f docker-compose.local.yml exec -T backend python manage.py collectstatic --noinput

# Crear superusuario si no existe
echo "👤 Creando superusuario..."
docker-compose -f docker-compose.local.yml exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@agro.com', 'admin123')
    print('Superusuario creado: admin / admin123')
else:
    print('Superusuario ya existe')
"

echo "✅ ¡Inicialización completada!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api"
echo "   Admin Django: http://localhost:8000/admin"
echo ""
echo "👤 Credenciales de admin:"
echo "   Usuario: admin"
echo "   Contraseña: admin123"
echo ""
echo "📊 Base de datos PostgreSQL:"
echo "   Host: localhost"
echo "   Puerto: 5433"
echo "   Base de datos: agro_db_dev"
echo "   Usuario: agro_user_dev"
echo "   Contraseña: agro_password_dev_2024"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.local.yml logs -f"
echo "   Detener: docker-compose -f docker-compose.local.yml down"
echo "   Reiniciar: docker-compose -f docker-compose.local.yml restart"
