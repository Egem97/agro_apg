#!/usr/bin/env python
"""
Script de diagnóstico para el servidor de producción
"""
import requests
import subprocess
import json
import os

def check_docker_containers():
    """Verifica el estado de los contenedores Docker"""
    print("🐳 VERIFICACIÓN DE CONTENEDORES DOCKER")
    print("=" * 50)
    
    try:
        # Verificar contenedores corriendo
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Contenedores activos:")
            print(result.stdout)
        else:
            print("❌ Error al verificar contenedores Docker")
            print(result.stderr)
            return False
        
        # Verificar todos los contenedores (incluyendo los detenidos)
        result = subprocess.run(['docker', 'ps', '-a'], capture_output=True, text=True)
        if result.returncode == 0:
            print("\n📋 Todos los contenedores:")
            print(result.stdout)
        
        return True
        
    except Exception as e:
        print(f"❌ No se pudo verificar Docker: {e}")
        return False

def check_ports():
    """Verifica qué puertos están en uso"""
    print("\n🔌 VERIFICACIÓN DE PUERTOS")
    print("=" * 50)
    
    ports_to_check = [80, 8080, 3000, 8000, 5432]
    
    for port in ports_to_check:
        try:
            result = subprocess.run(['netstat', '-tlnp'], capture_output=True, text=True)
            if result.returncode == 0:
                if str(port) in result.stdout:
                    print(f"✅ Puerto {port} está en uso")
                else:
                    print(f"❌ Puerto {port} NO está en uso")
        except Exception as e:
            print(f"❌ Error verificando puerto {port}: {e}")

def test_nginx_endpoints():
    """Prueba los endpoints de Nginx"""
    print("\n🌐 PRUEBA DE ENDPOINTS NGINX")
    print("=" * 50)
    
    base_urls = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://34.136.15.241:8080"
    ]
    
    endpoints = [
        "/",
        "/api/",
        "/api/auth/login/",
        "/admin/",
        "/health"
    ]
    
    for base_url in base_urls:
        print(f"\n📍 Probando: {base_url}")
        print("-" * 40)
        
        for endpoint in endpoints:
            url = base_url + endpoint
            try:
                response = requests.get(url, timeout=10)
                print(f"✅ {endpoint} - Status: {response.status_code}")
                if response.status_code == 502:
                    print(f"   ⚠️  502 Bad Gateway - Nginx no puede conectar al backend")
            except requests.exceptions.ConnectionError:
                print(f"❌ {endpoint} - No se puede conectar")
            except Exception as e:
                print(f"❌ {endpoint} - Error: {e}")

def test_direct_backend():
    """Prueba el backend directamente"""
    print("\n🔧 PRUEBA DIRECTA DEL BACKEND")
    print("=" * 50)
    
    # Probar puerto 8000 directamente
    try:
        response = requests.get("http://localhost:8000/api/", timeout=5)
        print(f"✅ Backend en puerto 8000 - Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend en puerto 8000 - No responde")
    except Exception as e:
        print(f"❌ Backend en puerto 8000 - Error: {e}")
    
    # Probar puerto 3000 directamente (frontend)
    try:
        response = requests.get("http://localhost:3000/", timeout=5)
        print(f"✅ Frontend en puerto 3000 - Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Frontend en puerto 3000 - No responde")
    except Exception as e:
        print(f"❌ Frontend en puerto 3000 - Error: {e}")

def check_nginx_logs():
    """Verifica los logs de Nginx"""
    print("\n📋 LOGS DE NGINX")
    print("=" * 50)
    
    try:
        # Verificar logs de error de Nginx
        result = subprocess.run(['docker', 'logs', 'agro_nginx', '--tail', '20'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("📄 Últimos logs de Nginx:")
            print(result.stdout)
        else:
            print("❌ No se pudieron obtener logs de Nginx")
            print(result.stderr)
    except Exception as e:
        print(f"❌ Error obteniendo logs: {e}")

def check_backend_logs():
    """Verifica los logs del backend"""
    print("\n📋 LOGS DEL BACKEND")
    print("=" * 50)
    
    try:
        result = subprocess.run(['docker', 'logs', 'agro_backend', '--tail', '20'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("📄 Últimos logs del backend:")
            print(result.stdout)
        else:
            print("❌ No se pudieron obtener logs del backend")
            print(result.stderr)
    except Exception as e:
        print(f"❌ Error obteniendo logs: {e}")

def main():
    """Función principal de diagnóstico"""
    print("🚀 DIAGNÓSTICO DEL SERVIDOR DE PRODUCCIÓN")
    print("=" * 60)
    
    # Verificar si estamos en el servidor correcto
    print(f"📍 IP del servidor: 34.136.15.241")
    print(f"📍 Puerto Nginx: 8080")
    print("-" * 40)
    
    # Ejecutar todas las verificaciones
    check_docker_containers()
    check_ports()
    test_nginx_endpoints()
    test_direct_backend()
    check_nginx_logs()
    check_backend_logs()
    
    print(f"\n📋 RECOMENDACIONES")
    print("=" * 50)
    print("1. Si los contenedores no están corriendo:")
    print("   - Ejecuta: docker compose up -d")
    print("   - Verifica: docker compose ps")
    
    print("\n2. Si hay error 502 Bad Gateway:")
    print("   - El backend no está respondiendo")
    print("   - Verifica logs: docker logs agro_backend")
    print("   - Reinicia: docker compose restart backend")
    
    print("\n3. Si Nginx no responde:")
    print("   - Verifica logs: docker logs agro_nginx")
    print("   - Reinicia: docker compose restart nginx")
    
    print("\n4. Para acceder a la aplicación:")
    print("   - Frontend: http://34.136.15.241:8080")
    print("   - API: http://34.136.15.241:8080/api/")
    print("   - Admin: http://34.136.15.241:8080/admin/")

if __name__ == "__main__":
    main()
