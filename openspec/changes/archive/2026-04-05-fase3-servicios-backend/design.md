# Design: fase3-servicios-backend

## Technical Approach

Implement 3 new business modules (servicios, productos, imagenes) following the established hexagonal architecture pattern from animales module. Each module uses tsyringe DI, Drizzle ORM repositories, and Fastify v4 routes with JSON Schema validation.

**Key distinction from animales**: The servicios module contains 4 service categories with grupal+animales transactional patterns, and the imagenes module is shared across animales and productos for image associations.

## Architecture Decisions

### Decision: Module Separation Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single servicios module with 4 sub-categories | Cohesive but large | **Chosen** |
| Split into 4 separate modules | Smaller but fragmented | Rejected - breaks logical grouping |

**Rationale**: Services (palpaciones, inseminaciones, partos, veterinarios) share the grupal+animales pattern and similar domain logic. Single module with subdirectories maintains cohesion.

### Decision: Imagenes Module Placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep imagenes inside animales (current) | Tight coupling but simple | Rejected |
| Extract to shared imagenes module | Loose coupling, reusable | **Chosen** |
| Separate animal-imagenes junction in animales | Clean separation | Hybrid approach |

**Rationale**: Imagenes table already exists in schema/animales.ts but productos needs same image association. Extract to shared imagenes module with junction tables for animal-imagenes and producto-imagenes.

### Decision: Grupal+Animales Transaction Pattern

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Auto-commit without transaction | Fast but inconsistent | Rejected |
| Drizzle transaction wrapper | ACID guarantees | **Chosen** |
| Application-level saga pattern | Complex but resilient | Overkill for this scope |

**Rationale**: Atomic creation of grupal + multiple animales records is critical. Use Drizzle's `db.transaction(async (tx) => {...})` pattern.

### Decision: Cross-Module Repository References

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Direct schema import | Coupled but simple | Rejected |
| Repository interface injection | Clean, testable | **Chosen** |
| Shared entity types | Minimal coupling | Used for types only |

**Rationale**: servicios needs to reference animales (via animalId), productos (via productoId), and maestros (veterinarios, diagnosticos). Use repository interfaces with tsyringe injection.

## Data Flow

### Grupal Service Creation Flow

```
POST /servicios/palpaciones
         │
         ▼
   Controller
         │
         ▼
   Use Case ├──────────────────────────────────────┐
         │                                        │
         ▼                                        │
   db.transaction()                               │
         │                                        │
         ├──► Create PalpacionGrupal ◄────────────┤
         │         │                              │
         │         ▼                              │
         │    RETURNING id ────────────────────► │
         │                                        │
         ├──► FOR EACH animal in animales:        │
         │         │                              │
         │         ▼                              │
         │    Create PalpacionAnimal              │
         │    (with grupalId FK)                  │
         │                                        │
         ▼                                        │
   COMMIT / ROLLBACK ◄────────────────────────────┘
```

### Image Association Flow

```
POST /imagenes (creates ImagenEntity) ──► imagenes module
                    │
                    ▼
POST /animales/:id/imagenes ◄── animales module (owns animal-imagenes junction)
                    │
                    ▼
         Creates AnimalImagen junction

POST /productos/:id/imagenes ◄── productos module (owns producto-imagenes junction)
                    │
                    ▼
         Creates ProductoImagen junction
```

## File Changes

### New Files

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/modules/servicios/index.ts` | Create | Module barrel export with DI registration |
| `apps/api/src/modules/servicios/domain/entities/*.entity.ts` | Create | 10 entity interfaces |
| `apps/api/src/modules/servicios/domain/repositories/*.repository.ts` | Create | 10 repository interfaces + Symbol tokens |
| `apps/api/src/modules/servicios/application/dtos/*.ts` | Create | Request/Response DTOs |
| `apps/api/src/modules/servicios/application/use-cases/*.use-case.ts` | Create | ~35 use cases |
| `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-*.repository.ts` | Create | 10 Drizzle implementations |
| `apps/api/src/modules/servicios/infrastructure/http/controllers/*.controller.ts` | Create | 4 controllers (one per service category) |
| `apps/api/src/modules/servicios/infrastructure/http/routes/*.routes.ts` | Create | 4 route files |
| `apps/api/src/modules/servicios/infrastructure/http/schemas/*.schema.ts` | Create | JSON Schemas |
| `apps/api/src/modules/servicios/infrastructure/mappers/*.mapper.ts` | Create | Entity <-> DTO mappers |
| `apps/api/src/modules/productos/index.ts` | Create | Module barrel export |
| `apps/api/src/modules/productos/domain/entities/*.entity.ts` | Create | 2 entity interfaces |
| `apps/api/src/modules/productos/domain/repositories/*.repository.ts` | Create | 2 repository interfaces |
| `apps/api/src/modules/productos/application/*` | Create | DTOs, use cases (CRUD) |
| `apps/api/src/modules/productos/infrastructure/*` | Create | Repositories, controllers, routes, schemas |
| `apps/api/src/modules/imagenes/index.ts` | Create | Shared imagenes module barrel |
| `apps/api/src/modules/imagenes/domain/entities/*.entity.ts` | Create | ImagenEntity (moved from animales) |
| `apps/api/src/modules/imagenes/domain/repositories/*.repository.ts` | Create | IImagenRepository |
| `apps/api/src/modules/imagenes/application/*` | Create | DTOs, use cases |

### Modified Files

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/app.ts` | Modify | Register servicios, productos, imagenes modules |
| `apps/api/src/modules/animales/domain/repositories/imagen.repository.ts` | Modify | Remove (moved to imagenes module) |
| `apps/api/src/modules/animales/infrastructure/persistence/drizzle-imagen.repository.ts` | Modify | Remove (moved to imagenes module) |
| `apps/api/src/modules/animales/index.ts` | Modify | Remove imagen-related DI tokens, import from imagenes |

## Interfaces / Contracts

### Repository Interface Pattern

```typescript
// domain/repositories/palpacion-grupal.repository.ts
export interface IPalpacionGrupalRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: PalpacionGrupalEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<PalpacionGrupalEntity | null>
  findByCodigo(codigo: string, predioId: number): Promise<PalpacionGrupalEntity | null>
  create(data: Omit<PalpacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalpacionGrupalEntity>
  update(id: number, data: Partial<PalpacionGrupalEntity>): Promise<PalpacionGrupalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}
export const PALPACION_GRUPAL_REPOSITORY = Symbol('IPalpacionGrupalRepository')

// domain/repositories/palpacion-animal.repository.ts
export interface IPalpacionAnimalRepository {
  findByPalpacionGrupalId(palpacionGrupalId: number): Promise<PalpacionAnimalEntity[]>
  findById(id: number): Promise<PalpacionAnimalEntity | null>
  create(data: Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalpacionAnimalEntity>
  createBatch(data: Array<Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, tx?: Transaction): Promise<PalpacionAnimalEntity[]>
  update(id: number, data: Partial<PalpacionAnimalEntity>): Promise<PalpacionAnimalEntity | null>
  softDelete(id: number): Promise<boolean>
}
export const PALPACION_ANIMAL_REPOSITORY = Symbol('IPalpacionAnimalRepository')
```

### Transaction Interface

```typescript
// shared/types/transaction.ts
import type { DbClient } from '@ganatrack/database'

export type TransactionCallback<T> = (tx: DbClient) => Promise<T>

export interface ITransactionManager {
  run<T>(callback: TransactionCallback<T>): Promise<T>
}
```

### Cross-Module Service Interface

```typescript
// servicios/domain/services/animal-reference.service.ts
export interface IAnimalReferenceService {
  validateAnimalsExist(animalIds: number[], predioId: number): Promise<boolean>
}
```

## Module Structure Details

### Servicios Module (10 entities)

**Palpaciones:**
- `servicios_palpaciones_grupal` → PalpacionGrupalEntity
- `servicios_palpaciones_animales` → PalpacionAnimalEntity

**Inseminaciones:**
- `servicios_inseminacion_grupal` → InseminacionGrupalEntity
- `servicios_inseminacion_animales` → InseminacionAnimalEntity

**Partos (NO grupal - individual):**
- `servicios_partos_animales` → PartoAnimalEntity
- `servicios_partos_crias` → PartoCriaEntity

**Veterinarios:**
- `servicios_veterinarios_grupal` → VeterinarioGrupalEntity
- `servicios_veterinarios_animales` → VeterinarioAnimalEntity
- `servicios_veterinarios_productos` → VeterinarioProductoEntity (junction)

### Productos Module (2 entities)

- `productos` → ProductoEntity
- `productos_imagenes` → ProductoImagenEntity (junction)

### Imagenes Module (1 entity)

- `imagenes` → ImagenEntity (shared)

**Junction ownership:**
- `animal-imagenes` → owned by animales module (already exists)
- `producto-imagenes` → owned by productos module

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Use cases (business logic) | Mock repositories, test error paths |
| Unit | Repository queries | Mock Drizzle, test query conditions |
| Integration | Transaction rollback | Use test DB, simulate failures |
| Integration | Cross-module references | Integration test with real modules |
| E2E | API endpoints | Fastify inject, test authMiddleware |

## Migration / Rollout

No database migration required - schema already exists in `packages/database/src/schema/servicios.ts` and `productos.ts`.

**Rollback:**
1. Remove `apps/api/src/modules/servicios/`, `productos/`, `imagenes/`
2. Revert `app.ts` registration changes
3. Restore `animales/index.ts` (if imagenes changes applied)

## Open Questions

- [ ] Should VeterinarioProducto use batch insert for multiple products? (Recommended: yes, single transaction)
- [ ] File upload endpoint for imagenes - handle in this phase or separate? (Out of scope per proposal)
- [ ] PartosCrias criaId FK - should it validate against animales table at creation time? (Recommended: optional validation)

## Sequence Diagrams

### Create Palpacion Grupal with Animales

```
Client                Controller          UseCase             GrupalRepo          AnimalRepo           DB
   │                      │                  │                    │                    │              │
   │ POST /palpaciones    │                  │                    │                    │              │
   │─────────────────────►│                  │                    │                    │              │
   │                      │ execute(dto)     │                    │                    │              │
   │                      │─────────────────►│                    │                    │              │
   │                      │                  │ db.transaction()  │                    │              │
   │                      │                  │────────────────────────────────────────────────────►│
   │                      │                  │                    │                    │              │
   │                      │                  │ create(grupal)     │                    │              │
   │                      │                  │───────────────────►│                    │              │
   │                      │                  │                    │ INSERT INTO grupal│              │
   │                      │                  │                    │───────────────────────────────►│
   │                      │                  │                    │◄──────────────────────────────│
   │                      │                  │◄───────────────────│                    │              │
   │                      │                  │                    │                    │              │
   │                      │                  │ FOR EACH animal:   │                    │              │
   │                      │                  │ createBatch([...]) │                    │              │
   │                      │                  │────────────────────────────────────────────►│        │
   │                      │                  │                    │                    │ INSERT INTO │
   │                      │                  │                    │                    │ animales    │
   │                      │                  │                    │                    │────────────►│
   │                      │                  │◄────────────────────────────────────────│            │
   │                      │                  │                    │                    │              │
   │                      │                  │ COMMIT             │                    │              │
   │                      │                  │────────────────────────────────────────────────────►│
   │                      │◄─────────────────│                    │                    │              │
   │◄─────────────────────│                  │                    │                    │              │
```