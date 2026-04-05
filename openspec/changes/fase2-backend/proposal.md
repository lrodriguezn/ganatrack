# Proposal: fase2-backend

## Intent

Build Phase 2 backend for GanaTrack: 4 new business modules (predios, configuración, maestros, animales) with full CRUD operations. Phase 1 (auth + usuarios) is complete and provides the architectural foundation. This change implements 24 tables across 6 Drizzle schema files, establishing the core domain layer for farm management, global catalogs, master data, and animal tracking with genealogy support.

## Scope

### In Scope
- **Módulo Predios** (6 tables): predios, potreros, sectores, lotes, grupos, config_parametros_predio — farms and subdivisions with tenant scoping
- **Módulo Configuración** (7 tables): config_razas, config_condiciones_corporales, config_tipos_explotacion, config_calidad_animal, config_colores, config_rangos_edades, config_key_values — global catalogs (no predio_id)
- **Módulo Maestros** (8 tables): veterinarios, propietarios, hierros (tenant-scoped) + diagnosticos_veterinarios, motivos_ventas, causas_muerte, lugares_compras, lugares_ventas (global)
- **Módulo Animales** (3 tables): animales (with self-referencing lineage: madre_id, padre_id), imagenes, animales_imagenes
- Repository interfaces + Drizzle implementations for all entities
- Use cases (List, Create, Update, Delete) for each entity
- Controllers, routes, JSON Schema validation
- ~145 new files following established hexagonal architecture

### Out of Scope
- Servicios module (Phase 3)
- Productos module (Phase 3)
- Reportes module (Phase 4)
- Notificaciones module (Phase 5)
- Advanced animal genealogy queries (beyond basic CRUD)
- Image upload/storage infrastructure (images table only)

## Capabilities

### New Capabilities
- `predios-api`: CRUD for farms and subdivisions (predios, potreros, sectores, lotes, grupos, config_parametros_predio)
- `configuracion-api`: CRUD for global catalog tables (razas, condiciones, tipos_explotacion, etc.)
- `maestros-api`: CRUD for master data (tenant-scoped veterinarios/hierros/propietarios + global catalogs)
- `animales-api`: CRUD for animals with lineage references, image associations

### Modified Capabilities
- None (extends foundation without modifying existing modules)

## Approach

### Architecture Decision: Maestros Module Scope
**Recommendation: Option A** — Keep all 8 tables in `maestros` module with dual access patterns.

Rationale:
- Global tables (diagnosticos, motivos, causas, lugares) are semantically "master reference data", not system configuration
- Repositories will have different query patterns: `findAllGlobal()` vs `findByPredioId(predioId)`
- Moving to configuración would blur semantic boundaries: config = system settings, maestros = business reference data
- Single module keeps related master data together

### Implementation Order
1. **Configuración** (simplest) — establishes global catalog patterns (no tenant filtering)
2. **Predios** (medium) — establishes tenant-scoped patterns with unique constraints
3. **Maestros** (mixed) — tests dual access pattern implementation
4. **Animales** (complex) — self-referencing FKs, junction tables, multiple ID systems

### Pattern Replication
Follow established hexagonal architecture from `auth/` and `usuarios/` modules:
- Domain: entities, repository interfaces, domain services (if needed)
- Application: use cases with `@injectable()` + DI via `@inject(REPOSITORY_TOKEN)`
- Infrastructure: Drizzle repositories, mappers (snake_case ↔ camelCase), controllers, routes/schemas

### Unique Constraints
- `uq_potreros_predio_codigo`, `uq_sectores_predio_codigo`, `uq_parametros_predio_codigo`
- `uq_animales_predio_codigo` — animal codes unique within farm
- `uq_config_key_values` on (opcion, key) — key-value uniqueness

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/modules/predios/` | New | ~35 files (6 entities × hexagonal layers) |
| `apps/api/src/modules/configuracion/` | New | ~40 files (7 entities × hexagonal layers) |
| `apps/api/src/modules/maestros/` | New | ~45 files (8 entities × hexagonal layers) |
| `apps/api/src/modules/animales/` | New | ~25 files (3 entities, high complexity) |
| `apps/api/src/app.ts` | Modified | Register 4 new modules |
| `packages/database/src/schema/` | Existing | Schemas already defined; no changes needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Self-referencing FKs in animales (madre_id, padre_id) | Medium | Use deferred FK validation; add genealogy validation in domain service |
| Junction table animales_imagenes many-to-many | Low | Standard Drizzle relational patterns; separate use case for associations |
| Tenant vs global access patterns in maestros | Medium | Create base `GlobalRepository` interface; extend for tenant-scoped repos |
| Unique constraints with predio_id (potreros, animales) | Low | Repository `findByPredioIdAndCodigo()` check before insert/update |
| ~145 files is significant scope | Medium | Implement módulo by módulo; test each before moving to next |

## Rollback Plan

1. **Modules**: Delete `apps/api/src/modules/{predios,configuracion,maestros,animales}` directories
2. **App Registration**: Remove module imports from `apps/api/src/app.ts`
3. **Database**: Schemas were already in Phase 1; migrations already applied — no schema changes needed for this phase
4. **Revert**: `git revert` to pre-Phase 2 commit; database dev.db can be re-seeded if needed

## Dependencies

- **Phase 1 Complete**: auth and usuarios modules working with JWT auth, RBAC middleware
- **Schema Files**: Already defined in `packages/database/src/schema/` (predios.ts, configuracion.ts, maestros.ts, animales.ts)
- **Infrastructure**: DI container (tsyringe), error classes, response formatter — all from Phase 1
- **Runtime**: Same Fastify v5 + Drizzle ORM stack from Phase 1

## Success Criteria

- [ ] `GET /api/v1/configuracion/razas` returns list without authentication (global)
- [ ] `GET /api/v1/predios` returns tenant's farms with JWT auth
- [ ] `POST /api/v1/predios` creates farm with unique codigo constraint
- [ ] `GET /api/v1/maestros/veterinarios?$filter=predioId eq 1` returns tenant-scoped data
- [ ] `GET /api/v1/maestros/diagnosticos` returns global catalog without predioId filter
- [ ] `POST /api/v1/animales` creates animal with madre_id/padre_id references
- [ ] `GET /api/v1/animales?$include=imagenes` returns animal with associated images
- [ ] All use case tests pass (`pnpm --filter @ganatrack/api test`)
- [ ] TypeScript strict mode passes (`pnpm typecheck`)