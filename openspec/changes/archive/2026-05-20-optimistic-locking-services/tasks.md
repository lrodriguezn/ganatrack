# Tasks: Replicate Optimistic Locking to Servicios (Issue #41)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500–600 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB migration + backend version column, entities, DTOs, mappers | PR 1 | Schema → code cascade |
| 2 | Use cases (4 root update UCs with expectedVersion + VersionConflictError) | PR 1 | Core logic |
| 3 | Routes + integration tests | PR 1 | Exposes the feature |
| 4 | Frontend types, service, mock | PR 1 | Complete E2E |

Single PR (all units together) is preferred — clean, self-contained feature.

## Phase 1: Schema Migration

- [ ] 1.1 Add `version: integer('version').notNull().default(1)` to `serviciosPalpacionesGrupal`, `serviciosInseminacionGrupal`, `serviciosPartosAnimales`, `serviciosVeterinariosGrupal` in `packages/database/src/schema/servicios.ts`
- [ ] 1.2 Run `drizzle-kit generate` → verify migration includes version column on all 4 root tables
- [ ] 1.3 Run `drizzle-kit push` (or migrate) to apply; confirm all 4 tables have version

## Phase 2: Domain & Application Layers

### Entities
- [ ] 2.1 Add `version: number` to `PalpacionGrupalEntity` in `apps/api/src/modules/servicios/domain/entities/palpacion.entity.ts`
- [ ] 2.2 Add `version: number` to `InseminacionGrupalEntity` in `apps/api/src/modules/servicios/domain/entities/inseminacion.entity.ts`
- [ ] 2.3 Add `version: number` to `PartoAnimalEntity` in `apps/api/src/modules/servicios/domain/entities/parto.entity.ts`
- [ ] 2.4 Add `version: number` to `VeterinarioGrupalEntity` in `apps/api/src/modules/servicios/domain/entities/veterinario.entity.ts`

### Response DTOs
- [ ] 2.5 Add `version: number` to `PalpacionGrupalResponseDto` in `apps/api/src/modules/servicios/application/dtos/palpacion.dto.ts`
- [ ] 2.6 Add `version: number` to `InseminacionGrupalResponseDto` in `apps/api/src/modules/servicios/application/dtos/inseminacion.dto.ts`
- [ ] 2.7 Add `version: number` to `PartoResponseDto` in `apps/api/src/modules/servicios/application/dtos/parto.dto.ts`
- [ ] 2.8 Add `version: number` to `VeterinarioGrupalResponseDto` in `apps/api/src/modules/servicios/application/dtos/veterinario.dto.ts`

### Mappers
- [ ] 2.9 Map `entity.version` in `PalpacionGrupalMapper.toResponse()` in `apps/api/src/modules/servicios/infrastructure/mappers/palpacion.mapper.ts`
- [ ] 2.10 Map `entity.version` in `InseminacionGrupalMapper.toResponse()` in `apps/api/src/modules/servicios/infrastructure/mappers/inseminacion.mapper.ts`
- [ ] 2.11 Map `entity.version` in `PartoMapper.toResponse()` in `apps/api/src/modules/servicios/infrastructure/mappers/parto.mapper.ts`
- [ ] 2.12 Map `entity.version` in `VeterinarioGrupalMapper.toResponse()` in `apps/api/src/modules/servicios/infrastructure/mappers/veterinario.mapper.ts`

## Phase 3: Update Use Cases + Repository

### Use Cases
- [ ] 3.1 Add `expectedVersion: number` as last param to `UpdatePalpacionGrupalUseCase.execute()`; throw `VersionConflictError` on mismatch; pass `version: existingVersion + 1` in update payload
- [ ] 3.2 Add `expectedVersion: number` as last param to `UpdateInseminacionGrupalUseCase.execute()`; same pattern
- [ ] 3.3 Add `expectedVersion: number` as last param to `UpdatePartoUseCase.execute()`; same pattern
- [ ] 3.4 Add `expectedVersion: number` as last param to `UpdateVeterinarioGrupalUseCase.execute()`; same pattern

### Tests
- [ ] 3.5 Write unit tests for `UpdatePalpacionGrupalUseCase` — version match succeeds, mismatch throws `VersionConflictError`, version increments (follow `update-animal.use-case.spec.ts` pattern)
- [ ] 3.6 Write unit tests for `UpdateInseminacionGrupalUseCase`
- [ ] 3.7 Write unit tests for `UpdatePartoUseCase`
- [ ] 3.8 Write unit tests for `UpdateVeterinarioGrupalUseCase`

## Phase 4: HTTP Routes

- [ ] 4.1 Import the 4 update use cases at top of `apps/api/src/modules/servicios/infrastructure/http/routes/servicios.routes.ts`
- [ ] 4.2 Instantiate the 4 update use cases alongside existing use case instances
- [ ] 4.3 Add PUT `/servicios/palpaciones/:id` — parse `If-Match`, return 400 on missing/invalid, call use case, return `X-Resource-Version` header, catch `VersionConflictError` → 409
- [ ] 4.4 Add PUT `/servicios/inseminaciones/:id` — same pattern
- [ ] 4.5 Add PUT `/servicios/partos/:id` — same pattern
- [ ] 4.6 Add PUT `/servicios/veterinarios/:id` — same pattern
- [ ] 4.7 Write integration tests for all 4 PUT routes: 400 MISSING_IF_MATCH, 400 INVALID_IF_MATCH, 409 VERSION_CONFLICT, 200 + X-Resource-Version on success (follow `animales.routes.version.spec.ts` pattern)

## Phase 5: Frontend

### Types
- [ ] 5.1 Add `version: number` to `EventoGrupal` interface in `apps/web/src/modules/servicios/types/servicios.types.ts`
- [ ] 5.2 Add `version: number` to `Parto` interface in same file
- [ ] 5.3 Verify `ServicioVeterinarioEvento` and `PalpacionEvento`/`InseminacionEvento` inherit `version` from `EventoGrupal`; verify `Parto` gets it explicitly

### Service Interface
- [ ] 5.4 Add `updatePalpacion(id, dto, version)`, `updateInseminacion(id, dto, version)`, `updateParto(id, dto, version)`, `updateVeterinario(id, dto, version)` to `ServiciosService` interface in `apps/web/src/modules/servicios/services/servicios.service.ts`

### API Implementation
- [ ] 5.5 Implement `updatePalpacion(id, dto, version)` in `RealServiciosService` — `apiClient.put(..., { headers: { 'If-Match': version } })`
- [ ] 5.6 Implement `updateInseminacion(id, dto, version)` in `RealServiciosService`
- [ ] 5.7 Implement `updateParto(id, dto, version)` in `RealServiciosService`
- [ ] 5.8 Implement `updateVeterinario(id, dto, version)` in `RealServiciosService`

### Mock Implementation
- [ ] 5.9 Implement all 4 `update*` methods in `MockServiciosService` — bump `version` by 1 on success
- [ ] 5.10 Write unit tests for mock — verify version bumps correctly

## Phase 6: GET Routes (X-Resource-Version on read)

- [ ] 6.1 Add `X-Resource-Version` response header to GET `/servicios/palpaciones/:id`
- [ ] 6.2 Add `X-Resource-Version` response header to GET `/servicios/inseminaciones/:id`
- [ ] 6.3 Add `X-Resource-Version` response header to GET `/servicios/partos/:id`
- [ ] 6.4 Add `X-Resource-Version` response header to GET `/servicios/veterinarios/:id`
- [ ] 6.5 Add integration tests for GET responses — verify `X-Resource-Version` header is present