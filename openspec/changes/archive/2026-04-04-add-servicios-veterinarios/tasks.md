# Tasks: Servicios Veterinarios Module

## Phase 1: Foundation (Types, Service, Mock, Schema, Maestro Extension)

- [ ] 1.1 Add `ServicioVeterinarioAnimal`, `ServicioVeterinarioEvento`, `CreateServicioVeterinarioEventoDto`, `CreateServicioVeterinarioAnimalDto`, and `ServiciosVeterinariosKPIs` interfaces to `apps/web/src/modules/servicios/types/servicios.types.ts` following the exact pattern of Palpacion/Inseminacion types (see lines 32-108 for reference)
- [ ] 1.2 Add `'diagnosticos-veterinarios'` to `MaestroTipo` union in `apps/web/src/modules/maestros/types/maestro.types.ts`, add `DiagnosticoVeterinarioSchema`, update `MaestroSchemas` record, and add to `MaestroEntityMap` and `MaestroDtoMap`
- [ ] 1.3 Add `SEED_DIAGNOSTICOS_VETERINARIOS` (Desparasitación, Vacunación, Vitaminas, Tratamiento) to `apps/web/src/modules/maestros/services/maestros.mock.ts`, add to `DataStore` type and `store` object, update `resetMaestrosMock()` and `idCounters`
- [ ] 1.4 Add 3 service methods to `ServiciosService` interface in `apps/web/src/modules/servicios/services/servicios.service.ts`: `getServiciosVeterinarios`, `getServicioVeterinarioById`, `createServicioVeterinario` (mirror palpaciones signatures, lines 30-32)
- [ ] 1.5 Add mock seed data (3 events, 13 animal records total) and implement 3 veterinary methods in `apps/web/src/modules/servicios/services/servicios.mock.ts`, update `resetServiciosMock()` with new counters and store reset (mirror palpaciones mock pattern, lines 29-55, 131-178)
- [ ] 1.6 Add 3 API methods to `RealServiciosService` in `apps/web/src/modules/servicios/services/servicios.api.ts` calling `/servicios/veterinarios` endpoints (mirror palpaciones API pattern, lines 24-41)
- [ ] 1.7 Create `apps/web/src/modules/servicios/schemas/servicio-veterinario.schema.ts` with `servicioVeterinarioAnimalSchema`, `servicioVeterinarioEventoSchema`, and `servicioVeterinarioWizardSchema` (mirror `palpacion.schema.ts` exactly)
- [ ] 1.8 Add `veterinarios` key block to `queryKeys.servicios` in `apps/web/src/shared/lib/query-keys.ts` with `all`, `list(params)`, and `detail(id)` (mirror palpaciones keys, lines 65-69)

## Phase 2: Hooks

- [ ] 2.1 Create `apps/web/src/modules/servicios/hooks/use-servicios-veterinarios.ts` — paginated list hook using `useQuery` with `queryKeys.servicios.veterinarios.list()`, `StaleTimes.LIST` (mirror `use-palpaciones.ts` exactly)
- [ ] 2.2 Create `apps/web/src/modules/servicios/hooks/use-servicio-veterinario.ts` — detail hook using `useQuery` with `queryKeys.servicios.veterinarios.detail(id)`, `enabled: id > 0` (mirror `use-palpacion.ts` exactly)
- [ ] 2.3 Create `apps/web/src/modules/servicios/hooks/use-create-servicio-veterinario.ts` — mutation hook using `useMutation`, invalidates `queryKeys.servicios.veterinarios.all`, navigates to `/dashboard/servicios/veterinarios` on success (mirror `use-create-palpacion.ts` exactly)

## Phase 3: Components

- [ ] 3.1 Create `apps/web/src/modules/servicios/components/servicios-veterinarios-table.tsx` — DataTable with columns: código, fecha, veterinario, # animales, próxima aplicación pendiente (nearest future `proximaAplicacion` across animals, or "-"), acciones ("Ver detalle" → `/dashboard/servicios/veterinarios/${id}`), empty state "No hay servicios veterinarios registrados" (mirror `palpaciones-table.tsx` exactly)
- [ ] 3.2 Create `apps/web/src/modules/servicios/components/servicio-veterinario-form.tsx` with 3 exports: `ServicioVeterinarioEventoForm` (forwardRef with trigger/getValues, fields: código, fecha, veterinario select via `maestrosService.getAll('veterinarios')`, observaciones), `ServicioVeterinarioAnimalesStep` (wraps `AnimalSelector`), `ServicioVeterinarioResultadosStep` (per-animal cards with diagnóstico select via `maestrosService.getAll('diagnosticos-veterinarios')`, medicamentos, dosis, proximaAplicacion, observaciones; initializes defaults with `diagnosticosVeterinariosId: 0`) (mirror `palpacion-form.tsx` structure exactly)
- [ ] 3.3 Extend `ServicioGrupalWizard` type prop in `apps/web/src/modules/servicios/components/servicio-grupal-wizard.tsx` from `'palpacion' | 'inseminacion'` to `'palpacion' | 'inseminacion' | 'veterinario'`, add title case `'Nuevo Servicio Veterinario'` for `'veterinario'` (line 43: update ternary)

## Phase 4: Pages

- [ ] 4.1 Create `apps/web/src/app/dashboard/servicios/veterinarios/page.tsx` — list page with header "Servicios Veterinarios", KPI card "Total Eventos" from `data.total`, `ServiciosVeterinariosTable` with server-side pagination, "Nuevo Servicio" button → `/dashboard/servicios/veterinarios/nuevo` (mirror `palpaciones/page.tsx` exactly)
- [ ] 4.2 Create `apps/web/src/app/dashboard/servicios/veterinarios/[id]/page.tsx` — detail page showing event info (código, fecha, veterinario, # animales, observaciones) and animal treatment records table (columns: Animal, Diagnóstico, Medicamentos, Dosis, Próxima Aplicación, Observaciones), handles invalid ID with `notFound()`, shows error + "Volver" button on 404 (mirror `palpaciones/[id]/page.tsx` exactly)
- [ ] 4.3 Create `apps/web/src/app/dashboard/servicios/veterinarios/nuevo/page.tsx` — create page with `ServicioGrupalWizard type="veterinario"`, 3-step state management, assembles `CreateServicioVeterinarioEventoDto` on submit, calls `useCreateServicioVeterinario().mutateAsync(dto)` (mirror `palpaciones/nuevo/page.tsx` exactly)

## Phase 5: Wiring & Verification

- [ ] 5.1 Update barrel exports in `apps/web/src/modules/servicios/index.ts` — add veterinary types, hooks (`useServiciosVeterinarios`, `useServicioVeterinario`, `useCreateServicioVeterinario`), and components (`ServiciosVeterinariosTable`, `ServicioVeterinarioEventoForm`, `ServicioVeterinarioResultadosStep`, `ServicioVeterinarioEventoFormRef`)
- [ ] 5.2 Update barrel exports in `apps/web/src/modules/servicios/hooks/index.ts` — add 3 veterinary hooks
- [ ] 5.3 Update barrel exports in `apps/web/src/modules/servicios/components/index.ts` — add veterinary components and form ref type
- [ ] 5.4 Run TypeScript typecheck (`npx tsc --noEmit` or project equivalent) — verify zero errors, confirm existing Palpaciones/Inseminaciones flows unaffected
