# Tasks: PWA Offline — GanaTrack

## Phase 1: Infrastructure & Dependencies

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 1.1 | Install `idb-keyval@^6.2.1` and `@tanstack/react-query-persist-client@^5.x` dependencies | S | — | — |
| 1.2 | Add `APP_VERSION` env variable to `.env.local` and build config | S | 1.1 | — |

### Acceptance Criteria Phase 1
- [x] `pnpm install` completes without errors
- [x] `APP_VERSION` available at build time for cache buster

---

## Phase 2: Query Persistence (TanStack Query → IndexedDB)

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 2.1 | **RED**: Write unit test for `createIDBPersister()` — persist/restore/remove client | S | 1.1 | `src/shared/lib/__tests__/idb-persister.test.ts` |
| 2.2 | **GREEN**: Create `src/shared/lib/idb-persister.ts` with `createIDBPersister()` function | S | 2.1 | — |
| 2.3 | **RED**: Write unit test for `query-client.ts` — verify gcTime is 24h | XS | 1.1 | `src/shared/lib/__tests__/query-client.test.ts` |
| 2.4 | **GREEN**: Update `src/shared/lib/query-client.ts` — change `gcTime` to 24h (86400000ms) | XS | 2.3 | — |
| 2.5 | **RED**: Write unit test for `app-providers.tsx` — verify PersistQueryClientProvider usage | S | 2.2 | `src/shared/providers/__tests__/app-providers.test.tsx` |
| 2.6 | **GREEN**: Modify `src/shared/providers/app-providers.tsx` — replace QueryClientProvider with PersistQueryClientProvider, configure persister with maxAge 24h and buster from APP_VERSION | M | 2.4, 2.5 | — |
| 2.7 | **REFACTOR**: Clean up tests, ensure coverage >80% | S | 2.6 | — |

### Acceptance Criteria Phase 2
- [ ] Query cache persists across page reloads when offline (Spec PWA-01 Scenario 1)
- [ ] Cache survives browser close and reopen (Spec PWA-01 Scenario 2)
- [ ] Cache invalidates after 24h or app version change (Spec PWA-01 Scenario 3)
- [ ] Unit tests pass with >80% coverage

---

## Phase 3: Service Worker — Refresh-Before-Replay

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 3.1 | **RED**: Write integration test for SW replay handler — verify token refresh before replay | M | — | `src/sw.test.ts` (MSW mock for /auth/refresh) |
| 3.2 | **GREEN**: Add `replayWithTokenRefresh()` to `src/sw.ts` — intercept replay, call /auth/refresh, retry with new token | L | 3.1 | — |
| 3.3 | **GREEN**: Add `moveToFailedSyncQueue()` to `src/sw.ts` — move failed items to separate IndexedDB queue | M | 3.2 | — |
| 3.4 | **GREEN**: Add `handleReplayResponse()` to `src/sw.ts` — handle 404/409/400/5xx/401 responses per design table | L | 3.3 | — |
| 3.5 | **GREEN**: Add `notifyClient()` to `src/sw.ts` — postMessage to clients for UI notifications | S | 3.4 | — |
| 3.6 | **GREEN**: Add `CLEAR_DYNAMIC_CACHE` message handler to `src/sw.ts` | S | 3.5 | — |
| 3.7 | **GREEN**: Add offline fallback navigation handler in `src/sw.ts` catch block | M | 3.6 | — |
| 3.8 | **REFACTOR**: Consolidate SW logic, add TypeScript types for queue items | S | 3.7 | — |

### Acceptance Criteria Phase 3
- [ ] SW refreshes token before replaying mutations (Spec PWA-02 Scenario 1)
- [ ] Failed refresh (401) moves items to failed-sync queue (Spec PWA-02 Scenario 2)
- [ ] Multiple mutations replay with single token refresh (Spec PWA-02 Scenario 3)
- [ ] 404 responses discard mutation and notify user (Spec PWA-03 Scenario 1)
- [ ] 409 responses move to conflict queue (Spec PWA-03 Scenario 2)
- [ ] 400 responses move to failed-sync queue (Spec PWA-03 Scenario 3)

---

## Phase 4: Conflict Resolution & Sync Page

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 4.1 | **RED**: Write unit test for `use-sync-actions.ts` — discardItem, retryItem, resolveConflict | M | 3.4 | `src/shared/hooks/__tests__/use-sync-actions.test.ts` |
| 4.2 | **GREEN**: Create `src/shared/hooks/use-sync-actions.ts` with discardItem, retryItem, resolveConflict functions | M | 4.1 | — |
| 4.3 | **RED**: Write unit test for `use-failed-sync.ts` improvements — categorize by error status, expose actions | S | 4.2 | `src/shared/hooks/__tests__/use-failed-sync.test.ts` |
| 4.4 | **GREEN**: Enhance `src/shared/hooks/use-failed-sync.ts` — add error categorization (404/409/400), expose remove/update actions | M | 4.3 | — |
| 4.5 | **RED**: Write unit test for `failed-item-card.tsx` — render item with timestamp, method, entity, error | S | 4.4 | `src/app/dashboard/sincronizacion/components/__tests__/failed-item-card.test.tsx` |
| 4.6 | **GREEN**: Create `src/app/dashboard/sincronizacion/components/failed-item-card.tsx` component | S | 4.5 | — |
| 4.7 | **RED**: Write unit test for `sync-queue-list.tsx` — render list, handle empty state, navigation | S | 4.6 | `src/app/dashboard/sincronizacion/components/__tests__/sync-queue-list.test.tsx` |
| 4.8 | **GREEN**: Create `src/app/dashboard/sincronizacion/components/sync-queue-list.tsx` component | M | 4.7 | — |
| 4.9 | **RED**: Write unit test for `conflict-resolver.tsx` — render diff, handle local/server choice | M | 4.8 | `src/app/dashboard/sincronizacion/components/__tests__/conflict-resolver.test.tsx` |
| 4.10 | **GREEN**: Create `src/app/dashboard/sincronizacion/components/conflict-resolver.tsx` modal component with side-by-side diff | L | 4.9 | — |
| 4.11 | **GREEN**: Create `src/app/dashboard/sincronizacion/page.tsx` — sync page with banner, list, and conflict resolution | L | 4.10 | — |
| 4.12 | **GREEN**: Add sync pending banner to header (integrate with `admin-header.tsx` or layout) | M | 4.11 | — |
| 4.13 | **REFACTOR**: Clean up components, ensure accessibility, add loading states | S | 4.12 | — |

### Acceptance Criteria Phase 4
- [ ] `/sincronizacion` page accessible from dashboard
- [ ] Lists all failed-sync and conflict items (Spec PWA-04 Scenario 1)
- [ ] Conflict resolver shows side-by-side diff (Spec PWA-04 Scenario 2)
- [ ] "Keep my version" sends PUT with `force: true`
- [ ] "Accept server version" discards local mutation
- [ ] Discard button shows confirmation before removing (Spec PWA-04 Scenario 3)
- [ ] Banner shows count of pending items when >0 (Spec PWA-07)
- [ ] No banner when all items synced (Spec PWA-07 Scenario 2)

---

## Phase 5: Offline Fallback & Manifest

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 5.1 | **RED**: Write E2E test for offline fallback page — verify display when navigating to uncached route | S | — | `tests/e2e/offline-fallback.spec.ts` |
| 5.2 | **GREEN**: Create `src/app/offline/page.tsx` — offline fallback with message, retry button, links to available sections | M | 5.1 | — |
| 5.3 | **GREEN**: Update `public/manifest.json` — add `lang: "es"`, `shortcuts`, `screenshots`, `categories` | S | 5.2 | — |
| 5.4 | **GREEN**: Add offline page to SW precache or navigation fallback | S | 5.3 | — |

### Acceptance Criteria Phase 5
- [ ] Offline page shows when navigating to uncached route offline (Spec PWA-05)
- [ ] Retry button attempts navigation again
- [ ] Links to available offline sections (dashboard, animales)
- [ ] Manifest passes Lighthouse PWA audit >90 score (Spec PWA-06)

---

## Phase 6: Integration Tests (MSW)

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 6.1 | Setup MSW handlers for `/auth/refresh` endpoint in `tests/mocks/handlers.ts` | S | 3.2 | — |
| 6.2 | Write integration test — token refresh success, mutation replay success | M | 6.1 | `tests/integration/sync-replay-success.test.ts` |
| 6.3 | Write integration test — token refresh fails (401), mutation moves to failed queue | M | 6.1 | `tests/integration/sync-replay-auth-fail.test.ts` |
| 6.4 | Write integration test — 409 conflict response triggers conflict queue | M | 6.1 | `tests/integration/sync-conflict-409.test.ts` |
| 6.5 | Write integration test — 404 response discards mutation and notifies | M | 6.1 | `tests/integration/sync-discard-404.test.ts` |
| 6.6 | Write integration test — 400 validation error moves to failed queue | M | 6.1 | `tests/integration/sync-validation-400.test.ts` |

### Acceptance Criteria Phase 6
- [ ] All integration tests pass
- [ ] MSW properly mocks auth refresh and API responses
- [ ] Tests verify IndexedDB state changes

---

## Phase 7: E2E Tests (Playwright)

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 7.1 | Setup Playwright test fixtures for offline/online simulation | S | — | `tests/e2e/fixtures/offline.ts` |
| 7.2 | Write E2E test — offline data entry, reload, data persists (PWA-01) | L | 7.1 | `tests/e2e/offline-persistence.spec.ts` |
| 7.3 | Write E2E test — offline mutation, reconnect, auto-sync success (PWA-02) | L | 7.2 | `tests/e2e/offline-sync-success.spec.ts` |
| 7.4 | Write E2E test — offline mutation, reconnect, conflict resolution (PWA-03, PWA-04) | L | 7.3 | `tests/e2e/offline-sync-conflict.spec.ts` |
| 7.5 | Write E2E test — sync page navigation, discard item, retry item (PWA-04) | M | 7.4 | `tests/e2e/sync-page-actions.spec.ts` |
| 7.6 | Write E2E test — banner visibility with pending items (PWA-07) | S | 7.5 | `tests/e2e/sync-banner.spec.ts` |
| 7.7 | Write E2E test — Lighthouse PWA audit passes >90 (PWA-06) | S | 7.6 | `tests/e2e/lighthouse-pwa.spec.ts` |

### Acceptance Criteria Phase 7
- [ ] All E2E tests pass in CI
- [ ] Tests run in headed and headless modes
- [ ] Offline simulation works reliably

---

## Phase 8: Cleanup & Documentation

| ID | Task | Complexity | Dependencies | TDD Test File |
|----|------|------------|--------------|---------------|
| 8.1 | Update `.lighthouserc.json` — add `/sincronizacion` to audited URLs | XS | 5.4 | — |
| 8.2 | Run full test suite, fix any failing tests | M | 7.7 | — |
| 8.3 | Verify test coverage >80% for all new code | S | 8.2 | — |
| 8.4 | Add JSDoc comments to public functions | S | 8.3 | — |

### Acceptance Criteria Phase 8
- [ ] Lighthouse CI includes sync page
- [ ] All tests pass (unit + integration + E2E)
- [ ] Coverage thresholds met
- [ ] Code documented

---

## Summary

| Phase | Tasks | Focus | Key Deliverables |
|-------|-------|-------|------------------|
| 1 | 2 | Infrastructure | Dependencies installed |
| 2 | 7 | Query Persistence | idb-persister, PersistQueryClientProvider |
| 3 | 8 | Service Worker | refresh-before-replay, conflict handling |
| 4 | 13 | Sync Page | /sincronizacion, hooks, components |
| 5 | 4 | Offline UX | fallback page, manifest |
| 6 | 6 | Integration Tests | MSW-based API tests |
| 7 | 7 | E2E Tests | Playwright offline flows |
| 8 | 4 | Cleanup | Lighthouse, coverage, docs |
| **Total** | **51** | | |

## Implementation Order

1. **Start with Phase 1-2** (infrastructure + persistence) — these are foundational
2. **Then Phase 3** (SW enhancements) — requires Phase 2 for proper token handling
3. **Parallel: Phase 4** (sync page) — can start after Phase 3's interface is defined
4. **Phase 5** (fallback + manifest) — independent, can parallel with Phase 4
5. **Phase 6-7** (testing) — after implementation is stable
6. **Phase 8** (cleanup) — final verification

## TDD Approach

Every implementation task follows RED-GREEN-REFACTOR:
- **RED**: Write failing test first (specifies expected behavior)
- **GREEN**: Implement minimal code to pass test
- **REFACTOR**: Clean up while keeping tests green

## Dependencies Graph

```
1.1 → 1.2 → 2.1 → 2.2 → 2.5 → 2.6
                ↘ 2.3 → 2.4 ↗

3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8
                ↓
4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8 → 4.9 → 4.10 → 4.11 → 4.12 → 4.13

5.1 → 5.2 → 5.3 → 5.4

6.1 → 6.2-6.6 (parallel)

7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6 → 7.7

8.x (after all above)
```
