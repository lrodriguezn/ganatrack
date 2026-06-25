# Tasks: Fix `GET /notificaciones/resumen` and revert frontend workaround

## Review Workload Forecast

Total estimated changed lines: ~115 (backend ~95 incl. integration test, frontend ~20)
400-line budget risk: Low
Chained PRs recommended: No
Chain strategy: not applicable (single PR)
Decision needed before apply: No

**Justification.** ~115 lines, well under budget; one coherent unit. No chained PR.

## Work-Unit Commits

Tests ship with code; commit by deliverable behavior. Two commits.

1. `fix(notificaciones): register /resumen route with tenant guard and populate ultimas`
   Files: `notificaciones.routes.ts`, `notificacion.dto.ts`, `obtener-resumen.use-case.ts` + spec, NEW `resumen.integration.spec.ts`. Behavior: 200 `{ noLeidas, porTipo, ultimas }` scoped to `X-Predio-Id`, 403 missing header, 401 no auth.

2. `revert(notificaciones): restore bell badge, polling, and notification center empty-state`
   Files: `use-notificaciones-resumen.ts`, `notification-bell.tsx`, `notification-center.tsx`. Reverses `4fd86fa`.

## Tasks

### 1. [RED] Write the integration spec

- [ ] 1.1 Create `apps/api/src/__tests__/integration/notificaciones/resumen.integration.spec.ts` modelled on `configuracion.integration.spec.ts`: `:memory:` better-sqlite3 + Drizzle, `canRunTests`/`testOrSkip`, minimal Fastify app with stubbed `preferenciaRepo`/`pushTokenRepo` and a real `DrizzleNotificacionRepository`.
- [ ] 1.2 Six scenarios: 200 valid `X-Predio-Id` · 403 missing header · 401 no auth · route-ordering (resumen must NOT match `:id`) · 200 empty list · 200 with 12 seeded rows → `ultimas.length === 5`, newest first.
- [ ] 1.3 Run the spec; confirm it fails (route missing → falls through to `:id`, Zod 400).

### 2. [GREEN] Register the route and add the 403 guard

- [ ] 2.1 In `notificaciones.routes.ts`, register `app.get('/notificaciones/resumen', ...)` **before** `GET /notificaciones/:id`. PreHandler: `[authMiddleware, tenantContextMiddleware]`.
- [ ] 2.2 Add the 403 guard: use the `getPredioId(request)` helper (extracted at the top of `notificaciones.routes.ts`); if `predioId <= 0` throw `ForbiddenError('X-Predio-Id es requerido')`; then `obtenerResumenUseCase.execute(predioId)` and reply `{ success: true, data }`.
- [ ] 2.3 Rerun the integration spec; all six scenarios pass.

### 3. [GREEN] Extend the DTO and wire `findByPredio` into the use case

- [ ] 3.1 In `notificacion.dto.ts`, add `ultimas: NotificacionResponseDto[]` to `NotificacionResumenDto`.
- [ ] 3.2 In `obtener-resumen.use-case.ts`, run `Promise.all([countNoLeidas, countByTipo, findByPredio(predioId, { page: 1, limit: ULTIMAS_LIMIT })])`; map the third result via `NotificacionMapper.toResponseDto` into `ultimas`. The cap (`ULTIMAS_LIMIT = 5`) is the repository's job — the use case is a pass-through.
- [ ] 3.3 In `obtener-resumen.use-case.spec.ts`, assert the **pass-through contract**: when the repository returns 5 items, `result.ultimas.length === 5`; when it returns 10 items, `result.ultimas.length === 10`. The actual cap is asserted in the integration spec (seed 12 rows → `length === 5`). Newest-first ordering comes from `findByPredio`'s `desc(createdAt)`.

### 4. Revert the frontend workaround (`4fd86fa`)

- [ ] 4.1 `use-notificaciones-resumen.ts`: `enabled: false` → `enabled: isOnline && !!predioId`; keep `refetchInterval: 30_000`; drop the two workaround comment lines.
- [ ] 4.2 `notification-bell.tsx`: uncomment `<Badge count={unreadCount} max={99} />`.
- [ ] 4.3 `notification-center.tsx`: empty-state condition `data?.ultimas && length === 0` → `(!data?.ultimas || length === 0)` (defensive); render one `NotificationItem` per entry.

### 5. Final verification (run before opening the PR)

- [ ] 5.1 `pnpm --filter api test` — integration + use-case specs green.
- [ ] 5.2 `pnpm typecheck` and `pnpm lint` — clean on touched files.
- [ ] 5.3 Manual: start API + web, log in, select a `predio`; confirm bell badge + panel; remove `X-Predio-Id` and confirm 403.

## Verification (post-apply)

`pnpm test`, `pnpm typecheck`, `pnpm lint` pass. Manual: bell badge + panel list ≤5 newest; 403 without header.

## Rollback

No migration, no flag, no data loss. `git revert` the two commits in reverse order, or cherry-pick the inverse of `4fd86fa` onto the frontend files and reset the three backend files to `master`.
