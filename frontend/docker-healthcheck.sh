#!/bin/sh

# Health check para el frontend
# Verifica que nginx esté respondiendo en el puerto 3000

if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    exit 0
else
    exit 1
fi
