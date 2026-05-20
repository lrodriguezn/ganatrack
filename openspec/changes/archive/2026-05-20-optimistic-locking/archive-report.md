# Archive Report: Optimistic Locking (Issue #36)

**Change**: optimistic-locking  
**Issue**: #36  
**Status**: VERIFIED PASS  
**Archived**: 2026-05-20  
**Archive path**: `openspec/changes/archive/2026-05-20-optimistic-locking/`

---

## 1. What Was Built

Optimistic locking with version-based conflict detection for the `animales` entity. When two users (or one user offline and one online) modify the same animal record, the second updater receives a `409 VERSION_CONFLICT` instead of silently overwriting.

### Implemented Features

| Feature | Description |
|---------|-------------|
| **Schema version column** | `version INTEGER NOT NULL DEFAULT 1` added to `animales` table via Drizzle migration |
| **Backend version check** | `UpdateAnimalUseCase` compares `expectedVersion` against current DB version, throws `VersionConflictError` on mismatch |
| **HTTP header contract** | `GET` returns `X-Resource-Version`; `PUT` requires `If-Match` header |
| **Frontend version tracking** | Ky interceptor captures `X-Resource-Version` from GET responses, attaches `If-Match` on PUT mutations via TanStack Query cache meta |
| **Offline PUT queue** | `FormQueueItem` schema extended for `method: 'PUT'` + `expectedVersion` metadata |
| **Offline conflict resolution** | Service Worker captures `currentVersion` from 409 responses into conflict queue; `resolveConflict` sends `If-Match: serverVersion` for version-aware overwrite |
| **Error responses** | `VERSION_CONFLICT` (409) with `currentVersion`/`expectedVersion` details; `MISSING_IF_MATCH` (400) for missing header |

### Files Changed

**Backend (8 files)**:
- `packages/database/src/schema/animales.ts` — version column
- `apps/api/src/modules/animales/domain/entities/animal.entity.ts` — version field
- `apps/api/src/modules/animales/application/dtos/animal.dto.ts` — version in response DTO
- `apps/api/src/modules/animales/infrastructure/mappers/animal.mapper.ts` — version mapping
- `apps/api/src/modules/animales/infrastructure/persistence/drizzle-animal.repository.ts` — version increment on update
- `apps/api/src/modules/animales/application/use-cases/update-animal.use-case.ts` — version check logic
- `apps/api/src/modules/animales/infrastructure/http/routes/animales.routes.ts` — header handling
- `apps/api/src/shared/errors/conflict.error.ts` — VersionConflictError class

**Frontend (7 files)**:
- `apps/web/src/modules/animales/types/animal.types.ts` — version field
- `apps/web/src/modules/animales/services/animal.api.ts` — If-Match header on update
- `apps/web/src/shared/lib/api-client.ts` — ky interceptors for version headers
- `apps/web/src/shared/lib/offline/types.ts` — FormQueueItem PUT support
- `apps/web/src/shared/lib/offline/submit-form.ts` — queue stores expectedVersion
- `apps/web/src/sw.ts` — captures serverVersion from 409 responses
- `apps/web/src/shared/hooks/use-sync-actions.ts` — resolveConflict with If-Match
- `apps/web/src/shared/hooks/use-failed-sync.ts` — serverVersion in SyncQueueItem
- `apps/web/src/shared/components/feedback/sync-conflict-toast.tsx` — version display

**Total**: ~17 files changed, +489/-22 lines

---

## 2. Scope vs Plan

| Proposed | Delivered | Notes |
|----------|-----------|-------|
| Schema version column + migration | ✅ Done | T1.1, T1.2 |
| Backend use-case version check | ✅ Done | T2.1-T4.1 |
| Backend routes (If-Match, X-Resource-Version) | ✅ Done | T4.2 |
| Frontend ky interceptor | ✅ Done | T5.3 |
| TanStack Query cache meta integration | ✅ Done | T5.3, T5.4 |
| FormQueueItem PUT + version | ✅ Done | T5.2, T6.1 |
| Service Worker 409 capture | ✅ Done | T6.2 |
| resolveConflict with If-Match | ✅ Done | T7.1 |
| Conflict queue serverVersion | ✅ Done | T6.2, T7.2 |
| SyncConflictToast version display | ✅ Done | T7.3 |
| Backend unit + integration tests | ✅ Done | T8.1, T8.2 |
| Frontend unit tests | ✅ Done | T8.3 |
| E2E Playwright two-tab test | ❌ Deferred | T8.4 — requires Playwright browser setup |
| Servicios optimistic locking | ❌ Out of scope | Deferred to issue #37 (no PUT routes exist yet) |
| Repository-level atomic update | ❌ Out of scope | Deferred to Phase 2 (PostgreSQL primary) |

**Delivery**: 19/20 tasks complete. All 20 spec requirements (REQ-1 to REQ-20) compliant.

---

## 3. Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Locking layer** | Use-case level check | Single DB read, follows existing hexagonal pattern. Repository-level conditional update deferred due to SQLite RETURNING quirks. |
| **Version transport** | `If-Match` / `X-Resource-Version` headers | HTTP-native for optimistic locking; keeps DTOs unchanged; works cleanly with ky interceptors and SW replays. |
| **Version type** | Integer (monotonic) | Simple, no clock-sync issues, smaller payload, easy to reason about. |
| **Scope** | `animales` only | Servicios have no PUT routes yet; adding routes + locking deserves its own issue (#37). |
| **Force override** | Keep `X-Force-Update` as fallback | Admin/debug backdoor preserved; normal flow uses version headers. |
| **Delivery strategy** | Chained PRs (Backend → Frontend) | ~350 estimated lines exceeded 400-line budget risk threshold; split into two reviewable PRs. |
| **cambiarEstado (PATCH)** | No locking | State transition, not a general edit; can be added later if needed. |

---

## 4. Verification Results

### Verdict: **PASS**

| Metric | Result |
|--------|--------|
| Requirements | 20/20 compliant |
| Scenarios | 5/5 covered |
| Tasks | 19/20 complete (T8.4 deferred) |
| Backend tests | 268 passed, 1 failed (pre-existing, unrelated) |
| Frontend tests | 591/591 passed |
| Backend typecheck | ✅ Clean |
| Frontend typecheck | ✅ Clean |
| Lint | ⚠️ 3907 pre-existing errors in `usuarios` module; optimistic-locking files clean |
| TDD compliance | 6/6 checks passed |
| Test files | 11 new test files (~55 tests) |
| Changed file coverage | 100% on 15/16 files; ~90% on sw.ts |

### Test Layer Distribution

| Layer | Tests | Files |
|-------|-------|-------|
| Unit | ~50 | 11 test files (Vitest) |
| Integration | ~5 | `animales.routes.version.spec.ts` (Vitest + Fastify inject) |
| E2E | 0 | T8.4 deferred |

---

## 5. Deferred Items

| Item | Reason | Follow-up |
|------|--------|-----------|
| **T8.4** — Playwright two-tab concurrent edit E2E | Requires Playwright browser setup for two-tab scenario | Create follow-up issue when browser setup is available |
| **Servicios optimistic locking** | No PUT routes exist for servicios entities | Issue #37 |
| **Repository-level atomic update** | SQLite RETURNING quirks; PostgreSQL planned for Phase 2 | Defer to Phase 2 migration |

---

## 6. Follow-Up Issues

1. **E2E Test (T8.4)**: Implement Playwright two-tab conflict resolution test once browser infrastructure is ready.
2. **Lint Fix PR**: Address 3907 pre-existing lint errors in `usuarios` module (sort-imports, no-unsafe-*, unused vars) in a dedicated PR.
3. **Issue #37**: Optimistic locking for `servicios` entities (requires PUT routes first).
4. **PATCH locking**: Consider adding version check to `cambiarEstado` if concurrent state transitions become a problem.

---

## 7. Lessons Learned

### What Worked Well
- **Use-case level locking** proved clean and testable — no dialect-specific complexity, single DB read, follows hexagonal architecture naturally.
- **HTTP header contract** (`If-Match` / `X-Resource-Version`) integrated smoothly with ky interceptors and TanStack Query cache meta.
- **Chained PR strategy** (Backend → Frontend) kept each PR reviewable and isolated failures to one layer.
- **Strict TDD** ensured all 20 requirements had test coverage before implementation was considered complete.

### What Was Challenging
- **Offline conflict flow** required coordination across multiple layers (service worker → IndexedDB → React hooks → UI components), making it the most complex part of the change.
- **FormQueueItem schema extension** needed backward compatibility with existing POST items — careful zod schema design was required.
- **No delta specs directory** — this change used a single `spec.md` file rather than the `specs/{domain}/spec.md` convention, which means no spec merge was needed during archive.

### Observations for Future Changes
- When a change affects both online and offline flows, plan for the offline path to be ~2x the complexity of the online path.
- The `X-Force-Update` fallback pattern from the previous offline sync change (#32) provided a safety net that made the version-based migration less risky.

---

## Engram Observation IDs

| Artifact | Observation ID |
|----------|---------------|
| Exploration | #98 |
| Proposal | #99 |
| Spec | #100 |
| Design | #101 |
| Tasks | #102 |
| Delivery Strategy | #103 |
| PR 2 Completion | #104 |
| Verify Report | #105 |
