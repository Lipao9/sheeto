# syntax=docker/dockerfile:1

FROM php:8.4-cli AS build
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip nodejs npm \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader --no-scripts
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN mkdir -p bootstrap/cache storage \
    && chmod -R 775 bootstrap/cache storage
RUN php artisan package:discover --ansi
RUN npm run build

FROM php:8.4-cli
WORKDIR /var/www/html
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libpq5 \
    && docker-php-ext-install pdo_pgsql \
    && apt-get purge -y --auto-remove libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY . .
COPY --from=build /app/vendor /var/www/html/vendor
COPY --from=build /app/public/build /var/www/html/public/build
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache
USER www-data
EXPOSE 8000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8000} -t public"]
