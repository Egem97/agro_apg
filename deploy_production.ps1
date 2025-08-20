# 🚀 Script de Despliegue en Producción - AGRO APG (PowerShell)
# Uso: .\deploy_production.ps1

param(
    [string]$EnvFile = ".env"
)

# Configurar para detener en caso de error
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando despliegue en producción de AGRO APG..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Función para imprimir mensajes
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar si Docker está instalado
function Test-Docker {
    Write-Status "Verificando Docker..."
    
    try {
        $null = docker --version
        $null = docker-compose --version
        Write-Success "Docker y Docker Compose están instalados"
    }
    catch {
        Write-Error "Docker no está instalado o no está en el PATH. Por favor instala Docker Desktop."
        exit 1
    }
}

# Verificar archivo .env
function Test-EnvFile {
    if (Test-Path $EnvFile) {
        Write-Success "Archivo $EnvFile encontrado"
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                Set-Variable -Name $name -Value $value -Scope Global
            }
        }
    }
    else {
        Write-Warning "Archivo $EnvFile no encontrado. Creando archivo .env por defecto..."
        
        $envContent = @"
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
"@
        
        $envContent | Out-File -FilePath $EnvFile -Encoding UTF8
        Write-Warning "Archivo $EnvFile creado con valores por defecto. ¡IMPORTANTE: Cambia las contraseñas!"
        
        # Cargar variables
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                Set-Variable -Name $name -Value $value -Scope Global
            }
        }
    }
}

# Detener contenedores existentes
function Stop-Containers {
    Write-Status "Deteniendo contenedores existentes..."
    docker-compose down --remove-orphans
    Write-Success "Contenedores detenidos"
}

# Limpiar recursos Docker
function Clear-DockerResources {
    Write-Status "Limpiando recursos Docker no utilizados..."
    docker system prune -f
    Write-Success "Limpieza completada"
}

# Construir y levantar contenedores
function Start-Containers {
    Write-Status "Construyendo y levantando contenedores..."
    docker-compose up --build -d
    
    # Esperar a que los contenedores estén listos
    Write-Status "Esperando a que los contenedores estén listos..."
    Start-Sleep -Seconds 30
    
    Write-Success "Contenedores construidos y levantados"
}

# Verificar estado de contenedores
function Test-Containers {
    Write-Status "Verificando estado de contenedores..."
    
    $containers = docker-compose ps
    if ($containers -match "Up") {
        Write-Success "Todos los contenedores están ejecutándose"
        docker-compose ps
    }
    else {
        Write-Error "Algunos contenedores no están ejecutándose correctamente"
        docker-compose ps
        docker-compose logs
        exit 1
    }
}

# Ejecutar migraciones
function Invoke-Migrations {
    Write-Status "Ejecutando migraciones de Django..."
    
    # Esperar a que la base de datos esté lista
    Write-Status "Esperando a que PostgreSQL esté listo..."
    do {
        Start-Sleep -Seconds 2
        $result = docker-compose exec -T db pg_isready -U $POSTGRES_USER -d $POSTGRES_DB 2>$null
    } while ($LASTEXITCODE -ne 0)
    
    docker-compose exec -T backend python manage.py migrate --noinput
    Write-Success "Migraciones ejecutadas"
}

# Recolectar archivos estáticos
function Invoke-CollectStatic {
    Write-Status "Recolectando archivos estáticos..."
    docker-compose exec -T backend python manage.py collectstatic --noinput --clear
    Write-Success "Archivos estáticos recolectados"
}

# Crear superusuario si no existe
function New-SuperUser {
    Write-Status "Verificando superusuario..."
    
    # Verificar si ya existe un superusuario
    $checkScript = @"
from apps.authentication.models import User
if User.objects.filter(is_superuser=True).exists():
    print('Superusuario ya existe')
    exit(0)
else:
    print('No hay superusuario')
    exit(1)
"@
    
    try {
        docker-compose exec -T backend python manage.py shell -c $checkScript 2>$null
        Write-Success "Superusuario ya existe"
    }
    catch {
        Write-Warning "No hay superusuario. Creando uno por defecto..."
        
        $createScript = @"
from apps.authentication.models import User
User.objects.create_superuser(
    email='admin@agroapg.com',
    password='admin123',
    first_name='Admin',
    last_name='AGRO APG'
)
print('Superusuario creado: admin@agroapg.com / admin123')
"@
        
        docker-compose exec -T backend python manage.py shell -c $createScript
        Write-Warning "¡IMPORTANTE: Cambia la contraseña del superusuario inmediatamente!"
    }
}

# Verificar configuración de producción
function Test-ProductionConfig {
    Write-Status "Verificando configuración de producción..."
    docker-compose exec -T backend python manage.py check --deploy
    Write-Success "Configuración de producción verificada"
}

# Mostrar información de acceso
function Show-AccessInfo {
    Write-Host ""
    Write-Host "🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "🔧 Backend API: http://localhost:8000/api" -ForegroundColor White
    Write-Host "📊 Admin Django: http://localhost:8000/admin" -ForegroundColor White
    Write-Host ""
    Write-Host "👤 Credenciales por defecto:" -ForegroundColor Yellow
    Write-Host "   Email: admin@agroapg.com" -ForegroundColor White
    Write-Host "   Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "🗄️ Base de datos PostgreSQL:" -ForegroundColor Yellow
    Write-Host "   Host: localhost" -ForegroundColor White
    Write-Host "   Puerto: 5432" -ForegroundColor White
    Write-Host "   Base de datos: $POSTGRES_DB" -ForegroundColor White
    Write-Host "   Usuario: $POSTGRES_USER" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "   Ver logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   Ver estado: docker-compose ps" -ForegroundColor White
    Write-Host "   Reiniciar: docker-compose restart" -ForegroundColor White
    Write-Host "   Detener: docker-compose down" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
    Write-Host "   - Cambia las contraseñas por defecto" -ForegroundColor White
    Write-Host "   - Configura SSL para producción" -ForegroundColor White
    Write-Host "   - Configura un dominio real" -ForegroundColor White
    Write-Host "   - Habilita backups automáticos" -ForegroundColor White
    Write-Host ""
}

# Función principal
function Main {
    Write-Host "🚀 Script de Despliegue en Producción - AGRO APG" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar Docker
    Test-Docker
    
    # Verificar archivo .env
    Test-EnvFile
    
    # Detener contenedores existentes
    Stop-Containers
    
    # Limpiar recursos
    Clear-DockerResources
    
    # Construir y levantar
    Start-Containers
    
    # Verificar contenedores
    Test-Containers
    
    # Ejecutar migraciones
    Invoke-Migrations
    
    # Recolectar archivos estáticos
    Invoke-CollectStatic
    
    # Crear superusuario
    New-SuperUser
    
    # Verificar configuración
    Test-ProductionConfig
    
    # Mostrar información de acceso
    Show-AccessInfo
    
    Write-Success "¡Despliegue completado exitosamente!"
}

# Ejecutar función principal
Main
