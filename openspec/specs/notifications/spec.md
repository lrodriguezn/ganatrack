# Notifications Specification

## Purpose

Defines the `notifications` capability: a tenant-scoped summary endpoint that powers the header bell and notification panel in the web app. The endpoint returns the unread count, a per-type breakdown, and the latest notifications for the active `predioId` propagated via the `X-Predio-Id` header.

## Requirements

### Requirement: Resumen Route Registration

The system MUST register `GET /api/v1/notificaciones/resumen` BEFORE `GET /api/v1/notificaciones/:id` in `notificaciones.routes.ts`. The route MUST use preHandler `[authMiddleware, tenantContextMiddleware]`.

#### Scenario: 200 with valid X-Predio-Id

- GIVEN a valid auth token and `X-Predio-Id: 1`
- WHEN the client requests `GET /api/v1/notificaciones/resumen`
- THEN the response MUST be `200` with body `{ success: true, data: { noLeidas, porTipo, ultimas } }`

#### Scenario: 403 when X-Predio-Id is missing

- GIVEN a valid auth token
- WHEN the client requests `GET /api/v1/notificaciones/resumen` without `X-Predio-Id`
- THEN the response MUST be `403` with a forbidden error code

#### Scenario: 401 when auth token is missing

- GIVEN no auth token
- WHEN the client requests `GET /api/v1/notificaciones/resumen`
- THEN the response MUST be `401`

#### Scenario: Route ordering — resumen never matches :id

- GIVEN both `GET /notificaciones/resumen` and `GET /notificaciones/:id` are registered
- WHEN the resolver evaluates `GET /notificaciones/resumen`
- THEN it MUST match the static `resumen` route, NOT the `:id` parameter

### Requirement: Resumen DTO Includes ultimas

`NotificacionResumenDto` MUST include `ultimas: NotificacionResponseDto[]`. The DTO MUST be returned on every successful `GET /notificaciones/resumen` response.

#### Scenario: 200 with empty list

- GIVEN a valid `X-Predio-Id` for a predio with no notifications
- WHEN the client requests `GET /notificaciones/resumen`
- THEN the response MUST be `200`
- AND `data.ultimas` MUST equal `[]`, `data.noLeidas` MUST equal `0`, and `data.porTipo` MUST equal `[]`

### Requirement: Use Case Returns Top 5 Newest ultimas

`ObtenerResumenUseCase` MUST call `INotificacionRepository.findByPredio(predioId, { page: 1, limit: 5 })` and return the mapped items as `ultimas`, ordered newest-first.

#### Scenario: ultimas newest-first, max 5

- GIVEN a `predioId` with 12 notifications across different timestamps
- WHEN `ObtenerResumenUseCase.execute(predioId)` is called
- THEN `result.ultimas.length` MUST be `<= 5`
- AND `result.ultimas[0]` MUST have the most recent `fechaCreacion`
- AND `result.ultimas` MUST be ordered descending by `fechaCreacion`

### Requirement: Frontend Polling Re-enabled

`useNotificacionesResumen` MUST re-enable polling when the device is online and a `predioId` is active. The query MUST use `refetchInterval: 30_000` and `refetchIntervalInBackground: false`.

#### Scenario: Polling enabled when online with active predio

- GIVEN `isOnline === true` and `predioId` is a positive number
- WHEN `useNotificacionesResumen(predioId)` is called
- THEN the underlying `useQuery` MUST have `enabled: true` and `refetchInterval: 30_000`

### Requirement: Notification Bell Badge

`NotificationBell` MUST render a `<Badge count={unreadCount} max={99} />` inside the bell button so the unread count is visible in the header.

#### Scenario: Badge visible when unreadCount > 0

- GIVEN `unreadCount = 3` in the notifications store
- WHEN `NotificationBell` renders
- THEN it MUST render a `<Badge count={3} max={99} />` element inside the bell button

### Requirement: Notification Center Lists ultimas

`NotificationCenter` MUST render one `NotificationItem` per entry of `data.ultimas` (max 5, newest first) and MUST render the empty-state message when `data.ultimas` is empty.

#### Scenario: Panel lists ultimas

- GIVEN the resumen query returns `data.ultimas` with 3 items
- WHEN `NotificationCenter` renders
- THEN it MUST render exactly 3 `NotificationItem` components, one per entry of `data.ultimas`
- AND when `data.ultimas.length === 0`, it MUST render the empty-state message
