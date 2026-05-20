# Tasks: Optimistic Locking with Version-Based Conflict Detection (Issue #36)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Backend) → PR 2 (Frontend) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: schema, domain, use-case, routes, error classes | PR 1 | All backend files; verify with `pnpm --filter api test` |
| 2 | Frontend: types, api-client, offline queue, hooks, SW | PR 2 | All frontend files; verify with `pnpm --filter web test` |

---

## Phase 1: Database Schema & Migration

- [x] **T1.1** — Add `version INTEGER NOT NULL DEFAULT 1` to `animales` table in `packages/database/src/schema/animales.ts`
  - REQ-1, REQ-19
  - Dependencies: None
  - Files: `packages/database/src/schema/animales.ts`
  - Verification: `cd packages/database && pnpm exec drizzle-kit generate` produces migration with version column; existing rows default to 1
  - Risk: Low

- [x] **T1.2** — Verify migration auto-generates and applies correctly
  - REQ-19
  - Dependencies: T1.1
  - Files: `packages/database/drizzle/` (generated)
  - Verification: Migration SQL contains `ADD COLUMN version INTEGER NOT NULL DEFAULT 1` and `UPDATE animales SET version = 1`
  - Risk: Low

---

## Phase 2: Backend Domain & Application Layer

- [x] **T2.1** — Add `version: number` to `AnimalEntity` interface
  - REQ-2
  - Dependencies: None (schema is the source of truth, entity mirrors it)
  - Files: `apps/api/src/modules/animales/domain/entities/animal.entity.ts`
  - Verification: `pnpm --filter api typecheck` passes
  - Risk: Low

- [x] **T2.2** — Add `version: number` to `AnimalResponseDto`
  - REQ-3
  - Dependencies: T2.1
  - Files: `apps/api/src/modules/animales/application/dtos/animal.dto.ts`
  - Verification: `pnpm --filter api typecheck` passes
  - Risk: Low

- [x] **T2.3** — Map `version` in `AnimalMapper.toResponse`
  - REQ-3
  - Dependencies: T2.1, T2.2
  - Files: `apps/api/src/modules/animales/infrastructure/mappers/animal.mapper.ts`
  - Verification: `pnpm --filter api test` passes (AnimalMapper unit test)
  - Risk: Low

---

## Phase 3: Backend Error & Repository

- [x] **T3.1** — Create `VersionConflictError extends ConflictError` with `code: 'VERSION_CONFLICT'` and `details: { currentVersion: number }`
  - REQ-6, REQ-20
  - Dependencies: None
  - Files: `apps/api/src/shared/errors/conflict.error.ts`
  - Verification: `pnpm --filter api test` passes (ConflictError unit test)
  - Risk: Low

- [x] **T3.2** — Update `DrizzleAnimalRepository.create` to set `version: 1`; `update` to increment version (`version: data.version` from use-case)
  - REQ-8, REQ-9
  - Dependencies: T1.1, T2.1
  - Files: `apps/api/src/modules/animales/infrastructure/persistence/drizzle-animal.repository.ts`
  - Verification: Unit test: create returns version=1; update sets version=existing+1
  - Risk: Low

---

## Phase 4: Backend Use Case & Routes

- [x] **T4.1** — Modify `UpdateAnimalUseCase.execute` to accept `expectedVersion: number`; throw `VersionConflictError` when mismatch; pass `version: existing.version + 1` to repo update
  - REQ-5, REQ-6, REQ-7
  - Dependencies: T3.1, T3.2
  - Files: `apps/api/src/modules/animales/application/use-cases/update-animal.use-case.ts`
  - Verification: Unit test: mismatch throws 409 VERSION_CONFLICT; match increments version
  - Risk: Medium

- [x] **T4.2** — Modify `animales.routes.ts` PUT handler: read `If-Match` header → 400 `MISSING_IF_MATCH` if absent; pass `expectedVersion` to use-case; set `X-Resource-Version` on response. GET handler adds `X-Resource-Version` header. POST returns `X-Resource-Version: 1`.
  - REQ-4, REQ-5, REQ-7, REQ-8, REQ-17
  - Dependencies: T4.1
  - Files: `apps/api/src/modules/animales/infrastructure/http/routes/animales.routes.ts`
  - Verification: Integration test with Fastify inject: GET returns header, PUT with/without If-Match returns correct status, conflict returns 409 with details
  - Risk: Medium

---

## Phase 5: Frontend Types & API Client

- [ ] **T5.1** — Add `version?: number` to `Animal` interface in frontend types
  - REQ-11 (frontend side)
  - Dependencies: None
  - Files: `apps/web/src/modules/animales/types/animal.types.ts`
  - Verification: `pnpm --filter web typecheck` passes
  - Risk: Low

- [ ] **T5.2** — Extend `FormQueueItem` schema: `method` becomes `z.enum(['POST', 'PUT'])`; add `expectedVersion?: z.number().int().positive()`
  - REQ-12
  - Dependencies: None
  - Files: `apps/web/src/shared/lib/offline/types.ts`
  - Verification: `pnpm --filter web test` passes (FormQueueItem schema test)
  - Risk: Low

- [ ] **T5.3** — Add `AfterResponseHook` to ky interceptor: read `X-Resource-Version` from response, store in module-level Map keyed by URL. Add `BeforeRequestHook`: for PUT requests, read cached version and attach `If-Match` header.
  - REQ-10
  - Dependencies: T5.1
  - Files: `apps/web/src/shared/lib/api-client.ts`
  - Verification: Unit test: GET stores version meta; subsequent PUT attaches correct `If-Match`
  - Risk: Medium

- [ ] **T5.4** — Update `RealAnimalService.update` to accept optional `expectedVersion` and pass `If-Match` header; `getById` returns Animal with version
  - REQ-10
  - Dependencies: T5.1, T5.3
  - Files: `apps/web/src/modules/animales/services/animal.api.ts`
  - Verification: `pnpm --filter web typecheck` passes
  - Risk: Low

---

## Phase 6: Frontend Offline Queue & Service Worker

- [ ] **T6.1** — Update `SubmitFormOptions` to accept `method: 'POST' | 'PUT'` and `expectedVersion?: number`; queue items store these fields
  - REQ-13
  - Dependencies: T5.2
  - Files: `apps/web/src/shared/lib/offline/submit-form.ts`
  - Verification: `pnpm --filter web test` passes
  - Risk: Low

- [ ] **T6.2** — Update `SyncResponsePlugin` 409 handler: parse `error.details.currentVersion` from body, store as `serverVersion` in conflict queue item. Remove hardcoded `method: 'POST'` in conflict queue items — use actual request method.
  - REQ-14, REQ-15
  - Dependencies: T6.1
  - Files: `apps/web/src/sw.ts`
  - Verification: Manual test: queue PUT offline → replay → 409 → conflict queue item has `serverVersion` and correct method
  - Risk: Medium

---

## Phase 7: Frontend Sync Hooks & UI

- [ ] **T7.1** — Update `resolveConflict` to send `If-Match: {serverVersion}` when `keepLocal=true`; remove `X-Force-Update` from conflict resolution flow. When `keepLocal=false`, discard (accept server) and remove from queue.
  - REQ-16
  - Dependencies: T6.2
  - Files: `apps/web/src/shared/hooks/use-sync-actions.ts`
  - Verification: Unit test: `keepLocal=true` sends If-Match header, `keepLocal=false` posts DISCARD_CONFLICT_ITEM
  - Risk: Medium

- [ ] **T7.2** — Add `serverVersion?: number` to `SyncQueueItem` interface in `use-failed-sync.ts`
  - REQ-15
  - Dependencies: None
  - Files: `apps/web/src/shared/hooks/use-failed-sync.ts`
  - Verification: `pnpm --filter web typecheck` passes
  - Risk: Low

- [ ] **T7.3** — Update `SyncConflictToast` to display `serverVersion` info from conflict items (e.g., "El servidor tiene versión N")
  - REQ-15
  - Dependencies: T7.2
  - Files: `apps/web/src/shared/components/feedback/sync-conflict-toast.tsx`
  - Verification: Visual check: conflict toast shows version number
  - Risk: Low

---

## Phase 8: Verification

- [ ] **T8.1** — Run backend unit tests for `UpdateAnimalUseCase` (version check, mismatch throws, success increments)
  - Verification: `pnpm --filter api test` — all tests pass
  - Risk: Low

- [ ] **T8.2** — Run backend integration tests: GET returns `X-Resource-Version`, PUT with correct `If-Match` → 200, stale `If-Match` → 409, missing `If-Match` → 400
  - Verification: `pnpm --filter api test` — all integration tests pass
  - Risk: Low

- [ ] **T8.3** — Run frontend unit tests: api-client interceptor, FormQueueItem schema, resolveConflict
  - Verification: `pnpm --filter web test` — all tests pass
  - Risk: Low

- [ ] **T8.4** — Run E2E test: two-tab concurrent edit conflict (Playwright) — Tab A fetches, Tab B fetches, Tab A saves, Tab B saves → 409 shown, resolve with "keep mine" → success
  - Verification: Playwright test passes
  - Risk: Medium