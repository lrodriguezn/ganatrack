# Proposal: Fase 5 Notificaciones Backend

## Intent

Implement the notification system for GanaTrack: a complete backend module with automatic alert generation (partos próximos, celos, servicios pendientes), multi-channel delivery (in-app/email/push), daily scheduler, and user preference management.

## Scope

### In Scope

**notifications module** (3 entities):
- Notificaciones (CRUD + filtering + read/unread)
- NotificacionesPreferencias (user preferences by alert type)
- NotificacionesPushTokens (FCM device token registration)

**Alert Engine** (5 alert types):
- PARTO_PROXIMO: Partos estimados en N días
- CELO_ESTIMADO: Celo esperado (21 días post-parto/servicio fallido)
- INSEMINACION_PENDIENTE: Diagnóstico reproductivo pendiente
- VACUNA_PENDIENTE: Tratamiento veterinario próximo a vencer
- ANIMAL_ENFERMO: Animal enfermo sin atención reciente

**Delivery Channels** (3 adapters):
- In-App: DB persistence + polling endpoint
- Email: nodemailer with queue
- Push: firebase-admin (FCM)

**Scheduler Infrastructure**:
- node-cron job (daily at 00:30)
- AlertaSchedulerService with predio iteration
- Per-alert-type evaluation methods

**API Endpoints** (10):
- GET /notificaciones (paginated list)
- GET /notificaciones/resumen (unread counts by type)
- PATCH /notificaciones/:id/leer (mark read)
- PATCH /notificaciones/leer-todas (mark all read)
- DELETE /notificaciones/:id (delete)
- GET /notificaciones/preferencias (user preferences)
- PUT /notificaciones/preferencias/:tipo (update preferences)
- POST /notificaciones/push-tokens (register device)
- DELETE /notificaciones/push-tokens/:token (unregister)
- POST /notificaciones/alertas/evaluar (manual trigger for admin)

### Out of Scope

- Email templates with rich formatting
- WebSockets/SSE for real-time push
- Frontend notification UI
- Notification history analytics/reporting
- Push notification retry logic with exponential backoff

## Capabilities

### New Capabilities

- `notifications-backend`: Complete notification system with alert engine, scheduler, multi-channel delivery, and user preferences

### Modified Capabilities

None — this is a brand new module with no existing spec changes.

## Approach

Follow established hexagonal architecture pattern:

1. **Domain Layer**: Pure entities matching existing Drizzle schema (notificaciones.ts already exists)
2. **Alert Engine**: Domain service with per-alert-type evaluation methods
3. **Repository Interfaces**: CRUD + tenant-scoped queries + preference management
4. **Use Cases**: Application layer with tsyringe DI
5. **Infrastructure**: 
   - Drizzle repositories (existing schema)
   - Scheduler service with node-cron
   - Channel adapters (InAppAdapter, EmailAdapter, PushAdapter)

**Key patterns**:
- Alert Engine queries servicios tables (palpaciones, inseminaciones, partos, veterinarios)
- Tenant isolation: ALWAYS filter by predioId
- Soft delete: Use `activo` field
- Preferences: Default enabled for all channels, user can disable per type
- Manual trigger: Admin-only endpoint for testing

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/modules/notificaciones/` | New | Complete hexagonal module (domain/application/infrastructure) |
| `apps/api/src/app.ts` | Modified | Register notificaciones module + scheduler plugin |
| `packages/database/src/schema/notificaciones.ts` | Referenced | Schema already exists, no changes needed |
| `apps/api/src/shared/` | Modified | Add node-cron plugin, firebase-admin setup |
| `packages/shared-types/` | Modified | Add notification-related DTOs and enums |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Data integrity (services change after alert generated) | Medium | Store snapshot of relevant data in notificacion, add `entidadSnapshot` field |
| Performance (N predios × M animales queries) | High | Batch queries, use indexes on fecha fields, run scheduler at low-traffic hour (00:30) |
| Multi-tenant data leak | Critical | ALWAYS filter by predioId, use established tenant context middleware pattern |
| Timezone handling (partos/celos dates) | Medium | Store dates in UTC, convert to predio timezone for display, use timezone-aware scheduler |
| Push token invalidation | Low | Handle FCM errors gracefully, mark tokens as invalid on delivery failure |
| Email delivery failures | Low | Use queue pattern, retry with backoff, log failures |

## Rollback Plan

1. Remove `apps/api/src/modules/notificaciones/` folder
2. Remove scheduler plugin registration from `apps/api/src/app.ts`
3. Remove node-cron, nodemailer, firebase-admin from dependencies
4. Revert shared-types changes
5. No database schema rollback needed (schema already exists)

## Dependencies

- **Phase 1&2 Modules**: auth, usuarios, predios, animales, configuracion, maestros
- **Phase 3 Module**: servicios (palpaciones, inseminaciones, partos, veterinarios tables for alert triggers)
- **External npm packages**:
  - `node-cron`: Job scheduling
  - `nodemailer`: Email delivery
  - `firebase-admin`: FCM push notifications
- **Existing Schema**: `packages/database/src/schema/notificaciones.ts` (already created)

## Success Criteria

- [ ] All TypeScript files compile without errors
- [ ] Module follows hexagonal architecture (domain → application → infrastructure)
- [ ] All repositories implement tenant scoping (predioId filtering)
- [ ] All routes have authMiddleware + tenantContextMiddleware
- [ ] Scheduler runs daily at 00:30 using node-cron
- [ ] Alert Engine correctly evaluates all 5 alert types
- [ ] All 10 API endpoints functional with JSON Schema validation
- [ ] Email adapter sends via nodemailer (basic template)
- [ ] Push adapter sends via firebase-admin (FCM)
- [ ] User preferences persist correctly (enable/disable per type and channel)