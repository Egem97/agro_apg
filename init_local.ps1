# Script de inicialización para entorno local en Windows
Write-Host "🚀 Inicializando el entorno local de Agro APG..." -ForegroundColor Green

# Verificar que Docker esté corriendo
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Detener contenedores si están corriendo
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml down

# Construir y levantar contenedores
Write-Host "🔨 Construyendo y levantando contenedores..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml up --build -d

# Esperar a que la base de datos esté lista
Write-Host "⏳ Esperando a que la base de datos esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar que la base de datos esté lista
Write-Host "🔍 Verificando conexión a la base de datos..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.local.yml exec -T db pg_isready -U agro_user_dev -d agro_db_dev
} catch {
    Write-Host "❌ La base de datos no está lista. Esperando más tiempo..." -ForegroundColor Red
    Start-Sleep -Seconds 10
}

# Ejecutar migraciones
Write-Host "📦 Ejecutando migraciones..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml exec -T backend python manage.py migrate

# Recolectar archivos estáticos
Write-Host "📁 Recolectando archivos estáticos..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml exec -T backend python manage.py collectstatic --noinput

# Crear superusuario si no existe
Write-Host "👤 Creando superusuario..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@agro.com', 'admin123')
    print('Superusuario creado: admin / admin123')
else:
    print('Superusuario ya existe')
"

Write-Host "✅ ¡Inicialización completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000/api" -ForegroundColor White
Write-Host "   Admin Django: http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "👤 Credenciales de admin:" -ForegroundColor Cyan
Write-Host "   Usuario: admin" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📊 Base de datos PostgreSQL:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Puerto: 5433" -ForegroundColor White
Write-Host "   Base de datos: agro_db_dev" -ForegroundColor White
Write-Host "   Usuario: agro_user_dev" -ForegroundColor White
Write-Host "   Contraseña: agro_password_dev_2024" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose -f docker-compose.local.yml logs -f" -ForegroundColor White
Write-Host "   Detener: docker-compose -f docker-compose.local.yml down" -ForegroundColor White
Write-Host "   Reiniciar: docker-compose -f docker-compose.local.yml restart" -ForegroundColor White
