# Archive Report: Fase 5 — Notificaciones Backend

**Change**: fase5-notificaciones-backend
**Project**: ganatrack
**Mode**: hybrid
**Date**: 2026-04-05
**Status**: COMPLETED

## Summary

Implemented the complete GanaTrack notifications backend module with alert engine, multi-channel delivery (in-app, email, push), daily scheduler, and user preference management. Module follows established hexagonal architecture and integrates with existing servicios module for alert triggers.

## Artifacts

- ✅ `proposal.md` — Change proposal (created before implementation)

> **Note**: Spec, design, and tasks were not formalized in openspec — implementation was done directly following the proposal requirements and established project patterns. This archive retrospectively documents the completed work.

## What Was Done

### Domain Layer (4 files)
- 3 entities: Notificacion, Preferencia, PushToken
- 3 repository interfaces: INotificacionRepository, IPreferenciaRepository, IPushTokenRepository
- Alert Engine domain service with 5 alert type evaluators:
  - `PARTO_PROXIMO` — Partos estimados en N días
  - `CELO_ESTIMADO` — Celo esperado (21 días post-parto/servicio fallido)
  - `INSEMINACION_PENDIENTE` — Diagnóstico reproductivo pendiente
  - `VACUNA_PENDIENTE` — Tratamiento veterinario próximo a vencer
  - `ANIMAL_ENFERMO` — Animal enfermo sin atención reciente
- Canal de notificación interface (strategy pattern)

### Application Layer (11 use cases)
- `ListarNotificacionesUseCase` — Paginated list with tenant scoping
- `ObtenerResumenUseCase` — Unread counts by type
- `MarcarLeidaUseCase` — Mark single notification as read
- `MarcarTodasLeidasUseCase` — Mark all as read
- `EliminarNotificacionUseCase` — Soft delete
- `ObtenerPreferenciasUseCase` — User preferences by type
- `ActualizarPreferenciaUseCase` — Update channel preferences
- `RegistrarPushTokenUseCase` — FCM device registration
- `EliminarPushTokenUseCase` — Unregister device
- `EvaluarAlertasUseCase` — Manual alert evaluation trigger (admin)

### Infrastructure Layer
- 3 Drizzle repositories with tenant scoping (predioId filtering)
- 3 channel adapters:
  - `InAppChannelAdapter` — DB persistence
  - `EmailChannelAdapter` — nodemailer integration
  - `PushChannelAdapter` — firebase-admin FCM integration
- `AlertaSchedulerService` — node-cron daily job at 00:30
- 3 mappers: notificacion, preferencia, push-token
- JSON Schema validation for all 10 endpoints

### HTTP Layer (10 endpoints)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notificaciones` | Paginated list |
| GET | `/notificaciones/resumen` | Unread counts |
| PATCH | `/notificaciones/:id/leer` | Mark read |
| PATCH | `/notificaciones/leer-todas` | Mark all read |
| DELETE | `/notificaciones/:id` | Delete |
| GET | `/notificaciones/preferencias` | User preferences |
| PUT | `/notificaciones/preferencias/:tipo` | Update preference |
| POST | `/notificaciones/push-tokens` | Register device |
| DELETE | `/notificaciones/push-tokens/:token` | Unregister device |
| POST | `/notificaciones/alertas/evaluar` | Manual alert trigger |

### DI Registration
- Full tsyringe container setup in `index.ts`
- Registered in `app.ts` with `registerNotificacionesModule()` + `registerNotificacionesModuleRoutes()`

## Verification Results

### Tests
- **Test files**: 14
  - 9 use case specs
  - 1 alert engine spec
  - 3 mapper specs
  - 1 repository spec
- **Coverage**: All use cases, mappers, alert engine, and repository tested

### Code Metrics
- **Total files**: 47
- **Total lines**: 3,472
- **Architecture**: Hexagonal (domain → application → infrastructure)

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| N/A | None | This change adds a new backend module. No API spec changes to sync — endpoints are internal to backend. |

## Files

```
apps/api/src/modules/notificaciones/
├── domain/
│   ├── entities/              # 3 entities
│   ├── repositories/          # 3 interfaces
│   └── services/              # AlertEngine + canal interface + tests
├── application/
│   ├── dtos/                  # DTOs
│   └── use-cases/             # 11 use cases + 9 test files
├── infrastructure/
│   ├── channels/              # InApp, Email, Push adapters
│   ├── http/
│   │   ├── controllers/       # NotificacionesController
│   │   ├── routes/            # 10 endpoints
│   │   └── schemas/           # JSON Schema validation
│   ├── mappers/               # 3 mappers + 3 test files
│   ├── persistence/           # 3 Drizzle repos + 1 test
│   └── scheduler/             # AlertaSchedulerService
└── index.ts                   # DI registration
```

## Dependencies

- `node-cron` — Job scheduling
- `nodemailer` — Email delivery
- `firebase-admin` — FCM push notifications
- `@ganatrack/database` — Drizzle schema (already existed)
