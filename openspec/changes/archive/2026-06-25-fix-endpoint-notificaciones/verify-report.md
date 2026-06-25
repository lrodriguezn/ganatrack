# Verify Report: fix-endpoint-notificaciones

**Change:** `fix-endpoint-notificaciones`
**Issue:** https://github.com/lrodriguezn/ganatrack/issues/52
**PR:** https://github.com/lrodriguezn/ganatrack/pull/57 (MERGED squash 2026-06-25T14:42:01Z → `b58003e`)
**Verify date:** 2026-06-25
**Verifier:** `sdd-verify-opencode-go`
**Branch / HEAD:** `master` @ `b58003e`

---

## Summary

**Verdict: PASS WITH WARNINGS** — all 10 spec scenarios are satisfied, all acceptance criteria are met, all new and updated tests pass, no regressions introduced.

| | |
|---|---|
| Spec scenarios satisfied | 10/10 |
| Acceptance criteria met | 6/6 |
| New test suites passing | 4 (3 web + 1 schema), all 100% pass |
| Updated test suites passing | 2 (resumen integration + use case), 6/6 + 8/8 |
| Regression risk | None (2 pre-existing failures confirmed unrelated) |
| Lint delta on touched files | 0 new errors (pre-merge: 6 → post-merge: 5) |
| Typecheck | clean |

The implementation matches the spec verbatim, the 4 multi-lens CRITICAL/R1 fixes are in place, and the test suite is comprehensive enough to catch every scenario the spec defines.

---

## Spec coverage

Every requirement and scenario in `openspec/changes/fix-endpoint-notificaciones/specs/notifications/spec.md` was verified against the merged code on `b58003e`.

| # | Requirement | Scenario | Implementation | Test | Result |
|---|-------------|----------|----------------|------|--------|
| 1 | Resumen Route Registration | 200 with valid X-Predio-Id | `notificaciones.routes.ts:44-58` (preHandler `[auth, tenant]`) | `resumen.integration.spec.ts:126-143` | ✅ PASS |
| 2 | Resumen Route Registration | 403 when X-Predio-Id is missing | `notificaciones.routes.ts:53-55` (inline 403 guard) | `resumen.integration.spec.ts:146-157` | ✅ PASS |
| 3 | Resumen Route Registration | 401 when auth token is missing | `authMiddleware` (`[auth, tenant]` order) | `resumen.integration.spec.ts:160-174` | ✅ PASS |
| 4 | Resumen Route Registration | Route ordering — resumen never matches :id | `notificaciones.routes.ts:44` registered before `:id` (line 60) | `resumen.integration.spec.ts:177-196` (asserts `Object.keys(body.data).length > 0` + body shape) | ✅ PASS |
| 5 | Resumen DTO Includes ultimas | 200 with empty list | `notificacion.dto.ts:62` (`ultimas: NotificacionResponseDto[]`) | `resumen.integration.spec.ts:199-214` | ✅ PASS |
| 6 | Use Case Returns Top 5 Newest ultimas | ultimas newest-first, max 5 | `obtener-resumen.use-case.ts:30` (`findByPredio(predioId, { page: 1, limit: ULTIMAS_LIMIT })` where `ULTIMAS_LIMIT = 5`) | `resumen.integration.spec.ts:217-261` (12-row seed → `length === 5` + descending order) | ✅ PASS |
| 7 | Use Case Returns Top 5 Newest ultimas | use-case-level pass-through contract | `obtener-resumen.use-case.ts:24-41` (Promise.all + map) | `obtener-resumen.use-case.spec.ts:85-122, 124-174` (5-item + 10-item pass-through + ordering) | ✅ PASS |
| 8 | Frontend Polling Re-enabled | Polling enabled when online with active predio | `use-notificaciones-resumen.ts:27-34` (`enabled: isOnline && !!predioId`, `refetchInterval: 30_000`) | `use-notificaciones-resumen.test.tsx:78-86, 88-95, 97-104, 106-115, 117-125, 127-136` (7 tests) | ✅ PASS |
| 9 | Notification Bell Badge | Badge visible when unreadCount > 0 | `notification-bell.tsx:48` (`<Badge count={unreadCount} max={99} />`) | `notification-bell.test.tsx:99-115` (asserts `aria-label="3 notificaciones"`, `99+` cap, hides at 0) | ✅ PASS |
| 10 | Notification Center Lists ultimas | Panel lists ultimas (3 items + empty state) | `notification-center.tsx:156-166` (`.map` over `data.ultimas`) | `notification-center.test.tsx:141-153, 155-166, 168-177` (3 items rendered, empty state, undefined-data regression A.W4) | ✅ PASS |

**Cross-spec coverage bonus (not required by spec but added during JD rounds):**
- A.C3 production crash (API UPPER_SNAKE → web lower_snake): `notification-item.test.tsx:60-80, 82-109` asserts no crash for all 11 `NotificacionTipo` values
- R1.C1 tenant membership check: `tenant-context.middleware.spec.ts:77-106` asserts cross-tenant rejection (3 tests)
- A.W6 atomicity: `obtener-resumen.use-case.spec.ts:176-200` fault-injection on all 3 calls
- R4.C1 composite indexes: `notificaciones.schema.spec.ts:69-87` asserts both indexes on `sqlite_master`

---

## Acceptance criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Valid `X-Predio-Id` → 200 with `{ success: true, data: { noLeidas, porTipo, ultimas } }` | ✅ | `resumen.integration.spec.ts:126-143`; use case returns DTO with all 3 fields |
| Missing header → 403; no auth → 401 | ✅ | `resumen.integration.spec.ts:146-157, 160-174` |
| `resumen` never matches `:id`; route-ordering test guards this | ✅ | `resumen.integration.spec.ts:177-196` (executed, passes) + line 44 registered before line 60 |
| `ultimas` newest-first, max 5 (12-row seed test) | ✅ | `resumen.integration.spec.ts:217-261`; 12 rows seeded → `length === 5` + `fechaCreacion` descending |
| Bell shows badge; center lists `ultimas` (frontend revert) | ✅ | `notification-bell.test.tsx:99-115` + `notification-center.test.tsx:141-153` |
| Polls 30s when `isOnline && !!predioId` (frontend revert) | ✅ | `use-notificaciones-resumen.test.tsx:78-86, 88-95` |

All 6 acceptance criteria from `proposal.md` are satisfied with passing tests.

---

## Test results

### Targeted suites (all green)

| Suite | Command | Result |
|-------|---------|--------|
| New integration spec | `pnpm --filter @ganatrack/api test -- resumen.integration.spec.ts` | **6/6 pass** (2.75s) |
| Updated use case spec | `pnpm --filter @ganatrack/api test -- obtener-resumen.use-case.spec.ts` | **8/8 pass** (41ms) |
| New tenant middleware spec (R1.C1) | `pnpm --filter @ganatrack/api test -- tenant-context.middleware.spec.ts` | **6/6 pass** (9ms) |
| New schema spec (R4.C1) | `pnpm --filter @ganatrack/api test -- notificaciones.schema.spec.ts` | **2/2 pass** (20ms) |
| New web hook spec (A.W1) | `pnpm --filter @ganatrack/web test -- use-notificaciones-resumen.test` | **10/10 pass** (167ms + 297ms) |
| New web bell spec (B.S3) | `pnpm --filter @ganatrack/web test -- notification-bell` | **8/8 pass** (1.5s) |
| New web center spec (A.W4) | `pnpm --filter @ganatrack/web test -- notification-center` | **7/7 pass** (745ms) |
| New web item spec (A.C3) | `pnpm --filter @ganatrack/web test -- notification-item` | **7/7 pass** (524ms) |

### Full suites (no regressions)

| Suite | Result | Notes |
|-------|--------|-------|
| `pnpm --filter @ganatrack/api test` | **326 pass, 1 fail, 21 skip** (68 files: 65 pass, 2 fail, 1 skip) | The 2 failed test files are pre-existing on `master`: (1) `maestros.e2e.spec.ts` requires API server on port 3001 (ECONNREFUSED — not running), (2) `crear-producto.use-case.spec.ts` has 1 assertion mismatch in the `productos` module (unrelated to this change). |
| `pnpm --filter @ganatrack/web test` | **599 pass, 0 fail** (84 files) | 100% green. |
| `pnpm typecheck` (turbo) | **clean** | 2 packages typecheck successfully (`@ganatrack/api`, `@ganatrack/web`). |
| `pnpm lint` (turbo) | **3891 errors repo-wide** (3900 problems in `apps/api`); pre-existing on `master`, not introduced by this change |

### Lint delta on touched files

| File | Pre-merge (`2046d0d`) | Post-merge (`b58003e`) | Delta |
|------|------------------------|------------------------|-------|
| `apps/api/src/modules/notificaciones/infrastructure/http/routes/notificaciones.routes.ts` | 2 errors (sort-imports on lines 3, 5) | 2 errors (sort-imports on lines 4, 7) | 0 (pre-existing) |
| `apps/api/src/modules/notificaciones/application/use-cases/obtener-resumen.use-case.ts` | 4 errors (no-duplicate-imports + 2 sort-imports + unused `NotificacionMapper`) | 3 errors (no-duplicate-imports + 2 sort-imports) | **−1** (the unused-vars error is gone because `NotificacionMapper` is now used in the new `ultimas` mapping) |

**Net lint delta: −1 error** (improvement, not regression). The 5 remaining errors on touched files are pre-existing sort-import issues that the JD rounds intentionally left as-is (per the apply-progress.md note).

### Pre-existing failures (not introduced by this change)

| File | Reason | Pre-merge? |
|------|--------|-----------|
| `apps/api/src/__tests__/e2e/maestros.e2e.spec.ts` | `ECONNREFUSED 127.0.0.1:3001` — requires API server running on port 3001 | ✅ Yes |
| `apps/api/src/modules/productos/application/use-cases/__tests__/crear-producto.use-case.spec.ts` | 1 assertion mismatch in `CrearProductoUseCase > should set optional fields to null when not provided` — `productos` module is unrelated to notificaciones | ✅ Yes |

Both were verified pre-existing via git stash + re-run (per `apply-progress.md`).

---

## Findings

### CRITICAL

None.

### WARNING (real)

None.

### WARNING (theoretical)

| ID | Location | Description |
|----|----------|-------------|
| W.T1 | `apps/api/src/modules/notificaciones/infrastructure/http/routes/notificaciones.routes.ts:24-26` | The `getPredioId` helper uses `(request as unknown as {predioId?: number}).predioId ?? 0` cast. B.W1 consolidated the cast into one place (a regression-friendly location), but the cast itself is still present. The `FastifyRequest` module augmentation in `shared/types/request.types.ts` declares `predioId`; the cast is unnecessary in strict-typed code. **Impact: none** — the cast is a TS-only escape hatch, not a runtime path. The fix is a small follow-up to widen the `FastifyRequest` type to make `predioId` non-optional after the tenant middleware runs. Out of scope for this PR. |

### SUGGESTION

| ID | Location | Description |
|----|----------|-------------|
| S.1 | `apps/api/src/modules/notificaciones/infrastructure/http/controllers/notificaciones.controller.ts` | The `NotificacionesController` is dead code (defined but never imported anywhere). It contains 4 `as any` casts. The B.W3 fix added a "DEAD CODE" JSDoc, but the file itself should be deleted in a follow-up cleanup PR. |
| S.2 | `apps/api/src/modules/notificaciones/infrastructure/http/schemas/notificaciones.schema.ts:124-152` | The `resumenResponseSchema` now includes `ultimas` (A.W7), but the resumen route does not wire it: `app.get('/notificaciones/resumen', { preHandler: [...] }, ...)` has no `schema: { response: resumenResponseSchema }`. Wiring it would add a runtime validation layer. Intentionally out of scope for this PR. |
| S.3 | `apps/api/src/modules/notificaciones/infrastructure/http/routes/notificaciones.routes.ts:51-52` | The 403 guard comment references a "follow-up issue to refactor tenantContextMiddleware globally" — recommended to file the follow-up issue and link it from the comment for traceability. |
| S.4 | `apps/api/src/modules/notificaciones/infrastructure/http/routes/notificaciones.routes.ts:24-26` | The `getPredioId` helper duplicates logic from `maestros.routes.ts`. Consider a shared helper at `apps/api/src/shared/middleware/tenant-context.middleware.ts` to avoid drift. |

---

## Recommendations

### For the archive phase

1. **Commit the untracked OpenSpec artifacts** to fully close the change:
   - `openspec/changes/fix-endpoint-notificaciones/proposal.md` (82 lines)
   - `openspec/changes/fix-endpoint-notificaciones/specs/notifications/spec.md` (89 lines)
   - `openspec/changes/fix-endpoint-notificaciones/apply-progress.md` (118 lines)
   - The untracked `apps/web/lrt` directory (1.3 MB) and `openspec/changes/archive/2026-06-24-pwa-cherrypick-phase2/` should be confirmed as intentional leftovers from other changes — do NOT include them in this archive commit.

2. **Sync the delta spec into the base spec**: copy the 6 requirements (Resumen Route Registration, Resumen DTO Includes ultimas, Use Case Returns Top 5 Newest ultimas, Frontend Polling Re-enabled, Notification Bell Badge, Notification Center Lists ultimas) into the `notifications` capability's main spec at `openspec/specs/notifications/spec.md` (or create it if absent) so future changes can build on this.

3. **Archive the change**: rename `openspec/changes/fix-endpoint-notificaciones/` to `openspec/changes/archive/fix-endpoint-notificaciones/` and add an `archive-report.md` summarizing the merge.

### For future work (follow-up issues)

1. **Delete dead `NotificacionesController`** (S.1) — open a cleanup PR.
2. **Wire `resumenResponseSchema` into the route** (S.2) — open a "harden response schemas" follow-up.
3. **Refactor `tenantContextMiddleware` globally** (referenced in `notificaciones.routes.ts:51-52`) — the inline 403 guard is the only place that breaks the "silent zero" convention. A global `requireTenantStrict` wrapper would eliminate the inline guard and unify the contract.
4. **Remove the `(request as unknown as {predioId?: number})` cast in `getPredioId`** (W.T1) — type-augment `FastifyRequest` to make `predioId` available on the request after `tenantContextMiddleware` runs.
5. **Investigate the pre-existing `crear-producto` test failure** — the assertion in `should set optional fields to null when not provided` has been failing on `master` for at least 2 weeks (per the `apply-progress.md` from this PR). It is not a blocker for this change but should be triaged.
6. **Re-enable the `maestros.e2e.spec.ts` E2E test** — the test relies on a running API server on port 3001. Consider a `beforeAll` that auto-spawns the server (or use `testcontainers`) to make this runnable in CI without manual setup.

---

## Verdict

**PASS WITH WARNINGS** — the implementation is complete, correct, and comprehensively tested. The single WARNING (W.T1) is theoretical and does not affect runtime behavior. The implementation is ready for the archive phase to commit the untracked OpenSpec artifacts and sync the delta spec.
