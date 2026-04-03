# Design: Módulo Reportes — Fase 4

## Technical Approach

Módulo nuevo que sigue Screaming Architecture existente: `modules/reportes/` con types, services, hooks y components. ApexCharts lazy-loaded via `next/dynamic` (~460KB no impacta bundle inicial). Filtros compartidos en Zustand store sincronizados con URL params. Exportación async con polling (POST → job_id → GET status cada 3s → descarga blob). Dashboard home reemplaza mock data con hook `useDashboardKPIs()`.

---

## Architecture Decisions

### D1: Chart Component Architecture

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| 1 genérico `ReporteChart` | Reutilizable pero props complejas | **✅ ELEGIDA** |
| Chart-specific components | Simple pero duplicación | ❌ Rechazada |

**Rationale**: ApexCharts recibe `options` y `series` como objetos. Un wrapper genérico que maneje tema dark/light, loading skeleton, responsive y error state centraliza lógica. Cada reporte define sus `options` y `series` específicas. Patrón:

```typescript
// modules/reportes/components/charts/reporte-chart.tsx
interface ReporteChartProps {
  options: ApexCharts.ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radialBar';
  height?: number | string;
  loading?: boolean;
  error?: string;
}
```

### D2: Filter State Management

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Zustand store | Simple, pero no bookmarkeable | ❌ Parcial |
| URL params (searchParams) | Bookmarkeable, pero prop drilling | ❌ Parcial |
| **Zustand + URL sync** | Best of both worlds | **✅ ELEGIDA** |

**Rationale**: Patrón existente en diseño frontend (#D7). Store Zustand como single source of truth, pero sincronizado bidireccionalmente con URL via `useSearchParams()`. Permite compartir enlaces con filtros aplicados. Predio ya viene de `predio.store.ts` existente.

```typescript
// store/reportes.store.ts
interface ReportesFiltrosState {
  fechaInicio: string; // ISO date
  fechaFin: string;
  // predioId viene de predio.store.ts existente
  setFechas: (inicio: string, fin: string) => void;
  resetFiltros: () => void;
}
```

### D3: Export UX Pattern

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Inline progress bar | Contextual pero ocupa espacio | ❌ |
| Toast notification | No intrusivo pero pierde contexto | ❌ |
| **Popover + progress bar** | Compacto, contextual, dismissable | **✅ ELEGIDA** |

**Rationale**: Botón "Exportar" abre popover con opciones (PDF/Excel/CSV). Al iniciar, popover muestra progress bar con polling status. Permite cancelar. Si success, descarga automática + toast. Si error, retry button. Evita página dedicada innecesaria.

### D4: Dashboard KPIs Strategy

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Individual queries (4 hooks) | Paralelo pero 4 requests | ❌ |
| **Single aggregated endpoint** | 1 request, atomic | **✅ ELEGIDA** |

**Rationale**: KPIs del dashboard (total animales, tasa preñez, mortalidad %, compras/ventas mes) son datos pequeños que se renderizan juntos. Un solo `GET /api/v1/dashboard/kpi` es más eficiente que 4 requests paralelos. El PRD ya define este endpoint.

### D5: Date Range Control

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Parent page control | Flexible pero prop drilling | ❌ |
| **Global filters (store + URL)** | Consistente, reutilizable | **✅ ELEGIDA** |

**Rationale**: Todos los reportes usan los mismos filtros de fecha. Un componente `ReportFilters` que lee/escribe en `reportes.store.ts` y URL params. Cada página de reporte simplemente renderiza `<ReportFilters />` y consume el store. Predio viene de `predio.store.ts` global.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Report Page (e.g. /reportes/inventario)       │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ReportFilters │───>│reportes.store│<───│URL searchParams  │   │
│  │(date picker) │    │(Zustand)     │    │(useSearchParams) │   │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘   │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │useReporteInven..│                           │
│                    │(TanStack Query) │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │reportes.service │                           │
│                    │(ky API client)  │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    ReporteChart (x4)                      │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Pie     │  │ Bar     │  │ Donut   │  │ Line    │    │   │
│  │  │ por raza│  │ por edo │  │ por sexo│  │ tendenc │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ExportButton ──> useExportacion ──> POST /exportar       │   │
│  │      │                              GET /exportar/:id    │   │
│  │      └──> Popover: PDF/Excel/CSV ──> descarga blob      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Export Polling Flow
```
User clicks "Exportar"
       │
       ▼
POST /api/v1/reportes/{tipo}/exportar { formato: "pdf" }
       │
       ▼  { jobId: "abc123", estimatedTime: 15 }
  ┌────────────┐
  │ Polling    │──── GET /api/v1/exportar/abc123/status
  │ cada 3s    │<─── { status: "processing", progress: 45 }
  │ max 60s    │──── GET /api/v1/exportar/abc123/status
  └─────┬──────┘<─── { status: "completed", downloadUrl: "..." }
        │
        ▼
  Descarga blob → archivo.{pdf|xlsx|csv}
  Toast success
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `modules/reportes/types/reportes.types.ts` | Create | Tipos para cada reporte, KPIs, filtros, export |
| `modules/reportes/services/reportes.service.ts` | Create | API calls: KPIs, 5 reportes, exportación |
| `modules/reportes/services/reportes.mock.ts` | Create | Mock data para MSW development |
| `modules/reportes/hooks/use-reporte-inventario.ts` | Create | useQuery para reporte inventario |
| `modules/reportes/hooks/use-reporte-reproductivo.ts` | Create | useQuery para reporte reproductivo |
| `modules/reportes/hooks/use-reporte-mortalidad.ts` | Create | useQuery para reporte mortalidad |
| `modules/reportes/hooks/use-reporte-movimiento.ts` | Create | useQuery para reporte movimiento |
| `modules/reportes/hooks/use-reporte-sanitario.ts` | Create | useQuery para reporte sanitario |
| `modules/reportes/hooks/use-dashboard-kpis.ts` | Create | useQuery para KPIs dashboard |
| `modules/reportes/hooks/use-exportacion.ts` | Create | Hook con polling para exportación |
| `modules/reportes/hooks/use-filtros-reportes.ts` | Create | Hook para filtros compartidos |
| `modules/reportes/components/charts/reporte-chart.tsx` | Create | Wrapper genérico ApexCharts |
| `modules/reportes/components/filters/reporte-filters.tsx` | Create | Filtros fecha + predio selector |
| `modules/reportes/components/dashboard/kpi-card.tsx` | Create | Card KPI reutilizable |
| `modules/reportes/components/export/export-button.tsx` | Create | Botón export con popover |
| `modules/reportes/components/export/export-progress.tsx` | Create | Progress bar con polling status |
| `store/reportes.store.ts` | Create | Zustand store para filtros reportes |
| `app/dashboard/page.tsx` | Modify | Reemplazar mock → `useDashboardKPIs()` |
| `app/dashboard/reportes/page.tsx` | Create | Index con sub-nav a 5 reportes |
| `app/dashboard/reportes/inventario/page.tsx` | Create | Página reporte inventario |
| `app/dashboard/reportes/reproductivo/page.tsx` | Create | Página reporte reproductivo |
| `app/dashboard/reportes/mortalidad/page.tsx` | Create | Página reporte mortalidad |
| `app/dashboard/reportes/movimiento/page.tsx` | Create | Página reporte movimiento |
| `app/dashboard/reportes/sanitario/page.tsx` | Create | Página reporte sanitario |
| `shared/lib/query-keys.ts` | Modify | Agregar factory `reportes` |
| `tests/mocks/handlers/reportes.handlers.ts` | Create | MSW handlers para 8 endpoints |
| `package.json` | Modify | Agregar `apexcharts` + `react-apexcharts` |

---

## Interfaces / Contracts

### Types Core

```typescript
// modules/reportes/types/reportes.types.ts

// Filtros compartidos
export interface ReporteFiltros {
  predioId: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;
}

// KPI Dashboard
export interface DashboardKPIs {
  totalAnimales: number;
  enOrdeno: number;
  tasaPrenez: number;      // porcentaje
  mortalidadMensual: number; // porcentaje
  comprasMes: number;
  ventasMes: number;
}

// Respuesta genérica de reporte
export interface ReporteData<T> {
  resumen: ReporteResumen;
  graficos: T;
  generadoEn: string; // ISO timestamp
}

export interface ReporteResumen {
  totalAnimales: number;
  periodoAnalizado: string;
  predioNombre: string;
}

// Inventario
export interface InventarioGraficos {
  porPredio: ChartDataItem[];
  porRaza: ChartDataItem[];
  porEstado: ChartDataItem[];
  porSexo: ChartDataItem[];
}

// Reproductivo
export interface ReproductivoGraficos {
  tasaConcepcion: ChartDataItem[];
  serviciosPorMes: TimeSeriesItem[];
  intervaloPartos: ChartDataItem[];
  tasaPrenezMensual: TimeSeriesItem[];
}

// Mortalidad
export interface MortalidadGraficos {
  porCausa: ChartDataItem[];
  porRangoEdad: ChartDataItem[];
  tendenciaMensual: TimeSeriesItem[];
}

// Movimiento
export interface MovimientoGraficos {
  comprasVsVentas: TimeSeriesItem[];
  saldoAnimales: TimeSeriesItem[];
  costosPorMes: TimeSeriesItem[];
}

// Sanitario
export interface SanitarioGraficos {
  eventosPorTipo: ChartDataItem[];
  vacunaciones: TimeSeriesItem[];
  tratamientos: TimeSeriesItem[];
}

// Chart data primitives
export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesItem {
  date: string;
  values: Record<string, number>;
}

// Exportación
export interface ExportRequest {
  formato: 'pdf' | 'excel' | 'csv';
  filtros: ReporteFiltros;
}

export interface ExportJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;        // 0-100
  downloadUrl?: string;
  error?: string;
  estimatedTime?: number;  // segundos
}
```

### Service Interface

```typescript
// modules/reportes/services/reportes.service.ts
import { apiClient } from '@/shared/lib/api-client';

export const reportesService = {
  // Dashboard KPIs
  getDashboardKPIs: (predioId: number): Promise<DashboardKPIs> =>
    apiClient.get(`dashboard/kpi`, { searchParams: { predioId } }).json(),

  // Reportes específicos
  getInventario: (filtros: ReporteFiltros): Promise<ReporteData<InventarioGraficos>> =>
    apiClient.get('reportes/inventario', { searchParams: filtros }).json(),

  getReproductivo: (filtros: ReporteFiltros): Promise<ReporteData<ReproductivoGraficos>> =>
    apiClient.get('reportes/reproductivo', { searchParams: filtros }).json(),

  getMortalidad: (filtros: ReporteFiltros): Promise<ReporteData<MortalidadGraficos>> =>
    apiClient.get('reportes/mortalidad', { searchParams: filtros }).json(),

  getMovimiento: (filtros: ReporteFiltros): Promise<ReporteData<MovimientoGraficos>> =>
    apiClient.get('reportes/movimiento', { searchParams: filtros }).json(),

  getSanitario: (filtros: ReporteFiltros): Promise<ReporteData<SanitarioGraficos>> =>
    apiClient.get('reportes/sanitario', { searchParams: filtros }).json(),

  // Exportación
  exportar: (tipo: string, request: ExportRequest): Promise<{ jobId: string }> =>
    apiClient.post(`reportes/${tipo}/exportar`, { json: request }).json(),

  getExportStatus: (jobId: string): Promise<ExportJob> =>
    apiClient.get(`exportar/${jobId}/status`).json(),

  downloadExport: (downloadUrl: string): Promise<Blob> =>
    apiClient.get(downloadUrl).blob(),
};
```

### Component Props

```typescript
// modules/reportes/components/charts/reporte-chart.tsx
interface ReporteChartProps {
  options: ApexCharts.ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radialBar';
  height?: number | string; // default 350
  loading?: boolean;
  error?: string;
  className?: string;
}

// modules/reportes/components/filters/reporte-filters.tsx
interface ReporteFiltrosProps {
  className?: string;
  showPredio?: boolean; // default true
  onChange?: (filtros: ReporteFiltros) => void;
}

// modules/reportes/components/dashboard/kpi-card.tsx
interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: string; // Tailwind classes
  loading?: boolean;
}

// modules/reportes/components/export/export-button.tsx
interface ExportButtonProps {
  reportType: string; // 'inventario', 'reproductivo', etc.
  filtros: ReporteFiltros;
  disabled?: boolean;
}
```

---

## Caching Strategy

### Query Keys (agregar a `query-keys.ts`)

```typescript
export const queryKeys = {
  // ... existing keys ...

  reportes: {
    all: ['reportes'] as const,
    dashboard: (predioId: number) =>
      ['reportes', 'dashboard', predioId] as const,
    inventario: (filtros: ReporteFiltros) =>
      ['reportes', 'inventario', filtros] as const,
    reproductivo: (filtros: ReporteFiltros) =>
      ['reportes', 'reproductivo', filtros] as const,
    mortalidad: (filtros: ReporteFiltros) =>
      ['reportes', 'mortalidad', filtros] as const,
    movimiento: (filtros: ReporteFiltros) =>
      ['reportes', 'movimiento', filtros] as const,
    sanitario: (filtros: ReporteFiltros) =>
      ['reportes', 'sanitario', filtros] as const,
    exportStatus: (jobId: string) =>
      ['reportes', 'export', jobId] as const,
  },
} as const;
```

### Stale Times

| Tipo | staleTime | Rationale |
|------|-----------|-----------|
| Dashboard KPIs | 60s | Datos agregados, cambian lentamente |
| Reportes datos | 5min | Cálculos pesados, no cambian en tiempo real |
| Export status | 0s (polling) | Siempre fresh durante polling |

### Invalidation

```
Cambio predio → queryClient.invalidateQueries({ queryKey: ['reportes'] })
Cambio fechas → re-fetch automático (query key cambia)
Export completado → removeQueries(['reportes', 'export', jobId])
```

---

## Performance

### Lazy Loading Strategy

```typescript
// Cada página de reporte usa dynamic import
const ReporteInventario = dynamic(
  () => import('@/modules/reportes/components/reporte-inventario'),
  { loading: () <Skeleton className="h-[400px]" />, ssr: false }
);
```

ApexCharts (~460KB) solo se carga cuando el usuario visita un reporte. SSR deshabilitado porque ApexCharts requiere `window`.

### Debounced Filters

```typescript
// modules/reportes/hooks/use-filtros-reportes.ts
export function useFiltrosReportes() {
  const store = useReportesStore();
  const debouncedFechas = useDebounce(
    { fechaInicio: store.fechaInicio, fechaFin: store.fechaFin },
    300 // 300ms debounce
  );
  return { ...debouncedFechas, predioId: store.predioId };
}
```

### Mobile Responsive Charts

```typescript
// ReporteChart responsive config
const responsiveOptions: ApexResponsive[] = [
  {
    breakpoint: 640, // sm
    options: {
      chart: { height: 280 },
      legend: { position: 'bottom', fontSize: '11px' },
    },
  },
];
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Types | Type inference, Zod validation | `expectTypeOf` + compile check |
| Service | API calls, error handling | MSW handlers + mock responses |
| Hooks | Query behavior, polling logic | `renderHook` + MSW |
| Store | Filter state, URL sync | Unit test Zustand actions |
| Charts | Render with data, loading/error states | RTL + mock ApexCharts |
| Export | Polling flow, timeout, cancel | `renderHook` + fake timers |
| Pages | Integration: filters → query → chart | RTL + MSW + `screen` queries |
| E2E | Full flow: navigate → filter → export | Playwright |

### Test Files Structure
```
modules/reportes/
├── __tests__/
│   ├── reporte-chart.test.tsx
│   ├── reporte-filters.test.tsx
│   ├── use-exportacion.test.ts
│   ├── use-dashboard-kpis.test.ts
│   └── export-button.test.tsx
store/
├── __tests__/
│   └── reportes.store.test.ts
tests/
├── mocks/handlers/
│   └── reportes.handlers.ts
├── e2e/
│   └── reportes.spec.ts
```

---

## Migration / Rollout

No migration required. Módulo completamente nuevo:
1. Agregar dependencias `apexcharts` + `react-apexcharts`
2. Crear estructura `modules/reportes/`
3. Agregar `reportes` a `query-keys.ts`
4. Crear `store/reportes.store.ts`
5. Crear rutas bajo `/dashboard/reportes/`
6. Crear MSW handlers para desarrollo
7. Reemplazar mock data en `dashboard/page.tsx`

Rollback: eliminar `modules/reportes/`, rutas, store, y revertir `dashboard/page.tsx` a mock data.

---

## Open Questions

- [ ] Backend: ¿`GET /dashboard/kpi` acepta query param `predioId` o usa header `X-Predio-Id`?
- [ ] Backend: ¿Export response incluye `estimatedTime` para decidir polling interval?
- [ ] Backend: ¿Rate limiting en endpoints de reporte? (datos pesados)
- [ ] UX: ¿Permitir exportar solo datos visibles (filtrados) o siempre dataset completo?
- [ ] ApexCharts: ¿Soporta tree-shaking para importar solo tipos usados (pie, bar, line)?

---

## Relevant Files

- `apps/web/src/modules/reportes/` — módulo completo (nuevo)
- `apps/web/src/store/reportes.store.ts` — Zustand filtros (nuevo)
- `apps/web/src/shared/lib/query-keys.ts` — agregar factory reportes (modificar)
- `apps/web/src/app/dashboard/page.tsx` — reemplazar mock (modificar)
- `apps/web/src/app/dashboard/reportes/` — 6 páginas (nuevo)
- `apps/web/package.json` — agregar apexcharts (modificar)
- `apps/web/tests/mocks/handlers/reportes.handlers.ts` — MSW (nuevo)
