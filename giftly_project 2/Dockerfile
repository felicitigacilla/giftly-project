FROM php:8.2-apache

# Install PostgreSQL extension for Laravel/PHP app compatibility
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

# Enable Apache rewrite support
RUN a2enmod rewrite

# Copy app files
COPY . /var/www/html/

# Add Render-compatible startup script
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]
