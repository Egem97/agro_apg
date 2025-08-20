#!/usr/bin/env python
"""
Script para verificar datos de calidad con valores reales
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_backend.settings')
django.setup()

from apps.quality_data.models import QualityData

def check_quality_data():
    """
    Verifica datos de calidad con valores reales
    """
    print("🔍 Verificando datos de calidad con valores reales...")
    print("=" * 60)
    
    # Buscar registros con valores no nulos
    records_with_temp = QualityData.objects.exclude(temperatura__isnull=True)
    records_with_humidity = QualityData.objects.exclude(humedad__isnull=True)
    records_with_ph = QualityData.objects.exclude(ph__isnull=True)
    records_with_firmness = QualityData.objects.exclude(firmeza__isnull=True)
    records_with_solids = QualityData.objects.exclude(solidos_solubles__isnull=True)
    records_with_acidity = QualityData.objects.exclude(acidez_titulable__isnull=True)
    
    print(f"📊 Registros con temperatura: {records_with_temp.count()}")
    print(f"📊 Registros con humedad: {records_with_humidity.count()}")
    print(f"📊 Registros con pH: {records_with_ph.count()}")
    print(f"📊 Registros con firmeza: {records_with_firmness.count()}")
    print(f"📊 Registros con sólidos solubles: {records_with_solids.count()}")
    print(f"📊 Registros con acidez titulable: {records_with_acidity.count()}")
    
    # Mostrar algunos registros con valores
    print(f"\n📋 Registros con temperatura (primeros 3):")
    for i, record in enumerate(records_with_temp[:3]):
        print(f"  Registro {i+1}:")
        print(f"    ID: {record.id}")
        print(f"    Empresa: {record.empresa}")
        print(f"    Fecha: {record.fecha_registro}")
        print(f"    Temperatura: {record.temperatura}°C")
        print(f"    Humedad: {record.humedad}%")
        print(f"    pH: {record.ph}")
        print(f"    Calidad: {record.calidad_general}")
        print(f"    Aprobado: {record.aprobado}")
        print()
    
    # Verificar distribución de calidad
    print(f"📊 Distribución por calidad:")
    from django.db.models import Count
    quality_distribution = QualityData.objects.values('calidad_general').annotate(count=Count('calidad_general'))
    for item in quality_distribution:
        print(f"  {item['calidad_general'] or 'Sin clasificar'}: {item['count']}")
    
    # Verificar distribución por aprobación
    print(f"\n📊 Distribución por aprobación:")
    approval_distribution = QualityData.objects.values('aprobado').annotate(count=Count('aprobado'))
    for item in approval_distribution:
        status = "Aprobado" if item['aprobado'] else "Rechazado"
        print(f"  {status}: {item['count']}")

if __name__ == "__main__":
    check_quality_data()
