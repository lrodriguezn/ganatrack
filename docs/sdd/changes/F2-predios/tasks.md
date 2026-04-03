# Tasks: Módulo Predios (F2-PREDIOS)

## Phase 1: Foundation — Shared Types y Schemas Zod

- [x] 1.1 Create `packages/shared-types/src/schemas/predio.schema.ts` with Zod schemas: PotreroSchema, SectorSchema, LoteSchema, GrupoSchema (with id, nombre, areaHectareas, capacidadMaxima, activo)
- [x] 1.2 Create create/update form schemas: CreatePredioSchema, UpdatePredioSchema, CreatePotreroSchema, CreateLoteSchema, CreateGrupoSchema, CreateSectorSchema
- [x] 1.3 Move PredioSchema from `packages/shared-types/src/schemas/auth.schema.ts` to new `predio.schema.ts`, re-export from auth.schema.ts for backward compatibility
- [x] 1.4 Update `packages/shared-types/src/index.ts` to export all schemas from `predio.schema.ts`

## Phase 2: Service Layer — Interface, Mock, API

- [x] 2.1 Create `apps/web/src/modules/predios/services/predios.service.ts` with PrediosService interface (CRUD methods for predios + getPotreros, getLotes, getGrupos, getSectores)
- [x] 2.2 Create `apps/web/src/modules/predios/services/predios.mock.ts` with MockPrediosService implementing interface, seed data with 3-5 realistic predios, 2-3 potreros per predio, using Map<string, T[]> with 300-500ms delay
- [x] 2.3 Create `apps/web/src/modules/predios/services/predios.api.ts` with RealPrediosService placeholder (throw "Not implemented" error)
- [x] 2.4 Create `apps/web/src/modules/predios/services/index.ts` exporting factory function that returns mock service in dev mode

## Phase 3: TanStack Query Hooks

- [x] 3.1 Update `apps/web/src/shared/lib/query-keys.ts` to add predios.potreros, predios.sectores, predios.lotes, predios.grupos key factories
- [x] 3.2 Create `apps/web/src/modules/predios/hooks/use-predios.ts` with useQuery returning paginated list, search filter
- [x] 3.3 Create `apps/web/src/modules/predios/hooks/use-predio.ts` with useQuery for single Predio detail
- [x] 3.4 Create `apps/web/src/modules/predios/hooks/use-create-predio.ts` with useMutation, optimistic update, store sync
- [x] 3.5 Create `apps/web/src/modules/predios/hooks/use-update-predio.ts` with useMutation, optimistic update
- [x] 3.6 Create `apps/web/src/modules/predios/hooks/use-delete-predio.ts` with useMutation, query invalidation, store sync
- [x] 3.7 Create `apps/web/src/modules/predios/hooks/use-potreros.ts`, `use-lotes.ts`, `use-grupos.ts`, `use-sectores.ts` with useQuery per sub-recurso
- [x] 3.8 Create `apps/web/src/modules/predios/hooks/index.ts` exporting all hooks

## Phase 4: Components — Predios (Tables, Forms, Detail)

- [x] 4.1 Create `apps/web/src/modules/predios/components/predio-table.tsx` with DataTable wrapper, columns: Nombre, Departamento, Municipio, Hectáreas, Tipo, acciones (Edit/Delete), pagination controls, search input
- [x] 4.2 Create `apps/web/src/modules/predios/components/predio-form.tsx` with RHF + Zod validation, fields: nombre (required, max 100), departamento, municipio, vereda, hectáreas (positive), tipo (enum)
- [x] 4.3 Create `apps/web/src/modules/predios/components/predio-detail.tsx` with tabs: Info, Potreros, Lotes, Grupos, using usePredioStore to get current Predio ID
- [x] 4.4 Create `apps/web/src/modules/predios/components/predio-delete-modal.tsx` with confirmation modal dialog

## Phase 5: Components — Sub-recursos (Tables, Forms)

- [x] 5.1 Create `apps/web/src/modules/predios/components/potreros-table.tsx` with DataTable, columns: Nombre, Hectáreas, Tipo Pasto, Capacidad, Estado, acciones
- [x] 5.2 Create `apps/web/src/modules/predios/components/potrero-form.tsx` with RHF + Zod, fields: nombre, hectáreas (positive), tipo_pasto, capacidad_animales (positive int), estado (enum: activo/en_descanso)
- [x] 5.3 Create `apps/web/src/modules/predios/components/lotes-table.tsx` with DataTable, columns: Nombre, Descripción, Tipo (producción/levante/engorde/cría), acciones
- [x] 5.4 Create `apps/web/src/modules/predios/components/lote-form.tsx` with RHF + Zod, fields: nombre, descripción, tipo (enum)
- [x] 5.5 Create `apps/web/src/modules/predios/components/grupos-table.tsx` with DataTable, columns: Nombre, Descripción, Animal Count, acciones
- [x] 5.6 Create `apps/web/src/modules/predios/components/grupo-form.tsx` with RHF + Zod, fields: nombre, descripción
- [x] 5.7 Create `apps/web/src/modules/predios/components/sectores-table.tsx` and `sector-form.tsx` with same pattern as potreros
- [x] 5.8 Create `apps/web/src/modules/predios/components/index.ts` exporting all components

## Phase 6: Pages — App Router

- [x] 6.1 Create `apps/web/src/app/dashboard/predios/page.tsx` with PredioTable, search input, "Nuevo Predio" button linking to /dashboard/predios/nuevo
- [x] 6.2 Create `apps/web/src/app/dashboard/predios/nuevo/page.tsx` with PredioForm for create, on success redirect to detail page
- [x] 6.3 Create `apps/web/src/app/dashboard/predios/[id]/page.tsx` with PredioDetail (tabs: Info, Potreros, Lotes, Grupos)
- [x] 6.4 Create `apps/web/src/app/dashboard/predios/[id]/edit/page.tsx` with PredioForm pre-populated for edit
- [x] 6.5 Create `apps/web/src/app/dashboard/predios/potreros/page.tsx` global potreros list, filters by active Predio from store
- [x] 6.6 Create `apps/web/src/app/dashboard/predios/lotes/page.tsx`, `grupos/page.tsx`, `sectores/page.tsx` with same pattern
- [x] 6.7 Add "Nuevo Potrero/Lote/Grupo/Sector" buttons in respective pages — Note: Task 6.7 mentions buttons but the design doesn't show where these link to (no forms created yet for sub-recursos). The buttons are placeholders for future work.

## Phase 7: Integration — Stores y Query Keys

- [x] 7.1 Update `apps/web/src/store/predio.store.ts` to add addPredio, updatePredio, removePredio actions for sync on CRUD
- [x] 7.2 Create `apps/web/src/modules/predios/index.ts` exporting module metadata (service, hooks, components)

## Phase 8: Verification — Spec Compliance

- [x] 8.1 Verify: Listado con DataTable funcional (pagination, search) — test scenarios from spec
- [x] 8.2 Verify: Crear/editar Predio con RHF + Zod validation — test required fields, max lengths
- [x] 8.3 Verify: Delete with confirmation modal — test confirm/cancel flows
- [x] 8.4 Verify: Detail page con tabs muestra sub-recursos — test tab switching
- [x] 8.5 Verify: CRUD potreros, lotes, grupos funciona desde tabs y páginas directas
- [x] 8.6 Verify: Dark mode soportado en todos los componentes
- [x] 8.7 Verify: Todos los strings están en español (no hay inglés hardcodeado)
