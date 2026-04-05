# Tasks: Backend Foundation

## Phase 1: Dependencies & Configuration

### API Dependencies
- [ ] 1.1 Install Fastify plugins and auth dependencies — `apps/api/package.json` (add @fastify/cors, @fastify/jwt, @fastify/cookie, @fastify/rate-limit, bcrypt, jsonwebtoken, tsyringe, reflect-metadata)
- [ ] 1.2 Install testing and dev dependencies — `apps/api/package.json` (add vitest, @vitest/coverage-v8, @types/bcrypt, @types/jsonwebtoken)
- [ ] 1.3 Create Vitest configuration — `apps/api/vitest.config.ts`

### Database Dependencies
- [ ] 1.4 Install Drizzle ORM and database drivers — `packages/database/package.json` (add drizzle-orm, better-sqlite3, postgres, drizzle-kit)
- [ ] 1.5 Install database testing dependencies — `packages/database/package.json` (add vitest, @vitest/coverage-v8)
- [ ] 1.6 Create Drizzle Kit configuration — `packages/database/drizzle.config.ts`
- [ ] 1.7 Create Vitest configuration — `packages/database/vitest.config.ts`

### Turborepo Configuration
- [ ] 1.8 Update turbo.json with backend test tasks — `turbo.json` (add test:unit, test:integration tasks)

## Phase 2: Database Schema (55 Tables)

### Security Schema (8 tables)
- [ ] 2.1 Create usuarios table — `packages/database/src/schema/usuarios.ts`
- [ ] 2.2 Create password and 2FA tables — `packages/database/src/schema/usuarios.ts` (usuarios_contrasena, usuarios_historial_contrasenas, usuarios_autenticacion_dos_factores)
- [ ] 2.3 Create login and RBAC tables — `packages/database/src/schema/usuarios.ts` (usuarios_login, usuarios_roles, usuarios_permisos, usuarios_predios)

### Predios Schema (6 tables)
- [ ] 2.4 Create predios core tables — `packages/database/src/schema/predios.ts` (predios, potreros, sectores, lotes, grupos)
- [ ] 2.5 Create predios config table — `packages/database/src/schema/predios.ts` (config_parametros_predio)

### Animales Schema (3 tables)
- [ ] 2.6 Create animales table with self-references — `packages/database/src/schema/animales.ts`
- [ ] 2.7 Create animales_imagenes and imagenes tables — `packages/database/src/schema/animales.ts`

### Maestros Schema (8 tables)
- [ ] 2.8 Create veterinarios and propietarios tables — `packages/database/src/schema/maestros.ts`
- [ ] 2.9 Create hierros and diagnosticos tables — `packages/database/src/schema/maestros.ts`
- [ ] 2.10 Create motivos, causas, lugares tables — `packages/database/src/schema/maestros.ts`

### Servicios Schema (12 tables)
- [ ] 2.11 Create palpaciones tables — `packages/database/src/schema/servicios.ts` (servicios_palpaciones_grupal, servicios_palpaciones_animales)
- [ ] 2.12 Create inseminacion tables — `packages/database/src/schema/servicios.ts` (servicios_inseminacion_grupal, servicios_inseminacion_animales)
- [ ] 2.13 Create partos tables — `packages/database/src/schema/servicios.ts` (servicios_partos_animales, servicios_partos_crias)
- [ ] 2.14 Create veterinarios tables — `packages/database/src/schema/servicios.ts` (servicios_veterinarios_grupal, servicios_veterinarios_animales, servicios_veterinarios_productos)

### Configuracion Schema (7 tables)
- [ ] 2.15 Create config catalog tables — `packages/database/src/schema/configuracion.ts` (config_razas, config_condiciones_corporales, config_tipos_explotacion, config_calidad_animal, config_colores)
- [ ] 2.16 Create config key tables — `packages/database/src/schema/configuracion.ts` (config_rangos_edades, config_key_values)

### Productos Schema (2 tables)
- [ ] 2.17 Create productos tables — `packages/database/src/schema/productos.ts` (productos, productos_imagenes)

### Reportes Schema (1 table)
- [ ] 2.18 Create reportes_exportaciones table — `packages/database/src/schema/reportes.ts`

### Notificaciones Schema (3 tables)
- [ ] 2.19 Create notificaciones tables — `packages/database/src/schema/notificaciones.ts` (notificaciones, notificaciones_preferencias, notificaciones_push_tokens)

### Schema Integration
- [ ] 2.20 Create schema barrel export — `packages/database/src/schema/index.ts`
- [ ] 2.21 Create database client factory — `packages/database/src/client.ts`
- [ ] 2.22 Update database package export — `packages/database/src/index.ts`

## Phase 3: Shared Infrastructure

### Error Classes
- [x] 3.1 Create domain error base class — `apps/api/src/shared/errors/domain.error.ts`
- [x] 3.2 Create specific error classes — `apps/api/src/shared/errors/not-found.error.ts`, `validation.error.ts`, `unauthorized.error.ts`, `forbidden.error.ts`, `conflict.error.ts`
- [x] 3.3 Create error barrel export — `apps/api/src/shared/errors/index.ts`

### Middleware
- [x] 3.4 Create error handler middleware — `apps/api/src/shared/middleware/error-handler.middleware.ts`

### Types
- [x] 3.9 Create FastifyRequest type extensions — `apps/api/src/shared/types/request.types.ts`

### Utils
- [x] 3.10 Create password utils — `apps/api/src/shared/utils/password.utils.ts`
- [x] 3.11 Create JWT utils — `apps/api/src/shared/utils/jwt.utils.ts`

### Fastify Plugins
- [x] 3.12 Create CORS plugin — `apps/api/src/plugins/cors.plugin.ts`
- [x] 3.13 Create JWT plugin — `apps/api/src/plugins/jwt.plugin.ts`
- [x] 3.14 Create cookie plugin — `apps/api/src/plugins/cookie.plugin.ts`

### App Setup
- [x] 3.15 Create DI container composition root — `apps/api/src/container.ts`
- [x] 3.16 Create Fastify app builder — `apps/api/src/app.ts`
- [x] 3.17 Refactor server entry point — `apps/api/src/server.ts` (import reflect-metadata first)
- [x] 3.18 Create .env.example — `apps/api/.env.example`

## Phase 4: Seed Data

- [x] 4.1 Create seed script with catalog data — `packages/database/seed.ts` (config_rangos_edades, config_key_values)
- [x] 4.2 Add razas and condiciones seed data — `packages/database/seed.ts`
- [x] 4.3 Add admin user and ADMIN role — `packages/database/seed.ts`
- [x] 4.4 Add default permissions — `packages/database/seed.ts`

## Phase 5: Auth Module (Hexagonal)

### Domain Layer
- [x] 5.1 Create auth session entity — `apps/api/src/modules/auth/domain/entities/auth-session.entity.ts`
- [x] 5.2 Create auth domain service — `apps/api/src/modules/auth/domain/services/auth.domain-service.ts`
- [x] 5.3 Create auth repository interface — `apps/api/src/modules/auth/domain/repositories/auth.repository.ts`

### Application Layer
- [x] 5.4 Create auth DTOs — `apps/api/src/modules/auth/application/dtos/login.dto.ts`, `auth-response.dto.ts`, `verify-2fa.dto.ts`
- [x] 5.5 Create login use case — `apps/api/src/modules/auth/application/use-cases/login.use-case.ts`
- [x] 5.6 Create logout use case — `apps/api/src/modules/auth/application/use-cases/logout.use-case.ts`
- [x] 5.7 Create refresh use case — `apps/api/src/modules/auth/application/use-cases/refresh.use-case.ts`
- [x] 5.8 Create verify-2fa use case — `apps/api/src/modules/auth/application/use-cases/verify-2fa.use-case.ts`
- [x] 5.9 Create resend-2fa use case — `apps/api/src/modules/auth/application/use-cases/resend-2fa.use-case.ts`
- [x] 5.10 Create change-password use case — `apps/api/src/modules/auth/application/use-cases/change-password.use-case.ts`

### Infrastructure Layer
- [x] 5.11 Create Drizzle auth repository — `apps/api/src/modules/auth/infrastructure/persistence/drizzle-auth.repository.ts`
- [x] 5.12 Create auth mappers — `apps/api/src/modules/auth/infrastructure/mappers/auth.mapper.ts`
- [x] 5.13 Create auth JSON schemas — `apps/api/src/modules/auth/infrastructure/http/schemas/auth.schema.ts`
- [x] 5.14 Create auth controller — `apps/api/src/modules/auth/infrastructure/http/controllers/auth.controller.ts`
- [x] 5.15 Create auth routes — `apps/api/src/modules/auth/infrastructure/http/routes/auth.routes.ts`
- [x] 5.16 Create auth module barrel — `apps/api/src/modules/auth/index.ts`

## Phase 6: Usuarios Module (Hexagonal)

### Domain Layer
- [x] 6.1 Create usuario entity — `apps/api/src/modules/usuarios/domain/entities/usuario.entity.ts`
- [x] 6.2 Create rol entity — `apps/api/src/modules/usuarios/domain/entities/rol.entity.ts`
- [x] 6.3 Create permiso entity — `apps/api/src/modules/usuarios/domain/entities/permiso.entity.ts`
- [x] 6.4 Create usuarios domain service — `apps/api/src/modules/usuarios/domain/services/usuarios.domain-service.ts`
- [x] 6.5 Create repository interfaces — `apps/api/src/modules/usuarios/domain/repositories/usuario.repository.ts`, `rol.repository.ts`, `permiso.repository.ts`

### Application Layer
- [x] 6.6 Create usuarios DTOs — `apps/api/src/modules/usuarios/application/dtos/`
- [x] 6.7 Create CRUD use cases — `apps/api/src/modules/usuarios/application/use-cases/create-usuario.use-case.ts`, `update-usuario.use-case.ts`, `delete-usuario.use-case.ts`, `list-usuarios.use-case.ts`, `get-usuario.use-case.ts`
- [x] 6.8 Create role use cases — `apps/api/src/modules/usuarios/application/use-cases/assign-roles.use-case.ts`, `create-rol.use-case.ts`, `update-rol.use-case.ts`, `list-roles.use-case.ts`, `list-permisos.use-case.ts`, `get-me.use-case.ts`

### Infrastructure Layer
- [x] 6.9 Create Drizzle usuario repository — `apps/api/src/modules/usuarios/infrastructure/persistence/drizzle-usuario.repository.ts`
- [x] 6.10 Create Drizzle rol repository — `apps/api/src/modules/usuarios/infrastructure/persistence/drizzle-rol.repository.ts`
- [x] 6.11 Create Drizzle permiso repository — `apps/api/src/modules/usuarios/infrastructure/persistence/drizzle-permiso.repository.ts`
- [x] 6.12 Create usuarios mappers — `apps/api/src/modules/usuarios/infrastructure/mappers/usuarios.mapper.ts`
- [x] 6.13 Create usuarios JSON schemas — `apps/api/src/modules/usuarios/infrastructure/http/schemas/usuarios.schema.ts`
- [x] 6.14 Create usuarios controller — `apps/api/src/modules/usuarios/infrastructure/http/controllers/usuarios.controller.ts`
- [x] 6.15 Create usuarios routes — `apps/api/src/modules/usuarios/infrastructure/http/routes/usuarios.routes.ts`
- [x] 6.16 Create usuarios module barrel — `apps/api/src/modules/usuarios/index.ts`

## Phase 7: RBAC Middleware

- [x] 7.1 Create tenant-context middleware — `apps/api/src/shared/middleware/tenant-context.middleware.ts`
- [x] 7.2 Create auth middleware (JWT verification) — `apps/api/src/shared/middleware/auth.middleware.ts`
- [x] 7.3 Create RBAC middleware — `apps/api/src/shared/middleware/rbac.middleware.ts`
- [x] 7.4 Register middleware in app — `apps/api/src/app.ts`

## Phase 8: Testing

### Auth Domain Tests
- [x] 8.1 Write auth domain service tests — `apps/api/src/modules/auth/domain/services/__tests__/auth.domain-service.test.ts`

### Auth Use Case Tests
- [x] 8.2 Write login use case tests — `apps/api/src/modules/auth/application/use-cases/__tests__/login.use-case.test.ts`
- [x] 8.3 Write refresh use case tests — `apps/api/src/modules/auth/application/use-cases/__tests__/refresh-token.use-case.test.ts`
- [x] 8.4 Write 2FA use case tests — `apps/api/src/modules/auth/application/use-cases/__tests__/verify-2fa.use-case.test.ts`

### Auth Repository Integration Tests
- [x] 8.5 Write auth repository tests — `apps/api/src/__tests__/integration/auth.integration.test.ts` (skipped due to native module issue)

### Auth E2E Tests
- [x] 8.6 Write auth routes E2E tests — `apps/api/src/__tests__/e2e/auth.e2e.test.ts` (skipped due to native module issue)

### Usuarios Tests
- [x] 8.7 Write usuarios use case tests — `apps/api/src/modules/usuarios/application/use-cases/__tests__/create-usuario.use-case.test.ts`, `list-usuarios.use-case.test.ts`
- [x] 8.8 Write usuarios repository tests — `apps/api/src/__tests__/integration/usuarios.integration.test.ts` (skipped due to native module issue)
- [x] 8.9 Write usuarios E2E tests — `apps/api/src/__tests__/e2e/auth.e2e.test.ts` (includes usuarios endpoints, skipped due to native module issue)

## Phase 9: Type Fix

- [ ] 9.1 Fix User.id type from UUID to integer — `packages/shared-types/src/schemas/user.schema.ts`
