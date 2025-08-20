# Script de pruebas de login para AGRO APG
Write-Host "🔍 Pruebas de Login - AGRO APG" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Función para hacer peticiones HTTP
function Invoke-LoginTest {
    param(
        [string]$Email,
        [string]$Password,
        [string]$Description
    )
    
    Write-Host "`n📝 Probando: $Description" -ForegroundColor Yellow
    Write-Host "   Email: $Email" -ForegroundColor Gray
    Write-Host "   Password: $Password" -ForegroundColor Gray
    
    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
        Write-Host "   ✅ ÉXITO - Login correcto" -ForegroundColor Green
        Write-Host "   Usuario: $($response.user.username)" -ForegroundColor Cyan
        Write-Host "   Email: $($response.user.email)" -ForegroundColor Cyan
        Write-Host "   Superuser: $($response.user.is_superuser)" -ForegroundColor Cyan
        return $true
    }
    catch {
        Write-Host "   ❌ ERROR - Login falló" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Respuesta: $responseBody" -ForegroundColor Red
        } else {
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Función para probar conectividad
function Test-APIConnectivity {
    Write-Host "`n🌐 Probando conectividad con el backend..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET
        Write-Host "   ✅ Backend accesible (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ Backend no accesible" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para verificar usuarios en la base de datos
function Get-UsersFromDB {
    Write-Host "`n👥 Verificando usuarios en la base de datos..." -ForegroundColor Yellow
    
    try {
        $result = docker-compose -f docker-compose.local.yml exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
print('=== USUARIOS EN LA BASE DE DATOS ===')
for user in User.objects.all():
    print(f'ID: {user.id} | Username: {user.username} | Email: {user.email} | Superuser: {user.is_superuser} | Activo: {user.is_active}')
print('=== FIN ===')
"
        Write-Host $result -ForegroundColor Cyan
    }
    catch {
        Write-Host "   ❌ Error al obtener usuarios de la base de datos" -ForegroundColor Red
    }
}

# Función para verificar variables de entorno del frontend
function Test-FrontendConfig {
    Write-Host "`n⚙️ Verificando configuración del frontend..." -ForegroundColor Yellow
    
    try {
        $env = docker-compose -f docker-compose.local.yml exec -T frontend env | Select-String "REACT_APP_API_URL"
        Write-Host "   REACT_APP_API_URL: $env" -ForegroundColor Cyan
    }
    catch {
        Write-Host "   ❌ Error al verificar configuración del frontend" -ForegroundColor Red
    }
}

# Función para verificar logs del frontend
function Get-FrontendLogs {
    Write-Host "`n📋 Últimos logs del frontend..." -ForegroundColor Yellow
    
    try {
        $logs = docker-compose -f docker-compose.local.yml logs frontend --tail=10
        Write-Host $logs -ForegroundColor Gray
    }
    catch {
        Write-Host "   ❌ Error al obtener logs del frontend" -ForegroundColor Red
    }
}

# Función para verificar logs del backend
function Get-BackendLogs {
    Write-Host "`n📋 Últimos logs del backend..." -ForegroundColor Yellow
    
    try {
        $logs = docker-compose -f docker-compose.local.yml logs backend --tail=10
        Write-Host $logs -ForegroundColor Gray
    }
    catch {
        Write-Host "   ❌ Error al obtener logs del backend" -ForegroundColor Red
    }
}

# Ejecutar pruebas
Write-Host "`n🚀 Iniciando pruebas de login..." -ForegroundColor Green

# 1. Verificar conectividad
$connectivity = Test-APIConnectivity

if (-not $connectivity) {
    Write-Host "`n❌ No se puede conectar al backend. Verifica que los contenedores estén corriendo." -ForegroundColor Red
    Write-Host "Comando para verificar: docker-compose -f docker-compose.local.yml ps" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar usuarios en la base de datos
Get-UsersFromDB

# 3. Verificar configuración del frontend
Test-FrontendConfig

# 4. Probar diferentes credenciales
$testCases = @(
    @{Email="admin@agroapg.com"; Password="admin123"; Description="Superusuario principal"},
    @{Email="eenriquez@alzagroup.com"; Password="admin123"; Description="Superusuario alternativo"},
    @{Email="admin@sanlucar.com"; Password="admin123"; Description="Usuario normal"},
    @{Email="admin@agroapg.com"; Password="wrongpassword"; Description="Contraseña incorrecta"},
    @{Email="nonexistent@test.com"; Password="admin123"; Description="Email inexistente"}
)

$successCount = 0
$totalTests = $testCases.Count

foreach ($testCase in $testCases) {
    $result = Invoke-LoginTest -Email $testCase.Email -Password $testCase.Password -Description $testCase.Description
    if ($result) {
        $successCount++
    }
}

# 5. Mostrar resumen
Write-Host "`n📊 RESUMEN DE PRUEBAS" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "Pruebas exitosas: $successCount/$totalTests" -ForegroundColor Cyan

# 6. Mostrar logs si hay problemas
if ($successCount -eq 0) {
    Write-Host "`n🔍 Mostrando logs para diagnóstico..." -ForegroundColor Yellow
    Get-FrontendLogs
    Get-BackendLogs
}

Write-Host "`n✅ Pruebas completadas" -ForegroundColor Green
Write-Host "Para más detalles, abre: http://localhost:3000/test_frontend_login.html" -ForegroundColor Cyan
