# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stashy** is a personal dictionary application where users stash terms and write definitions. The core domain model:
- **Term**: A global vocabulary entry (the word concept itself)
- **Word**: A user's personal stash entry linking to a term
- **Definition**: A user's definition for a word (can be public or private)

Public definitions are searchable by all users; users can like, follow each other, earn badges, and receive notifications.

## Monorepo Structure

```
backend/          # NestJS API (port 3000)
backend-admin/    # NestJS Admin API
frontend/         # React 19 + Vite user app (port 5173)
frontend-admin/   # React 19 + Vite admin app
shared/           # DTOs, entities, constants shared across all packages
```

Each package has its own `node_modules` and `package.json`. The root `node_modules` contains some shared dev tooling.

## Development Commands

### Setup
```bash
# Install all dependencies (run from each package directory)
cd backend && yarn install
cd frontend && yarn install
cd backend-admin && yarn install
cd frontend-admin && yarn install
cd shared && yarn install
```

### Running Locally
```bash
# Start PostgreSQL + Redis via Docker (required before running backend)
make dev  # or: docker compose -f docker-compose.dev.yml up -d

# Backend (also builds shared first)
cd backend && yarn dev

# Frontend
cd frontend && yarn dev

# Backend-admin
cd backend-admin && yarn dev

# Frontend-admin
cd frontend-admin && yarn dev
```

### Shared Package
The `shared` package must be built before the backend starts. The backend `dev` script handles this automatically (`cd ../shared && yarn build && cd ../backend && nest start --watch`). When making changes to `shared`, rebuild it:
```bash
cd shared && yarn build
```

### Testing (Backend)
```bash
# Unit tests
cd backend && yarn test

# Run a single test file
cd backend && yarn test --testPathPattern=words.repository

# Watch mode
cd backend && yarn test:watch

# E2E tests (requires Docker test DB)
cd backend && yarn test:docker:up
cd backend && yarn test:e2e
cd backend && yarn test:docker:down

# CI (spins up Docker, runs tests, tears down)
cd backend && yarn test:ci
```

### Linting & Formatting
All packages use **Biome** (not ESLint/Prettier):
```bash
cd backend && yarn lint        # lint + auto-fix
cd backend && yarn lint:check  # check only (no writes)
cd frontend && yarn lint
cd frontend && yarn type-check # tsc type checking
```

## Architecture

### Backend (`backend/`)

**NestJS** with standard module structure per domain: `module → controller → service → repository`. Database access uses **Knex.js** (raw query builder, no ORM).

Key patterns:
- `KNEX_CONNECTION` token injected via `knexProvider` — repositories receive Knex via DI
- `@Public()` decorator bypasses the global `JwtAuthGuard`; most routes require JWT by default
- `OptionalAuthGuard` allows unauthenticated access while still resolving a user if a token is present
- Errors use `BusinessException` (with typed `ErrorCode` from `@stashy/shared`) and helper functions: `badRequest()`, `notFound()`, `conflict()`, `forbidden()`, `unauthorized()`
- Event system: `EventEmitterService` enqueues events to a **BullMQ** queue named `"events"`; `EventsProcessor` dispatches jobs to registered `EventHandler` implementations by `EventType`
- Redis via `ioredis` for caching (`CacheService`)
- S3 for file storage (`StorageService` interface with `S3StorageService` implementation)
- i18n via `nestjs-i18n`

Domain modules: `words`, `terms`, `definitions`, `likes`, `follows`, `users`, `auth`, `badges`, `notifications`, `reports`, `feed`, `login-streaks`, `sitemap`

**Auth flow**: Google OAuth → JWT access token + refresh token (stored in DB). `@stashy/backend` uses `passport-jwt` strategy.

### Frontend (`frontend/`)

**React 19** with:
- **React Query** (`@tanstack/react-query`) for all server state — API functions in `src/lib/api/`
- **Zustand** for client-side global state
- **React Router v7** for routing; `AuthLayout` wraps protected routes
- **Tiptap** rich text editor for definition content
- **i18next** for internationalization
- **shadcn/ui** components (Radix UI primitives + Tailwind CSS v4)
- `AuthProvider` context manages the current user session

### Shared (`shared/`)

Exported from `shared/src/index.ts`. Contains:
- TypeScript entity types (`User`, `Term`, `Definition`, `Word`, etc.)
- DTOs with class-validator decorators (used in both backend validation and frontend type-checking)
- `ErrorCode` constants
- DB table name constants
- Utility functions (`uuid`, `generate-nickname`)

Module alias `@stashy/shared` resolves to the built `dist/` in production and to `shared/src/` in Jest via `moduleNameMapper`.

### Database

PostgreSQL accessed via Knex.js. No migrations framework visible — schema is managed externally. Test helpers in `backend/src/test/helper/` spin up a real test DB from `docker-compose.test.yml` and call `setupSchema()` to initialize tables.
