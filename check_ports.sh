#!/bin/bash

# 🔍 Script para verificar conflictos de puertos - AGRO APG

echo "🔍 Verificando puertos utilizados por AGRO APG..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar puerto
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo -e "${RED}❌ Puerto $port está en uso por:${NC}"
        netstat -tlnp 2>/dev/null | grep ":$port " | head -1
    else
        echo -e "${GREEN}✅ Puerto $port está libre${NC}"
    fi
}

# Función para verificar contenedores Docker
check_docker_ports() {
    echo ""
    echo -e "${BLUE}🐳 Verificando contenedores Docker:${NC}"
    
    if command -v docker &> /dev/null; then
        docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | grep -E "(agro|backend|frontend|postgres)"
    else
        echo -e "${YELLOW}⚠️ Docker no está instalado${NC}"
    fi
}

# Puertos críticos para AGRO APG
echo -e "${BLUE}📋 Verificando puertos críticos:${NC}"
check_port 8000 "Backend Django"
check_port 3000 "Frontend React"
check_port 5432 "PostgreSQL"
check_port 8001 "API Externa (conflicto potencial)"

# Verificar contenedores Docker
check_docker_ports

# Verificar archivos de configuración
echo ""
echo -e "${BLUE}📁 Verificando archivos de configuración:${NC}"

# Verificar docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.yml encontrado${NC}"
    echo "Puertos configurados:"
    grep -E "ports:|-[0-9]+:" docker-compose.yml | grep -v "#" | head -10
else
    echo -e "${RED}❌ docker-compose.yml no encontrado${NC}"
fi

# Verificar docker-compose.local.yml
if [ -f "docker-compose.local.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.local.yml encontrado${NC}"
    echo "Puertos configurados:"
    grep -E "ports:|-[0-9]+:" docker-compose.local.yml | grep -v "#" | head -10
else
    echo -e "${RED}❌ docker-compose.local.yml no encontrado${NC}"
fi

# Verificar archivo .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
    echo "Variables de puerto:"
    grep -E "PORT|HOST" .env | head -5
else
    echo -e "${YELLOW}⚠️ Archivo .env no encontrado${NC}"
fi

echo ""
echo -e "${BLUE}📊 Resumen de recomendaciones:${NC}"
echo "1. ✅ Puerto 8000: Backend Django"
echo "2. ✅ Puerto 3000: Frontend React"
echo "3. ✅ Puerto 5432: PostgreSQL"
echo "4. ⚠️ Puerto 8001: Verificar si hay conflictos con otros servicios"
echo ""
echo -e "${YELLOW}💡 Si hay conflictos, considera:${NC}"
echo "- Cambiar puertos en docker-compose.yml"
echo "- Detener servicios que no necesites"
echo "- Usar puertos alternativos (ej: 8002, 3001, 5433)"
