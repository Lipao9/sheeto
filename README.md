# Sheeto

Plataforma de estudos com inteligência artificial que ajuda estudantes a praticar e revisar conteúdos de forma personalizada.

## O que é

O Sheeto gera materiais de estudo sob medida usando IA. O estudante informa a disciplina, tema e nível de dificuldade, e a plataforma entrega o material pronto para praticar.

## Para quem

- Estudantes do ensino fundamental, médio e superior
- Qualquer pessoa que queira praticar e revisar conteúdos de forma estruturada

## Funcionalidades

### Disponíveis

- **Listas de exercícios** — Geração de listas com questões personalizadas (múltipla escolha, discursivas, V/F, problemas práticos), com gabarito e explicações

### Em desenvolvimento

- **Resumos inteligentes** — Transformação de conteúdos em resumos claros e objetivos
- **Simulados personalizados** — Montagem de simulados sob medida para provas e vestibulares
- **Flashcards** — Cartões de memorização para fixação de conceitos

## Stack

- **Backend:** Laravel 12, PHP 8.4
- **Frontend:** React 19, Inertia.js v2, TypeScript
- **Estilo:** Tailwind CSS v4
- **IA:** Geração de conteúdo via modelos de linguagem
- **Auth:** Laravel Fortify + Google OAuth (Socialite)
- **Testes:** Pest v4

## Rodando localmente

```bash
# Instalar dependências
composer install
npm install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Rodar migrations
php artisan migrate

# Iniciar desenvolvimento
composer run dev
```

## Testes

```bash
php artisan test --compact
```

## Formatação

```bash
vendor/bin/pint --dirty
npm run format
npm run lint
```
