#!/usr/bin/env python
"""
Script para resetear contraseñas de usuarios
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from django.contrib.auth import authenticate
from apps.authentication.models import User

def reset_all_admin_passwords():
    """Resetear contraseñas de todos los usuarios admin"""
    print("=== RESETEANDO CONTRASEÑAS DE ADMIN ===")
    
    # Lista de usuarios admin que necesitan reset
    admin_users = [
        'admin@sanlucar.com',
        'admin@bluegold.com',
        'maria@frutasdelvalle.com',
        'carlos@agroexport.com',
        'alza@test.com',
    ]
    
    for email in admin_users:
        try:
            user = User.objects.get(email=email)
            user.set_password('admin123')
            user.save()
            print(f"✅ Contraseña actualizada para {email}")
            
            # Probar el login
            auth_user = authenticate(username=email, password='admin123')
            if auth_user:
                print(f"   ✅ Login exitoso con nueva contraseña")
            else:
                print(f"   ❌ Error en el login con nueva contraseña")
                
        except User.DoesNotExist:
            print(f"❌ Usuario {email} no encontrado")
        except Exception as e:
            print(f"❌ Error con {email}: {str(e)}")
        print()

def reset_specific_user():
    """Resetear contraseña de un usuario específico"""
    print("=== RESET DE USUARIO ESPECÍFICO ===")
    
    email = input("Ingrese el email del usuario: ")
    new_password = input("Ingrese la nueva contraseña: ")
    
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        print(f"✅ Contraseña actualizada para {email}")
        
        # Probar el login
        auth_user = authenticate(username=email, password=new_password)
        if auth_user:
            print(f"✅ Login exitoso con nueva contraseña")
        else:
            print(f"❌ Error en el login con nueva contraseña")
            
    except User.DoesNotExist:
        print(f"❌ Usuario {email} no encontrado")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def list_users():
    """Listar todos los usuarios"""
    print("=== LISTA DE USUARIOS ===")
    
    users = User.objects.all()
    print(f"Total de usuarios: {users.count()}")
    print()
    
    for user in users:
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Nombre: {user.first_name} {user.last_name}")
        print(f"Activo: {user.is_active}")
        print(f"Staff: {user.is_staff}")
        print(f"Superuser: {user.is_superuser}")
        if user.company:
            print(f"Empresa: {user.company.name}")
        if user.role:
            print(f"Rol: {user.role.name}")
        print("-" * 50)

def main():
    """Función principal"""
    print("🔧 RESET DE CONTRASEÑAS - AGRO APG")
    print("=" * 50)
    
    while True:
        print("\nOpciones:")
        print("1. Resetear todas las contraseñas de admin a 'admin123'")
        print("2. Resetear contraseña de usuario específico")
        print("3. Listar todos los usuarios")
        print("4. Salir")
        
        choice = input("\nSeleccione una opción (1-4): ")
        
        if choice == '1':
            reset_all_admin_passwords()
        elif choice == '2':
            reset_specific_user()
        elif choice == '3':
            list_users()
        elif choice == '4':
            print("¡Hasta luego!")
            break
        else:
            print("Opción inválida. Intente de nuevo.")

if __name__ == "__main__":
    main()
