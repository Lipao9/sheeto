# -------------------------
# 1) Frontend build (Vite)
# -------------------------
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# -------------------------
# 2) PHP deps (Composer)
# -------------------------
FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

# Se você usa scripts do Composer que dependem de artisan/env, comente a linha acima e use:
# RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts


# -------------------------
# 3) Runtime (Nginx + PHP-FPM)
# -------------------------
FROM php:8.3-fpm-alpine AS app
WORKDIR /var/www/html

# Pacotes do sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
    bash \
    curl \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev

# Extensões PHP comuns (ajuste conforme seu projeto)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_pgsql \
    intl \
    zip \
    mbstring \
    gd \
    opcache

# Copia código
COPY . .

# Copia vendor do estágio do composer
COPY --from=vendor /app/vendor ./vendor

# Copia assets buildados (Vite geralmente gera em public/build)
COPY --from=frontend /app/public/build ./public/build

# Configs Nginx + Supervisor + entrypoint
COPY docker/nginx.conf.template /etc/nginx/http.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Permissões Laravel
RUN addgroup -g 1000 -S appgroup && adduser -u 1000 -S appuser -G appgroup \
    && chown -R appuser:appgroup /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Render usa PORT (dinâmico). Nginx vai ouvir nele via template.
ENV PHP_FPM_LISTEN=127.0.0.1:9000

EXPOSE 8080
CMD ["/entrypoint.sh"]