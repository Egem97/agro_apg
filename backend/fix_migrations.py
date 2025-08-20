import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def main():
    print("🔄 Aplicando migraciones...")
    
    try:
        # Aplicar migraciones
        call_command('migrate')
        print("✅ Migraciones aplicadas")
        
        # Verificar tablas
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            if 'auth_company' in tables:
                print("✅ Tabla auth_company existe")
            else:
                print("❌ Tabla auth_company NO existe")
                
            if 'auth_user' in tables:
                print("✅ Tabla auth_user existe")
            else:
                print("❌ Tabla auth_user NO existe")
        
        # Crear datos de prueba
        print("📊 Creando datos de prueba...")
        call_command('shell', command='exec(open("init_data.py").read())')
        print("✅ Datos de prueba creados")
        
        print("\n🎉 ¡Todo listo! Ejecuta: python manage.py runserver")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    main()
