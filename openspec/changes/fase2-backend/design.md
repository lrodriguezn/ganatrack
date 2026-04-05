# Design: fase2-backend

## Technical Approach

Implement 4 new backend modules (Configuracion, Predios, Maestros, Animales) following the established hexagonal architecture from Phase 1 (auth, usuarios). Each module follows the same layer structure: Domain (entities, repository interfaces) → Application (use cases, DTOs) → Infrastructure (Drizzle repos, Fastify routes/controllers/schemas, mappers). Uses tsyringe DI with module-level registration pattern. Implementation starts with Configuracion (simplest global catalogs) and progresses to Animales (most complex with self-referencing FKs and junction tables).

## Architecture Decisions

### Decision: Dual Repository Pattern for Maestros Module

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single interface with optional `predioId` param | Simpler, but violates ISP | Rejected |
| Separate `IGlobalRepository` and `ITenantRepository` interfaces | Clean separation, code reuse via base class | **Chosen** |
| All repos in Maestros with tenant filtering always | Incorrect semantics for global data | Rejected |

**Rationale**: Maestros has 3 tenant-scoped entities (veterinarios, propietarios, hierros) and 5 global entities (diagnosticos, motivos, causas, lugares). A base `IGlobalRepository<T>` interface reduces boilerplate while maintaining semantic correctness. Tenant-scoped repos extend `ITenantRepository<T>` which requires `predioId` parameter.

### Decision: Module Registration Pattern

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Central container in app.ts | Tight coupling, hard to maintain | Rejected |
| Module self-registration via `registerXxxModule()` | Encapsulated, follows SRP | **Chosen** |

**Rationale**: Each module exports `registerXxxModule()` that registers its own repos, use cases, and domain services in tsyringe. The `container.ts` remains empty (only exports `container`). This pattern is proven in auth and usuarios modules.

### Decision: Animal Genealogy Query Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Recursive CTE in SQL | Single query, but SQLite CTE support limited | Rejected |
| Iterative JS traversal (depth-limited) | More queries, but portable and controllable | **Chosen** |

**Rationale**: Genealogy queries for `GET /api/v1/animales/:id/genealogia` will use iterative JS traversal with depth limit of5 generations (configurable). Each iteration fetches parents by ID. Cross-predio lineage validation happens in `AnimalDomainService.validarLineage()` before animal creation.

### Decision: SharedBase Entity Pattern

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Create base `BaseCatalogEntity` interface | DRY for Configuracion entities | **Chosen** |
| Duplicate interface per entity | No abstraction, but explicit | Rejected |

**Rationale**: All 7 Configuracion entities share identical structure: `id, nombre, descripcion?, activo, createdAt, updatedAt`. A shared base reduces boilerplate while preserving entity-specific repository interfaces.

## Data Flow

```
HTTP Request ──→ Fastify Route (JSON Schema validation)
                  │
                  ├── authMiddleware (JWT verification)
                  ├── tenantContextMiddleware (X-Predio-Id extraction)
                  └── requirePermission('recurso:accion')
                          │
                          ▼
                   Controller (thin adapter)
                          │
                          ▼
                    Use Case (orchestration)
                          │
                          ├── Domain Service (validation)
                          └── Repository Interface (port)
                                  │
                                  ▼
                           Drizzle Repository (adapter)
                                  │
                                  ▼
                            SQLite/PostgreSQL
```

## File Changes

### Module 1: Configuracion (~40 files)

| File | Action | Description |
|------|--------|-------------|
| `modules/configuracion/domain/entities/config-catalog.base.ts` | Create | Base interface for catalog entities |
| `modules/configuracion/domain/entities/raza.entity.ts` | Create | ConfigRaza domain entity |
| `modules/configuracion/domain/repositories/raza.repository.ts` | Create | IRazaRepository interface + Symbol |
| `modules/configuracion/application/use-cases/list-razas.use-case.ts` | Create | List all razas (paginated) |
| `modules/configuracion/application/use-cases/create-raza.use-case.ts` | Create | Create new raza (super-admin only) |
| `modules/configuracion/application/use-cases/update-raza.use-case.ts` | Create | Update raza |
| `modules/configuracion/application/use-cases/delete-raza.use-case.ts` | Create | Soft delete raza |
| `modules/configuracion/infrastructure/persistence/drizzle-raza.repository.ts` | Create | Drizzle implementation |
| `modules/configuracion/infrastructure/http/controllers/raza.controller.ts` | Create | HTTP → Use Case adapter |
| `modules/configuracion/infrastructure/http/routes/configuracion.routes.ts` | Create | Route registration |
| `modules/configuracion/infrastructure/http/schemas/raza.schema.ts` | Create | JSON Schema validation |
| `modules/configuracion/infrastructure/mappers/raza.mapper.ts` | Create | Domain ↔ DTO transform |
| `modules/configuracion/index.ts` | Create | DI registration + barrel export |
| *(repeat pattern for: condiciones-corporales, tipos-explotacion, calidad-animal, colores, rangos-edades, key-values)* | | |

### Module 2: Predios (~35 files)

| File | Action | Description |
|------|--------|-------------|
| `modules/predios/domain/entities/predio.entity.ts` | Create | Predio domain entity (parent, no predioId) |
| `modules/predios/domain/entities/potrero.entity.ts` | Create | Potrero domain entity |
| `modules/predios/domain/repositories/predio.repository.ts` | Create | IPredioRepository interface |
| `modules/predios/domain/repositories/potrero.repository.ts` | Create | IPotreroRepository interface |
| `modules/predios/domain/services/predio-domain.service.ts` | Create | Validation for tipoExplotacionId FK |
| `modules/predios/application/use-cases/list-predios.use-case.ts` | Create | List tenant's predios |
| `modules/predios/application/use-cases/create-predio.use-case.ts` | Create | Create predio |
| `modules/predios/application/use-cases/create-potrero.use-case.ts` | Create | Create potrero with unique (predioId, codigo) |
| `modules/predios/infrastructure/persistence/drizzle-predio.repository.ts` | Create | Predio Drizzle repo |
| `modules/predios/infrastructure/persistence/drizzle-potrero.repository.ts` | Create | Potrero Drizzle repo with tenant filter |
| `modules/predios/infrastructure/http/routes/predios.routes.ts` | Create | Routes with tenant context |
| *(repeat pattern for: sectores, lotes, grupos, config-parametros)* | | |

### Module 3: Maestros (~45 files)

| File | Action | Description |
|------|--------|-------------|
| `modules/maestros/domain/repositories/base/global.repository.ts` | Create | Base interface for global catalogs |
| `modules/maestros/domain/repositories/base/tenant.repository.ts` | Create | Base interface for tenant-scoped |
| `modules/maestros/domain/entities/veterinario.entity.ts` | Create | Veterinario entity (tenant-scoped) |
| `modules/maestros/domain/entities/diagnostico.entity.ts` | Create | DiagnosticoVeterinario entity (global) |
| `modules/maestros/domain/repositories/veterinario.repository.ts` | Create | IVeterinarioRepository extends ITenantRepository |
| `modules/maestros/domain/repositories/diagnostico.repository.ts` | Create | IDiagnosticoRepository extends IGlobalRepository |
| `modules/maestros/infrastructure/persistence/base/drizzle-global.repository.ts` | Create | Base Drizzle implementation for global |
| `modules/maestros/infrastructure/persistence/base/drizzle-tenant.repository.ts` | Create | Base Drizzle implementation for tenant |
| `modules/maestros/infrastructure/persistence/drizzle-veterinario.repository.ts` | Create | Extends base tenant repo |
| `modules/maestros/infrastructure/http/routes/maestros.routes.ts` | Create | Routes for all 8 entities |
| `modules/maestros/infrastructure/http/controllers/veterinario.controller.ts` | Create | Tenant-scoped controller |
| `modules/maestros/infrastructure/http/controllers/diagnostico.controller.ts` | Create | Global catalog controller |
| *(repeat pattern for: propietarios, hierros, motivos-ventas, causas-muerte, lugares-compras, lugares-ventas)* | | |

### Module 4: Animales (~25 files)

| File | Action | Description |
|------|--------|-------------|
| `modules/animales/domain/entities/animal.entity.ts` | Create | Animal entity with lineage fields |
| `modules/animales/domain/entities/imagen.entity.ts` | Create | Imagen entity |
| `modules/animales/domain/entities/animal-imagen.entity.ts` | Create | Junction entity |
| `modules/animales/domain/repositories/animal.repository.ts` | Create | IAnimalRepository interface |
| `modules/animales/domain/repositories/imagen.repository.ts` | Create | IImagenRepository interface |
| `modules/animales/domain/repositories/animal-imagen.repository.ts` | Create | IAnimalImagenRepository interface |
| `modules/animales/domain/services/animal-domain.service.ts` | Create | Lineage validation, cross-predio check |
| `modules/animales/application/use-cases/list-animales.use-case.ts` | Create | List by predio with filters |
| `modules/animales/application/use-cases/create-animal.use-case.ts` | Create | Create with madreId/padreId validation |
| `modules/animales/application/use-cases/get-genealogy.use-case.ts` | Create | Recursive genealogy query |
| `modules/animales/application/use-cases/assign-imagen.use-case.ts` | Create | Associate image with animal |
| `modules/animales/infrastructure/persistence/drizzle-animal.repository.ts` | Create | Animal repo with unique constraint check |
| `modules/animales/infrastructure/persistence/drizzle-imagen.repository.ts` | Create | Imagen repo with tenant filter |
| `modules/animales/infrastructure/persistence/drizzle-animal-imagen.repository.ts` | Create | Junction table operations |
| `modules/animales/infrastructure/http/routes/animales.routes.ts` | Create | Routes for animals and images |
| `modules/animales/infrastructure/http/schemas/animal.schema.ts` | Create | JSON Schema with lineage fields |
| `modules/animales/index.ts` | Create | DI registration |

### Infrastructure Updates

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/app.ts` | Modify | Register 4 new modules after auth/usuarios |
| `apps/api/src/shared/errors/duplicate-code.error.ts` | Create | Error for unique code constraint violations |

## Interfaces / Contracts

### Base Repository Interfaces

```typescript
// modules/maestros/domain/repositories/base/global.repository.ts
export interface IGlobalRepository<T> {
  findById(id: number): Promise<T | null>
  findAll(opts: PaginationOpts): Promise<{ data: T[]; total: number }>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: number, data: Partial<T>): Promise<T | null>
  softDelete(id: number): Promise<boolean>
}

// modules/maestros/domain/repositories/base/tenant.repository.ts
export interface ITenantRepository<T> {
  findById(id: number, predioId: number): Promise<T | null>
  findAll(predioId: number, opts: PaginationOpts): Promise<{ data: T[]; total: number }>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { predioId: number }): Promise<T>
  update(id: number, predioId: number, data: Partial<T>): Promise<T | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}
```

### Configuracion Entity Interface

```typescript
// modules/configuracion/domain/entities/config-catalog.base.ts
export interface ConfigCatalogEntity {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date
  updatedAt: Date | null
}

export interface ConfigRaza extends ConfigCatalogEntity {
  origen: string | null
  tipoProduccion: string | null
}
```

### Pagination Parameters

```typescript
// shared/types/pagination.ts
export interface PaginationOpts {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
  }
}
```

### Use Case Pattern

```typescript
// modules/animales/application/use-cases/create-animal.use-case.ts
@injectable()
export class CrearAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly repo: IAnimalRepository,
    @inject(AnimalDomainService) private readonly domainService: AnimalDomainService,
  ) {}

  async execute(dto: CrearAnimalDto, predioId: number): Promise<Animal> {
    // Domain validation
    await this.domainService.validarLineage(dto.madreId, dto.padreId, predioId)
    
    // Check unique constraint
    const existing = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
    if (existing) {
      throw new DuplicateCodeError('codigo', dto.codigo, predioId)
    }
    
    return this.repo.create({ ...dto, predioId, activo: 1 })
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Domain services (lineage validation, unique constraints) | Vitest with mocked repos |
| Unit | Use cases (business logic flow) | Vitest with mocked repos |
| Integration | Repository implementations (Drizzle operations) | Vitest with test SQLite database |
| E2E | Routes (auth, tenant context, permissions) | Fastify inject with real DB |

**Test file location**: Mirror source structure under `test/` directory

```bash
# Example test commands
pnpm vitest apps/api/src/modules/animales/
pnpm vitest apps/api/src/modules/predios/
pnpm test:integration  # Real SQLite
```

## Module DI Registration Pattern

Each module follows this registration:

```typescript
// modules/predios/index.ts
export function registerPrediosModule(): void {
  const db = createClient()
  container.registerInstance(PREDIO_TOKENS.DbClient, db)
  container.registerSingleton<IPredioRepository>(PREDIO_REPOSITORY, DrizzlePredioRepository)
  container.registerSingleton<IPotreroRepository>(POTRERO_REPOSITORY, DrizzlePotreroRepository)
  // ... other repos
  container.registerSingleton(ListarPrediosUseCase)
  container.registerSingleton(CrearPredioUseCase)
  // ... other use cases
  container.registerSingleton(PredioDomainService)
}

export async function registerPrediosModuleRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(PredioController)
  // Register routes with app.register()
}
```

## app.ts Integration

```typescript
// apps/api/src/app.ts (additions)
import { registerConfiguracionModule, registerConfiguracionModuleRoutes } from './modules/configuracion/index.js'
import { registerPrediosModule, registerPrediosModuleRoutes } from './modules/predios/index.js'
import { registerMaestrosModule, registerMaestrosModuleRoutes } from './modules/maestros/index.js'
import { registerAnimalesModule, registerAnimalesModuleRoutes } from './modules/animales/index.js'

export async function buildApp(): Promise<FastifyInstance> {
  // ... existing setup
  
  // Register Phase 2 modules
  registerConfiguracionModule()
  await app.register(async (instance) => registerConfiguracionModuleRoutes(instance), { prefix: '/api/v1/configuracion' })
  
  registerPrediosModule()
  await app.register(async (instance) => registerPrediosModuleRoutes(instance), { prefix: '/api/v1' })
  
  registerMaestrosModule()
  await app.register(async (instance) => registerMaestrosModuleRoutes(instance), { prefix: '/api/v1/maestros' })
  
  registerAnimalesModule()
  await app.register(async (instance) => registerAnimalesModuleRoutes(instance), { prefix: '/api/v1/animales' })
  
  // ... health check
}
```

## Migration / Rollout

**No new migrations required** — all 24 tables already exist in `packages/database/src/schema/` from Phase 1. Schemas were migrated during Phase 1 database setup.

**Rollback Plan**:
1. Delete module directories: `rm -rf apps/api/src/modules/{configuracion,predios,maestros,animales}`
2. Revert `app.ts` changes to remove module registrations
3. No database changes needed

## Module Routes Summary

### Configuracion Routes (Global, Read = Authenticated, Write = Super-Admin)

| Route | Method | Handler |
|-------|--------|---------|
| `/api/v1/configuracion/razas` | GET | listRazas |
| `/api/v1/configuracion/razas` | POST | createRaza (super-admin) |
| `/api/v1/configuracion/razas/:id` | PUT | updateRaza (super-admin) |
| `/api/v1/configuracion/razas/:id` | DELETE | deleteRaza (super-admin) |
| *(same pattern for: condiciones-corporales, tipos-explotacion, calidad-animal, colores, rangos-edades, key-values)* | | |

### Predios Routes (Tenant-Scoped)

| Route | Method | Handler |
|-------|--------|---------|
| `/api/v1/predios` | GET | listPredios |
| `/api/v1/predios` | POST | createPredio |
| `/api/v1/predios/:id` | GET | getPredio |
| `/api/v1/predios/:id` | PUT | updatePredio |
| `/api/v1/predios/:id` | DELETE | deletePredio |
| `/api/v1/predios/:predioId/potreros` | GET | listPotreros |
| `/api/v1/predios/:predioId/potreros` | POST | createPotrero |
| `/api/v1/predios/:predioId/potreros/:id` | PUT | updatePotrero |
| `/api/v1/predios/:predioId/sectores` | * | *(same CRUD pattern)* |
| `/api/v1/predios/:predioId/lotes` | * | *(same CRUD pattern)* |
| `/api/v1/predios/:predioId/grupos` | * | *(same CRUD pattern)* |
| `/api/v1/predios/:predioId/config-parametros` | * | *(same CRUD pattern)* |

### Maestros Routes (Mixed Scope)

| Route | Method | Scope | Handler |
|-------|--------|-------|---------|
| `/api/v1/maestros/veterinarios` | GET | Tenant | listVeterinarios |
| `/api/v1/maestros/veterinarios` | POST | Tenant | createVeterinario |
| `/api/v1/maestros/diagnosticos` | GET | Global | listDiagnosticos |
| `/api/v1/maestros/diagnosticos` | POST | Global (super-admin) | createDiagnostico |
| *(same pattern for: propietarios, hierros → tenant-scoped)* | | | *(same pattern for: motivos-ventas, causas-muerte, lugares-compras, lugares-ventas → global)* |

### Animales Routes (Tenant-Scoped)

| Route | Method | Handler |
|-------|--------|---------|
| `/api/v1/animales` | GET | listAnimales (filter by predioId, potreroId, estado) |
| `/api/v1/animales` | POST | createAnimal |
| `/api/v1/animales/:id` | GET | getAnimal |
| `/api/v1/animales/:id` | PUT | updateAnimal |
| `/api/v1/animales/:id` | DELETE | deleteAnimal |
| `/api/v1/animales/:id/genealogia` | GET | getGenealogy (recursive parents) |
| `/api/v1/imagenes` | GET | listImagenes |
| `/api/v1/imagenes` | POST | createImagen |
| `/api/v1/animales/:id/imagenes` | GET | getAnimalImages |
| `/api/v1/animales/:id/imagenes` | POST | assignImagen (junction table) |

## Open Questions

- [ ] Confirm pagination defaults (page=1, limit=20, max=100) matches usuarios module
- [ ] Verify genealogy depth limit (5 generations) is sufficient for business needs
- [ ] Consider caching strategy for global Configuracion catalogs (frequently read, rarely written)

## Estimated File Count

| Module | Domain | Application | Infrastructure | Index | Total |
|--------|--------|-------------|----------------|-------|-------|
| Configuracion | 8 | 28 | 23 | 1 | ~60 |
| Predios | 12 | 20 | 18 | 1 | ~51 |
| Maestros | 16 | 32 | 30 | 1 | ~79 |
| Animales | 6 | 12 | 14 | 1 | ~33 |
| **Infrastructure** | - | - | - | 2 | 2 |
| **Total** | | | | | **~165 files** |

Actual count may vary slightly based on shared base classes reducing boilerplate in Maestros.