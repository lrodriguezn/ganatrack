# Proposal: Servicios Veterinarios Module

## Intent

Implement complete "Servicios Veterinarios" (Veterinary Services) module — a group event system for veterinary treatments (vitamins, deworming, treatments, vaccinations) following the established pattern used by Palpaciones and Inseminaciones.

## Scope

### In Scope
- Types: `ServicioVeterinarioAnimal`, `ServicioVeterinarioEvento`, DTOs in `servicios.types.ts`
- Service methods: `getServiciosVeterinarios`, `getServicioVeterinarioById`, `createServicioVeterinario` in service interface + mock + API
- Mock seed data: 3+ events with realistic veterinary treatment data
- Hooks: `use-servicios-veterinarios.ts`, `use-servicio-veterinario.ts`, `use-create-servicio-veterinario.ts`
- Components: `servicios-veterinarios-table.tsx`, `servicio-veterinario-form.tsx`
- Schema: `servicio-veterinario.schema.ts` (Zod validation)
- Pages: list, detail, create (`/dashboard/servicios/veterinarios/`)
- Update barrel exports (index.ts files)
- Update `ServicioGrupalWizard` to support `'veterinario'` type

### Out of Scope
- Backend API implementation (frontend mock-first)
- KPIs or dashboard widgets for veterinary services
- Edit/update/delete operations
- PDF reports or export functionality

## Capabilities

### New Capabilities
- `servicios-veterinarios`: Complete veterinary services module — CRUD operations, group event wizard, table listing, detail view with animal-level treatment records

### Modified Capabilities
- `servicios-grupal-wizard`: Extend type union from `'palpacion' | 'inseminacion'` to include `'veterinario'`

## Approach

Mirror the Palpaciones/Inseminaciones pattern exactly. Each animal record captures: `diagnosticosVeterinariosId` (treatment type), `medicamentos`, `dosis`, `proximaAplicacion` (next application date), `observaciones`. Reuse `ServicioGrupalWizard`, `AnimalSelector`, `DataTable`, query keys pattern, and service factory.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/servicios/types/servicios.types.ts` | Modified | Add 4 new interfaces + 2 DTOs |
| `apps/web/src/modules/servicios/services/servicios.service.ts` | Modified | Add 3 methods to interface |
| `apps/web/src/modules/servicios/services/servicios.mock.ts` | Modified | Add seed data + implement 3 methods |
| `apps/web/src/modules/servicios/services/servicios.api.ts` | Modified | Add 3 API methods |
| `apps/web/src/modules/servicios/hooks/` | New | 3 hook files |
| `apps/web/src/modules/servicios/components/` | New | 2 component files |
| `apps/web/src/modules/servicios/schemas/` | New | 1 schema file |
| `apps/web/src/modules/servicios/index.ts` | Modified | Add exports |
| `apps/web/src/modules/servicios/hooks/index.ts` | Modified | Add exports |
| `apps/web/src/modules/servicios/components/index.ts` | Modified | Add exports |
| `apps/web/src/modules/servicios/components/servicio-grupal-wizard.tsx` | Modified | Extend type union |
| `apps/web/src/app/dashboard/servicios/veterinarios/` | New | 3 page files |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Type union changes break existing Palpacion/Inseminacion flows | Low | TypeScript catches at compile; test existing wizard paths |
| Mock data inconsistency across services | Low | Follow exact seed pattern from Palpaciones |
| Missing barrel exports break imports | Low | Run TypeScript check after changes |

## Rollback Plan

Revert the change branch. No database migrations — all frontend code. Remove `veterinarios/` page directory and revert service/hook/component additions. Wizard type union revert is safe (narrowing).

## Dependencies

- Existing `ServicioGrupalWizard` component
- `AnimalSelector` component
- `DataTable` generic component
- Query keys pattern from `@/shared/lib/query-keys`
- Service factory pattern (mock/API swap)

## Success Criteria

- [ ] List page loads with mock data and pagination
- [ ] Create wizard completes 3-step flow (event → animals → results)
- [ ] Detail page shows event + animal treatment records
- [ ] All TypeScript checks pass with zero errors
- [ ] Existing Palpaciones/Inseminaciones wizard flows unaffected
