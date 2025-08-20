# Script de despliegue en producción para AGRO APG
param(
    [string]$Domain = "",
    [string]$SecretKey = "",
    [string]$DbPassword = ""
)

Write-Host "🚀 Despliegue en Producción - AGRO APG" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Verificar que Docker esté corriendo
try {
    docker info | Out-Null
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar que Docker Compose esté disponible
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose está disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está disponible." -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
    
    # Generar clave secreta si no se proporciona
    if (-not $SecretKey) {
        $SecretKey = -join ((33..126) | Get-Random -Count 50 | ForEach-Object {[char]$_})
    }
    
    # Generar contraseña de base de datos si no se proporciona
    if (-not $DbPassword) {
        $DbPassword = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    }
    
    # Configurar URL de API
    $ApiUrl = if ($Domain) { "https://$Domain/api" } else { "http://localhost:8000/api" }
    $AllowedHosts = if ($Domain) { "$Domain,www.$Domain,localhost,127.0.0.1" } else { "localhost,127.0.0.1" }
    $CorsOrigins = if ($Domain) { "https://$Domain,https://www.$Domain" } else { "http://localhost:3000" }
    
    $envContent = @"
# Configuración de Django
DEBUG=False
SECRET_KEY=$SecretKey
DJANGO_SETTINGS_MODULE=agro_backend.settings_production

# Configuración de base de datos
POSTGRES_DB=agro_db
POSTGRES_USER=agro_user
POSTGRES_PASSWORD=$DbPassword
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Configuración de hosts
ALLOWED_HOSTS=$AllowedHosts
CORS_ALLOWED_ORIGINS=$CorsOrigins

# Configuración de frontend
REACT_APP_API_URL=$ApiUrl
NODE_ENV=production
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Archivo .env ya existe" -ForegroundColor Cyan
}

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Construir y levantar contenedores
Write-Host "🔨 Construyendo y levantando contenedores..." -ForegroundColor Yellow
docker-compose up --build -d

# Esperar a que la base de datos esté lista
Write-Host "⏳ Esperando a que la base de datos esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar estado de los contenedores
Write-Host "🔍 Verificando estado de los contenedores..." -ForegroundColor Yellow
$containers = docker-compose ps --format json | ConvertFrom-Json
$allHealthy = $true

foreach ($container in $containers) {
    $status = $container.State
    $name = $container.Name
    if ($status -eq "running") {
        Write-Host "   ✅ $name - $status" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $name - $status" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host "❌ Algunos contenedores no están funcionando correctamente" -ForegroundColor Red
    Write-Host "Revisando logs..." -ForegroundColor Yellow
    docker-compose logs --tail=20
    exit 1
}

# Verificar conexión a la base de datos
Write-Host "🔍 Verificando conexión a la base de datos..." -ForegroundColor Yellow
try {
    $dbCheck = docker-compose exec -T db pg_isready -U agro_user -d agro_db
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Base de datos conectada" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error de conexión a la base de datos" -ForegroundColor Red
        Write-Host "   Esperando más tiempo..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "   ⚠️ No se pudo verificar la base de datos, continuando..." -ForegroundColor Yellow
}

# Ejecutar migraciones
Write-Host "📦 Ejecutando migraciones..." -ForegroundColor Yellow
try {
    docker-compose exec -T backend python manage.py migrate
    Write-Host "   ✅ Migraciones aplicadas" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al aplicar migraciones" -ForegroundColor Red
    docker-compose logs backend --tail=10
    exit 1
}

# Recolectar archivos estáticos
Write-Host "📁 Recolectando archivos estáticos..." -ForegroundColor Yellow
try {
    docker-compose exec -T backend python manage.py collectstatic --noinput
    Write-Host "   ✅ Archivos estáticos recolectados" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al recolectar archivos estáticos" -ForegroundColor Red
    docker-compose logs backend --tail=10
    exit 1
}

# Crear superusuario
Write-Host "👤 Creando superusuario..." -ForegroundColor Yellow
try {
    $superuserScript = @"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@agroapg.com', 'admin123')
    print('Superusuario creado: admin@agroapg.com / admin123')
else:
    print('Superusuario ya existe')
"@
    
    $result = docker-compose exec -T backend python manage.py shell -c $superuserScript
    Write-Host "   ✅ $result" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al crear superusuario" -ForegroundColor Red
    docker-compose logs backend --tail=10
}

# Verificar conectividad
Write-Host "🌐 Verificando conectividad..." -ForegroundColor Yellow

# Probar backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Backend accesible (Status: $($backendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend no accesible: $($_.Exception.Message)" -ForegroundColor Red
}

# Probar frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Frontend accesible (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend no accesible: $($_.Exception.Message)" -ForegroundColor Red
}

# Mostrar información final
Write-Host "`n🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000/api" -ForegroundColor White
Write-Host "   Admin Django: http://localhost:8000/admin" -ForegroundColor White

Write-Host "`n👤 Credenciales de admin:" -ForegroundColor Cyan
Write-Host "   Usuario: admin@agroapg.com" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White

Write-Host "`n📊 Base de datos PostgreSQL:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Puerto: 5432" -ForegroundColor White
Write-Host "   Base de datos: agro_db" -ForegroundColor White
Write-Host "   Usuario: agro_user" -ForegroundColor White
Write-Host "   Contraseña: $DbPassword" -ForegroundColor White

Write-Host "`n🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Detener: docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar: docker-compose restart" -ForegroundColor White
Write-Host "   Ver estado: docker-compose ps" -ForegroundColor White

Write-Host "`n⚠️ IMPORTANTE: Cambia las credenciales por defecto en producción!" -ForegroundColor Yellow
Write-Host "   Usa: docker-compose exec backend python manage.py shell" -ForegroundColor White

Write-Host "`n✅ Despliegue exitoso!" -ForegroundColor Green
