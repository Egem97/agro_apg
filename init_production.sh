#!/bin/bash

echo "🚀 Inicializando el entorno de producción de Agro APG..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Detener contenedores si están corriendo
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Construir y levantar contenedores
echo "🔨 Construyendo y levantando contenedores..."
docker-compose up --build -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 15

# Verificar que la base de datos esté lista
echo "🔍 Verificando conexión a la base de datos..."
docker-compose exec -T db pg_isready -U agro_user -d agro_db

if [ $? -ne 0 ]; then
    echo "❌ La base de datos no está lista. Esperando más tiempo..."
    sleep 15
fi

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
docker-compose exec -T backend python manage.py migrate

# Ejecutar diagnóstico
echo "🔍 Ejecutando diagnóstico de configuración..."
docker-compose exec -T backend python /app/diagnose_production.py

# Recolectar archivos estáticos
echo "📁 Recolectando archivos estáticos..."
docker-compose exec -T backend python manage.py collectstatic --noinput

# Crear superusuario si no existe
echo "👤 Creando superusuario..."
docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@agro.com', 'admin123')
    print('Superusuario creado: admin / admin123')
else:
    print('Superusuario ya existe')
"

echo "✅ ¡Inicialización de producción completada!"
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
echo "   Puerto: 5432"
echo "   Base de datos: agro_db"
echo "   Usuario: agro_user"
echo "   Contraseña: agro_password_secure_2024"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
