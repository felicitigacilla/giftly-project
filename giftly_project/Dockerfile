FROM php:8.2-apache

# Install MySQL and PostgreSQL extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install mysqli pdo_mysql pdo_pgsql pgsql

# Enable mod_rewrite for Apache
RUN a2enmod rewrite

# Copy all files from current directory to /var/www/html/
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80