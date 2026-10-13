#!/bin/sh
set -e

# Asegurar permisos de carpetas de escritura
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Ejecutar migraciones automáticamente si se define la variable
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo ">> Ejecutando migraciones y seeders de Laravel..."
    php artisan migrate --force --seed || true
fi

# Optimizar caché si existe la clave de la aplicación
if [ -n "$APP_KEY" ]; then
    echo ">> Cacheando configuraciones de Laravel..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo ">> Iniciando Apache..."
exec apache2-foreground
