# Proposal: fase3-servicios-backend

## Intent

Implement Phase 3 backend for GanaTrack: 3 new business modules (servicios, productos, imagenes) with full hexagonal architecture, following established patterns from Phase1( auth, usuarios) and Phase 2 (configuracion, predios, maestros, animales).

## Scope

### In Scope

**servicios module** (10 entities):
- Palpaciones: Grupal + Animales (4 use cases × 2 entities)
- Inseminaciones: Grupal + Animales (4 use cases × 2 entities)
- Partos: Animales + Crias (NO grupal - individual records only)
- Veterinarios: Grupal + Animales + Productos junction (4 use cases × 3 entities)

**productos module** (2entities):
- Productos with stock management (CRUD)
- Productos-Imagenes junction

**imagenes module** (shared):
- Imagenes entity (file upload + path storage)
- Animal-Imagen junction (reference to animales module)
- Producto-Imagen junction (reference to productos module)

### Out of Scope

- File upload API endpoints (delegated to frontend integration)
- Image processing/resizing
- Stock adjustment workflows (movement history)
- Advanced service analytics/reporting

## Capabilities

### New Capabilities

- `servicios-palpaciones`: Group palpation service management with individual animalresults
- `servicios-inseminaciones`: Group insemination service management with individual animal records
- `servicios-partos`: Individual parturition records with offspring tracking
- `servicios-veterinarios`: Group veterinary services with product usage tracking
- `productos-inventory`: Veterinary product inventory CRUD with stock fields
- `imagenes-upload`: Image storage and association with animals/products

### Modified Capabilities

None — these are brand new modules with no existing spec changes.

## Approach

Follow established hexagonal architecture pattern:

1. **Domain Layer**: Pure entity interfaces matching Drizzle schema types
2. **Repository Interfaces**: CRUD + tenant-scoped queries + domain-specific operations
3. **Use Cases**: Application layer with tsyringeDI (@injectable, @inject)
4. **Infrastructure**: Drizzle repositories with SQLite/PostgreSQL dual support
5. **HTTP Layer**: Fastify routes with JSON Schema validation, authMiddleware preHandler

**Key patterns**:
- Soft delete via `activo` field
- Tenant isolation via `predioId`
- Transactions for grupal+animales batch operations
- File storage: Local filesystem (uploads/) with path in DB

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/modules/servicios/` | New | 10 entities, ~35 use cases, complete hexagonal structure |
| `apps/api/src/modules/productos/` | New | 2 entities, ~10 use cases, complete hexagonal structure |
| `apps/api/src/modules/animales/` | Modified | Add imagen-related helper methods if needed |
| `apps/api/src/app.ts` | Modified | Register 2 new modules (servicios, productos) |
| `packages/database/src/schema/` | Referenced | Schema already exists (servicios.ts, productos.ts, animales.ts) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Complex junction tables (productos in veterinarios) | Medium | Follow existing animal-imagen junction pattern from animales module |
| Transaction boundaries for grupal+animales | Low | Use Drizzle transactions consistently, test rollback scenarios |
| Cross-module dependencies (animales, productos) | Medium | Use repository interfaces with forward references, resolve in barrel export |
| Image file storage security | Low | Static path validation, no file execution, secure uploads directory |

## Rollback Plan

1. Remove new module folders from `apps/api/src/modules/`
2. Revert `apps/api/src/app.ts` registration changes
3. No database schema changes (already exist)
4. No shared code modifications

## Dependencies

- **Phase 1 Modules**: auth, usuarios (authentication, tenant context)
- **Phase 2 Modules**: predios, animales, maestros (veterinarios, diagnosticos_veterinarios), configuracion (config_condiciones_corporales)
- **External**: Fastify v4, Drizzle ORM, tsyringe, SQLite/PostgreSQL

## Success Criteria

- [ ] all TypeScript files compile without errors
- [ ] All 3 modules follow hexagonal architecture (domain → application → infrastructure)
- [ ] All repositories implement tenant scoping (predioId filtering)
- [ ] All routes have authMiddleware + tenantContextMiddleware
- [ ] Grupal+animales operations use transactions
- [ ] Module registration in app.ts follows existing pattern
- [ ] ~50-60 new files created across 3 modules