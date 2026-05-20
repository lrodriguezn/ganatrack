# Delta for Servicios Optimistic Locking

## ADDED Requirements

### Requirement: Version Column on Servicios Root Tables

The system MUST add a `version` column to all 4 servicios root/grupal tables in `packages/database/src/schema/servicios.ts`.

- GIVEN the `servicios` schema definition
- WHEN the Drizzle migration runs
- THEN `palpaciones_grupal`, `inseminacion_grupal`, `partos_animales`, and `veterinarios_grupal` tables MUST each have `version: integer('version').notNull().default(1)`
- AND existing rows MUST receive `version = 1` via database default

### Requirement: Version Check in Update Use Cases

The system MUST throw `VersionConflictError` when the stored version does not match `expectedVersion`.

- GIVEN the 4 update use case files
- WHEN use cases are updated
- THEN `UpdatePalpacionGrupalUseCase`, `UpdateInseminacionGrupalUseCase`, `UpdatePartoUseCase`, `UpdateVeterinarioGrupalUseCase` MUST accept `expectedVersion: number` as the last parameter
- AND throw `VersionConflictError` when `existing.version !== expectedVersion`
- AND increment `version` by 1 in the update payload on success

### Requirement: PUT Route — If-Match Contract

The system MUST enforce the `If-Match` / `X-Resource-Version` header contract on all 4 PUT routes in `servicios.routes.ts`.

- GIVEN the 4 PUT routes
- WHEN a request arrives without `If-Match` header
- THEN response MUST be `400` with `{ code: 'MISSING_IF_MATCH', message: 'If-Match header is required' }`

- GIVEN `If-Match` with non-integer value
- WHEN `parseInt()` returns `NaN`
- THEN response MUST be `400` with `{ code: 'INVALID_IF_MATCH', message: 'If-Match must be an integer' }`

- GIVEN `VersionConflictError` from use case
- WHEN handler catches it
- THEN response MUST be `409` with `{ code: 'VERSION_CONFLICT', ... }`

- GIVEN successful update
- THEN response MUST include `X-Resource-Version: <newVersion>` header

### Requirement: Frontend Update API with If-Match

The system MUST extend the frontend `ServiciosService` interface with `update*` methods that attach `If-Match`.

- GIVEN the `ServiciosService` interface
- WHEN `updatePalpacion(id, dto, version)`, `updateInseminacion(id, dto, version)`, `updateParto(id, dto, version)`, `updateVeterinario(id, dto, version)` are called
- THEN each method MUST attach `If-Match: <version>` to `apiClient.put`
- AND return the parsed response

### Requirement: Frontend Types Include version

The system MUST add `version: number` to `EventoGrupal` and `Parto` interfaces, and all derived service event types.

---

## MODIFIED Requirements

### Requirement: GET Response Includes X-Resource-Version Header

The system MUST return `X-Resource-Version` on all GET responses for the 4 servicios routes.
(Previously: no version header on GET responses)

- GIVEN a GET request to any servicios resource
- WHEN the record has `version = N`
- THEN response MUST include `X-Resource-Version: N`

---

## REMOVED Requirements

None.

---

## Boundary Conditions

| Condition | Expected Behavior |
|-----------|------------------|
| `If-Match: 0` on record with version=1 | `409` — version mismatch |
| `If-Match: -1` | `400` — invalid version |
| `If-Match: 1.5` (float string) | `400` — invalid version |
| `If-Match: ""` (empty) | `400` — invalid version |
| Old record (pre-migration) | Gets `version=1` via DEFAULT — works normally |
| Concurrent updates | Second request gets `409` — first wins |

---

## Traceability Matrix

| Requirement | Files |
|-------------|-------|
| Add `version` to schema | `packages/database/src/schema/servicios.ts` |
| Add `version` to entities | `*/domain/entities/*.entity.ts` (4 files) |
| Add `version` to response DTOs | `*/application/dtos/*.dto.ts` (4 files) |
| Map `version` in mappers | `*/infrastructure/mappers/*.mapper.ts` (4 files) |
| `expectedVersion` param + check | `*/application/use-cases/update-*.use-case.ts` (4 files) |
| `If-Match` / `X-Resource-Version` headers | `apps/api/src/modules/servicios/infrastructure/http/routes/servicios.routes.ts` |
| Frontend update methods + If-Match | `apps/web/src/modules/servicios/services/servicios.api.ts` |
| Frontend version types | `apps/web/src/modules/servicios/types/servicios.types.ts` |
| Mock version bump | `apps/web/src/modules/servicios/services/servicios.mock.ts` |