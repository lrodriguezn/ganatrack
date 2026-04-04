# Tasks: Standardize Mock Services + Shared Feedback Components

## Phase 1: Mock Standardization (Track 1 — Independent, mechanical)

- [x] 1.1 Create `apps/web/src/modules/reportes/services/reportes.api.ts` — extract `RealReportesService` class (lines 46-111 from current `.service.ts`), export it, import `ReportesService` interface from `./reportes.service`
- [x] 1.2 Modify `apps/web/src/modules/reportes/services/reportes.service.ts` — remove inline `RealReportesService` class, update `createRealService()` to `require('./reportes.api').RealReportesService`, keep interface + factory only
- [x] 1.3 Modify `apps/web/src/modules/reportes/services/reportes.mock.ts` — add `implements ReportesService` to `MockReportesService` class, import interface type, export `resetReportesMock()` function that restores seed data to initial values
- [x] 1.4 Modify `apps/web/src/modules/animales/services/animal.service.ts` line 68 — change "Default to mock when env var is not set (falsy)" to "Default to real when env var is not set (falsy)"
- [x] 1.5 Modify `apps/web/src/modules/notificaciones/services/notificaciones.service.ts` line 67 — change "Default to mock" to "Default to real" in factory comment
- [x] 1.6 Modify `apps/web/src/modules/configuracion/services/catalogo.service.ts` line 44 — change "Default to mock" to "Default to real" in factory comment
- [x] 1.7 Modify `apps/web/src/modules/maestros/services/maestros.service.ts` line 42 — change "Default to mock" to "Default to real" in factory comment
- [x] 1.8 Modify `apps/web/src/modules/predios/services/predios.service.ts` line 90 — change "Default to mock" to "Default to real" in factory comment

## Phase 2: Feedback Components (Track 2 — Sequential, new code)

- [ ] 2.1 Install `sonner` dependency: `pnpm add sonner -w --filter @ganatrack/web` — verify in `apps/web/package.json`
- [ ] 2.2 Create `apps/web/src/shared/components/feedback/toast-provider.tsx` — export `ToastProvider` component rendering `<Toaster position="top-right" duration={5000} richColors closeButton />` (thin wrapper, no context)
- [ ] 2.3 Create `apps/web/src/shared/components/feedback/error-boundary.tsx` — React class component with `ErrorBoundaryProps` (children, optional fallback), `ErrorBoundaryState` (hasError, error), `getDerivedStateFromError`, `componentDidCatch` (console.error in dev only), fallback UI with error message + "Reintentar" button calling `handleRetry()`
- [ ] 2.4 Create `apps/web/src/shared/components/feedback/offline-banner.tsx` — `'use client'` component, no props, consumes `useOnlineStatus()` from `@/shared/hooks/use-online-status`, renders fixed top amber banner "Sin conexión a internet" when `!isOnline`, returns `null` when online
- [ ] 2.5 Create `apps/web/src/shared/components/feedback/empty-state.tsx` — component with `EmptyStateProps` (icon: ReactNode, title: string, description: string, action?: ReactNode), centered flex layout with friendly design
- [ ] 2.6 Create `apps/web/src/shared/components/feedback/index.ts` — barrel export re-exporting `ToastProvider`, `ErrorBoundary`, `OfflineBanner`, `EmptyState`

## Phase 3: Integration (Wiring feedback into app)

- [ ] 3.1 Modify `apps/web/src/app/layout.tsx` — import `Toaster` from `'sonner'`, add `<Toaster />` inside `<body>` above `<SerwistProvider>`
- [ ] 3.2 Modify `apps/web/src/app/dashboard/layout.tsx` — import `ErrorBoundary` and `OfflineBanner` from `@/shared/components/feedback`, wrap `<main>` children with `<ErrorBoundary>`, add `<OfflineBanner />` inside `<AdminLayout>`

## Phase 4: Verification

- [ ] 4.1 Run `pnpm typecheck` — verify zero TypeScript errors (especially `MockReportesService implements ReportesService` and `reportes.api.ts` exports)
- [ ] 4.2 Run `pnpm lint` — verify no linting regressions
- [ ] 4.3 Grep for "Default to mock" across all `.service.ts` files — expect 0 matches
- [ ] 4.4 Verify `reportesService` singleton still exports from same path — no consumer breakage
