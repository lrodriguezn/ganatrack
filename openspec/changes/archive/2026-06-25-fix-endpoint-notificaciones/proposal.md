# Proposal: Fix `GET /notificaciones/resumen` and revert frontend workaround

## Why

`GET /api/v1/notificaciones/resumen` returns **400**: the route is not registered, so requests match `GET /notificaciones/:id` with `id="resumen"` and fail Zod. `tenantContextMiddleware` is missing, and the DTO/use case omit the `ultimas` array. The `4fd86fa` workaround disabled polling and stubbed the UI — users miss real-time notifications.

## What Changes

### Backend (`apps/api/src/modules/notificaciones/`)

- **`infrastructure/http/routes/notificaciones.routes.ts`** — register `GET /notificaciones/resumen` **before** `GET /notificaciones/:id`. PreHandler `[authMiddleware, tenantContextMiddleware]`.
- **`application/dtos/notificacion.dto.ts`** — add `ultimas: NotificacionResponseDto[]` to `NotificacionResumenDto`.
- **`application/use-cases/obtener-resumen.use-case.ts`** — call `repo.findByPredio(predioId, { page: 1, limit: 5 })`, map to DTO, return alongside `noLeidas` and `porTipo`.
- **No controller wiring** — inline pattern. `NotificacionesController` stays dead code.

### Frontend (revert `4fd86fa`)

- **`use-notificaciones-resumen.ts`** — `enabled: false` → `enabled: isOnline && !!predioId`; keep `refetchInterval: 30_000`.
- **`notification-bell.tsx`** — uncomment `<Badge count={unreadCount} max={99} />`.
- **`notification-center.tsx`** — restore empty-state; drop `!data?.ultimas` workaround.


### Tests

- **New** `apps/api/src/__tests__/integration/notificaciones/resumen.integration.spec.ts` — 200 valid header, 403 missing, 401 no auth, 200 empty, route-ordering, `ultimas` newest-first max 5.
- **Update** `obtener-resumen.use-case.spec.ts` — assert `ultimas`.


## Capabilities

### New
- `notifications` — `GET /notificaciones/resumen` returns `{ noLeidas, porTipo, ultimas }` scoped to `predioId` from `X-Predio-Id`.

### Modified
None.

## Impact

| File | Change |
|------|--------|
| `apps/api/.../notificaciones.routes.ts` | New route + tenant middleware |
| `apps/api/.../obtener-resumen.use-case.ts` | Returns `ultimas` (top 5) |
| `apps/api/.../notificacion.dto.ts` | Adds `ultimas` |
| `apps/web/.../use-notificaciones-resumen.ts` | Re-enables polling |
| `apps/web/.../notification-bell.tsx` | Re-enables badge |
| `apps/web/.../notification-center.tsx` | Restores empty state |
| Database | No change |

## Out of Scope

`NotificacionesController` (dead code stays). WebSocket/push. 30 s polling. Preferences UI. Migrations.

## Acceptance Criteria

- [ ] Valid `X-Predio-Id` → **200** `{ success, data: { noLeidas, porTipo, ultimas } }`.
- [ ] Missing header → **403**; no auth → **401**.
- [ ] `resumen` never matches `:id`; polls 30 s when `isOnline && !!predioId`.
- [ ] Bell shows badge; center lists `ultimas` (max 5, newest first).
- [ ] Integration test passes; diff ≤ 130 lines.

## Risks & Mitigations

| Risk | Lik | Mitigation |
|------|-----|------------|
| `resumen` after `:id` → 400 | Med | Register first; route-ordering test. |
| Tenant middleware missing → `predioId=0` | Med | `[auth, tenant]` preHandler; 403 test. |
| DTO still missing `ultimas` | Low | Use case calls `findByPredio({ page: 1, limit: 5 })`. |
| Polls offline | Low | `enabled: isOnline && !!predioId`. |

## Rollback Plan

1. Revert three backend files to `master`.
2. Re-apply `4fd86fa` to three frontend files.
3. No migration, no feature flag.

## Open Questions (design)

- `ultimas` cap → **5**; unread-only filter → **No**; `?limit` param → **No**.

## Dependencies

`X-Predio-Id` propagation. `tenantContextMiddleware`. `INotificacionRepository.findByPredio`.
