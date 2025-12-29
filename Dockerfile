# -------------------------
# 1) Build stage (PHP + Composer + Node)
#    This allows @laravel/vite-plugin-wayfinder to run artisan during `npm run build`.
# -------------------------
FROM php:8.4-cli-alpine AS build
WORKDIR /app

# System deps + Node (for Vite build)
RUN apk add --no-cache \
    bash curl git unzip \
    icu-dev libzip-dev oniguruma-dev postgresql-dev \
    nodejs npm

# PHP extensions needed for Laravel boot + DB (Postgres)
RUN docker-php-ext-install -j$(nproc) \
    pdo pdo_pgsql intl zip mbstring

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP deps (vendor)
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --no-scripts

# Install Node deps
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Laravel expects these directories to exist and be writable.
# They are often empty in git (git-ignored), so they may be missing during Docker builds.
RUN mkdir -p bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
 && chmod -R 775 bootstrap/cache storage

# Ensure an .env exists for build-time artisan calls (Wayfinder).
# Render does not provide runtime env vars during image build.
RUN if [ ! -f .env ]; then \
  printf "APP_ENV=production\nAPP_DEBUG=false\nAPP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\nDB_CONNECTION=sqlite\nDB_DATABASE=/tmp/db.sqlite\n" > .env; \
  fi

# Run Composer post-autoload scripts now that the app code is present.
RUN composer run-script post-autoload-dump --no-interaction

# Build assets
RUN npm run build


# -------------------------
# 2) Runtime (Nginx + PHP-FPM + Supervisor)
# -------------------------
FROM php:8.4-fpm-alpine AS app
WORKDIR /var/www/html

# System packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    bash \
    curl \
    gettext \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_pgsql \
    intl \
    zip \
    mbstring \
    gd \
    opcache

RUN sed -i 's/^;clear_env = no/clear_env = no/' /usr/local/etc/php-fpm.d/www.conf \
 && sed -i 's/^;catch_workers_output = yes/catch_workers_output = yes/' /usr/local/etc/php-fpm.d/www.conf \
 && sed -i 's/^user = .*/user = appuser/' /usr/local/etc/php-fpm.d/www.conf \
 && sed -i 's/^group = .*/group = appgroup/' /usr/local/etc/php-fpm.d/www.conf \
 && sed -i 's/^listen = .*/listen = 127.0.0.1:9000/' /usr/local/etc/php-fpm.d/www.conf

# Copy app code
COPY . .

# Copy vendor + built assets from build stage
COPY --from=build /app/vendor ./vendor
COPY --from=build /app/public/build ./public/build

# Configs
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Permissions for Laravel
# These directories may be missing in the runtime image (often empty + git-ignored),
# so create them before chmod/chown.
RUN addgroup -g 1000 -S appgroup && adduser -u 1000 -S appuser -G appgroup \
 && mkdir -p /var/www/html/bootstrap/cache \
            /var/www/html/storage/framework/cache \
            /var/www/html/storage/framework/sessions \
            /var/www/html/storage/framework/views \
 && chown -R appuser:appgroup /var/www/html \
 && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Render uses dynamic PORT; Nginx will listen on it via template.
ENV PHP_FPM_LISTEN=127.0.0.1:9000

EXPOSE 8080
CMD ["/entrypoint.sh"]
