#!/bin/sh
set -e

# Configurar ServerName para evitar advertencias de Apache
grep -q "ServerName localhost" /etc/apache2/apache2.conf 2>/dev/null || echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Configurar puertos de Apache: escuchar en 80 y en el puerto dinámico de Railway sin duplicados
APP_PORT="${PORT:-8080}"

if [ "$APP_PORT" = "80" ]; then
    printf "Listen 80\n" > /etc/apache2/ports.conf
    VHOST_PORTS="*:80"
else
    printf "Listen 80\nListen %s\n" "$APP_PORT" > /etc/apache2/ports.conf
    VHOST_PORTS="*:80 *:$APP_PORT"
fi

cat <<EOF > /etc/apache2/sites-available/000-default.conf
<VirtualHost $VHOST_PORTS>
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

# Asegurar permisos de carpetas de almacenamiento y caché de Laravel
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

echo ">> Iniciando Apache en $VHOST_PORTS..."
exec apache2-foreground
