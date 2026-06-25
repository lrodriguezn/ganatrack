# Archive Report: fix-endpoint-notificaciones

**Change**: fix-endpoint-notificaciones
**Project**: ganatrack
**Mode**: hybrid (OpenSpec + Engram)
**Date Archived**: 2026-06-25
**Status**: COMPLETED — PR #57 merged (squash) as commit `b58003e`
**Issue**: #52 (`fix(api): endpoint /notificaciones/resumen no responde - polling deshabilitado en frontend`)

## Summary

`GET /api/v1/notificaciones/resumen` was returning 400 because the route was not registered; the request matched `GET /notificaciones/:id` with `id="resumen"` and failed Zod validation. The `tenantContextMiddleware` was also missing on that path, the DTO/use case omitted the `ultimas` array, and a previous commit (`4fd86fa`) had stubbed the UI by disabling polling, hiding the bell badge, and showing an "empty" state on data undefined.

This change restored the endpoint with proper tenant scoping, populated the `ultimas` top-5 newest-first list, and reverted the three frontend workarounds. The full cycle went through 4 rounds of Judgment Day (R2+R3) and a multi-lens review (R1+R2+R3+R4) that found 2 additional CRITICALs (cross-tenant data exposure via a commented-out middleware check, and missing DB indexes on the polling-target table), all of which were fixed in the same PR.

## Artifacts

### Filesystem (OpenSpec archive)

| Artifact | Path | Status |
|----------|------|--------|
| Proposal | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/proposal.md` | ✅ Complete |
| Spec | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/specs/notifications/spec.md` | ✅ Complete |
| Design | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/design.md` | ✅ Complete |
| Tasks | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/tasks.md` | ✅ Complete |
| Apply Progress | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/apply-progress.md` | ✅ Complete |
| Verify Report | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/verify-report.md` | ✅ PASS WITH WARNINGS, 0 CRITICAL |
| Archive Report | `openspec/changes/archive/2026-06-25-fix-endpoint-notificaciones/archive-report.md` | ✅ This file |

### Engram observations (for traceability)

| Artifact | Topic Key | Notes |
|----------|-----------|-------|
| Preflight | `sdd/fix-endpoint-notificaciones/preflight` | Session decisions (auto / hybrid / auto-forecast / 400) |
| Proposal | `sdd/fix-endpoint-notificaciones/proposal` | Full proposal content |
| Spec | `sdd/fix-endpoint-notificaciones/spec` | Full spec content |
| Design | `sdd/fix-endpoint-notificaciones/design` | Full design content |
| Tasks | `sdd/fix-endpoint-notificaciones/tasks` | Full tasks content |
| Apply Progress | `sdd/fix-endpoint-notificaciones/apply-progress` | Full apply progress |
| JD Round 1 synthesis | `sdd/fix-endpoint-notificaciones/jd-round-1` | Verdict table + multi-lens review synthesis |
| JD Round 4 state | `sdd/fix-endpoint-notificaciones/jd-closed` | User-driven APPROVED terminal state |
| Multi-lens review | `sdd/fix-endpoint-notificaciones/multi-lens-review` | 2 CRITICALs (R1.C1 + R4.C1) found, both fixed |
| Verify Report | `sdd/fix-endpoint-notificaciones/verify-report` | Full verify report content |
| Cycle state | `sdd/fix-endpoint-notificaciones/state` | Final cycle state observation |
| JD agents unavailable | `ganatrack/infra/jd-agents-unavailable` | Fallback to review-* + sdd-apply as JD substitutes |
| JD Round 4 connection error | `ganatrack/infra/jd-round-4-connection-error` | Fallback to inline audit on Judge A failure |

## Delta Spec Sync

**New canonical capability**: `notifications`

| Domain | Path |
|--------|------|
| notifications | `openspec/specs/notifications/spec.md` (NEW) |

The spec defines a new `notifications` capability with 6 requirements (Resumen Route Registration, Resumen DTO Includes `ultimas`, Use Case Returns Top 5 Newest `ultimas`, Frontend Polling Re-enabled, Notification Bell Badge, Notification Center Lists `ultimas`) and 9 scenarios.

The pre-existing `NotificacionesController` (180 lines, dead code) was intentionally left in place with a `DEAD CODE` JSDoc per the design's explicit non-goal.

## What Was Done

### Track 1: Original Apply (2 commits, then squashed)
1. `fix(notificaciones): register /resumen route with tenant guard and populate ultimas`
2. `revert(notificaciones): restore bell badge, polling, and notification center empty-state`

### Track 2: Judgment Day Round 1 (5 commits, fixes for 16 findings)
3. `fix(notificaciones): resolve API/web NotificacionTipo mismatch to prevent production crash` — extended web `NotificacionTipo` union with 5 UPPER_SNAKE values + matching `TIPO_ICONS` / `NOTIFICACION_TIPO_LABELS` / `NOTIFICACION_TIPO_COLORS` entries (Path C of the proposed solutions). 7 regression tests in `notification-item.test.tsx` cover all 11 `NotificacionTipo` values.
4. `test(web): add regression coverage for polling hook, bell badge, and notification panel` — 3 new test files: `use-notificaciones-resumen.test.tsx` (7 tests), `notification-bell.test.tsx` (8 tests), `notification-center.test.tsx` (7 tests).
5. `test(api): tighten integration and use case assertions` — rewrote the "cap to 5" test as a pass-through contract test (5-item + 10-item cases); added body shape assertion to the 401 test; added explicit `Object.keys(body.data).length > 0` for the route-ordering test; removed 6 dead `if (!app) return` guards.
6. `refactor(notificaciones): extract typed getPredioId helper and named constants` — extracted `getPredioId(request)` helper matching `maestros.routes.ts`; introduced `ULTIMAS_LIMIT = 5` constant; introduced `makeStubRepo<T>()` Proxy helper.
7. `chore(notificaciones): update response schema, design rationale, and UX guards` — added `porTipo?` to web type; defensive empty-state condition `!data?.ultimas || length === 0`; 3 fault-injection tests for `Promise.all` atomicity; updated `resumenResponseSchema` with `ultimas`; corrected design.md rationale about NaN; inline comment explaining the silent-zero divergence; ordering contract comment.

### Track 3: Doc Drift Fixes (2 commits, 9 doc fixes)
8. `docs(openspec): fix stale code references and descriptions in design.md and tasks.md` — 5 design.md + 1 tasks.md drift fixes.
9. `docs(openspec): extend Round 2 doc-drift fix to tasks.md and design.md prose` — 3 tasks.md + 1 design.md additional drift fixes found by Round 3.

### Track 4: Multi-lens Review CRITICALs (3 commits)
10. `fix(security): restore tenantContextMiddleware membership check` (R1.C1) — uncommented the `userPredioIds.includes(predicates)` check that was disabled under a `// TEMPORARY: Skip validation for testing - remove in production` comment; removed the `(request as any)` cast using the existing `request.types.ts` module augmentation; added 6 unit tests covering missing header, invalid header, header in claim, header outside claim (cross-tenant), empty claim, valid case.
11. `perf(database): add composite indexes to notificaciones table` (R4.C1) — added `idx_notificaciones_predio_activo (predio_id, activo)` and `idx_notificaciones_predio_leida (predio_id, leida)` composite indexes; converted the table to Drizzle's callback-style definition; hand-authored migration `0002_notificaciones_indexes.sql` (drizzle-kit was broken in this env: pglite native binary missing); added a schema-level test that rebuilds the migration set in-memory and asserts both indexes exist on `sqlite_master`.
12. `chore(database): regenerate dev.db with clean WAL checkpoint` — the dev.db committed in commit 11 was corrupted by migrating with WAL mode on and committing without checkpointing (R4 Finding 1, CRITICAL). Fix: dropped dev.db, dev.db-shm, dev.db-wal; re-applied all 3 migrations (0000, 0001, 0002) on a fresh DB; ran `PRAGMA wal_checkpoint(TRUNCATE)`. Verified: `SELECT 1` returns `{ ok: 1 }`; both indexes present on `sqlite_master`; `EXPLAIN QUERY PLAN` confirms all 3 polling queries use the new indexes.

The 12 PR commits were squashed into commit `b58003e` for the final merge to master.

## Test Results (final state on master)

| Suite | Result |
|-------|--------|
| `pnpm --filter @ganatrack/api test` | 326 pass, 2 pre-existing failures (productos + maestros.e2e), 21 skipped |
| `pnpm --filter @ganatrack/web test` | 599/599 pass |
| `pnpm typecheck` | Clean |
| `pnpm lint` on touched files | 6 → 5 errors (no new errors introduced; 1 unused-vars removed) |
| Target suites specifically | `resumen.integration` 6/6, `obtener-resumen` 8/8, `tenant-context` 6/6, `notificaciones.schema` 2/2, web hook 10/10, bell 8/8, center 7/7, item 7/7 — all green |

## Verify Report

**Verdict**: PASS WITH WARNINGS

| Metric | Value |
|--------|-------|
| Spec scenarios verified | 10/10 (covers the 9 spec scenarios + the pass-through contract extension) |
| Acceptance criteria satisfied | 6/6 |
| CRITICAL issues | 0 |
| WARNING (real) | 0 |
| WARNING (theoretical) | 1 (W.T1: type cast in getPredioId helper, no runtime impact) |
| SUGGESTIONS | 4 (out of scope for this PR) |

## Design Decisions

1. **403 inline in route handler (not a middleware change)** — `tenantContextMiddleware` silently sets `predioId = 0` when the header is missing, used by 8+ modules. Modifying the middleware would break the silent-zero convention. The inline guard is local, reversible, and the `// TODO: follow-up issue` comment flags the architectural debt.

2. **Path C for the A.C3 enum mismatch (least invasive)** — extended the web `NotificacionTipo` union with the 5 UPPER_SNAKE API values, added matching `TIPO_ICONS` / `NOTIFICACION_TIPO_LABELS` / `NOTIFICACION_TIPO_COLORS` entries, kept the 6 lower_snake web-only tipos (`sync_completado`, `sync_fallido`) for client-side sync events. Documented the rationale in the `TIPO_ICONS` comment.

3. **Composite indexes on `(predio_id, activo)` and `(predio_id, leida)`** — these match the 3 polling query filter patterns: `findByPredio` filters by `predio_id + activo=1`, `countNoLeidas` and `countByTipo` filter by `predio_id + leida=0`. The second index also serves as a COVERING index for the COUNT queries.

4. **`makeStubRepo<T>()` Proxy with throw-on-unhandled** — instead of `as never` casts that hide type drift, the Proxy throws `Error('not stubbed: <method>')` for any property access not in the overrides. Future test wiring errors surface as runtime errors, not silent undefined returns.

5. **`ULTIMAS_LIMIT = 5` named constant** — replaces a magic number in `findByPredio(predioId, { page: 1, limit: 5 })`. The JSDoc explicitly states the cap is the repository's job (enforced via the `limit` query option), not the use case's.

6. **Hand-authored migration (drizzle-kit broken in env)** — `drizzle-kit generate` and `drizzle-kit migrate` both failed with `pglite native binary missing` in this environment. The migration `0002_notificaciones_indexes.sql` was hand-authored following the 0001 pattern, then applied to dev.db. The schema test (`notificaciones.schema.spec.ts`) reads the migration file from disk and would catch a future regression.

7. **Defensive empty-state condition** — `!data?.ultimas || data.ultimas.length === 0` shows the empty state also when `data` is `undefined` (no cached data yet, transient error, etc.). The pre-workaround stub from `4fd86fa` had this defensive form; the revert initially restored the pre-stub form (which doesn't render the empty state on `undefined`), then Round 1 fix A.W4 restored the defensive form with a regression test.

## Risks & Follow-ups (out of scope for this PR)

The multi-lens review (R1+R2+R3+R4) found 18+ WARNING/SUGGESTION-level items that were explicitly excluded from this PR per the user's decision to fix only the 2 CRITICALs (`Bloquear merge, arreglar ambos`). These should become follow-up issues:

### Security (R1)
- **R1.W1**: `markAsRead` in `drizzle-notificacion.repository.ts:74-89` filters by `id + predioId + activo`, NOT by `usuarioId`. Cross-user notification manipulation enabled by `ultimas` exposing other users' IDs and the panel providing a one-click UI path to mutate them.
- **R1.W2**: `permisos: ['notificaciones:read']` is set in the test JWT but the route never calls `requirePermission` (the helper exists in `shared/middleware/rbac.middleware.ts` but is never imported). False sense of security.
- **R1.W3**: `noLeidas`, `porTipo`, `ultimas` are per-tenant, not per-user. The bell badge shows counts the viewer cannot act on. The schema has `usuarioId` for a reason.
- **R1.W4 / R3.W3**: The 403 guard `if (predioId <= 0)` does not catch non-integer values (e.g. `X-Predio-Id: 1.5`). Tighten to `if (!Number.isInteger(predioId) || predioId <= 0)`.

### Readability (R2)
- **R2.W1**: `getPredioId` helper duplicated across 4 files. Promote to `shared/middleware/`.
- **R2.W2**: `makeStubRepo` Proxy duplicates the existing `mock-builders.ts` pattern. Extend `mock-builders.ts` with a `buildPreferenciaRepo()` builder.
- **R2.W3**: The "DEAD CODE" JSDoc on `NotificacionesController` says "4 casts" but there are 6.
- **R2.W4**: The test "syncs unreadCount to the Zustand store when data.noLeidas changes" asserts only that `useQuery` was called; the actual `setUnreadCount` call is never reached because the mock returns `data: undefined`.
- **R2.W5**: The `celo_detectado` ↔ `CELO_ESTIMADO` and `servicio_pendiente` ↔ `INSEMINACION_PENDIENTE` mappings in the web type are semantically wrong (detected vs estimated are different events).
- **R2.W7**: 3 near-identical fault-injection tests should be parameterized with `it.each`.

### Reliability (R3)
- **R3.W1**: The `notification-item.test.tsx` "renders an SVG icon for every NotificacionTipo" test only asserts `svgs.length >= 1` — does not verify WHICH icon. A swap of two icons would pass the test.
- **R3.W2**: `makeStubRepo` has no direct unit test; the integration test never calls methods on the stubbed repos (`preferenciaRepo`, `pushTokenRepo`), so the Proxy's throw-on-unhandled contract is unverified.

### Resilience (R4)
- **R4.W1**: No Sentry / no observability. The 30s polling endpoint has no production monitoring.
- **R4.W2**: `Promise.all` is atomic with no graceful degradation. A failure in `countByTipo` breaks `noLeidas` and `ultimas` even though those are independent reads.
- **R4.W3**: No per-query timeout; one slow query blocks the whole response.
- **R4.W4**: The 403 guard sits in the route handler, not the middleware — defense-in-depth missing at a critical auth boundary.
- **R4.W6**: Token-expiry redirect can interrupt users mid-session (the re-enabled polling amplifies an existing brittle behavior).
- **R4.W7**: The `as Promise<NotificacionResumen>` cast on the polled response is untyped at runtime.
- **R4.W8**: The rollback doc in `proposal.md` and `tasks.md` says "3 files" but the actual PR is 9 commits.

### Architectural (cross-cutting)
- **B.W3 (from JD Round 1)**: The inline 403 guard locks in a divergent policy from the rest of the codebase's silent-zero convention. A follow-up should refactor `tenantContextMiddleware` to throw 403 on missing header uniformly.
- **`NotificacionesController` is dead code** (180 lines, 6 `as any` casts). Should be deleted in a follow-up to remove the tech-debt and the misleading "DEAD CODE" JSDoc.

## Impact

| Area | Change |
|------|--------|
| Backend | 5 files modified in `apps/api/src/modules/notificaciones/`, 1 new helper in `apps/api/src/__tests__/helpers/`, 1 new middleware spec in `apps/api/src/shared/middleware/__tests__/`, 1 migration in `packages/database/migrations/`, 1 new spec in `apps/api/src/__tests__/integration/notificaciones/`, 2 indexes on `notificaciones` table |
| Frontend | 4 new test files, 1 extended type, 1 extended component, 1 reverted workaround in `notification-center.tsx` |
| Database | 2 new composite indexes on `notificaciones`; migration `0002_notificaciones_indexes.sql` |
| Security | `tenantContextMiddleware` cross-tenant data leak closed (R1.C1) |
| Performance | All 3 polling queries now use indexes (verified via `EXPLAIN QUERY PLAN`) |
| External APIs | None |
| Breaking change risk | None — restoring documented behavior; users begin receiving real-time notifications again |

## Files Not Included in This Archive

- `apps/web/lrt/` — leftover from an unrelated session; not part of this change.
- `openspec/changes/archive/2026-06-24-pwa-cherrypick-phase2/` — leftover untracked artifact from a previous session (issue #56, closed as not planned).
- `packages/database/dev.db-shm` and `dev.db-wal` — deleted as part of the WAL checkpoint fix (commit 12); will be re-created on next dev DB open.

## Commit Reference

Final merge: `b58003e fix(notificaciones): register /resumen endpoint and revert frontend polling workaround (closes #52) (#57)` on master.

12 PR commits squashed into 1: `16d60f6` → `042f9ae` → `c243e3b` → `a9ecf00` → `457ad09` → `a1d9cf3` → `1f98723` → `7aa7c1c` → `208aae8` → `296f22e` → `4cb3666` → `37c8364`.
