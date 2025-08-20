#!/usr/bin/env python
"""
Script para configurar el modelo Company y crear datos de prueba
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def apply_migrations():
    """Aplicar migraciones"""
    print("🔄 Aplicando migraciones...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migraciones aplicadas exitosamente")
        return True
    except Exception as e:
        print(f"❌ Error aplicando migraciones: {e}")
        return False

def check_database():
    """Verificar que las tablas existen"""
    print("🔍 Verificando base de datos...")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name IN ('auth_company', 'auth_user')
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        if 'auth_company' in tables and 'auth_user' in tables:
            print("✅ Tablas Company y User existen")
            return True
        else:
            print("❌ Faltan tablas en la base de datos")
            return False

def create_test_data():
    """Crear datos de prueba"""
    print("📊 Creando datos de prueba...")
    try:
        from init_data import main
        main()
        print("✅ Datos de prueba creados exitosamente")
        return True
    except Exception as e:
        print(f"❌ Error creando datos de prueba: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Configurando modelo Company...")
    
    # Paso 1: Aplicar migraciones
    if not apply_migrations():
        return False
    
    # Paso 2: Verificar base de datos
    if not check_database():
        return False
    
    # Paso 3: Crear datos de prueba
    if not create_test_data():
        return False
    
    print("\n🎉 ¡Configuración completada exitosamente!")
    print("\n📋 Resumen:")
    print("   - Migraciones aplicadas")
    print("   - Tablas verificadas")
    print("   - Datos de prueba creados")
    print("\n🚀 Puedes ejecutar: python manage.py runserver")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
