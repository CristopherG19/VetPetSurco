#!/bin/sh
set -e

# Solución para Railway: asegurar que solo mpm_prefork esté activo en Apache
a2dismod mpm_event 2>/dev/null || true
a2dismod mpm_worker 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true

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
