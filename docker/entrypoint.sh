#!/usr/bin/env bash
set -e

# Render define PORT automaticamente. Se não vier, usa 8080.
export PORT="${PORT:-8080}"
export PHP_FPM_LISTEN="${PHP_FPM_LISTEN:-127.0.0.1:9000}"

# Gera config do Nginx com PORT dinâmico
envsubst '${PORT} ${PHP_FPM_LISTEN}' \
  < /etc/nginx/http.d/default.conf.template \
  > /etc/nginx/http.d/default.conf

# Opcional (muito comum no Render): preparar cache no boot
# Cuidado: config:cache depende do .env completo estar setado no Render
php artisan storage:link || true
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Se você quiser rodar migrate automaticamente (nem todo mundo quer):
# php artisan migrate --force || true

exec supervisord -c /etc/supervisord.conf