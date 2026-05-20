# Design: Replicate Optimistic Locking to Servicios

## Technical Approach

Follow the animales pattern exactly: add `version INTEGER NOT NULL DEFAULT 1` to the 4 servicios root tables, extend entities/DTOs/mappers, inject `expectedVersion` into the 4 root update use cases (throw `VersionConflictError` on mismatch), and expose PUT routes that read `If-Match` and return `X-Resource-Version`. Frontend API methods will send `If-Match` and types will carry `version`.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Which tables get `version` | All tables vs root-only | Child tables (animales within a group) are edited independently; locking the root is sufficient and simpler | 4 root tables only |
| Update transaction scope | Wrap update in `txManager` vs single-repo update | Current update use cases only touch the root row; `txManager` is used for CREATE (multi-table), not for root updates | Single-repo update, no `txManager` |
| Route wiring | Wire dead `ServiciosController` vs add routes directly | Controller is dead code and predioId hardcoding is out of scope; direct wiring matches existing animales pattern | Add PUT routes directly in `servicios.routes.ts` |
| `predioId` handling | Fix hardcoding now vs defer | Out of scope per proposal; keep `predioId = 0` in list/get routes, use `currentUser.predioIds[0]` in PUT | Defer to separate issue |

## Data Flow

### Happy Path
```
Client GET /servicios/palpaciones/1
  → Server reads version=3 from DB
  → Response: 200 + body + X-Resource-Version: 3

Client PUT /servicios/palpaciones/1  (If-Match: 3)
  → UseCase checks existing.version === 3
  → Repo updates row, version becomes 4
  → Response: 200 + body + X-Resource-Version: 4
```

### Conflict Path
```
Client GET /servicios/palpaciones/1
  → Server reads version=3
  → Response: 200 + X-Resource-Version: 3

(Another client updates it → version becomes 4)

Client PUT /servicios/palpaciones/1  (If-Match: 3)
  → UseCase checks existing.version (4) !== 3
  → Throws VersionConflictError
  → Response: 409 + { code: VERSION_CONFLICT, details: { currentVersion: ['4'], expectedVersion: ['3'] } }
```

## Interfaces / Contracts

### PUT Route Signature (identical pattern for all 4)

```typescript
app.put<{ Params: { id: number }; Body: UpdatePalpacionGrupalDto }>(
  '/servicios/palpaciones/:id',
  {
    schema: { params: idParamsSchema, body: updatePalpacionGrupalBodySchema },
    preHandler: [authMiddleware],
  },
  async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) return reply.code(400).send({ /* MISSING_IF_MATCH */ })
    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) return reply.code(400).send({ /* INVALID_IF_MATCH */ })

    try {
      const result = await updatePalpacionGrupalUseCase.execute(
        request.params.id, request.body, predioId, expectedVersion
      )
      return reply.header('X-Resource-Version', result.version).code(200).send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) {
        return reply.code(409).send({ success: false, error: { code: error.code, message: error.message, details: error.details } })
      }
      throw error
    }
  }
)
```

### Request/Response Headers

| Header | Direction | Required | Type | Description |
|--------|-----------|----------|------|-------------|
| `If-Match` | Request | Yes | integer | Expected `version` from prior GET |
| `X-Resource-Version` | Response | Yes | integer | Current `version` after read/create/update |

### Error Response (409)
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "El recurso fue modificado por otro usuario. Recarga e intenta de nuevo.",
    "details": {
      "currentVersion": ["4"],
      "expectedVersion": ["3"]
    }
  }
}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/database/src/schema/servicios.ts` | Modify | Add `version: integer('version').notNull().default(1)` to 4 root tables |
| `apps/api/src/modules/servicios/domain/entities/*.entity.ts` | Modify | Add `version: number` to 4 root entities |
| `apps/api/src/modules/servicios/application/dtos/*.dto.ts` | Modify | Add `version` to 4 root response DTOs |
| `apps/api/src/modules/servicios/infrastructure/mappers/*.mapper.ts` | Modify | Map `version` in 4 root response mappers |
| `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-*.repository.ts` | Modify | Ensure `update` methods accept `version` field |
| `apps/api/src/modules/servicios/application/use-cases/update-palpacion-grupal.use-case.ts` | Modify | Add `expectedVersion` param, version check, `version + 1` in update payload |
| `apps/api/src/modules/servicios/application/use-cases/update-inseminacion-grupal.use-case.ts` | Modify | Same |
| `apps/api/src/modules/servicios/application/use-cases/update-parto.use-case.ts` | Modify | Same |
| `apps/api/src/modules/servicios/application/use-cases/update-veterinario-grupal.use-case.ts` | Modify | Same |
| `apps/api/src/modules/servicios/infrastructure/http/routes/servicios.routes.ts` | Modify | Import 4 update use cases, add 4 PUT routes with `If-Match` handling |
| `apps/api/src/modules/servicios/infrastructure/http/schemas/*.schema.ts` | Modify | Ensure update body schemas permit no extra fields (no `version` in body) |
| `apps/web/src/modules/servicios/types/servicios.types.ts` | Modify | Add `version: number` to `EventoGrupal` and `Parto` |
| `apps/web/src/modules/servicios/services/servicios.service.ts` | Modify | Add 4 `update*` methods to `ServiciosService` interface |
| `apps/web/src/modules/servicios/services/servicios.api.ts` | Modify | Implement 4 `update*` methods sending `If-Match` header |
| `apps/web/src/modules/servicios/services/servicios.mock.ts` | Modify | Implement 4 mock `update*` methods with version bump |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (use cases) | Version check throws `VersionConflictError` on mismatch; version increments on match | Mock repository (like `update-animal.use-case.spec.ts`), assert `repo.update` called with `version: existing + 1` |
| Integration (routes) | 400 on missing `If-Match`; 400 on invalid `If-Match`; 409 on stale version; 200 + `X-Resource-Version` on success | Fastify `inject` with mock repos (like `animales.routes.version.spec.ts`), bypass auth hook |
| Frontend (mock) | `update*` methods bump version; `RealServiciosService` attaches `If-Match` | Vitest unit tests on `MockServiciosService` and spy on `apiClient.put` |

No `txManager` path is needed for updates because the 4 update use cases only touch a single root row.

## Migration / Rollout

1. **Drizzle migration**: Add `version` column to the 4 root tables with `DEFAULT 1` and `NOT NULL`.
2. **Backfill**: Existing rows automatically get `version = 1` via default.
3. **Verification**: Query each table to confirm all rows have `version >= 1`.
4. **Rollback**: Drop the `version` column from the 4 tables; revert code changes.

## Open Questions

- None. All technical decisions are covered by the animales reference implementation and the approved proposal.
