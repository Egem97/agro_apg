#!/usr/bin/env python
"""
Script para verificar usuarios en la base de datos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from apps.authentication.models import User, Company

def check_users():
    """Verifica usuarios en la base de datos"""
    print("👥 VERIFICACIÓN DE USUARIOS EN LA BASE DE DATOS")
    print("=" * 50)
    
    # Verificar usuarios existentes
    users = User.objects.all()
    print(f"📊 Total de usuarios: {users.count()}")
    
    if users.exists():
        print("\n📋 Lista de usuarios:")
        print("-" * 40)
        for user in users:
            print(f"👤 ID: {user.id}")
            print(f"   📧 Email: {user.email}")
            print(f"   👤 Nombre: {user.first_name} {user.last_name}")
            print(f"   ✅ Activo: {user.is_active}")
            print(f"   🏢 Empresa: {user.company.name if user.company else 'Sin empresa'}")
            print(f"   🔑 Superuser: {user.is_superuser}")
            print(f"   👨‍💼 Staff: {user.is_staff}")
            print("-" * 20)
    else:
        print("❌ No hay usuarios en la base de datos")
    
    # Verificar empresas
    companies = Company.objects.all()
    print(f"\n🏢 Total de empresas: {companies.count()}")
    
    if companies.exists():
        print("\n📋 Lista de empresas:")
        print("-" * 40)
        for company in companies:
            print(f"🏢 ID: {company.id}")
            print(f"   📝 Nombre: {company.name}")
            print(f"   🌐 Dominio: {company.domain}")
            print(f"   ✅ Activa: {company.activo}")
            print(f"   👥 Usuarios: {company.users.count()}")
            print("-" * 20)

def test_user_login(email, password):
    """Prueba el login de un usuario específico"""
    print(f"\n🔐 PRUEBA DE LOGIN PARA: {email}")
    print("=" * 50)
    
    try:
        from django.contrib.auth import authenticate
        
        # Buscar usuario
        user = User.objects.filter(email=email).first()
        if not user:
            print(f"❌ Usuario {email} no encontrado")
            return False
        
        print(f"✅ Usuario encontrado:")
        print(f"   📧 Email: {user.email}")
        print(f"   👤 Nombre: {user.first_name} {user.last_name}")
        print(f"   ✅ Activo: {user.is_active}")
        print(f"   🏢 Empresa: {user.company.name if user.company else 'Sin empresa'}")
        
        # Probar autenticación
        authenticated_user = authenticate(username=email, password=password)
        if authenticated_user:
            print(f"✅ Autenticación exitosa!")
            return True
        else:
            print(f"❌ Autenticación fallida - contraseña incorrecta")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Función principal"""
    check_users()
    
    # Probar login con usuarios conocidos
    test_credentials = [
        ("test@sanlucar.com", "test123"),
        ("demo@sanlucar.com", "demo123"),
    ]
    
    print(f"\n🔐 PRUEBAS DE AUTENTICACIÓN")
    print("=" * 50)
    
    for email, password in test_credentials:
        test_user_login(email, password)
        print()

if __name__ == "__main__":
    main()
