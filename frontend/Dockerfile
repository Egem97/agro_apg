# Etapa de construcción
FROM node:18-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Verificar que los archivos estén presentes
RUN ls -la && echo "=== PUBLIC DIR ===" && ls -la public/

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar archivos construidos
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Script de health check
COPY docker-healthcheck.sh /docker-healthcheck.sh
RUN chmod +x /docker-healthcheck.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /docker-healthcheck.sh

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]



