# Tasks: connect-palpacion-parto-offline

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150–180 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Wire PartoForm and PalpacionForm to offline queue | PR 1 | Service layer + 2 page files; tests included |

## Phase 1: Service Layer — Add headers parameter

- [ ] 1.1 In `apps/web/src/modules/servicios/services/servicios.api.ts`: add `headers?: Record<string, string>` optional param to `createParto()` and forward it to `apiClient.post`
- [ ] 1.2 Add `headers?: Record<string, string>` optional param to `createPalpacion()` and forward it to `apiClient.post`

## Phase 2: PartoForm — Wire offline support

- [ ] 2.1 In `apps/web/src/app/dashboard/servicios/partos/nuevo/page.tsx`: import `submitFormWithOfflineSupport` from `@/shared/lib/offline/submit-form` and `useState` from react
- [ ] 2.2 Add `isOfflineQueued` state and replace `handleSubmit` to use `submitFormWithOfflineSupport` with `formType: 'parto'`, `endpoint: '/api/v1/servicios/partos'`
- [ ] 2.3 Online path: call `mutateAsync` with headers `{ 'X-Idempotency-Key': <key> }`, redirect on success
- [ ] 2.4 Offline path: set `isOfflineQueued(true)`, stay on page
- [ ] 2.5 Add "Guardado offline" banner below header (matching AnimalForm pattern)

## Phase 3: PalpacionForm — Wire offline support (wizard final step)

- [ ] 3.1 In `apps/web/src/app/dashboard/servicios/palpaciones/nuevo/page.tsx`: import `submitFormWithOfflineSupport` and `useState`
- [ ] 3.2 Add `isOfflineQueued` state; replace `handleSubmit` to assemble DTO and call `submitFormWithOfflineSupport` with `formType: 'palpacion'`, `endpoint: '/api/v1/servicios/palpaciones'`
- [ ] 3.3 Online: call `mutateAsync` with headers `{ 'X-Idempotency-Key': <key> }`, redirect on success
- [ ] 3.4 Offline: set `isOfflineQueued(true)`, stay on page
- [ ] 3.5 Add "Guardado offline" banner below header (matching AnimalForm pattern)

## Phase 4: Testing

- [ ] 4.1 Verify `submitFormWithOfflineSupport` unit tests still pass
- [ ] 4.2 Verify no existing tests broken by service signature change (both params are optional)