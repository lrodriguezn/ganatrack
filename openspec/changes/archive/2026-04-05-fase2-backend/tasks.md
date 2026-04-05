# Tasks: Fase 2 Backend — GanaTrack

## Summary

- **Total Tasks**: 147
- **Estimated Duration**: 35-45 hours (single developer)
- **Modules**: 4 (Configuración, Predios, Maestros, Animales)
- **Pattern**: Hexagonal architecture with DI via tsyringe

---

## Phase 1: Configuración Module (28 tasks)

Global catalog tables (7 entities). All share identical CRUD pattern with super-admin writes.

### 1.1 ConfigRaza (4 tasks)

- [ ] 1.1.1 Create `domain/entities/config-raza.entity.ts` — interface with id, nombre, descripcion, origen, tipoProduccion, activo, createdAt, updatedAt
- [ ] 1.1.2 Create `domain/repositories/config-raza.repository.ts` — IConfigRazaRepository interface + CONFIG_RAZA_REPOSITORY Symbol token with findAll, findById, create, update, softDelete
- [ ] 1.1.3 Create `infrastructure/persistence/drizzle-config-raza.repository.ts` — Drizzle implementation with soft-delete filtering (activo=1)
- [ ] 1.1.4 Create `application/use-cases/list-config-razas.use-case.ts` — @injectable with pagination (page, limit, search)
- [ ] 1.1.5 Create `application/use-cases/get-config-raza.use-case.ts` — findById with 404 handling
- [ ] 1.1.6 Create `application/use-cases/create-config-raza.use-case.ts` — super-admin check
- [ ] 1.1.7 Create `application/use-cases/update-config-raza.use-case.ts` — partial updates
- [ ] 1.1.8 Create `application/use-cases/delete-config-raza.use-case.ts` — soft delete
- [ ] 1.1.9 Create `application/dtos/config-raza.dto.ts` — CreateConfigRazaDto, UpdateConfigRazaDto, ConfigRazaResponseDto
- [ ] 1.1.10 Create `infrastructure/mappers/config-raza.mapper.ts` — snake_case ↔ camelCase conversion
- [ ] 1.1.11 Create `infrastructure/http/schemas/config-raza.schema.ts` — JSON Schema for validation (nombre required, descripcion optional)
- [ ] 1.1.12 Create `infrastructure/http/controllers/config-raza.controller.ts` — 5 methods (list, get, create, update, delete)
- [ ] 1.1.13 Create `infrastructure/http/routes/config-raza.routes.ts` — /api/v1/configuracion/razas routes with auth middleware

### 1.2 ConfigCondicionCorporal (2 tasks)

- [ ] 1.2.1 Create entity, repository interface, Drizzle repo — copy from ConfigRaza pattern with valorMin, valorMax fields
- [ ] 1.2.2 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/configuracion/condiciones-corporales

### 1.3 ConfigTipoExplotacion (2 tasks)

- [ ] 1.3.1 Create entity, repository interface, Drizzle repo — copy pattern (nombre, descripcion only)
- [ ] 1.3.2 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/configuracion/tipos-explotacion

### 1.4 ConfigCalidadAnimal (2 tasks)

- [ ] 1.4.1 Create entity, repository interface, Drizzle repo — copy pattern
- [ ] 1.4.2 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/configuracion/calidad-animal

### 1.5 ConfigColor (2 tasks)

- [ ] 1.5.1 Create entity, repository interface, Drizzle repo — copy pattern with optional codigo field
- [ ] 1.5.2 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/configuracion/colores

### 1.6 ConfigRangoEdad (2 tasks)

- [ ] 1.6.1 Create entity, repository interface, Drizzle repo — copy pattern with rango1, rango2, sexo fields
- [ ] 1.6.2 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/configuracion/rangos-edades

### 1.7 ConfigKeyValue (3 tasks)

- [ ] 1.7.1 Create entity, repository interface, Drizzle repo — with findByOpcion method + uq_config_key_values constraint handling
- [ ] 1.7.2 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/configuracion/key-values with opcion filter
- [ ] 1.7.3 Create `index.ts` barrel — registerConfiguracionModule() + registerConfiguracionModuleRoutes() with all 7 entities DI

---

## Phase 2: Predios Module (36 tasks)

Tenant-scoped entities with parent-child relationships. Unique constraints on (predio_id, codigo).

### 2.1 Predio Entity (4 tasks)

- [ ] 2.1.1 Create `domain/entities/predio.entity.ts` — id, codigo, nombre, departamento, municipio, vereda, areaHectareas, capacidadMaxima, tipoExplotacionId, activo
- [ ] 2.1.2 Create `domain/repositories/predio.repository.ts` — IPredioRepository + PREDIO_REPOSITORY token, findByCodigo method
- [ ] 2.1.3 Create `infrastructure/persistence/drizzle-predio.repository.ts` — with tipoExplotacionId FK validation
- [ ] 2.1.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/predios with unique codigo check

### 2.2 Potrero Entity (5 tasks)

- [ ] 2.2.1 Create `domain/entities/potrero.entity.ts` — id, predioId, codigo, nombre, areaHectareas, tipoPasto, capacidadMaxima, estado, activo
- [ ] 2.2.2 Create `domain/repositories/potrero.repository.ts` — IPotreroRepository + POTRERO_REPOSITORY token, findByPredioId, findByPredioIdAndCodigo
- [ ] 2.2.3 Create `infrastructure/persistence/drizzle-potrero.repository.ts` — tenant filtering WHERE predio_id = ? AND activo = 1
- [ ] 2.2.4 Create use cases with tenant validation — verify user has access to predioId before operations
- [ ] 2.2.5 Create DTOs, mapper, schema, controller, routes — /api/v1/predios/{predioId}/potreros with uq_potreros_predio_codigo handling

### 2.3 Sector Entity (5 tasks)

- [ ] 2.3.1 Create `domain/entities/sector.entity.ts` — copy from Potrero pattern
- [ ] 2.3.2 Create `domain/repositories/sector.repository.ts` — ISectorRepository with tenant methods
- [ ] 2.3.3 Create `infrastructure/persistence/drizzle-sector.repository.ts` — tenant filtering + uq_sectores_predio_codigo
- [ ] 2.3.4 Create use cases with tenant validation
- [ ] 2.3.5 Create DTOs, mapper, schema, controller, routes — /api/v1/predios/{predioId}/sectores

### 2.4 Lote Entity (4 tasks)

- [ ] 2.4.1 Create `domain/entities/lote.entity.ts` — id, predioId, nombre, descripcion, tipo, activo
- [ ] 2.4.2 Create `domain/repositories/lote.repository.ts` — ILoteRepository with tenant methods
- [ ] 2.4.3 Create `infrastructure/persistence/drizzle-lote.repository.ts` — tenant filtering
- [ ] 2.4.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/predios/{predioId}/lotes

### 2.5 Grupo Entity (4 tasks)

- [ ] 2.5.1 Create `domain/entities/grupo.entity.ts` — id, predioId, nombre, descripcion, activo
- [ ] 2.5.2 Create `domain/repositories/grupo.repository.ts` — IGrupoRepository with tenant methods
- [ ] 2.5.3 Create `infrastructure/persistence/drizzle-grupo.repository.ts` — tenant filtering
- [ ] 2.5.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/predios/{predioId}/grupos

### 2.6 ConfigParametroPredio Entity (4 tasks)

- [ ] 2.6.1 Create `domain/entities/config-parametro-predio.entity.ts` — id, predioId, codigo, valor, descripcion, activo
- [ ] 2.6.2 Create `domain/repositories/config-parametro-predio.repository.ts` — IConfigParametroPredioRepository with findByPredioIdAndCodigo
- [ ] 2.6.3 Create `infrastructure/persistence/drizzle-config-parametro-predio.repository.ts` — tenant filtering + uq_parametros_predio_codigo
- [ ] 2.6.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/predios/{predioId}/parametros

### 2.7 Predios Module Index (10 tasks)

- [ ] 2.7.1 Create `domain/services/predio-access.domain-service.ts` — verify user access to predio (shared tenant validation)
- [ ] 2.7.2 Create `infrastructure/middleware/tenant-validation.middleware.ts` — validate predioId param matches user's tenants
- [ ] 2.7.3 Create `index.ts` barrel — registerPrediosModule() with all 6 repositories
- [ ] 2.7.4 Create `index.ts` route export — registerPrediosModuleRoutes() mounting all child routes
- [ ] 2.7.5 Write test: Create predio with duplicate codigo → 409
- [ ] 2.7.6 Write test: Create potrero in predio without access → 403
- [ ] 2.7.7 Write test: List potreros filtered by predio → only that predio's data
- [ ] 2.7.8 Write test: Soft-deleted potrero excluded from list
- [ ] 2.7.9 Write test: Update potrero with duplicate codigo in same predio → 409
- [ ] 2.7.10 Write test: Invalid tipoExplotacionId in predio create → 400

---

## Phase 3: Maestros Module (40 tasks)

Mixed scope: 3 tenant-scoped + 5 global entities. Dual repository patterns.

### 3.1 Base Repository Pattern (2 tasks)

- [ ] 3.1.1 Create `domain/repositories/base/tenant-repository.interface.ts` — ITenantRepository with findByPredioId(predioId)
- [ ] 3.1.2 Create `domain/repositories/base/global-repository.interface.ts` — IGlobalRepository with findAll() (no predio filter)

### 3.2 Veterinario Entity (Tenant-scoped) (4 tasks)

- [ ] 3.2.1 Create `domain/entities/veterinario.entity.ts` — id, predioId, nombre, telefono, email, direccion, numeroRegistro, especialidad, activo
- [ ] 3.2.2 Create `domain/repositories/veterinario.repository.ts` — IVeterinarioRepository extends ITenantRepository
- [ ] 3.2.3 Create `infrastructure/persistence/drizzle-veterinario.repository.ts` — tenant filtering WHERE predio_id = ?
- [ ] 3.2.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/maestros/veterinarios?predioId={id}

### 3.3 Propietario Entity (Tenant-scoped) (4 tasks)

- [ ] 3.3.1 Create `domain/entities/propietario.entity.ts` — id, predioId, nombre, tipoDocumento, numeroDocumento, telefono, email, direccion, activo
- [ ] 3.3.2 Create `domain/repositories/propietario.repository.ts` — IPropietarioRepository extends ITenantRepository
- [ ] 3.3.3 Create `infrastructure/persistence/drizzle-propietario.repository.ts` — tenant filtering
- [ ] 3.3.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/maestros/propietarios?predioId={id}

### 3.4 Hierro Entity (Tenant-scoped) (4 tasks)

- [ ] 3.4.1 Create `domain/entities/hierro.entity.ts` — id, predioId, nombre, descripcion, activo
- [ ] 3.4.2 Create `domain/repositories/hierro.repository.ts` — IHierroRepository extends ITenantRepository
- [ ] 3.4.3 Create `infrastructure/persistence/drizzle-hierro.repository.ts` — tenant filtering
- [ ] 3.4.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/maestros/hierros?predioId={id}

### 3.5 DiagnosticoVeterinario Entity (Global) (3 tasks)

- [ ] 3.5.1 Create `domain/entities/diagnostico-veterinario.entity.ts` — id, nombre, descripcion, categoria, activo
- [ ] 3.5.2 Create `domain/repositories/diagnostico-veterinario.repository.ts` — IDiagnosticoVeterinarioRepository extends IGlobalRepository
- [ ] 3.5.3 Create `infrastructure/persistence/drizzle-diagnostico-veterinario.repository.ts` — global access (no predio filter)
- [ ] 3.5.4 Create use cases (super-admin write), DTOs, mapper, schema, controller, routes — /api/v1/maestros/diagnosticos-veterinarios

### 3.6 MotivoVenta Entity (Global) (2 tasks)

- [ ] 3.6.1 Create entity, repository, Drizzle repo — copy global pattern
- [ ] 3.6.2 Create use cases (super-admin write), DTOs, mapper, schema, controller, routes — /api/v1/maestros/motivos-ventas

### 3.7 CausaMuerte Entity (Global) (2 tasks)

- [ ] 3.7.1 Create entity, repository, Drizzle repo — copy global pattern
- [ ] 3.7.2 Create use cases (super-admin write), DTOs, mapper, schema, controller, routes — /api/v1/maestros/causas-muerte

### 3.8 LugarCompra Entity (Global) (2 tasks)

- [ ] 3.8.1 Create entity, repository, Drizzle repo — copy global pattern with nombre, tipo, ubicacion, contacto, telefono
- [ ] 3.8.2 Create use cases (super-admin write), DTOs, mapper, schema, controller, routes — /api/v1/maestros/lugares-compras

### 3.9 LugarVenta Entity (Global) (2 tasks)

- [ ] 3.9.1 Create entity, repository, Drizzle repo — copy global pattern
- [ ] 3.9.2 Create use cases (super-admin write), DTOs, mapper, schema, controller, routes — /api/v1/maestros/lugares-ventas

### 3.10 Maestros Module Index & Tests (15 tasks)

- [ ] 3.10.1 Create `index.ts` barrel — registerMaestrosModule() with all 8 repositories
- [ ] 3.10.2 Create `index.ts` route export — registerMaestrosModuleRoutes() with tenant/global route separation
- [ ] 3.10.3 Write test: Veterinario create without predioId → 400
- [ ] 3.10.4 Write test: Veterinario list with predioId filter → only that predio's data
- [ ] 3.10.5 Write test: Veterinario access different predio → 403
- [ ] 3.10.6 Write test: DiagnosticoVeterinario create as super-admin → 201
- [ ] 3.10.7 Write test: DiagnosticoVeterinario create as regular user → 403
- [ ] 3.10.8 Write test: DiagnosticoVeterinario list → all active (no predio filter)
- [ ] 3.10.9 Write test: Propietario soft-delete → excluded from list
- [ ] 3.10.10 Write test: Hierro update with tenant validation
- [ ] 3.10.11 Write test: MotivoVenta super-admin delete
- [ ] 3.10.12 Write test: CausaMuerte soft-delete filtering
- [ ] 3.10.13 Write test: LugarCompra pagination
- [ ] 3.10.14 Write test: LugarVenta create as super-admin
- [ ] 3.10.15 Write test: Mixed access: tenant user can read global + own tenant data only

---

## Phase 4: Animales Module (35 tasks)

Most complex: self-referencing FKs, junction table, genealogy queries, multiple ID systems.

### 4.1 Animal Entity & Domain (6 tasks)

- [ ] 4.1.1 Create `domain/entities/animal.entity.ts` — id, predioId, codigo, codigoRfid, codigoArete, codigoQr, nombre, fechaNacimiento, fechaIngreso, fechaSalida, sexoKey, estadoAnimalKey, madreId, padreId, configRazasId, propietarioId, potreroId, hierroId, grupoId, observaciones, activo, createdAt, updatedAt
- [ ] 4.1.2 Create `domain/repositories/animal.repository.ts` — IAnimalRepository with findByPredioId, findByPredioIdAndCodigo, findGenealogy(animalId, depth)
- [ ] 4.1.3 Create `domain/services/animal-validation.domain-service.ts` — validateLineage(madreId, padreId, predioId), checkCrossPredioLineage
- [ ] 4.1.4 Create `infrastructure/persistence/drizzle-animal.repository.ts` — tenant filtering + uq_animales_predio_codigo + genealogy query (JS traversal, depth 5)
- [ ] 4.1.5 Create `infrastructure/persistence/drizzle-animal.repository.ts` — filtering by predioId, potreroId, estadoAnimalKey, grupoId
- [ ] 4.1.6 Create use cases: ListAnimalesUseCase with filters, GetAnimalUseCase with parent refs

### 4.2 Animal Use Cases & DTOs (4 tasks)

- [ ] 4.2.1 Create `application/use-cases/create-animal.use-case.ts` — validate lineage, unique codigo check
- [ ] 4.2.2 Create `application/use-cases/update-animal.use-case.ts` — partial updates, lineage change validation
- [ ] 4.2.3 Create `application/use-cases/delete-animal.use-case.ts` — soft delete
- [ ] 4.2.4 Create `application/dtos/animal.dto.ts` — CreateAnimalDto (codigo required, parents optional), UpdateAnimalDto, AnimalResponseDto with madre/padre refs

### 4.3 Animal Routes & Controller (3 tasks)

- [ ] 4.3.1 Create `infrastructure/http/schemas/animal.schema.ts` — JSON Schema with codigo, codigoRfid, codigoArete, codigoQr, nombre, fechaNacimiento, sexoKey, estadoAnimalKey, madreId, padreId, configRazasId, propietarioId, potreroId, hierroId, grupoId
- [ ] 4.3.2 Create `infrastructure/http/controllers/animal.controller.ts` — list, get, create, update, delete, getGenealogy methods
- [ ] 4.3.3 Create `infrastructure/http/routes/animal.routes.ts` — /api/v1/animales + /api/v1/animales/{id}/genealogia

### 4.4 Imagen Entity (4 tasks)

- [ ] 4.4.1 Create `domain/entities/imagen.entity.ts` — id, predioId, ruta, nombreOriginal, mimeType, tamanoBytes, descripcion, activo
- [ ] 4.4.2 Create `domain/repositories/imagen.repository.ts` — IImagenRepository with tenant methods
- [ ] 4.4.3 Create `infrastructure/persistence/drizzle-imagen.repository.ts` — tenant filtering
- [ ] 4.4.4 Create use cases, DTOs, mapper, schema, controller, routes — /api/v1/imagenes?predioId={id}

### 4.5 AnimalesImagenes Junction (5 tasks)

- [ ] 4.5.1 Create `domain/entities/animal-imagen.entity.ts` — id, animalId, imagenId, orden, esPrincipal, activo
- [ ] 4.5.2 Create `domain/repositories/animal-imagen.repository.ts` — IAnimalImagenRepository with findByAnimalId, findExistingAssociation
- [ ] 4.5.3 Create `infrastructure/persistence/drizzle-animal-imagen.repository.ts` — check cross-predio before association
- [ ] 4.5.4 Create use cases: AssignImagenUseCase, RemoveImagenUseCase, ListAnimalImagenesUseCase
- [ ] 4.5.5 Create controller + routes — /api/v1/animales/{animalId}/imagenes

### 4.6 Genealogy Domain Service (2 tasks)

- [ ] 4.6.1 Create `domain/services/genealogy.domain-service.ts` — buildGenealogyTree(animalId, maxDepth=5) using iterative approach
- [ ] 4.6.2 Create `application/use-cases/get-genealogy.use-case.ts` — use genealogy service, return ancestors structure

### 4.7 Animales Module Index & Tests (11 tasks)

- [ ] 4.7.1 Create `infrastructure/mappers/animal.mapper.ts` — snake_case ↔ camelCase conversion
- [ ] 4.7.2 Create `infrastructure/mappers/imagen.mapper.ts` — snake_case ↔ camelCase
- [ ] 4.7.3 Create `index.ts` barrel — registerAnimalesModule() with all repositories
- [ ] 4.7.4 Create `index.ts` route export — registerAnimalesModuleRoutes()
- [ ] 4.7.5 Write test: Create animal with duplicate codigo in same predio → 409
- [ ] 4.7.6 Write test: Create animal with valid madre_id → success
- [ ] 4.7.7 Write test: Create animal with madre_id from different predio → 400
- [ ] 4.7.8 Write test: Get animal genealogy → returns ancestors up to depth 5
- [ ] 4.7.9 Write test: Assign image to animal from same predio → 201
- [ ] 4.7.10 Write test: Assign image to animal from different predio → 400
- [ ] 4.7.11 Write test: Duplicate image association → 409

---

## Phase 5: Integration & Verification (8 tasks)

### 5.1 Module Registration (3 tasks)

- [ ] 5.1.1 Update `apps/api/src/app.ts` — import and call registerConfiguracionModuleRoutes()
- [ ] 5.1.2 Update `apps/api/src/app.ts` — import and call registerPrediosModuleRoutes()
- [ ] 5.1.3 Update `apps/api/src/app.ts` — import and call registerMaestrosModuleRoutes()
- [ ] 5.1.4 Update `apps/api/src/app.ts` — import and call registerAnimalesModuleRoutes()

### 5.2 Container Registration (2 tasks)

- [ ] 5.2.1 Update `apps/api/src/container.ts` or create module index.ts — registerConfiguracionModule(), registerPrediosModule(), registerMaestrosModule(), registerAnimalesModule()
- [ ] 5.2.2 Ensure all module registerXxxModule() functions are called at server startup

### 5.3 Quality Checks (3 tasks)

- [ ] 5.3.1 Run `pnpm typecheck` — fix any TypeScript errors
- [ ] 5.3.2 Run `pnpm --filter @ganatrack/api test` — fix failing tests
- [ ] 5.3.3 Run `pnpm lint` — fix linting issues

---

## Implementation Notes

### Reusable Templates

**Configuracion entities** are nearly identical. After completing ConfigRaza:
1. Copy directory structure
2. Rename files (config-raza → config-condicion-corporal)
3. Update field names in entity/DTO/schema
4. Update route paths

### Critical Dependencies

1. **Phase 1 must complete before Phase 2**: Configuracion establishes global patterns
2. **Phase 2 must complete before Phase 3**: Predios establishes tenant-scoped patterns
3. **Phase 3 before Phase 4**: Maestros tests dual access patterns needed for Animales
4. **Animales depends on**: Predios (potreroId), Configuracion (razasId), Maestros (propietarioId, hierroId)

### Repository Pattern Summary

| Entity Type | Repository Pattern | Query Filter |
|-------------|-------------------|--------------|
| Global (Config) | IGlobalRepository | WHERE activo = 1 |
| Tenant-scoped | ITenantRepository | WHERE predio_id = ? AND activo = 1 |
| Mixed (Maestros) | Both interfaces | Depends on entity |

### Testing Priority

1. **Unit tests**: Use cases (business logic validation)
2. **Integration tests**: Repository database queries
3. **E2E tests**: Route handlers with auth/tenant validation

### Estimated Timeline

- Phase 1 (Configuracion): 8-10 hours
- Phase 2 (Predios): 10-12 hours
- Phase 3 (Maestros): 10-12 hours
- Phase 4 (Animales): 10-12 hours
- Phase 5 (Integration): 2-3 hours
- **Total**: 40-49 hours
