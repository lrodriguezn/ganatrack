# Proposal: Completar CRUD Sub-recursos del Predio

## Intent

Los sub-recursos del Predio (Potreros, Sectores, Lotes, Grupos) tienen implementado el backend completo y componentes base (tablas, formularios), pero faltan las páginas de routing y hooks de mutación para completar el CRUD en el frontend. Los usuarios pueden listar pero no pueden crear, editar ni ver detalles de estos sub-recursos — UX incompleta.

## Scope

### In Scope

**1. Mutation hooks (12 archivos)**
- `use-create-potrero.ts`, `use-update-potrero.ts`, `use-delete-potrero.ts`
- `use-create-sector.ts`, `use-update-sector.ts`, `use-delete-sector.ts`
- `use-create-lote.ts`, `use-update-lote.ts`, `use-delete-lote.ts`
- `use-create-grupo.ts`, `use-update-grupo.ts`, `use-delete-grupo.ts`
- Ubicación: `apps/web/src/modules/predios/hooks/`

**2. Routing pages (12 archivos)**
- Para cada sub-recurso X en [potreros, sectores, lotes, grupos]:
  - `apps/web/src/app/dashboard/predios/[id]/X/nuevo/page.tsx`
  - `apps/web/src/app/dashboard/predios/[id]/X/[xId]/page.tsx`
  - `apps/web/src/app/dashboard/predios/[id]/X/[xId]/edit/page.tsx`

**3. Detail components (4 archivos)**
- `potrero-detail.tsx`, `sector-detail.tsx`, `lote-detail.tsx`, `grupo-detail.tsx`
- Ubicación: `apps/web/src/modules/predios/components/`

**4. Update list pages (4 archivos)**
- Agregar handlers onEdit, onDelete, onRowClick + botón "Nuevo"
- Archivos: `apps/web/src/app/dashboard/predios/{potreros, sectores, lotes, grupos}/page.tsx`

**5. Barrel export**
- `apps/web/src/modules/predios/hooks/index.ts` — exportar 12 nuevos hooks

### Out of Scope

- Modificaciones al backend (ya completo)
- Cambios en shared-types o Zod schemas (ya completos)
- Modificaciones en componentes de tabla/formulario (ya existen)
- Nuevas entidades o relaciones
- Tests E2E (fase posterior)

## Capabilities

### New Capabilities

None — el backend ya implementa estos casos de uso.

### Modified Capabilities

None — el spec ya define el comportamiento esperado. Este cambio es puramente de implementación frontend.

## Approach

**Patrón de referencia**: Replicar exactamente el patrón de `use-create-predio.ts`, `use-update-predio.ts`, `use-delete-predio.ts` y las páginas de `/dashboard/predios/[id]/...` para cada sub-recurso.

**Estructura**:
1. **Mutation hooks**: TanStack Query `useMutation` + `queryClient.invalidateQueries(['potreros', predioId])` + `onSuccess` navigation
2. **Pages nuevo**: Render `<PotreroForm />` sin initialData, redirect en onSuccess
3. **Pages detalle**: New`<PotreroDetail />` component + handlers
4. **Pages edit**: Fetch con `usePotrero(xId)`, pasar initialData a `<PotreroForm />`
5. **List pages**: Conectar botones existentes a las nuevas rutas

**Dependencias**:
- Los hooks de query (`use-potreros.ts`, etc.) ya existen
- Los form components (`potrero-form.tsx`, etc.) ya existen
- Los table components (`potreros-table.tsx`, etc.) ya existen

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/predios/hooks/*.ts` | New | 12 mutation hooks |
| `apps/web/src/modules/predios/components/*-detail.tsx` | New | 4 detail components |
| `apps/web/src/app/dashboard/predios/[id]/**/*.tsx` | New | 12 routing pages |
| `apps/web/src/app/dashboard/predios/{potreros,sectores,lotes,grupos}/page.tsx` | Modified | Add navigation handlers |
| `apps/web/src/modules/predios/hooks/index.ts` | Modified | Export new hooks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia con patrones de Predios | Low | Seguir archivo por archivo el patrón existente |
| Errores de tipado en rutas dinámicas | Med | UsarTanStack Router params tipados como en Predios |
| Invalidación incorrecta de cache | Low | Usar exactamente el queryKey de los hooks de query existentes |

## Rollback Plan

Eliminar los 28 archivos nuevos y revertir los 5 archivos modificados. No hay cambios en backend ni en shared-types, sinon impacto en otras funcionalidades.

## Dependencies

- Backend de Predios corriendo (ya funcional)
- TanStack Router configurado con rutas dinámicas (ya implementado)
- TanStack Query configurado (ya implementado)

## Success Criteria

- [ ] Usuario puede crear Potrero desde `/dashboard/predios/[id]/potreros/nuevo`
- [ ] Usuario puede ver detalle de Potrero desde tabla → `/dashboard/predios/[id]/potreros/[potreroId]`
- [ ] Usuario puede editar Potrero desde `/dashboard/predios/[id]/potreros/[potreroId]/edit`
- [ ] Usuario puede eliminar Potrero desde vista detalle
- [ ] Los 4 sub-recursos tienen flujo CRUD completo (crear, ver, editar, eliminar)
- [ ] Invalidación de cache funciona correctamente después de mutaciones
- [ ] Navegación bidireccional: lista → detalle → editar → lista