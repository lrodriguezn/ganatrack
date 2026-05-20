# Proposal: Optimistic Locking with Version-Based Conflict Detection

## Intent

Prevent concurrent edits from silently overwriting each other. When two users (or one user offline and one online) modify the same `animal` record, the second updater must be notified of the conflict instead of blindly overwriting the first's changes.

## Scope

### In Scope
- Add `version INTEGER NOT NULL DEFAULT 1` to `animales` schema + migration
- Backend: use-case level version check for `UpdateAnimalUseCase` (Approach 2)
- Backend: route reads `If-Match` header, returns `X-Resource-Version` response header
- Frontend: ky interceptor reads `X-Resource-Version` from GET responses, attaches `If-Match` on PUT
- Frontend: extend `FormQueueItem` schema for `PUT` method + version metadata
- Frontend: offline conflict queue stores server version on 409, `resolveConflict` reconciles with `If-Match`
- Reconcile existing `X-Force-Update` fallback with version-based flow

### Out of Scope
- **Servicios entities** — no PUT routes exist yet (only POST+GET). Defer to follow-up issue #37.
- Repository-level atomic conditional update (Approach 3) — deferred to Phase 2 when PostgreSQL is primary.
- Other entities (productos, predios, configuracion) — pattern will be replicated after animales proves successful.

## Capabilities

### New Capabilities
- `optimistic-locking`: Backend version check, `If-Match`/`X-Resource-Version` header contract
- `offline-conflict-resolution`: Frontend queue extension for PUT, version-aware conflict UI

### Modified Capabilities
- `animales-crud`: PUT route now requires `If-Match`, returns `X-Resource-Version`; `AnimalResponseDto` includes `version`

## Approach

Use-case level version check (exploration Approach 2):

1. **Schema**: Add `version` column to `animales` table (default 1).
2. **Domain**: `AnimalEntity` gets `version: number`.
3. **Application**: `UpdateAnimalUseCase` accepts `expectedVersion`, fetches existing, compares, throws `ConflictError` on mismatch, increments version on success.
4. **Infrastructure**: Repository `update` sets `version = version + 1`; mapper maps version; route handler reads `If-Match` header, passes to use case, sets `X-Resource-Version` on response.
5. **Frontend**: API client interceptor stores `X-Resource-Version` from GET into TanStack Query cache meta; on PUT mutations, reads cache meta, sends as `If-Match`.
6. **Offline**: Extend `formQueueItemSchema` to allow `method: 'PUT'` and store `expectedVersion`; on 409 replay, Service Worker captures server's current version into conflict queue; `resolveConflict` uses `If-Match` with latest version or `X-Force-Update` for forced override.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/database/src/schema/animales.ts` | Modified | Add `version` column |
| `apps/api/src/modules/animales/domain/entities/animal.entity.ts` | Modified | Add `version` field |
| `apps/api/src/modules/animales/application/use-cases/update-animal.use-case.ts` | Modified | Version check + increment |
| `apps/api/src/modules/animales/infrastructure/persistence/drizzle-animal.repository.ts` | Modified | Version-aware update |
| `apps/api/src/modules/animales/infrastructure/http/routes/animales.routes.ts` | Modified | Read `If-Match`, set `X-Resource-Version` |
| `apps/api/src/shared/errors/conflict.error.ts` | Modified | Add `VERSION_CONFLICT` code variant |
| `apps/web/src/shared/lib/api-client.ts` | Modified | Interceptor for version headers |
| `apps/web/src/shared/lib/offline/types.ts` | Modified | Extend `FormQueueItem` for PUT + version |
| `apps/web/src/sw.ts` | Modified | Capture version in conflict queue on 409 |
| `apps/web/src/shared/hooks/use-sync-actions.ts` | Modified | `resolveConflict` with `If-Match` integration |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SQLite `RETURNING` doesn't reliably report affected rows for true atomic check | Low | Use-case level check is sufficient for Phase 1; move to repository-level conditional update in Phase 2 when PostgreSQL is primary. |
| Frontend TanStack Query cache stale version leads to false 409s | Med | Always read version from latest GET response before PUT; invalidate cache on mutation. |
| Offline queue schema change breaks existing queued POST items | Low | Schema migration: default `version` to 1, make optional for POST; existing items without version continue to work. |

## Rollback Plan

1. Revert schema migration (remove `version` column from `animales`).
2. Revert use case, route, mapper, repository changes.
3. Revert frontend interceptor and offline queue changes.
4. Existing `X-Force-Update` pattern remains functional as fallback.

## Dependencies

- `pwa-offline-background-sync` (#32) — conflict queue, `resolveConflict`, `X-Force-Update` must exist.
- Drizzle migration system must be healthy (verified).
- `ConflictError` class and error handler middleware (already exist).

## Success Criteria

- [ ] `animales` table has `version` column with default 1.
- [ ] `GET /api/v1/animales/:id` returns `X-Resource-Version` header.
- [ ] `PUT /api/v1/animales/:id` with mismatched `If-Match` returns 409 with `VERSION_CONFLICT` code.
- [ ] `PUT /api/v1/animales/:id` with matching `If-Match` succeeds and returns incremented `X-Resource-Version`.
- [ ] Frontend sends correct `If-Match` on animal edits.
- [ ] Offline PUT mutations queue with version metadata and resolve conflicts via `SyncConflictToast`.
- [ ] Existing POST offline queue continues to work unchanged.
