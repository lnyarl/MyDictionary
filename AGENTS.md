# Stashy Agent Guidelines

This document provides essential information for AI agents working on the Stashy codebase.

## Project Overview
Stashy is a full-stack dictionary application.
- **Backend**: NestJS with Knex.js and PostgreSQL.
- **Frontend**: React 19, Vite, Radix UI, Tailwind CSS.
- **Admin**: Separate backend and frontend for administrative tasks.
- **Shared**: Common code in the `shared` workspace, including DTOs and constants.

## Build, Lint, and Test Commands

### Global
- **Database Reset**: `yarn db:reset` (runs `scripts/db-reset.js`)
- **Dev Mode**: `yarn dev` (runs everything via concurrently)
- **Docker Dev**: `yarn docker:dev`
- **Build All**: `yarn build:all`

### Backend (`/backend` & `/backend-admin`)
- **Build**: `yarn build` (NestJS CLI)
- **Lint**: `yarn lint` (Biome)
- **Format**: `yarn format` (Biome)
- **Test (All)**: `yarn test` (Jest)
- **Test (Single file)**: `npx jest src/path/to/test.spec.ts`
- **Test (E2E)**: `yarn test:e2e`
- **Dev**: `yarn start:dev`

### Frontend (`/frontend` & `/frontend-admin`)
- **Build**: `yarn build` (Vite)
- **Lint**: `yarn lint` (Biome)
- **Type Check**: `yarn type-check` (tsc)
- **Dev**: `yarn dev` (Vite)

## Code Style & Conventions

### Formatting & Linting
- **Primary Tool**: [Biome](https://biomejs.dev/) is used for both linting and formatting.
- **Indentation**: 
  - Root/Backend: 2 spaces.
  - Frontend: Tabs (essential for UI components and pages).
- **Quotes**: Double quotes for all strings.
- **Imports**: Biome automatically organizes imports. 
  - Always use `import type` for type-only imports to improve compilation performance and avoid circular dependencies.
  - Group imports: standard libraries, external packages, internal shared modules, local modules.

### Naming Conventions
- **Files**:
  - Components/Pages/Layouts: PascalCase (`Header.tsx`, `DashboardPage.tsx`, `AuthLayout.tsx`).
  - DTOs/Entities/Services/Controllers: kebab-case (`create-word.dto.ts`, `user.entity.ts`).
  - Utility/Scripts: kebab-case (`db-reset.js`, `migrate.js`).
- **NestJS Architecture**:
  - Controllers: `*Controller` (e.g., `WordsController`)
  - Services: `*Service` (e.g., `WordsService`)
  - Repositories: `*Repository` (e.g., `WordsRepository` extending `BaseRepository`)
  - DTOs: `*Dto` (e.g., `CreateWordDto`)
  - Entities: `*Entity` (e.g., `UserEntity`)
- **Frontend Architecture**:
  - Pages: PascalCase + `Page` suffix (e.g., `SettingsPage`).
  - Contexts: PascalCase + `Provider`/`Context` (e.g., `AuthProvider`).
  - Hooks: `use*` prefix (e.g., `useAuth`).

### Type Safety
- **TypeScript**: Strictly mandatory. Avoid `any` at all costs.
- **Shared Workspace**: Definitions used by both FE and BE must reside in `shared/`.
- **Interfaces**: Prefer `interface` for object shapes and `type` for unions/aliases.

### Error Handling & Validation
- **Backend**:
  - Use `HttpException` (and subclasses like `NotFoundException`, `BadRequestException`) for API responses.
  - Global error handling is centralized in `HttpExceptionFilter`.
  - Use `class-validator` decorators in DTOs for automatic input validation.
- **Frontend**:
  - Use the `Toaster` component (`useToast` hook) for displaying errors/success messages to users.
  - Handle API errors gracefully in services or hooks.

## Implementation Patterns

### Database (Knex.js)
- **Repositories**: All repository classes should extend `BaseRepository` from `common/database`.
- **Soft Deletes**: Use the `deleted_at` column. `BaseRepository` provides a `query()` method that filters out deleted records by default.
- **Transactions**: Use `this.transaction(async (trx) => { ... })` for atomic operations involving multiple tables.
- **Migrations**: SQL-based migrations are located in `migrations/` folders and run via `migrate.js`.
- Avoid using Triggers and Functions

### Authentication
- **Backend**: Passport.js with JWT and Google OAuth strategies. Use `@CurrentUser()` decorator to access authenticated user info.
- **Frontend**: `AuthContext` provides authentication state. Use `AuthLayout` to protect routes.

## Agent Guidelines & Workflow

- **Diagnostics**: Always run `lsp_diagnostics` on modified files before submitting.
- **Tests**: Before declaring a task complete, run relevant unit or E2E tests. For backend changes, `yarn test` is mandatory.
- **Refactoring**: Keep changes focused. Do not refactor code outside the scope of your assigned task unless explicitly requested.
- **Indentation Check**: Double-check indentation before saving. Biome will complain if you use spaces in frontend or tabs in backend.
- **Git Safety**: Do not run `git push` or `git commit` unless the user explicitly requests it.
- **Environment**: Use `.env.example` as a template for new environment variables.

## Common Agent Recipes

### Adding a new API endpoint
1. Create/Update DTO in `shared/` or `backend/src/*/dto/`.
2. Implement logic in the corresponding `Service`.
3. Add the route handler to the `Controller`.
4. Run `yarn lint` and `yarn build` in the backend.

### Creating a new Frontend component
1. Create a new `.tsx` file in `frontend/src/components/` using PascalCase.
2. Use Radix UI primitives for accessible UI components.
3. Ensure the file uses **Tabs** for indentation.
4. Run `yarn type-check` in the frontend.

---
*This file is intended for agent consumption. Maintain its clarity and accuracy.*
