#!/usr/bin/env python
"""
Script para solucionar el error 502 Bad Gateway
"""
import subprocess
import time
import os

def run_command(command, description):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n🔧 {description}")
    print("-" * 40)
    print(f"Comando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Comando ejecutado exitosamente")
            if result.stdout:
                print("Salida:")
                print(result.stdout)
        else:
            print("❌ Error ejecutando comando")
            print("Error:")
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def check_docker_status():
    """Verifica el estado de Docker"""
    print("🐳 VERIFICANDO ESTADO DE DOCKER")
    print("=" * 50)
    
    # Verificar si Docker está corriendo
    if not run_command("docker --version", "Verificando Docker"):
        print("❌ Docker no está instalado o no está corriendo")
        return False
    
    # Verificar contenedores
    run_command("docker ps", "Contenedores activos")
    run_command("docker ps -a", "Todos los contenedores")
    
    return True

def fix_502_gateway():
    """Soluciona el error 502 Bad Gateway"""
    print("🚀 SOLUCIONANDO ERROR 502 BAD GATEWAY")
    print("=" * 50)
    
    # 1. Detener todos los contenedores
    print("\n📋 PASO 1: Deteniendo contenedores")
    run_command("docker compose down", "Deteniendo todos los contenedores")
    
    # 2. Limpiar contenedores huérfanos
    print("\n📋 PASO 2: Limpiando contenedores")
    run_command("docker system prune -f", "Limpiando contenedores huérfanos")
    
    # 3. Reconstruir imágenes
    print("\n📋 PASO 3: Reconstruyendo imágenes")
    run_command("docker compose build --no-cache", "Reconstruyendo imágenes")
    
    # 4. Levantar servicios
    print("\n📋 PASO 4: Levantando servicios")
    run_command("docker compose up -d", "Levantando servicios en background")
    
    # 5. Esperar a que los servicios estén listos
    print("\n📋 PASO 5: Esperando que los servicios estén listos")
    print("⏳ Esperando 30 segundos...")
    time.sleep(30)
    
    # 6. Verificar estado
    print("\n📋 PASO 6: Verificando estado")
    run_command("docker compose ps", "Estado de los servicios")
    
    # 7. Verificar logs
    print("\n📋 PASO 7: Verificando logs")
    run_command("docker logs agro_backend --tail 20", "Logs del backend")
    run_command("docker logs agro_nginx --tail 20", "Logs de Nginx")
    
    return True

def test_endpoints():
    """Prueba los endpoints después de la corrección"""
    print("\n🌐 PROBANDO ENDPOINTS")
    print("=" * 50)
    
    import requests
    
    endpoints = [
        "http://localhost:8080/",
        "http://localhost:8080/api/",
        "http://localhost:8080/health"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"✅ {endpoint} - Status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - No se puede conectar")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")

def create_nginx_config_fix():
    """Crea una configuración de Nginx alternativa si es necesario"""
    print("\n🔧 CONFIGURACIÓN ALTERNATIVA DE NGINX")
    print("=" * 50)
    
    nginx_config = """
server {
    listen 80;
    server_name localhost;
    
    # Configuración más simple para debugging
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
"""
    
    # Guardar configuración alternativa
    with open("nginx_simple.conf", "w") as f:
        f.write(nginx_config)
    
    print("✅ Configuración alternativa guardada en nginx_simple.conf")
    print("📝 Para usar esta configuración:")
    print("   1. Copia nginx_simple.conf a nginx/nginx.conf")
    print("   2. Reinicia Nginx: docker compose restart nginx")

def main():
    """Función principal"""
    print("🚀 SOLUCIONADOR DE ERROR 502 BAD GATEWAY")
    print("=" * 60)
    
    # Verificar Docker
    if not check_docker_status():
        print("❌ Docker no está disponible. Instala Docker primero.")
        return
    
    # Solucionar el problema
    if fix_502_gateway():
        print("\n✅ Corrección completada")
        
        # Probar endpoints
        test_endpoints()
        
        # Crear configuración alternativa
        create_nginx_config_fix()
        
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. Accede a: http://34.136.15.241:8080")
        print("2. Si sigue el error 502, usa la configuración alternativa")
        print("3. Verifica logs: docker logs agro_backend")
        print("4. Verifica logs: docker logs agro_nginx")
    else:
        print("❌ Error durante la corrección")

if __name__ == "__main__":
    main()
