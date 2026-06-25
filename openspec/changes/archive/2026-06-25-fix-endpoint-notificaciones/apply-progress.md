# Apply Progress: fix-endpoint-notificaciones

**Status:** SUCCESS

**Branch:** `fix/endpoint-notificaciones-resumen`
**Base:** `master` @ `2046d0d`
**PR:** https://github.com/lrodriguezn/ganatrack/pull/57
**Issue:** https://github.com/lrodriguezn/ganatrack/issues/52

## Commits made

| Hash | Message |
|------|---------|
| `16d60f6` | `fix(notificaciones): register /resumen route with tenant guard and populate ultimas` |
| `042f9ae` | `revert(notificaciones): restore bell badge, polling, and notification center empty-state` |

Both commits follow conventional commit format with scope. No `Co-Authored-By` trailers, no AI attribution.

## Work-unit commit breakdown

### Commit 1 (`16d60f6`) — Backend fix (5 files, 381 insertions, 2 deletions)

| File | Change |
|------|--------|
| `apps/api/src/modules/notificaciones/infrastructure/http/routes/notificaciones.routes.ts` | Register `GET /notificaciones/resumen` (preHandler `[auth, tenant]`) with 403 guard, before `:id` |
| `apps/api/src/modules/notificaciones/application/dtos/notificacion.dto.ts` | Add `ultimas: NotificacionResponseDto[]` to `NotificacionResumenDto` |
| `apps/api/src/modules/notificaciones/application/use-cases/obtener-resumen.use-case.ts` | Add `findByPredio(predioId, { page: 1, limit: 5 })` to the `Promise.all`; map via `NotificacionMapper.toResponseDto` |
| `apps/api/src/modules/notificaciones/application/use-cases/__tests__/obtener-resumen.use-case.spec.ts` | Assert `findByPredio` called with `{ page: 1, limit: 5 }`, `ultimas.length <= 5`, newest-first ordering (3 new tests) |
| `apps/api/src/__tests__/integration/notificaciones/resumen.integration.spec.ts` (NEW) | 6 HTTP scenarios: 200 valid, 403 missing header, 401 no auth, route ordering, 200 empty, 200 with 12 seeded rows → `ultimas.length === 5` newest-first |

### Commit 2 (`042f9ae`) — Frontend revert (3 files, 3 insertions, 6 deletions)

| File | Change |
|------|--------|
| `apps/web/src/modules/notificaciones/hooks/use-notificaciones-resumen.ts` | `enabled: false` → `enabled: isOnline && !!predioId`; drop the 2 comment lines |
| `apps/web/src/shared/components/layout/notification-bell.tsx` | Uncomment `<Badge count={unreadCount} max={99} />` |
| `apps/web/src/modules/notificaciones/components/notification-center.tsx` | Empty-state condition: `(!data?.ultimas \|\| length === 0)` → `data?.ultimas && length === 0` |

Reverts commit `4fd86fa` (the temporary polling/badge stub).

## TDD evidence

### RED → GREEN

1. **RED** — wrote `resumen.integration.spec.ts` with all 6 scenarios. Confirmed it failed because `/notificaciones/resumen` was not registered (the request fell through to `/:id` with `id="resumen"` and returned 400 Zod error).
2. **GREEN** — registered the route + 403 guard + `ultimas` field. All 6 integration scenarios passed.
3. **GREEN** — wired `findByPredio({ page: 1, limit: 5 })` into the use case; added unit-level assertions for `ultimas.length <= 5`, newest-first ordering, and that `findByPredio` was called with the expected options. All 5 use-case tests pass.

## Test results

| Suite | Command | Result |
|-------|---------|--------|
| Integration — new `resumen.integration.spec.ts` | `pnpm --filter @ganatrack/api test -- resumen.integration.spec.ts` | **6/6 pass** |
| Use case — updated `obtener-resumen.use-case.spec.ts` | `pnpm --filter @ganatrack/api test -- obtener-resumen.use-case.spec.ts` | **5/5 pass** |
| API full suite | `pnpm --filter @ganatrack/api test` | 315/316 pass; 1 pre-existing failure (`crear-producto.use-case.spec.ts` — productos module, unrelated to this change) and 1 E2E failure (`maestros.e2e.spec.ts` — requires a running server on port 3001). Both confirmed pre-existing on `master` via stash + re-run. |
| Web full suite | `pnpm --filter @ganatrack/web test` | **570/570 pass** |
| API typecheck | `pnpm --filter @ganatrack/api typecheck` | clean |
| Web typecheck | `pnpm --filter @ganatrack/web typecheck` | clean |
| API lint | `npx eslint <touched files>` | no new errors on touched files; 6 pre-existing errors in `notificaciones.routes.ts` and `obtener-resumen.use-case.ts` confirmed pre-existing on `master` |
| Web lint | `next lint` on touched dirs | clean |

### Pre-existing test failures (not introduced by this change)

Two test failures on `master` are unrelated to this change and were verified to exist before my changes (via `git stash --include-untracked` + re-run):

1. `src/modules/productos/application/use-cases/__tests__/crear-producto.use-case.spec.ts` — assertion mismatch in `CrearProductoUseCase` test; productos module.
2. `src/__tests__/e2e/maestros.e2e.spec.ts` — E2E test requires API server on port 3001; `ECONNREFUSED 127.0.0.1:3001`.

## Files changed (summary)

```
8 files changed, 384 insertions(+), 8 deletions(-)
```

- Backend production code (excluding tests): **24 line changes** (well under 130-line production budget from proposal).
- New integration test file: 273 lines (the bulk of the diff — modeled on `configuracion.integration.spec.ts`).
- Updated use case spec: 86 lines (3 new tests added; existing 3 kept).
- Frontend revert: 3 files, 3 insertions, 6 deletions (exact inverse of `4fd86fa`).

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Valid `X-Predio-Id` → **200** `{ success, data: { noLeidas, porTipo, ultimas } }` | ✅ |
| Missing header → **403**; no auth → **401** | ✅ |
| `resumen` never matches `:id` | ✅ (route-ordering test) |
| `ultimas` newest-first, max 5 | ✅ (12-row seed test) |
| Bell shows badge; center lists `ultimas` | ✅ (frontend revert) |
| Polls 30s when `isOnline && !!predioId` | ✅ (frontend revert) |
| Diff ≤ 130 production lines | ✅ (24 production line changes) |

## Spec / design discrepancies found

None. The implementation followed the spec verbatim:

- `INotificacionRepository.findByPredio(predioId, { page: 1, limit: 5 })` already supported the exact signature the design called for (no method fabrication needed).
- `NotificacionMapper.toResponseDto` already converted `createdAt` → `fechaCreacion` ISO.
- `ForbiddenError` was already exported from `shared/errors/index.js`.
- `tenantContextMiddleware` was already exported from `shared/middleware/index.js`.

## Open issues

None.

## PR

- **URL:** https://github.com/lrodriguezn/ganatrack/pull/57
- **Number:** 57
- **Title:** `fix(notificaciones): register /resumen endpoint and revert frontend polling workaround (closes #52)`
- **Base:** `master`
- **Head:** `fix/endpoint-notificaciones-resumen`
- **Labels:** `type:bug`
- **State:** OPEN
- **Merged:** false (per user instruction: "no subir a master sin pasar por PR")

## Next phase

`verify` — the orchestrator should launch `sdd-verify` after the user reviews the PR.
