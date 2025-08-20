#!/usr/bin/env python3
"""
Script de diagnóstico para verificar la configuración de producción de AGRO APG
"""

import os
import sys
import django
from pathlib import Path

def main():
    print("🔍 Diagnóstico de Configuración de Producción - AGRO APG")
    print("=" * 60)
    
    # Verificar variables de entorno
    print("\n📋 Variables de Entorno:")
    print("-" * 30)
    
    env_vars = [
        'DEBUG',
        'DJANGO_SETTINGS_MODULE',
        'SECRET_KEY',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'ALLOWED_HOSTS',
        'CORS_ALLOWED_ORIGINS'
    ]
    
    for var in env_vars:
        value = os.getenv(var, 'NO DEFINIDA')
        if var in ['POSTGRES_PASSWORD', 'SECRET_KEY']:
            value = value[:10] + '...' if len(value) > 10 else value
        print(f"  {var}: {value}")
    
    # Verificar archivo de settings
    print("\n⚙️ Configuración de Django:")
    print("-" * 30)
    
    settings_module = os.getenv('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
    print(f"  Settings Module: {settings_module}")
    
    # Configurar Django
    try:
        # Agregar el directorio del proyecto al path
        project_dir = Path(__file__).parent / 'backend'
        sys.path.insert(0, str(project_dir))
        
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
        django.setup()
        
        from django.conf import settings
        
        print(f"  DEBUG: {settings.DEBUG}")
        print(f"  ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"  DATABASE ENGINE: {settings.DATABASES['default']['ENGINE']}")
        print(f"  DATABASE NAME: {settings.DATABASES['default']['NAME']}")
        print(f"  DATABASE HOST: {settings.DATABASES['default']['HOST']}")
        print(f"  DATABASE PORT: {settings.DATABASES['default']['PORT']}")
        print(f"  DATABASE USER: {settings.DATABASES['default']['USER']}")
        
        # Verificar aplicaciones instaladas
        print(f"  INSTALLED_APPS: {len(settings.INSTALLED_APPS)} aplicaciones")
        for app in settings.INSTALLED_APPS:
            if app.startswith('apps.'):
                print(f"    - {app}")
        
        # Verificar si quality_data está instalada
        if 'apps.quality_data' in settings.INSTALLED_APPS:
            print("  ✅ apps.quality_data está en INSTALLED_APPS")
        else:
            print("  ❌ apps.quality_data NO está en INSTALLED_APPS")
            
    except Exception as e:
        print(f"  ❌ Error al cargar configuración: {e}")
        return False
    
    # Verificar conectividad a la base de datos
    print("\n🗄️ Verificación de Base de Datos:")
    print("-" * 30)
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"  ✅ Conexión exitosa a PostgreSQL")
            print(f"  Versión: {version}")
    except Exception as e:
        print(f"  ❌ Error de conexión a la base de datos: {e}")
        return False
    
    # Verificar modelos
    print("\n📊 Verificación de Modelos:")
    print("-" * 30)
    
    try:
        from apps.quality_data.models import QualityData
        print(f"  ✅ Modelo QualityData cargado correctamente")
        
        # Verificar si la tabla existe
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'quality_data_qualitydata'
                );
            """)
            table_exists = cursor.fetchone()[0]
            if table_exists:
                print(f"  ✅ Tabla quality_data_qualitydata existe")
            else:
                print(f"  ⚠️ Tabla quality_data_qualitydata no existe (necesita migraciones)")
                
    except Exception as e:
        print(f"  ❌ Error al cargar modelo QualityData: {e}")
        return False
    
    print("\n✅ Diagnóstico completado")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
