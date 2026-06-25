# Design: Fix `GET /notificaciones/resumen` and revert frontend workaround

## Context

`GET /api/v1/notificaciones/resumen` returns 400 because the route is not registered; the request matches `GET /notificaciones/:id` with `id="resumen"` and fails Zod. The `tenantContextMiddleware` is also missing on that path, the DTO/use case omit the `ultimas` array, and commit `4fd86fa` stubbed the UI. Fix: register the static route before `:id`, add `tenantContextMiddleware` with an explicit 403 guard, populate `ultimas` via `findByPredio({ page: 1, limit: 5 })`, revert the three frontend files.

## Goals / Non-Goals

**Goals.** Restore `GET /notificaciones/resumen` returning `{ noLeidas, porTipo, ultimas }` scoped to `X-Predio-Id`. Enforce 403 when `X-Predio-Id` is missing on the resumen route. Re-enable 30 s polling, badge, and empty-state UI. Keep the change ≤ 130 lines.

**Non-Goals.** Rewiring `NotificacionesController` (dead code stays). Changing `tenantContextMiddleware` globally. WebSockets, push, prefs UI, migrations.

## Backend Architecture

### `notificaciones.routes.ts` — register `resumen` BEFORE `:id`

Inline use-case instantiation matches the existing pattern in this file (line 20 already inlines `ListarNotificacionesUseCase`).

```ts
app.get('/notificaciones/resumen', {
  preHandler: [authMiddleware, tenantContextMiddleware],
}, async (request, reply) => {
  const predioId = getPredioId(request)
  if (predioId <= 0) throw new ForbiddenError('X-Predio-Id es requerido')
  const data = await obtenerResumenUseCase.execute(predioId)
  return reply.code(200).send({ success: true, data })
})
```

### `obtener-resumen.use-case.ts` — parallel `findByPredio` call

```ts
const [noLeidas, porTipo, ultimasPage] = await Promise.all([
  this.repo.countNoLeidas(predioId),
  this.repo.countByTipo(predioId),
  this.repo.findByPredio(predioId, { page: 1, limit: ULTIMAS_LIMIT }),
])
return {
  noLeidas,
  porTipo: porTipo.map(t => ({ tipo: t.tipo, count: t.count })),
  ultimas: ultimasPage.data.map(NotificacionMapper.toResponseDto),
}
```

`NotificacionMapper.toResponseDto` converts `createdAt → fechaCreacion` ISO.

### `notificacion.dto.ts` — one new field

```ts
export interface NotificacionResumenDto {
  noLeidas: number
  porTipo: { tipo: NotificacionTipo; count: number }[]
  ultimas: NotificacionResponseDto[]
}
```

### `drizzle-notificacion.repository.ts` — no changes

`findByPredio` (line 39) already supports `{ page, limit, leida?, tipo? }`, orders `desc(createdAt)`, filters `activo=1` + `predioId`.

## Frontend Architecture

Three reverts reversing `4fd86fa`:

| File | Change |
|---|---|
| `use-notificaciones-resumen.ts` | `enabled: false` → `enabled: isOnline && !!predioId` (drop 2 comment lines) |
| `notification-bell.tsx` | Uncomment `<Badge count={unreadCount} max={99} />` |
| `notification-center.tsx` | Empty-state condition: `data?.ultimas && length === 0` → `(!data?.ultimas \|\| length === 0)` (defensive: shows empty state also when `data === undefined`) |

## Tenant Middleware Decision

**Chosen: explicit 403 check in the route handler.**

| Option | Tradeoff | Decision |
|---|---|---|
| Modify `tenantContextMiddleware` to throw on missing header | Behavior change for all 8+ modules reusing `requireTenant` (`app.ts:49`); breaks `animales`/`maestros` silent-zero convention | Reject |
| Add `requireTenantStrict` wrapper | New abstraction; still leaks to other modules unless namespaced everywhere | Reject |
| Inline `predioId <= 0` guard in route handler | One line, local, reversible; matches the spec's preHandler order verbatim | **Accept** |

The check catches the `predioId === 0` case set by the middleware when the header is missing. The middleware itself throws on NaN and negative values before the route handler runs.

## Test Plan

### TDD order (strict TDD mode)

1. **RED** — write the integration spec covering all 6 HTTP scenarios. Watch it fail (route missing).
2. **GREEN** — register the route + tenant middleware + 403 guard; add `ultimas` to DTO. All 6 HTTP tests pass.
3. **REFACTOR** — wire `findByPredio({ page: 1, limit: ULTIMAS_LIMIT })` into the use case. Update `obtener-resumen.use-case.spec.ts` to assert the **pass-through contract**: `findByPredio` is called with `{ page: 1, limit: ULTIMAS_LIMIT }` and the use case returns the items unchanged in count and order (asserts both 5-item and 10-item cases). The cap is the repository's job, not the use case's.

### Integration test pattern (from `configuracion.integration.spec.ts`)

`:memory:` better-sqlite3 + Drizzle, `canRunTests` guard, `testOrSkip`. Minimal Fastify app with stubbed `preferenciaRepo`/`pushTokenRepo` and a real `DrizzleNotificacionRepository`. `signAccessToken({ sub: 1, roles: ['ADMIN'], permisos: ['notificaciones:read'], predioIds: [1] })` for auth. Seed 12 rows for the ordering test.

### Scenarios → test mapping

| Spec scenario | Test |
|---|---|
| 200 with valid X-Predio-Id | inject w/ auth + `x-predio-id: 1` → 200, body shape |
| 403 when X-Predio-Id missing | inject w/ auth, no header → 403, `error.code === 'FORBIDDEN'` |
| 401 when auth missing | inject w/o `authorization` → 401 |
| Route ordering | hit `/notificaciones/resumen` — must NOT match `:id` |
| 200 with empty list | empty DB → `ultimas === []`, `noLeidas === 0`, `porTipo === []` |
| ultimas newest-first, max 5 | seed 12 → `length === 5`, first is newest |

Frontend scenarios (polling, badge, panel) are now covered by **three new test files** added in the Round 1 review fixes:
- `use-notificaciones-resumen.test.tsx` (7 tests: enabled flag, refetchInterval, online/offline behavior, store sync)
- `notification-bell.test.tsx` (8 tests: badge count, max=99, conditional render)
- `notification-center.test.tsx` (7 tests: ultimas list rendering, empty state, data-undefined regression)

## Rollout

Branch `fix/endpoint-notificaciones-resumen` (matches `fix/` convention). Single PR, squash-merge + delete branch. PR body: closes #52, lists 4 acceptance criteria, calls out the 403-via-handler-guard decision. Forecast ~115 lines, under 400 budget.

## Risks

| Risk | Lik | Mitigation |
|---|---|---|
| Route registered after `:id` → 400 | Med | Register first; explicit ordering test. |
| Middleware order wrong → 401 not 403 | Med | `preHandler: [auth, tenant]`; 403-with-auth test guards it. |
| DTO `fechaCreacion` vs DB `createdAt` mismatch | Low | `NotificacionMapper` already converts; assert string in test. |

## Open Questions

None.
