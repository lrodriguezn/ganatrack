# Tasks: Módulo Reportes — Fase 4

## Phase 1: Foundation / Infrastructure (Types, Service, Store, Config)

Foundation layer — all other tasks depend on these.

- [ ] 1.1 Create `modules/reportes/types/reportes.types.ts` — Define all TypeScript types: `ReporteFiltros`, `DashboardKPIs`, `ReporteData<T>`, `ReporteResumen`, `ChartDataItem`, `TimeSeriesItem`, `InventarioGraficos`, `ReproductivoGraficos`, `MortalidadGraficos`, `MovimientoGraficos`, `SanitarioGraficos`, `ExportRequest`, `ExportJob`
- [ ] 1.2 Create `modules/reportes/services/reportes.service.ts` — API client with ky: `getDashboardKPIs()`, `getInventario()`, `getReproductivo()`, `getMortalidad()`, `getMovimiento()`, `getSanitario()`, `exportar()`, `getExportStatus()`, `downloadExport()`
- [ ] 1.3 Create `store/reportes.store.ts` — Zustand store for `ReportesFiltrosState`: `fechaInicio`, `fechaFin`, `setFechas()`, `resetFiltros()`. PredioId comes from existing `predio.store.ts`
- [ ] 1.4 Modify `shared/lib/query-keys.ts` — Add `reportes` factory with: `all`, `dashboard(predioId)`, `inventario(filtros)`, `reproductivo(filtros)`, `mortalidad(filtros)`, `movimiento(filtros)`, `sanitario(filtros)`, `exportStatus(jobId)`
- [ ] 1.5 Modify `package.json` — Add `apexcharts` + `react-apexcharts` dependencies

## Phase 2: Core Implementation (Hooks — TanStack Query)

Each hook wraps one service method with useQuery/useMutation, staleTime, and error handling.

- [ ] 2.1 Create `modules/reportes/hooks/use-dashboard-kpis.ts` — `useQuery` for `GET /dashboard/kpi`, staleTime 60s, invalidates on predio change, returns `{ data, isLoading, error, refetch }`
- [ ] 2.2 Create `modules/reportes/hooks/use-reporte-inventario.ts` — `useQuery` for `GET /reportes/inventario`, staleTime 5min, accepts `ReporteFiltros`, transforms response to ApexCharts series/options
- [ ] 2.3 Create `modules/reportes/hooks/use-reporte-reproductivo.ts` — `useQuery` for `GET /reportes/reproductivo`, staleTime 5min, date range params `desde`/`hasta`, validates `hasta > desde`
- [ ] 2.4 Create `modules/reportes/hooks/use-reporte-mortalidad.ts` — `useQuery` for `GET /reportes/mortalidad`, staleTime 5min, computes peak detection (>2x 6-month avg) for alert highlighting
- [ ] 2.5 Create `modules/reportes/hooks/use-reporte-movimiento.ts` — `useQuery` for `GET /reportes/movimiento`, staleTime 5min, computes `saldoNeto` (compras - ventas), currency formatting
- [ ] 2.6 Create `modules/reportes/hooks/use-reporte-sanitario.ts` — `useQuery` for `GET /reportes/sanitario`, staleTime 5min, flags overdue vaccinations (>7 days past due)
- [ ] 2.7 Create `modules/reportes/hooks/use-exportacion.ts` — `useMutation` for POST + polling loop (3s interval, max 60s/20 attempts), manages concurrent jobs (max 3), auto-download on completion, retry on failure
- [ ] 2.8 Create `modules/reportes/hooks/use-filtros-reportes.ts` — Reads Zustand store + URL searchParams, bidirectional sync, 300ms debounce on date changes, defaults to last 12 months + active predio

## Phase 3: Components (Charts, Filters, KPI, Export UI)

Reusable presentation components — no page-level logic.

- [ ] 3.1 Create `modules/reportes/components/charts/reporte-chart.tsx` — Generic ApexCharts wrapper via `next/dynamic` (ssr: false), props: `options`, `series`, `type`, `height`, `loading`, `error`, `className`. Responsive config for mobile (breakpoint 640px), skeleton loader while loading
- [ ] 3.2 Create `modules/reportes/components/filters/reporte-filters.tsx` — Date range picker + predio selector, syncs with `useFiltrosReportes()` hook, bidirectional URL ↔ store sync, props: `className`, `showPredio`, `onChange`
- [ ] 3.3 Create `modules/reportes/components/dashboard/kpi-card.tsx` — Reusable KPI card with props: `label`, `value`, `change`, `icon` (LucideIcon), `color`, `loading`. Skeleton state, trend indicator (↑/↓)
- [ ] 3.4 Create `modules/reportes/components/export/export-button.tsx` — Popover with format options (PDF/Excel/CSV), disabled state when no data, tooltip "No hay datos para exportar", triggers `useExportacion`
- [ ] 3.5 Create `modules/reportes/components/export/export-progress.tsx` — Progress bar showing polling status, supports multiple concurrent exports (max 3), cancel button, retry on failure, toast notifications

## Phase 4: Pages & Wiring (Routes, Dashboard Integration)

Route pages compose hooks + components. Each page follows same pattern: filters → query → charts → export.

- [ ] 4.1 Create `app/dashboard/reportes/page.tsx` — Index page with sub-navigation cards to 5 report types (inventario, reproductivo, mortalidad, movimiento, sanitario)
- [ ] 4.2 Create `app/dashboard/reportes/inventario/page.tsx` — 4 charts: barras (por predio), dona (por raza), barras horizontales (por estado), dona (por sexo). Empty state with "Agregar animales" button
- [ ] 4.3 Create `app/dashboard/reportes/reproductivo/page.tsx` — 4 visualizations: línea (tasa concepción mensual), barras (servicios/mes), indicador numérico (intervalo partos), gauge (tasa preñez). Date range validation
- [ ] 4.4 Create `app/dashboard/reportes/mortalidad/page.tsx` — 3 visualizations: dona/stacked (por causa), barras horizontales (por rango edad), línea (tendencia mensual) with peak alert highlighting
- [ ] 4.5 Create `app/dashboard/reportes/movimiento/page.tsx` — Barras agrupadas (compras vs ventas por mes), saldo neto indicator (green/red), tabla resumen con costos de transacción, currency formatting
- [ ] 4.6 Create `app/dashboard/reportes/sanitario/page.tsx` — Barras apiladas (eventos por tipo/mes), lista vacunaciones pendientes with overdue badges, tabla tratamientos aplicados
- [ ] 4.7 Modify `app/dashboard/page.tsx` — Replace mock KPI data with `useDashboardKPIs()` hook, show skeleton loaders during fetch, error toast + retry button on failure, remove hardcoded values

## Phase 5: Testing (Unit + Integration)

Test files following existing vitest + RTL patterns.

- [ ] 5.1 Create `modules/reportes/__tests__/reporte-chart.test.tsx` — Test render with data, loading skeleton, error state, responsive breakpoint
- [ ] 5.2 Create `modules/reportes/__tests__/reporte-filters.test.tsx` — Test date picker sync, predio selector, URL ↔ store bidirectional sync, default values (12 months + active predio)
- [ ] 5.3 Create `modules/reportes/__tests__/use-exportacion.test.ts` — Test polling flow (pending→completed), timeout at 60s, error retry, max 3 concurrent exports, auto-download
- [ ] 5.4 Create `modules/reportes/__tests__/use-dashboard-kpis.test.ts` — Test successful KPI load, loading state, error state with retry, predio change invalidation
- [ ] 5.5 Create `modules/reportes/__tests__/export-button.test.tsx` — Test popover open/close, format selection, disabled state with tooltip, triggers export mutation
- [ ] 5.6 Create `store/__tests__/reportes.store.test.ts` — Test `setFechas()`, `resetFiltros()`, initial state, date validation

## Phase 6: MSW Handlers (Development Support)

Mock Service Worker handlers for local development.

- [ ] 6.1 Create `tests/mocks/handlers/reportes.handlers.ts` — MSW handlers for 8 endpoints: `GET /dashboard/kpi`, `GET /reportes/inventario`, `GET /reportes/reproductivo`, `GET /reportes/mortalidad`, `GET /reportes/movimiento`, `GET /reportes/sanitario`, `POST /reportes/{tipo}/exportar`, `GET /exportar/{jobId}/status`
