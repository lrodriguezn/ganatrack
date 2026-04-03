# Proposal: Módulo Reportes — Fase 4 (Weeks 7-8)

## Intent

Implementar el módulo completo de reportes para GanaTrack: 5 dashboards con gráficos ApexCharts, sistema de exportación async con polling, y dashboard home con KPIs reales. Actualmente el dashboard tiene datos mock y no existe código de reportes.

## Scope

### In Scope
- Dashboard home con KPIs reales desde API (reemplazar mock actual)
- 5 páginas de reporte: Inventario, Reproductivo, Mortalidad, Movimiento, Sanitario
- Sistema de filtros compartido (predio, rango fechas) sincronizado con URL params
- Gráficos ApexCharts (instalar dependencia `apexcharts` + `react-apexcharts`)
- Sistema de exportación PDF/Excel/CSV con polling async
- MSW handlers para desarrollo sin backend
- Query keys factory para `reportes` en `query-keys.ts`

### Out of Scope
- Customización de dashboards por usuario (drag & drop widgets)
- Reportes programados / email scheduling
- Comparativas multi-predio simultáneo
- Dashboard de producción láctea (no hay endpoints en PRD v1.5.0)

## Capabilities

### New Capabilities
- `reportes-dashboard`: Dashboard home con KPIs reales (total animales, tasa preñez, mortalidad %, compras/ventas mes)
- `reportes-inventario`: Reporte de inventario con 4 gráficos (por predio, raza, estado, sexo)
- `reportes-reproductivo`: Reporte reproductivo (concepción, servicios/mes, intervalo partos, tasa preñez)
- `reportes-mortalidad`: Reporte mortalidad (por causa, por rango edad, tendencia mensual)
- `reportes-movimiento`: Reporte movimiento (compras vs ventas, saldo animales, costos)
- `reportes-sanitario`: Reporte sanitario (eventos por tipo, vacunaciones, tratamientos)
- `reportes-exportacion`: Sistema de exportación PDF/Excel/CSV con polling async

### Modified Capabilities
- None (módulo nuevo, no modifica specs existentes)

## Approach

### Arquitectura del módulo
Seguir el patrón establecido en `modules/servicios/` y `modules/animales/`:
- `modules/reportes/types/` — tipos TypeScript para cada reporte
- `modules/reportes/services/` — API layer (`reportes.api.ts`) + mock data (`reportes.mock.ts`)
- `modules/reportes/hooks/` — hooks por reporte + hook de exportación
- `modules/reportes/components/` — componentes de gráfico reutilizables, filtros, export button

### Decisiones técnicas clave
1. **ApexCharts** — instalar `apexcharts` y `react-apexcharts` (no incluido en template). Wrapper genérico `ReportChart` que recibe opciones y datos.
2. **Filtros compartidos** — componente `ReportFilters` (predio selector + date range picker) que sincroniza con URL searchParams via `useSearchParams()` de Next.js.
3. **Exportación con polling** — hook `useExportReport()` que: (a) llama POST /exportar, (b) recibe job_id, (c) poll GET /exportar/:job_id/status cada 3s, (d) descarga blob al completar. Max 60s timeout.
4. **Zustand store para filtros** — `reportes.store.ts` para estado de filtros compartidos (evita prop drilling entre gráficos).
5. **Lazy loading de ApexCharts** — `next/dynamic` para importar react-apexcharts (lib pesada ~400KB).

### Rutas
```
/dashboard                    → KPIs reales (modificar page.tsx existente)
/dashboard/reportes           → página contenedora con tabs/sub-nav
/dashboard/reportes/inventario
/dashboard/reportes/reproductivo
/dashboard/reportes/mortalidad
/dashboard/reportes/movimiento
/dashboard/reportes/sanitario
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/reportes/` | New | Módulo completo: types, services, hooks, components |
| `apps/web/src/app/dashboard/page.tsx` | Modified | Reemplazar mock data con hook `useDashboardKPIs()` |
| `apps/web/src/app/dashboard/reportes/` | New | 6 páginas (index + 5 reportes) |
| `apps/web/src/shared/lib/query-keys.ts` | Modified | Agregar factory `reportes` con keys por tipo |
| `apps/web/src/store/` | Modified | Nuevo `reportes.store.ts` para filtros compartidos |
| `apps/web/package.json` | Modified | Agregar `apexcharts` + `react-apexcharts` |
| MSW handlers | New | `handlers/reportes.handlers.ts` con mock data |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ApexCharts bundle size impacta Lighthouse | Medium | Lazy load con `next/dynamic`, tree-shake solo gráficos usados |
| Export polling timeout > 60s | Low | Timeout configurable, toast de error claro, retry button |
| Gráficos no renderizan bien en dark mode | Medium | ApexCharts tiene soporte dark mode nativo, configurar theme toggle |
| Backend endpoints no disponibles | High | MSW mocks completos desde día 1, mismo patrón que servicios |
| Date range picker sin librería | Low | Usar componente nativo `<input type="date">` o instalar `react-day-picker` (1KB) |

## Rollback Plan

1. `apps/web/src/app/dashboard/page.tsx` se revierte al mock data original (el PRD tiene los datos hardcodeados originales)
2. Las rutas bajo `/dashboard/reportes/*` se eliminan (no afecta otras rutas)
3. `modules/reportes/` se elimina completo (no hay dependencias de otros módulos hacia reportes)
4. `apexcharts` y `react-apexcharts` se desinstalan de package.json
5. Query keys de reportes se eliminan de `query-keys.ts`

## Dependencies

- Backend endpoints de reportes deben estar definidos en PRD v1.5.0 (YA ESTÁN ✅)
- MSW v2 handlers existentes como patrón de referencia (`servicios.handlers.ts`, `animales.handlers.ts`)
- TanStack Query v5 configurado globalmente ✅
- Zustand stores existentes como patrón (`predio.store.ts`, `auth.store.ts`)
- ApexCharts: **NO instalado** — requiere `npm install apexcharts react-apexcharts`

## Success Criteria

- [ ] Dashboard home carga KPIs reales desde `GET /api/v1/dashboard/kpi` (o mock)
- [ ] Las 5 páginas de reporte renderizan con filtros funcionales y URL sync
- [ ] Cada reporte tiene ≥ 2 gráficos ApexCharts con datos del mock/API
- [ ] Exportación a PDF/Excel/CSV funciona con polling (descarga archivo válido)
- [ ] MSW handlers cubren todos los 8 endpoints de reportes
- [ ] TypeScript: 0 errores en módulo reportes
- [ ] ApexCharts lazy loaded (no impacta bundle inicial)
- [ ] Dark mode funciona en todos los gráficos
