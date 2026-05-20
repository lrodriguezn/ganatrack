# Proposal: Connect PalpacionForm and PartoForm to Offline Queue

## Intent

Wire the remaining two critical servicios forms — PartoForm and PalpacionForm — to the existing offline form queue so users can submit birth and palpation events while offline, matching the AnimalForm pattern already implemented in issue #32.

## Scope

### In Scope
- PartoForm: replace direct `mutateAsync` with `submitFormWithOfflineSupport`
- PalpacionForm: queue at final submit only (wizard assembles single payload)
- Add optional `headers` parameter to `servicios.api.ts` `createParto()` and `createPalpacion()`
- Offline queued success message UI for both forms
- Skip navigation redirect when offline

### Out of Scope
- IndexedDB wizard step persistence (mid-wizard data loss on browser close is acceptable)
- Optimistic UI or background sync retry logic (already exists)
- Backend changes (idempotency already wired)

## Capabilities

### New Capabilities
None — this change applies the existing `offline-form-queue` capability to two more forms.

### Modified Capabilities
None — no spec-level behavior changes.

## Approach

Follow the established AnimalForm pattern exactly:
1. Add `headers?: Record<string, string>` to service methods
2. In page `handleSubmit`, call `submitFormWithOfflineSupport` with `formType`, endpoint, payload, and `mutateAsync`
3. Online: submit with `X-Idempotency-Key` header and redirect
4. Offline: queue to IndexedDB, show "Guardado offline" toast, stay on page
5. For PalpacionForm: only wrap the final "Guardar Evento" handler; wizard state remains in React `useState`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/app/dashboard/servicios/partos/nuevo/page.tsx` | Modified | Wire `submitFormWithOfflineSupport` |
| `apps/web/src/app/dashboard/servicios/palpaciones/nuevo/page.tsx` | Modified | Wire `submitFormWithOfflineSupport` in final submit |
| `apps/web/src/modules/servicios/api/servicios.api.ts` | Modified | Add `headers?` param to `createParto` and `createPalpacion` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Service method signature break | Low | Both methods gain optional param; no callers affected |
| Wizard payload mismatch when offline | Low | Same assembly logic, just different submit path |
| Duplicate records on sync replay | Very Low | Backend idempotency already active on both routes |

## Rollback Plan

1. Revert the three affected files to pre-change state
2. No feature flags or schema changes to clean up
3. Backend idempotency remains compatible with old clients

## Dependencies

- Issue #32 (`pwa-offline-background-sync`) — offline infrastructure must be in place
- `submitFormWithOfflineSupport` utility and `useOfflineQueue` hook
- Backend idempotency middleware on `/servicios/partos` and `/servicios/palpaciones`

## Success Criteria

- [ ] PartoForm queues submission when offline and auto-submits on reconnect
- [ ] PalpacionForm queues final assembled payload when offline
- [ ] Both forms show offline queued confirmation without page redirect
- [ ] Zero duplicate records created from replay on both endpoints
- [ ] Total diff under 200 lines
