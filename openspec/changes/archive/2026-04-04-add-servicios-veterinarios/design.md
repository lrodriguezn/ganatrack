# Design: Servicios Veterinarios Module

## Technical Approach

Mirror the established Palpaciones/Inseminaciones group event pattern exactly. Extend existing shared components (`ServicioGrupalWizard`, `AnimalSelector`, `DataTable`) rather than creating new ones. Add new types, service methods, hooks, components, and pages following the identical structure. Reuse `maestrosService` for veterinarios catalog; add `diagnosticos-veterinarios` as a new `MaestroTipo` for veterinary-specific diagnostics (Desparasitación, Vacunación, Vitaminas, etc.).

## Architecture Decisions

### Decision: Wizard Integration — Extend Type Union

**Choice**: Extend `ServicioGrupalWizard` type prop from `'palpacion' | 'inseminacion'` to `'palpacion' | 'inseminacion' | 'veterinario'`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extend type union | Minimal change (1 line), TypeScript enforces exhaustiveness | ✅ |
| New wizard component | 100% code duplication, violates DRY | ❌ |
| Conditional rendering inside wizard | Mixes concerns, harder to maintain | ❌ |

**Rationale**: The wizard is a generic layout shell — it receives `step1Form` and `step3Form` as React nodes. The type prop only controls the title. Adding `'veterinario'` is a 1-line change. No logic duplication.

### Decision: Veterinario Selector — Reuse Existing Catalog

**Choice**: Use `maestrosService.getAll('veterinarios')` in the event form (step 1)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Reuse maestrosService | Zero new code, already used by PalpacionEventoForm | ✅ |
| Dedicated hook | Over-engineered for 4 items, adds abstraction | ❌ |

**Rationale**: `PalpacionEventoForm` already loads veterinarios via `maestrosService.getAll('veterinarios')` in a `useEffect`. The same pattern applies verbatim. No hook needed — the data is small and static.

### Decision: Diagnósticos Veterinarios — New MaestroTipo

**Choice**: Add `'diagnosticos-veterinarios'` to `MaestroTipo` union + seed data in maestros mock

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New MaestroTipo | Clean separation, type-safe, follows existing pattern | ✅ |
| Reuse existing 'diagnosticos' | Mixes palpación diagnostics (Positiva/Negativa) with veterinary ones (Desparasitación) | ❌ |
| Hardcoded in component | Not reusable, doesn't follow catalog pattern | ❌ |

**Rationale**: Veterinary diagnostics (Desparasitación, Vacunación, Vitaminas, Tratamiento) are semantically different from reproductive diagnostics. The spec explicitly references `diagnosticos-veterinarios`. Adding to `MaestroTipo` keeps type safety and follows the established catalog pattern.

**Impact**: Requires modifying `maestro.types.ts` (add union member), `maestros.mock.ts` (add seed data), and `maestros.api.ts` (if it has type guards).

### Decision: KPIs — Simple Count from List Data

**Choice**: Show only "Total Eventos" KPI (from `data.total`), no separate KPI endpoint

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Total Eventos only | Simple, uses existing paginated response | ✅ |
| 4 KPIs (pending, treated, common diag) | Requires aggregation endpoint not in scope | ❌ |

**Rationale**: Proposal explicitly marks KPIs/dashboard widgets as OUT OF SCOPE. The spec requires "at least one KPI card (Total Eventos)". We compute from the paginated response `total` field — zero additional API calls.

### Decision: Mock Data — 3 Events, 3-5 Animals Each

**Choice**: 3 seed events with 13 total animal records, realistic Colombian vet data

| Option | Tradeoff | Decision |
|--------|----------|----------|
| 3 events, mixed diagnostics | Sufficient for pagination demo, covers all diagnostic types | ✅ |
| 5+ events | Overkill for mock-first development | ❌ |

**Rationale**: Matches existing seed pattern (Palpaciones has 5 events, Inseminaciones has 5). 3 events with varying animal counts (5/4/4) demonstrates pagination and covers Desparasitación, Vacunación, Vitaminas diagnostic types per spec.

## Data Flow

```
Page (nuevo/page.tsx)
  │
  ├── step1Form → ServicioVeterinarioEventoForm
  │     ├── react-hook-form + zodResolver
  │     ├── maestrosService.getAll('veterinarios') → select
  │     └── exposes trigger() + getValues() via forwardRef
  │
  ├── step2 → AnimalSelector (reuse existing)
  │     └── usePredioStore → predioId
  │
  ├── step3 → ServicioVeterinarioResultadosStep
  │     ├── maestrosService.getAll('diagnosticos-veterinarios') → select
  │     └── per-animal card: diag, medicamentos, dosis, proximaAplicacion, observaciones
  │
  └── onSubmit → CreateServicioVeterinarioEventoDto
        └── useCreateServicioVeterinario.mutateAsync(dto)
              └── serviciosService.createServicioVeterinario(dto)
                    ├── Mock: push to in-memory store
                    └── Real: POST /servicios/veterinarios
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `modules/servicios/types/servicios.types.ts` | Modify | Add `ServicioVeterinarioAnimal`, `ServicioVeterinarioEvento`, 2 DTOs, `ServiciosVeterinariosKPIs` |
| `modules/servicios/services/servicios.service.ts` | Modify | Add 3 methods to `ServiciosService` interface |
| `modules/servicios/services/servicios.mock.ts` | Modify | Add seed data (3 events, 13 animals) + implement 3 methods + update `resetServiciosMock` |
| `modules/servicios/services/servicios.api.ts` | Modify | Add 3 API methods (`/servicios/veterinarios`) |
| `modules/servicios/schemas/servicio-veterinario.schema.ts` | Create | Zod schemas: evento, animal, wizard |
| `modules/servicios/hooks/use-servicios-veterinarios.ts` | Create | List query hook |
| `modules/servicios/hooks/use-servicio-veterinario.ts` | Create | Detail query hook |
| `modules/servicios/hooks/use-create-servicio-veterinario.ts` | Create | Create mutation hook |
| `modules/servicios/components/servicio-veterinario-form.tsx` | Create | Step1 (event form) + Step3 (resultados step) |
| `modules/servicios/components/servicios-veterinarios-table.tsx` | Create | Table with columns: código, fecha, veterinario, # animales, próxima aplicación, acciones |
| `modules/servicios/components/servicio-grupal-wizard.tsx` | Modify | Extend type union to include `'veterinario'` + update title mapping |
| `modules/maestros/types/maestro.types.ts` | Modify | Add `'diagnosticos-veterinarios'` to `MaestroTipo` union + schema + entity map |
| `modules/maestros/services/maestros.mock.ts` | Modify | Add `SEED_DIAGNOSTICOS_VETERINARIOS` (Desparasitación, Vacunación, Vitaminas, Tratamiento) |
| `modules/maestros/services/maestros.api.ts` | Modify | Add `'diagnosticos-veterinarios'` to API path mapping |
| `shared/lib/query-keys.ts` | Modify | Add `veterinarios` key block under `servicios` |
| `modules/servicios/index.ts` | Modify | Export new types, hooks, components |
| `modules/servicios/hooks/index.ts` | Modify | Export 3 new hooks |
| `modules/servicios/components/index.ts` | Modify | Export new components + form ref type |
| `app/dashboard/servicios/veterinarios/page.tsx` | Create | List page with KPI + table |
| `app/dashboard/servicios/veterinarios/nuevo/page.tsx` | Create | Create page with wizard |
| `app/dashboard/servicios/veterinarios/[id]/page.tsx` | Create | Detail page with animal records table |

## Interfaces / Contracts

```typescript
// New types in servicios.types.ts

export interface ServicioVeterinarioAnimal {
  id: number;
  eventoId: number;
  animalesId: number;
  diagnosticosVeterinariosId: number;
  medicamentos?: string;
  dosis?: string;
  proximaAplicacion?: string; // ISO date
  observaciones?: string;
  // Joined fields
  animalCodigo?: string;
  animalNombre?: string;
  diagnosticoNombre?: string;
}

export interface ServicioVeterinarioEvento extends EventoGrupal {
  animales: ServicioVeterinarioAnimal[];
}

export interface CreateServicioVeterinarioEventoDto {
  predioId: number;
  codigo: string;
  fecha: string;
  veterinariosId: number;
  observaciones?: string;
  animales: CreateServicioVeterinarioAnimalDto[];
}

export interface CreateServicioVeterinarioAnimalDto {
  animalesId: number;
  diagnosticosVeterinariosId: number;
  medicamentos?: string;
  dosis?: string;
  proximaAplicacion?: string;
  observaciones?: string;
}

// New methods in ServiciosService interface
getServiciosVeterinarios(params: PaginationParams): Promise<PaginatedEventos<ServicioVeterinarioEvento>>;
getServicioVeterinarioById(id: number): Promise<ServicioVeterinarioEvento>;
createServicioVeterinario(data: CreateServicioVeterinarioEventoDto): Promise<ServicioVeterinarioEvento>;

// MaestroTipo extension
type MaestroTipo = ... | 'diagnosticos-veterinarios';
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Zod schemas validate correct/invalid data | Vitest + schema tests |
| Unit | Mock service CRUD operations | Vitest + `resetServiciosMock()` |
| Integration | Wizard flow: step1 → step2 → step3 → submit | Component test with mocked services |
| Integration | Table pagination triggers refetch | Component test with query mock |
| E2E | Full create flow: navigate → fill → submit → verify list | Playwright (if configured) |

## Migration / Rollout

No migration required. All changes are frontend-only with mock-first development. The `MaestroTipo` union extension is backward-compatible — existing code doesn't use `'diagnosticos-veterinarios'` so no breakage. The wizard type union extension is also backward-compatible — `'palpacion'` and `'inseminacion'` remain valid.

## Open Questions

- [ ] Does the backend API already support `/servicios/veterinarios` endpoints, or is this purely mock-first? (Proposal says "Backend API implementation" is out of scope, so mock-first is assumed)
- [ ] Should `diagnosticos-veterinarios` be a completely separate catalog or a filtered view of `diagnosticos` by `tipo`? (Design assumes separate catalog per spec)
