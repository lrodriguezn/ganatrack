# Delta for Optimistic Locking — Servicios (Issue #41)

## ADDED Requirements

### Requirement: Version Column on Servicios Root Tables

The system MUST add a `version` column to all 4 servicios root/grupal tables in `packages/database/src/schema/servicios.ts`.

- GIVEN `servicios` schema definition
- WHEN the migration runs
- THEN `palpaciones_grupal`, `inseminacion_grupal`, `partos_animales`, and `veterinarios_grupal` tables MUST each have `version: integer('version').notNull().default(1)`
- AND existing rows MUST receive `version = 1` via database default

### Requirement: Version in Entity Layer

The system MUST add `version: number` to all 4 root entities in the domain layer.

- GIVEN the 4 root entity files
- WHEN entities are defined/updated
- THEN `PalpacionGrupalEntity`, `InseminacionGrupalEntity`, `PartoEntity`, and `VeterinarioGrupalEntity` MUST each include `readonly version: number`
- AND all entity read operations MUST return `version` from the repository

### Requirement: Version in Response DTOs

The system MUST add `version: number` to all 4 root response DTOs in the application layer.

- GIVEN the 4 response DTO files
- WHEN DTOs are updated
- THEN `PalpacionGrupalResponseDto`, `InseminacionGrupalResponseDto`, `PartoResponseDto`, and `VeterinarioGrupalResponseDto` MUST each include `version: number`
- AND DTOs MUST NOT accept `version` as input (it is server-assigned)

### Requirement: Version in Mappers

The system MUST include `version` when mapping from entity to response DTO in all 4 mappers.

- GIVEN the 4 mapper files
- WHEN `toResponseDto()` is called
- THEN mappers MUST map `entity.version` → `dto.version`
- AND existing `toEntity()` and `toPersistence()` behavior MUST remain unchanged

### Requirement: Update Use Cases Accept expectedVersion

The system MUST add `expectedVersion: number` as the last parameter to all 4 update use cases.

- GIVEN the 4 update use case files
- WHEN use cases are updated
- THEN `UpdatePalpacionGrupalUseCase.execute(id, dto, expectedVersion)` MUST be the new signature
- AND `UpdateInseminacionGrupalUseCase.execute(id, dto, expectedVersion)` MUST be the new signature
- AND `UpdatePartoUseCase.execute(id, dto, expectedVersion)` MUST be the new signature
- AND `UpdateVeterinarioGrupalUseCase.execute(id, dto, expectedVersion)` MUST be the new signature

### Requirement: Version Check in Update Use Cases

The system MUST throw `VersionConflictError` when the stored version does not match `expectedVersion`.

- GIVEN an existing record with `version = N`
- WHEN `update*UseCase.execute(id, dto, expectedVersion = M)` is called with `M ≠ N`
- THEN the use case MUST throw `VersionConflictError` with `currentVersion = N` and `expectedVersion = M`
- AND the database MUST NOT be modified

#### Scenario: Version mismatch — palpaciones

- GIVEN `palpaciones_grupal` row has `version = 5`
- WHEN `UpdatePalpacionGrupalUseCase.execute(1, dto, 3)` is called
- THEN `VersionConflictError` MUST be thrown with `currentVersion: 5`, `expectedVersion: 3`

#### Scenario: Version mismatch — inseminaciones

- GIVEN `inseminacion_grupal` row has `version = 2`
- WHEN `UpdateInseminacionGrupalUseCase.execute(1, dto, 1)` is called
- THEN `VersionConflictError` MUST be thrown with `currentVersion: 2`, `expectedVersion: 1`

#### Scenario: Version mismatch — partos

- GIVEN `partos_animales` row has `version = 8`
- WHEN `UpdatePartoUseCase.execute(1, dto, 7)` is called
- THEN `VersionConflictError` MUST be thrown with `currentVersion: 8`, `expectedVersion: 7`

#### Scenario: Version mismatch — veterinarios

- GIVEN `veterinarios_grupal` row has `version = 4`
- WHEN `UpdateVeterinarioGrupalUseCase.execute(1, dto, 2)` is called
- THEN `VersionConflictError` MUST be thrown with `currentVersion: 4`, `expectedVersion: 2`

### Requirement: Version Increment on Successful Update

The system MUST increment `version` by 1 in the update payload on all 4 use cases.

- GIVEN the version check passes
- WHEN the update is executed
- THEN the repository update call MUST include `version: existingVersion + 1`
- AND no other fields are affected

### Requirement: PUT Route — If-Match Header Required

The system MUST return HTTP 400 when `If-Match` header is missing on PUT requests to all 4 servicios routes.

- GIVEN a PUT request to `/servicios/palpaciones/:id`
- WHEN `If-Match` header is absent
- THEN response MUST be `400 Bad Request` with `{ code: 'MISSING_IF_MATCH', message: 'If-Match header is required' }`
- AND the same applies for `/servicios/inseminaciones/:id`, `/servicios/partos/:id`, `/servicios/veterinarios/:id`

### Requirement: PUT Route — Invalid If-Match Returns 400

The system MUST return HTTP 400 when `If-Match` header contains a non-integer value.

- GIVEN a PUT request with `If-Match: not-a-number`
- WHEN `parseInt()` returns `NaN`
- THEN response MUST be `400 Bad Request` with `{ code: 'INVALID_IF_MATCH', message: 'If-Match must be an integer' }`

### Requirement: PUT Route — Conflict Returns 409

The system MUST return HTTP 409 when `If-Match` version does not match the current resource version.

- GIVEN the `VersionConflictError` is thrown by the use case
- WHEN the PUT handler catches it
- THEN response MUST be `409 Conflict` with:
  ```json
  {
    "success": false,
    "error": {
      "code": "VERSION_CONFLICT",
      "message": "El recurso fue modificado por otro usuario. Recarga e intenta de nuevo.",
      "details": { "currentVersion": ["N"], "expectedVersion": ["M"] }
    }
  }
  ```

#### Scenario: Conflict on palpaciones PUT

- GIVEN `palpaciones_grupal` row has `version = 3`
- WHEN PUT arrives with `If-Match: 2`
- THEN response MUST be `409` with `VERSION_CONFLICT`

#### Scenario: Conflict on inseminaciones PUT

- GIVEN `inseminacion_grupal` row has `version = 6`
- WHEN PUT arrives with `If-Match: 5`
- THEN response MUST be `409` with `VERSION_CONFLICT`

#### Scenario: Conflict on partos PUT

- GIVEN `partos_animales` row has `version = 10`
- WHEN PUT arrives with `If-Match: 9`
- THEN response MUST be `409` with `VERSION_CONFLICT`

#### Scenario: Conflict on veterinarios PUT

- GIVEN `veterinarios_grupal` row has `version = 7`
- WHEN PUT arrives with `If-Match: 6`
- THEN response MUST be `409` with `VERSION_CONFLICT`

### Requirement: PUT Route — X-Resource-Version Response Header

The system MUST return `X-Resource-Version` header on all successful PUT responses.

- GIVEN a successful PUT with matching version
- WHEN the update completes
- THEN response MUST include `X-Resource-Version: <newVersion>` header
- AND the response body MUST include the updated resource

#### Scenario: Successful palpaciones update

- GIVEN the record has `version = 2`
- WHEN PUT with `If-Match: 2` succeeds
- THEN response MUST have `X-Resource-Version: 3`

#### Scenario: Successful inseminaciones update

- GIVEN the record has `version = 1`
- WHEN PUT with `If-Match: 1` succeeds
- THEN response MUST have `X-Resource-Version: 2`

#### Scenario: Successful partos update

- GIVEN the record has `version = 4`
- WHEN PUT with `If-Match: 4` succeeds
- THEN response MUST have `X-Resource-Version: 5`

#### Scenario: Successful veterinarios update

- GIVEN the record has `version = 9`
- WHEN PUT with `If-Match: 9` succeeds
- THEN response MUST have `X-Resource-Version: 10`

### Requirement: First Update (version 1 → 2)

The system MUST allow the first update when `expectedVersion = 1` on a row with `version = 1`.

- GIVEN a new record with `version = 1`
- WHEN PUT is called with `If-Match: 1`
- THEN update MUST succeed with `X-Resource-Version: 2`
- AND `VersionConflictError` MUST NOT be thrown

### Requirement: Rapid Sequential Updates Increment Sequentially

The system MUST increment version by exactly 1 per update, regardless of timing.

- GIVEN a record at `version = 1`
- WHEN 3 successful updates occur in sequence
- THEN versions MUST progress `1 → 2 → 3 → 4`
- AND no version numbers are skipped or repeated

### Requirement: Invalid Version String in If-Match

The system MUST treat non-numeric `If-Match` values as invalid (return 400).

- GIVEN `If-Match: abc123`
- WHEN `parseInt()` is applied
- THEN response MUST be `400` with `INVALID_IF_MATCH`

### Requirement: Frontend Update API Methods Attach If-Match

The system MUST extend the frontend `ServiciosService` interface with `update*` methods that attach the `If-Match` header.

- GIVEN the `ServiciosService` interface
- WHEN `updatePalpacion(id, dto, version)`, `updateInseminacion(id, dto, version)`, `updateParto(id, dto, version)`, `updateVeterinario(id, dto, version)` are called
- THEN each method MUST attach `If-Match: <version>` to the `apiClient.put` call
- AND return the parsed response

#### Scenario: updatePalpacion sends If-Match

- GIVEN `updatePalpacion(1, dto, 5)` is called
- WHEN the API call is made
- THEN the request MUST include `If-Match: 5`

### Requirement: Frontend Types Include version

The system MUST add `version: number` to all 4 service event types in `servicios.types.ts`.

- GIVEN `EventoGrupal` interface or `Parto` interface
- WHEN types are defined
- THEN `version: number` MUST be present
- AND all derived types (`ServicioVeterinarioEvento`, `ServicioPalpacionEvento`, `ServicioInseminacionEvento`) MUST inherit or redeclare `version`

### Requirement: Frontend Mock Service Bumps Version

The mock implementation MUST increment `version` on successful update.

- GIVEN a mock record with `version = 3`
- WHEN `mockServiciosService.updatePalpacion(id, dto, 3)` is called
- THEN the returned record MUST have `version = 4`
- AND `updateInseminacion`, `updateParto`, `updateVeterinario` MUST behave identically

## MODIFIED Requirements

### Requirement: GET Response Includes X-Resource-Version Header

The system MUST return `X-Resource-Version` on all GET responses for the 4 servicios routes.
(Previously: no version header on GET responses)

- GIVEN a GET request to `/servicios/palpaciones/1`
- WHEN the record has `version = 5`
- THEN response MUST include `X-Resource-Version: 5`

## REMOVED Requirements

None.

## Boundary Conditions

| Condition | Expected Behavior |
|-----------|------------------|
| `If-Match: 0` on new record (version=1) | `409` — version mismatch |
| `If-Match: -1` (negative integer) | `400` — invalid version |
| `If-Match: 1.5` (float string) | `400` — invalid version |
| `If-Match: ""` (empty string) | `400` — missing/empty |
| Old record with no version column (pre-migration) | N/A — all records get `version=1` via default |
| Race condition: two simultaneous PUTs | Second request gets `409` — first wins |
| `txManager` not used for version bump | Correct — single-row update, no multi-table tx needed |

## Traceability Matrix

| Requirement | Design Decision | Files |
|-------------|-----------------|-------|
| Add version to schema | Root tables only, DEFAULT 1 | `packages/database/src/schema/servicios.ts` |
| Version in entities | `readonly version: number` | `*/domain/entities/*.entity.ts` (4 files) |
| Version in DTOs | Server-assigned output field | `*/application/dtos/*.dto.ts` (4 files) |
| Version in mappers | `entity.version → dto.version` | `*/infrastructure/mappers/*.mapper.ts` (4 files) |
| expectedVersion param | Last param in use case execute() | `*/application/use-cases/update-*.use-case.ts` (4 files) |
| VersionConflictError on mismatch | Throw on `existing.version !== expectedVersion` | `*/application/use-cases/update-*.use-case.ts` (4 files) |
| Version increment | `version: existing + 1` in update payload | `*/infrastructure/persistence/drizzle-*.repository.ts` |
| If-Match required (400) | Guard before use case call | `apps/api/src/modules/servicios/infrastructure/http/routes/servicios.routes.ts` |
| Invalid If-Match (400) | `isNaN` check after `parseInt` | `servicios.routes.ts` |
| 409 on mismatch | Catch `VersionConflictError`, reply.code(409) | `servicios.routes.ts` |
| X-Resource-Version response | `reply.header('X-Resource-Version', result.version)` | `servicios.routes.ts` |
| Frontend update methods | `apiClient.put(..., { headers: { 'If-Match': version } })` | `apps/web/src/modules/servicios/services/servicios.api.ts` |
| Frontend version types | `version: number` on event types | `apps/web/src/modules/servicios/types/servicios.types.ts` |
| Mock version bump | Increment on mock update | `apps/web/src/modules/servicios/services/servicios.mock.ts` |

## Non-Functional Requirements

- **Performance**: Version check adds no DB round trips — version is read in the same query as the update.
- **Consistency**: `version` increment is atomic within the UPDATE statement (`SET version = version + 1`).
- **Backward compatibility**: Old clients without `If-Match` get `400` (not `409`) — clear signal to upgrade.
- **Rollback**: Drop `version` column reverts to no locking; no data migration needed on rollback.