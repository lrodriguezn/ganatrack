# Design: F3-SERVICIOS (Palpaciones, Inseminaciones, Partos)

## Technical Approach

Módulo nuevo `servicios/` completamente aislado. Replica el patrón Interface+Factory de `animales/` para service, useQuery/useMutation para hooks, y App Router pages con `usePredioStore()`. Wizard de 3 pasos con `useState` local en el page component (sin routing entre pasos). Partos usa form simple (no wizard). Todos los tipos son locales en `servicios.types.ts` (sin `@ganatrack/shared-types` — no existe contrato de API aún).

## Architecture Decisions

| Opción | Alternativa | Decisión | Rationale |
|--------|-------------|----------|-----------|
| `useState` para wizard state | Zustand store global | `useState` levantado en `nuevo/page.tsx` | Estado efímero de UI, no persiste, no compartido entre páginas |
| Tipos locales en módulo | Re-exportar desde `@ganatrack/shared-types` | Tipos locales en `servicios.types.ts` | Solo mock por ahora; sin contrato de API real. Migrar a shared-types cuando exista backend |
| `createQueryKeys` factory | Keys ad-hoc inline | Namespace `servicios.*` con `createQueryKeys` por sub-entidad | Consistencia con el resto del objeto `queryKeys` |
| Un `ServiciosService` unificado | 3 services separados (1 por entidad) | Un service con 3 secciones (getPalpaciones, getInseminaciones, getPartos) | Reduce archivos; palpaciones/inseminaciones comparten `EventoGrupal` base — un solo mock/factory |
| `AnimalSelector` como component propio | Reutilizar un selector existente | Nuevo `animal-selector.tsx` con `animalService` existente | No existe selector reutilizable; filtra solo hembras activas (lógica específica) |

## Data Flow

### List (Palpaciones como ejemplo — identical para Inseminaciones y Partos)

```
page.tsx
  └─ usePalpaciones({ predioId, page, limit })
       └─ useQuery(queryKeys.servicios.palpaciones.list(filters))
            └─ serviciosService.getPalpaciones(filters)
                 └─ MockServiciosService.getPalpaciones()  [delay(300)]
                      └─ SEED_PALPACIONES (in-memory array)
```

### Wizard Create (3 pasos en mismo page)

```
nuevo/page.tsx  [useState: { step, eventoData, animalesData }]
  │
  ├─ Step 1: PalpacionEventoForm → setEventoData (sin API call)
  │
  ├─ Step 2: AnimalSelector → setAnimalesData (sin API call)
  │           └─ useAnimales({ sexoKey: 1, estadoAnimalKey: 0 }) → animalService.getAll()
  │
  └─ Step 3: PalpacionResultsForm → onSubmit
              └─ useCreatePalpacion.mutateAsync({ evento, animales })
                   └─ serviciosService.createPalpacion(dto)
                        └─ MockServiciosService (push to store + invalidate)
```

### Parto Create (form simple, sin wizard)

```
partos/nuevo/page.tsx
  └─ PartoForm (RHF+Zod)
       └─ useCreateParto.mutateAsync(dto)
            └─ serviciosService.createParto(dto)
```

## Interfaces / Contracts

```typescript
// servicios.types.ts — core interfaces
interface EventoGrupal {
  id: number; predioId: number; codigo: string; fecha: string;
  veterinariosId: number; observaciones?: string;
  animales: PalpacionAnimalResult[] | InseminacionAnimalResult[];
  // joined
  veterinarioNombre?: string;
}

interface PalpacionAnimalResult {
  animalesId: number; veterinariosId: number;
  diagnosticosVeterinariosId: number; configCondicionesCorporalesId: number;
  fecha: string; diasGestacion?: number; fechaParto?: string; comentarios?: string;
  // joined
  animalCodigo?: string;
}

interface InseminacionAnimalResult {
  animalesId: number; fecha: string;
  tipoPadreKey?: number; comentarios?: string;
  // joined
  animalCodigo?: string;
}

interface Parto {
  id: number; predioId: number; animalesId: number; fecha: string;
  machos: number; hembras: number; muertos: number;
  tipoParto: 'Normal' | 'Con Ayuda' | 'Distócico' | 'Mortinato';
  // joined
  animalCodigo?: string;
}

// Filters/pagination (reutiliza PaginationParams pattern de animales)
interface ServiciosFilters { predioId: number; page: number; limit: number; search?: string; }

// Paginated responses (mismo patrón que PaginatedAnimales)
interface PaginatedPalpaciones { data: EventoGrupal[]; page: number; limit: number; total: number; totalPages: number; }
interface PaginatedPartos { data: Parto[]; page: number; limit: number; total: number; totalPages: number; }

// Query keys extension
servicios: {
  palpaciones: { ...createQueryKeys('servicios-palpaciones') },
  inseminaciones: { ...createQueryKeys('servicios-inseminaciones') },
  partos: { ...createQueryKeys('servicios-partos') },
}

// ServiciosService Interface
interface ServiciosService {
  getPalpaciones(filters: ServiciosFilters): Promise<PaginatedPalpaciones>;
  getPalpacion(id: number): Promise<EventoGrupal>;
  createPalpacion(dto: CreatePalpacionDto): Promise<EventoGrupal>;
  getInseminaciones(filters: ServiciosFilters): Promise<PaginatedInseminaciones>;
  getInseminacion(id: number): Promise<EventoGrupal>;
  createInseminacion(dto: CreateInseminacionDto): Promise<EventoGrupal>;
  getPartos(filters: ServiciosFilters): Promise<PaginatedPartos>;
  getParto(id: number): Promise<Parto>;
  createParto(dto: CreatePartoDto): Promise<Parto>;
}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `modules/servicios/types/servicios.types.ts` | Create | Interfaces: EventoGrupal, PalpacionAnimalResult, InseminacionAnimalResult, Parto, Filters, Paginated |
| `modules/servicios/schemas/palpacion.schema.ts` | Create | Zod: evento grupal + animales[] con resultados |
| `modules/servicios/schemas/inseminacion.schema.ts` | Create | Zod: mismo patrón palpacion |
| `modules/servicios/schemas/parto.schema.ts` | Create | Zod: individual — animalesId, fecha, crías, tipo |
| `modules/servicios/services/servicios.service.ts` | Create | Interface ServiciosService + Factory (mock/real) |
| `modules/servicios/services/servicios.mock.ts` | Create | MockServiciosService: 6 seed palpaciones, 6 inseminaciones, 8 partos; delay(300) |
| `modules/servicios/services/servicios.api.ts` | Create | RealServiciosService stub (throw NotImplemented) |
| `modules/servicios/services/index.ts` | Create | Barrel re-export |
| `modules/servicios/hooks/use-palpaciones.ts` | Create | useQuery list palpaciones |
| `modules/servicios/hooks/use-palpacion.ts` | Create | useQuery detail by id |
| `modules/servicios/hooks/use-create-palpacion.ts` | Create | useMutation + invalidate queryKeys.servicios.palpaciones.all |
| `modules/servicios/hooks/use-inseminaciones.ts` | Create | useQuery list inseminaciones |
| `modules/servicios/hooks/use-inseminacion.ts` | Create | useQuery detail |
| `modules/servicios/hooks/use-create-inseminacion.ts` | Create | useMutation + invalidate |
| `modules/servicios/hooks/use-partos.ts` | Create | useQuery list partos |
| `modules/servicios/hooks/use-parto.ts` | Create | useQuery detail |
| `modules/servicios/hooks/use-create-parto.ts` | Create | useMutation + invalidate |
| `modules/servicios/hooks/index.ts` | Create | Barrel |
| `modules/servicios/components/animal-selector.tsx` | Create | Multi-select hembras activas (usa animalService) |
| `modules/servicios/components/servicio-grupal-wizard.tsx` | Create | Stepper horizontal + render condicional de paso |
| `modules/servicios/components/palpacion-evento-form.tsx` | Create | Step 1: codigo, fecha, veterinariosId, observaciones |
| `modules/servicios/components/palpacion-results-form.tsx` | Create | Step 3: tabla por animal con diagnostico, CC, diasGestacion condicional |
| `modules/servicios/components/inseminacion-evento-form.tsx` | Create | Step 1 para inseminación |
| `modules/servicios/components/inseminacion-results-form.tsx` | Create | Step 3 para inseminación |
| `modules/servicios/components/parto-form.tsx` | Create | Form completo sin wizard |
| `modules/servicios/components/palpaciones-table.tsx` | Create | ColumnDef[] + DataTable para EventoGrupal |
| `modules/servicios/components/inseminaciones-table.tsx` | Create | Idem para inseminaciones |
| `modules/servicios/components/partos-table.tsx` | Create | ColumnDef[] + DataTable para Parto |
| `modules/servicios/index.ts` | Create | Barrel del módulo completo |
| `app/dashboard/servicios/palpaciones/page.tsx` | Create | Listado + KPIs + botón Nueva Palpación |
| `app/dashboard/servicios/palpaciones/nuevo/page.tsx` | Create | Wizard 3 pasos (useState local) |
| `app/dashboard/servicios/palpaciones/[id]/page.tsx` | Create | Detalle evento con tabla animales |
| `app/dashboard/servicios/inseminaciones/page.tsx` | Create | Listado inseminaciones |
| `app/dashboard/servicios/inseminaciones/nuevo/page.tsx` | Create | Wizard inseminación |
| `app/dashboard/servicios/inseminaciones/[id]/page.tsx` | Create | Detalle inseminación |
| `app/dashboard/servicios/partos/page.tsx` | Create | Listado partos + KPIs |
| `app/dashboard/servicios/partos/nuevo/page.tsx` | Create | Form simple parto |
| `shared/lib/query-keys.ts` | Modify | Agregar namespace `servicios` con sub-claves por entidad |

## Wizard Sequence (3 pasos — Palpaciones e Inseminaciones)

```
nuevo/page.tsx  [step: 1|2|3, eventoData: Partial, animalesSeleccionados: number[], resultados: Map]
       │
Step 1 ── PalpacionEventoForm (RHF+Zod) ── onNext(eventoData) → step=2
       │
Step 2 ── AnimalSelector (multi-check) ── onNext(ids[]) → step=3
       │
Step 3 ── PalpacionResultsForm ── por cada animal: diagnostico + CC + diasGestacion?
       │   onSubmit → useCreatePalpacion.mutateAsync({ evento: eventoData, animales: resultados })
       │
       └── onSuccess: router.push('/dashboard/servicios/palpaciones')
           onError: toast.error(err.message)
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | MockServiciosService CRUD | Jest — verify seed data, pagination, create/getById |
| Unit | Schemas Zod | Parse valid + invalid payloads |
| Integration | Hooks (useQuery/useMutation) | renderHook + QueryClientProvider + MockService |
| E2E | Wizard flow end-to-end | Playwright (out of scope for this change) |

## Migration / Rollout

No migration required. Módulo completamente nuevo. El único archivo existente modificado es `query-keys.ts` — cambio aditivo, no rompe nada.

## Open Questions

- [ ] ¿`configCondicionesCorporalesId` viene de `catalogoService` o de `configuracionService`? (Exploración dice `configuracion/`, confirmar key exacto)
- [ ] ¿Los diagnósticos veterinarios son de `maestrosService.getAll('diagnosticos')` o tienen ruta propia? (Exploración asume maestros — confirmar)
