#!/usr/bin/env python
"""
Script para crear un usuario de prueba con contraseña conocida
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from apps.authentication.models import User, Company
from django.contrib.auth.hashers import make_password

def create_test_user():
    """
    Crea un usuario de prueba para testing
    """
    print("👤 Creando usuario de prueba...")
    
    # Buscar la empresa SAN LUCAR S.A.
    company = Company.objects.filter(name="SAN LUCAR S.A.").first()
    if not company:
        print("❌ No se encontró la empresa SAN LUCAR S.A.")
        return
    
    # Crear o actualizar usuario de prueba
    user, created = User.objects.get_or_create(
        email="test@sanlucar.com",
        defaults={
            'username': 'testuser',
            'first_name': 'Usuario',
            'last_name': 'Prueba',
            'company': company,
            'password': make_password('test123'),
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Usuario creado: {user.email}")
    else:
        # Actualizar contraseña si el usuario ya existe
        user.password = make_password('test123')
        user.save()
        print(f"✅ Usuario actualizado: {user.email}")
    
    print(f"🏢 Empresa asignada: {user.company.name}")
    print(f"🔑 Contraseña: test123")

if __name__ == "__main__":
    create_test_user()
