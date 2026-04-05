# Proposal: backend-foundation

## Intent

Build the backend foundation for GanaTrack Phase 1: a working API with authentication and user management. The frontend (320+ tests passing) is complete; the backend is currently a 21-line skeleton. This change establishes the hexagonal architecture pattern, Drizzle ORM schema for all 55 tables, auth module (login, JWT, 2FA, refresh), usuarios module (CRUD + RBAC), shared infrastructure (errors, middleware, DI container), and Vitest testing setup.

## Scope

### In Scope
- **Database Package**: All 55 Drizzle tables across 10 schema files (security, predios, animales, maestros, servicios, configuracion, productos, reportes, notificaciones) with dual SQLite/PostgreSQL support
- **Auth Module**: Login (with 2FA flow), JWT access/refresh tokens, logout, password change, tenant context middleware
- **Usuarios Module**: CRUD for users, roles, permissions; RBAC authorization middleware
- **Shared Infrastructure**: Error classes, response formatter, DI container setup (tsyringe), Fastify plugins (CORS, JWT, rate-limit)
- **Testing Setup**: Vitest configuration for apps/api and packages/database
- **Seed Data**: Catalog tables (config_*) + default admin user
- **Type Fix**: Correct shared-types User.id from UUID to integer (PRD compliance)

### Out of Scope
- Modules beyond auth and usuarios (predios, animales, servicios, etc.) — those are Phase 2+
- Reportes and Notificaciones modules — Phase 4+ and 5+
- Email/Push notification infrastructure — Phase 5
- PDF/Excel export libraries — Phase 4
- BullMQ/Redis job queues — Phase 4

## Capabilities

### New Capabilities
- `auth-api`: Login, logout, token refresh, 2FA verification, password change endpoints
- `usuarios-api`: User CRUD, role management, permission assignment endpoints
- `database-schema`: Complete Drizzle ORM schema for all 55 tables with migrations
- `rbac-authorization`: Permission-based access control middleware

### Modified Capabilities
- None (this is foundation work; no existing backend capabilities to modify)

## Approach

### Architecture Pattern
Hexagonal (Ports & Adapters) with strict layer separation:
- **Domain**: Pure entities, value objects, repository interfaces (no framework dependencies)
- **Application**: Use cases orchestrating business logic (depend only on interfaces)
- **Infrastructure**: Drizzle repositories, Fastify controllers/routes/schemas, mappers

### Database Strategy
- **Phase 1a**: Create all 55 table schemas first (enable foreign key validation)
- **Phase 1b**: Run migrations, apply seed data
- **Dual Driver**: Client factory reads `DATABASE_PROVIDER` env var (sqlite/postgresql)

### DI Setup
- `reflect-metadata` imported as first line in `server.ts`
- Module barrel exports register dependencies via `container.ts`
- Use cases decorated with `@injectable()`, receive repositories via `@inject()`

### Implementation Order
1. **Infrastructure**: Database client, DI container, Fastify plugins, error classes
2. **Auth Module**: Domain entities → Use cases → Repository interfaces → Drizzle repos → Controllers → Routes
3. **Usuarios Module**: Same layer-by-layer approach
4. **Testing**: Add Vitest config, write unit tests for use cases

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/database/src/schema/` | New | 10 schema files (usuarios.ts, predios.ts, animales.ts, servicios.ts, configuracion.ts, maestros.ts, productos.ts, reportes.ts, notificaciones.ts, security.ts) |
| `packages/database/src/client.ts` | New | Drizzle client factory (SQLite/PostgreSQL switch) |
| `packages/database/migrations/` | New | Generated SQL migrations |
| `packages/database/seed.ts` | New | Seed data for catalogs + admin user |
| `packages/shared-types/src/schemas/` | Modified | Fix User.id from UUID to integer |
| `apps/api/src/shared/` | New | errors/, middleware/, types/ directories |
| `apps/api/src/plugins/` | New | cors.ts, jwt.ts, rate-limit.ts, multipart.ts |
| `apps/api/src/container.ts` | New | tsyringe DI composition root |
| `apps/api/src/modules/auth/` | New | Complete hexagonal module (~20 files) |
| `apps/api/src/modules/usuarios/` | New | Complete hexagonal module (~25 files) |
| `apps/api/src/app.ts` | Modified | Register plugins and modules |
| `apps/api/vitest.config.ts` | New | Vitest configuration |
| `apps/api/package.json` | Modified | Add ~20 dependencies |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 55 tables is large scope | High | Create all schemas in one batch, validate with `drizzle-kit push` before implementing modules |
| shared-types UUID vs integer mismatch | Medium | Fix in Phase 1a before auth module; update frontend auth context to expect integer IDs |
| tsyringe + ESM compatibility | Medium | Use `tsyringe@4.x` with `reflect-metadata` import-first; test DI resolution early |
| SQLite foreign key enforcement | Low | Enable `PRAGMA foreign_keys = ON` in client factory |
| bcrypt performance in dev | Low | Cost factor 12 is production-safe; SQLite dev mode unaffected |

## Rollback Plan

1. **Database**: All changes versioned via Drizzle migrations — `drizzle-kit drop` removes last migration
2. **Code**: Each module is self-contained — delete `apps/api/src/modules/{auth,usuarios}` and shared infrastructure
3. **Revert**: `git revert` to previous commit; database file (dev.db) can be deleted and re-seeded

## Dependencies

- **Runtime**: fastify, @fastify/cors, @fastify/jwt, @fastify/rate-limit, drizzle-orm, better-sqlite3, postgres, bcrypt, jsonwebtoken, tsyringe, reflect-metadata, pino
- **Dev**: drizzle-kit, vitest, @types/bcrypt, @types/jsonwebtoken, tsx

## Success Criteria

- [ ] `pnpm --filter @ganatrack/database drizzle-kit push` succeeds with all 55 tables
- [ ] `pnpm --filter @ganatrack/database seed` creates admin user + catalog data
- [ ] `POST /api/v1/auth/login` returns JWT token for valid credentials
- [ ] `GET /api/v1/usuarios` returns 401 without token, 200 with valid admin token
- [ ] `GET /api/v1/usuarios/me` returns current user information
- [ ] All use case unit tests pass (`pnpm --filter @ganatrack/api test`)
- [ ] TypeScript strict mode passes (`pnpm typecheck`)