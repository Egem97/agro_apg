#!/bin/bash

# 🚀 Solución rápida para el frontend - AGRO APG

echo "🚀 Solución rápida para el frontend..."
echo "======================================"

# Detener todos los contenedores
echo "🛑 Deteniendo contenedores..."
docker-compose down

# Limpiar recursos
echo "🧹 Limpiando recursos..."
docker system prune -f

# Reconstruir solo el frontend
echo "🔨 Reconstruyendo frontend..."
docker-compose up --build -d frontend

# Esperar
echo "⏳ Esperando a que el frontend esté listo..."
sleep 20

# Verificar estado
echo "📊 Estado de contenedores:"
docker-compose ps

# Verificar logs del frontend
echo "📋 Logs del frontend:"
docker-compose logs frontend --tail=10

echo ""
echo "✅ Proceso completado"
echo "===================="
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://34.136.15.241:3000"
echo "   Backend: http://34.136.15.241:8000"
echo "   Admin: http://34.136.15.241:8000/admin"
