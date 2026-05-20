# Design: Optimistic Locking with Version-Based Conflict Detection (Issue #36)

## Technical Approach

Implement use-case level optimistic locking for the `animales` entity (servicios deferred to #37). A monotonic integer `version` column is added to the `animales` table. On every PUT, the client sends the version it read via the `If-Match` header. The `UpdateAnimalUseCase` compares the expected version against the current DB version; on mismatch it throws `ConflictError` with the server's current version. On success, the use case increments the version and the route returns it via `X-Resource-Version`. The frontend ky interceptor bridges TanStack Query cache metadata with these headers, and the offline queue is extended to support PUT + version metadata so BackgroundSync replays carry the correct `If-Match`.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Locking layer | Use-case level check | Middleware-level (double read); Repository-level conditional update (SQLite RETURNING quirks) | Single DB read, follows existing hexagonal pattern, no dialect-specific complexity |
| Version transport | `If-Match` / `X-Resource-Version` headers | Body field | HTTP-native for optimistic locking; keeps DTOs unchanged; works cleanly with ky interceptors and SW replays |
| Version type | Integer (1, 2, 3…) | Timestamp | Simple, monotonic, no clock-sync issues, smaller payload, easy to reason about |
| Force override | Keep `X-Force-Update: true` | Remove in favor of `If-Match: currentVersion` | Admin/debug backdoor preserved; normal flow uses version headers |
| Scope | `animales` only | Include servicios | Servicios have update use-cases but NO PUT routes yet; adding routes + locking is ~200+ lines and deserves its own issue |

## Data Flow

```
Online Happy Path
-----------------
Browser GET /animales/123
  ← API returns { data: { ..., version: 3 } } + X-Resource-Version: 3
  → Ky interceptor stores version=3 in TanStack Query cache meta

Browser PUT /animales/123 (user edits)
  → Ky interceptor reads cached version=3, attaches If-Match: 3
  → Route parses header, passes expectedVersion=3 to useCase
  → UseCase: fetch(existing.version=3) → match → update with version=4
  ← API returns { data: { ..., version: 4 } } + X-Resource-Version: 4
  → Ky interceptor updates cache meta version=4

Offline → Reconnect → Conflict Path
------------------------------------
Browser offline PUT /animales/123 (local version=3)
  → Enqueued with expectedVersion: 3, method: 'PUT'

Reconnect → BackgroundSync replays PUT with If-Match: 3
  → Another user already updated → DB version=4
  → UseCase: existing.version=4 ≠ 3 → throws ConflictError(currentVersion=4)
  ← API returns 409 { code: VERSION_CONFLICT, details: { currentVersion: 4 } }
  → SW SyncResponsePlugin stores in ganatrack-conflict-queue with currentVersion: 4
  → useFailedSync hook surfaces conflict
  → User opens SyncConflictToast, chooses "Overwrite"
  → resolveConflict sends PUT with If-Match: 4 (or X-Force-Update: true)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/database/src/schema/animales.ts` | Modify | Add `version: integer('version').notNull().default(1)` |
| `packages/database/drizzle/` | Add | Auto-generated migration + snapshot |
| `apps/api/src/modules/animales/domain/entities/animal.entity.ts` | Modify | Add `version: number` to `AnimalEntity` |
| `apps/api/src/modules/animales/application/dtos/animal.dto.ts` | Modify | Add `version` to `AnimalResponseDto` |
| `apps/api/src/modules/animales/infrastructure/mappers/animal.mapper.ts` | Modify | Map `e.version` in `toResponse` |
| `apps/api/src/modules/animales/infrastructure/persistence/drizzle-animal.repository.ts` | Modify | `create` sets `version: 1`; `update` accepts version and sets `version: data.version` |
| `apps/api/src/modules/animales/application/use-cases/update-animal.use-case.ts` | Modify | Accept `expectedVersion`, check mismatch, build `updateData` with `version: existing.version + 1` |
| `apps/api/src/modules/animales/infrastructure/http/routes/animales.routes.ts` | Modify | Read `If-Match`, pass to useCase, set `X-Resource-Version` on response |
| `apps/api/src/shared/errors/conflict.error.ts` | Modify | Add `VersionConflictError extends ConflictError` with `code: 'VERSION_CONFLICT'` and `details: { currentVersion }` |
| `apps/api/src/shared/middleware/error-handler.middleware.ts` | Modify | Ensure `DomainError.details` passes through (already works) |
| `apps/web/src/modules/animales/types/animal.types.ts` | Modify | Add `version?: number` to `Animal` interface |
| `apps/web/src/modules/animales/services/animal.api.ts` | Modify | `getById` returns version; `update` accepts optional `expectedVersion` and sends `If-Match` header |
| `apps/web/src/shared/lib/api-client.ts` | Modify | Add ky `afterResponse` hook to capture `X-Resource-Version` into TanStack Query cache meta; add `beforeRequest` hook to attach `If-Match` for PUTs |
| `apps/web/src/shared/lib/offline/types.ts` | Modify | Extend `FormQueueItem`: `method: z.enum(['POST', 'PUT'])`, add `expectedVersion?: number` |
| `apps/web/src/shared/lib/offline/submit-form.ts` | Modify | `SubmitFormOptions` accepts `method` and `expectedVersion`; queue items include them |
| `apps/web/src/sw.ts` | Modify | `SyncResponsePlugin` 409 handler reads `details.currentVersion` from body and stores it in conflict queue item; stop hardcoding `method: 'POST'` |
| `apps/web/src/shared/hooks/use-sync-actions.ts` | Modify | `resolveConflict` sends `If-Match: item.currentVersion` on overwrite; keep `X-Force-Update` as fallback |
| `apps/web/src/shared/hooks/use-failed-sync.ts` | Modify | `SyncQueueItem` type gains `currentVersion?: number`; type guard updated |
| `apps/web/src/shared/components/feedback/sync-conflict-toast.tsx` | Modify | Show current version info if available |

## Interfaces / Contracts

**Backend — UpdateAnimalUseCase signature change**
```typescript
async execute(
  id: number,
  predioId: number,
  dto: UpdateAnimalDto,
  expectedVersion: number,
): Promise<AnimalResponseDto>
```

**Backend — VersionConflictError**
```typescript
export class VersionConflictError extends ConflictError {
  constructor(currentVersion: number) {
    super(
      'VERSION_CONFLICT',
      'El recurso fue modificado por otro usuario. Recarga e intenta de nuevo.',
      409,
      { currentVersion: [String(currentVersion)] },
    )
  }
}
```

**Backend — Repository update contract**
```typescript
async update(
  id: number,
  data: Partial<Omit<AnimalEntity, 'id' | 'createdAt' | 'updatedAt'>> & { version: number },
): Promise<AnimalEntity | null>
```

**Frontend — Animal type**
```typescript
export interface Animal {
  // ...existing fields...
  version?: number;
}
```

**Frontend — FormQueueItem schema**
```typescript
export const formQueueItemSchema = z.object({
  // ...existing fields...
  method: z.enum(['POST', 'PUT']),
  expectedVersion: z.number().int().optional(),
})
```

**Frontend — Ky interceptor pseudocode**
```typescript
const attachVersionHeader: BeforeRequestHook = (request) => {
  if (request.method === 'PUT') {
    const url = request.url;
    const cachedVersion = getCachedVersionFromQueryClient(url); // reads TanStack meta
    if (cachedVersion) request.headers.set('If-Match', String(cachedVersion));
  }
};

const captureVersionHeader: AfterResponseHook = (request, _options, response) => {
  const version = response.headers.get('X-Resource-Version');
  if (version) {
    setCachedVersionInQueryClient(request.url, parseInt(version, 10));
  }
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `UpdateAnimalUseCase` | Mock repo: success increments version, mismatch throws `VersionConflictError`, not-found throws `NotFoundError` |
| Unit | `AnimalMapper.toResponse` | Assert `version` is forwarded |
| Route | PUT /animales/:id | Fastify inject: valid `If-Match` → 200 + `X-Resource-Version`; mismatched → 409 with `currentVersion`; missing `If-Match` → 400 |
| Unit (frontend) | Ky interceptor | Mock ky hooks: GET stores version meta; PUT attaches `If-Match` |
| Integration | Full flow | Create animal → GET → capture version → concurrent update → PUT with stale version → expect 409 → retry with current version → expect 200 |
| E2E | Offline conflict | Go offline → queue PUT → go online → BackgroundSync replays → intercept 409 → resolve conflict → assert final state |

## Migration / Rollout

1. **Generate migration**: `cd packages/database && npx drizzle-kit generate` — creates SQL to add `version INTEGER NOT NULL DEFAULT 1`.
2. **Data migration**: Existing rows automatically get `version = 1` via `DEFAULT 1`. No manual data migration script needed.
3. **Deploy order**: Backend first (new column is backward-compatible — old code ignores it), then frontend.
4. **Rollback**: Revert code, run down-migration to drop `version` column. If rollback occurs after writes, data loss of version numbers is acceptable (they're synthetic).

## Open Questions

- [ ] Should `create` also return `X-Resource-Version: 1` for consistency? **Decision: Yes**, trivial to add.
- [ ] Should `cambiarEstado` (PATCH) use locking too? **Decision: No for now** — it's a state transition, not a general edit; can be added later if needed.
- [ ] How to expose `currentVersion` in the 409 response so the SW can capture it reliably? **Decision**: Standard `error.details.currentVersion` array per `DomainError` shape.
