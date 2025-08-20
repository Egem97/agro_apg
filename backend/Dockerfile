FROM python:3.11-slim

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=agro_backend.settings

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        curl \
        sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install gunicorn

# Copiar el código del proyecto
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/staticfiles /app/media /app/logs

# Crear usuario no-root para seguridad
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app

# Script de inicialización
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER appuser

# Exponer puerto
EXPOSE 8000

# Comando de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]



