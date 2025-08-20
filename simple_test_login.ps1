# Script simple de pruebas de login
Write-Host "🔍 Pruebas de Login - AGRO APG" -ForegroundColor Green

# Verificar conectividad
Write-Host "`n🌐 Probando conectividad..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET
    Write-Host "✅ Backend accesible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no accesible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar usuarios en la base de datos
Write-Host "`n👥 Usuarios en la base de datos:" -ForegroundColor Yellow
try {
    $result = docker-compose -f docker-compose.local.yml exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
for user in User.objects.all():
    print(f'{user.username} ({user.email}) - Superuser: {user.is_superuser}')
"
    Write-Host $result -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al obtener usuarios" -ForegroundColor Red
}

# Probar login con credenciales correctas
Write-Host "`n📝 Probando login con admin@agroapg.com..." -ForegroundColor Yellow
$body = @{
    email = "admin@agroapg.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host "Usuario: $($response.user.username)" -ForegroundColor Cyan
    Write-Host "Email: $($response.user.email)" -ForegroundColor Cyan
    Write-Host "Superuser: $($response.user.is_superuser)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ LOGIN FALLÓ" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Pruebas completadas" -ForegroundColor Green
Write-Host "Para más pruebas, abre: http://localhost:3000/test_frontend_login.html" -ForegroundColor Cyan
