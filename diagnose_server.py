#!/usr/bin/env python3
"""
Script de diagnóstico para verificar la conectividad del servidor AGRO APG
"""
import os
import sys
import requests
import socket
from urllib.parse import urlparse

def check_port(host, port):
    """Verificar si un puerto está abierto"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        print(f"❌ Error verificando puerto {port}: {e}")
        return False

def check_http_response(url):
    """Verificar respuesta HTTP"""
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        return response.status_code, response.url
    except requests.exceptions.RequestException as e:
        return None, str(e)

def main():
    print("🔍 Diagnóstico de Conectividad - AGRO APG")
    print("=" * 50)
    
    # Configuración
    server_ip = "34.136.15.241"
    ports_to_check = [8000, 3000, 5432]
    
    print(f"🌐 Verificando conectividad a {server_ip}")
    print()
    
    # Verificar puertos
    print("📋 Verificando puertos:")
    for port in ports_to_check:
        if check_port(server_ip, port):
            print(f"   ✅ Puerto {port} está abierto")
        else:
            print(f"   ❌ Puerto {port} está cerrado")
    
    print()
    
    # Verificar URLs
    print("🌐 Verificando URLs:")
    
    # Backend
    backend_url = f"http://{server_ip}:8000"
    status_code, final_url = check_http_response(backend_url)
    if status_code:
        print(f"   ✅ Backend ({backend_url}): {status_code}")
        if final_url != backend_url:
            print(f"      → Redirigido a: {final_url}")
    else:
        print(f"   ❌ Backend ({backend_url}): {final_url}")
    
    # Admin
    admin_url = f"http://{server_ip}:8000/admin"
    status_code, final_url = check_http_response(admin_url)
    if status_code:
        print(f"   ✅ Admin ({admin_url}): {status_code}")
        if final_url != admin_url:
            print(f"      → Redirigido a: {final_url}")
    else:
        print(f"   ❌ Admin ({admin_url}): {final_url}")
    
    # API
    api_url = f"http://{server_ip}:8000/api"
    status_code, final_url = check_http_response(api_url)
    if status_code:
        print(f"   ✅ API ({api_url}): {status_code}")
        if final_url != api_url:
            print(f"      → Redirigido a: {final_url}")
    else:
        print(f"   ❌ API ({api_url}): {final_url}")
    
    # Frontend
    frontend_url = f"http://{server_ip}:3000"
    status_code, final_url = check_http_response(frontend_url)
    if status_code:
        print(f"   ✅ Frontend ({frontend_url}): {status_code}")
        if final_url != frontend_url:
            print(f"      → Redirigido a: {final_url}")
    else:
        print(f"   ❌ Frontend ({frontend_url}): {final_url}")
    
    print()
    print("📊 Resumen de recomendaciones:")
    print("1. ✅ Usar http:// no https://")
    print("2. ✅ Verificar que ALLOWED_HOSTS incluya tu IP")
    print("3. ✅ Verificar que el firewall permita los puertos")
    print("4. ✅ Verificar que los contenedores estén corriendo")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
