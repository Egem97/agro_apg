#!/usr/bin/env python
"""
Script para crear datos de calidad de prueba con valores realistas
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from apps.authentication.models import User, Company
from apps.quality_data.models import QualityData

def create_test_quality_data():
    """
    Crea datos de calidad de prueba con valores realistas
    """
    print("🔬 Creando datos de calidad de prueba...")
    
    # Buscar la empresa SAN LUCAR S.A.
    company = Company.objects.filter(name="SAN LUCAR S.A.").first()
    if not company:
        print("❌ No se encontró la empresa SAN LUCAR S.A.")
        return
    
    # Buscar un usuario para asignar como creador
    user = User.objects.filter(company=company).first()
    if not user:
        print("❌ No se encontró un usuario para la empresa")
        return
    
    # Eliminar datos existentes de prueba (opcional)
    # QualityData.objects.filter(empresa="SAN LUCAR S.A.").delete()
    
    # Crear datos de prueba
    quality_levels = ['excelente', 'buena', 'regular', 'mala']
    approval_statuses = [True, False]
    
    # Generar 20 registros de prueba
    for i in range(20):
        # Fecha aleatoria en los últimos 30 días
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        
        fecha = datetime.now() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        # Valores realistas para arándanos
        temperatura = round(random.uniform(2.0, 8.0), 2)  # Temperatura de refrigeración
        humedad = round(random.uniform(85.0, 95.0), 2)    # Humedad alta para frutas
        ph = round(random.uniform(3.0, 4.5), 2)           # pH ácido típico de arándanos
        
        firmeza = round(random.uniform(1.5, 3.0), 2)      # Firmeza en kg/cm²
        solidos_solubles = round(random.uniform(8.0, 12.0), 2)  # °Brix
        acidez_titulable = round(random.uniform(0.8, 1.5), 2)   # %
        
        defectos_porcentaje = round(random.uniform(0.0, 15.0), 2)
        
        calidad = random.choice(quality_levels)
        aprobado = random.choice(approval_statuses)
        
        # Crear el registro
        quality_data = QualityData.objects.create(
            empresa="SAN LUCAR S.A.",
            fecha_registro=fecha,
            temperatura=temperatura,
            humedad=humedad,
            ph=ph,
            firmeza=firmeza,
            solidos_solubles=solidos_solubles,
            acidez_titulable=acidez_titulable,
            defectos_porcentaje=defectos_porcentaje,
            defectos_descripcion="Datos de prueba generados automáticamente",
            calibre=random.choice(['Grande', 'Mediano', 'Pequeño']),
            color=random.choice(['Azul intenso', 'Azul claro', 'Rojo']),
            calidad_general=calidad,
            aprobado=aprobado,
            observaciones="Registro de prueba con valores realistas",
            company=company,
            created_by=user
        )
        
        print(f"✅ Registro {i+1} creado: {fecha.strftime('%Y-%m-%d %H:%M')} - {calidad} - {'Aprobado' if aprobado else 'Rechazado'}")
    
    print(f"\n🎉 Se crearon 20 registros de prueba para {company.name}")

if __name__ == "__main__":
    create_test_quality_data()
