#!/bin/sh
set -e

# Configurar Apache para escuchar en el puerto asignado por Railway ($PORT), en el 8080 y en el 80
APP_PORT="${PORT:-8080}"

echo "ServerName localhost" >> /etc/apache2/apache2.conf 2>/dev/null || true

cat <<EOF > /etc/apache2/ports.conf
Listen 80
Listen 8080
Listen $APP_PORT
EOF

cat <<EOF > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80 *:8080 *:$APP_PORT>
    DocumentRoot /var/www/html/public
    <Directory /var/www/html/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

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

echo ">> Iniciando Apache en puertos 80, 8080 y $APP_PORT..."
exec apache2-foreground
