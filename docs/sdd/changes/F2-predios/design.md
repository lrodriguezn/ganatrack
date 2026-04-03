# Design: Módulo Predios (F2-PREDIOS)

## Technical Approach

Implementar CRUD completo de Predios y sus 4 sub-recursos (Potreros, Sectores, Lotes, Grupos) siguiendo el patrón modular establecido en `modules/auth/`. La arquitectura separa concerns en service layer (interface + factory + mock), hooks TanStack Query con optimistic updates, y componentes presentacionales. Sub-recursos se renderizan como tabs en detalle del predio Y como páginas independientes accesibles desde sidebar.

---

## Architecture Decisions

### Decision: IDs como number (no string UUID)

**Choice**: IDs son `z.number().int()` — alineado con `createAnimalSchema` y backend Drizzle (autoIncrement).
**Alternatives**: `z.string().uuid()` (auth.schema.ts para User), `z.string()`.
**Rationale**: Backend usa `integer('id').primaryKey({ autoIncrement: true })`. El animal.schema.ts ya usa `z.number().int()`. Mantener consistencia con el dominio ganadero, no con auth (que es un caso especial).

### Decision: Sub-recursos como tabs + páginas independientes

**Choice**: Tabs en `/dashboard/predios/[id]` para contexto del predio, PERO también `/dashboard/predios/potreros`, etc. para acceso rápido desde sidebar.
**Alternatives**: Solo tabs, solo páginas independientes.
**Rationale**: El PRD (Frontend §4.2) define ambas rutas. Navigation.config.ts ya tiene children de Predios con rutas a potreros, sectores, lotes, grupos. El usuario quiere poder ver potreros de un predio específico (tab) Y listar todos los potreros del predio activo (página).

### Decision: Schemas Zod en shared-types (no module-local)

**Choice**: Crear `packages/shared-types/src/schemas/predio.schema.ts` con PotreroSchema, SectorSchema, LoteSchema, GrupoSchema.
**Alternatives**: Poner schemas en `modules/predios/schemas/`.
**Rationale**: PredioSchema ya existe en `auth.schema.ts`. Sub-recursos son tipos de dominio compartidos (animales referencia potreroId). Mover PredioSchema al nuevo archivo y re-exportar desde auth.schema.ts para backward compatibility.

### Decision: Mock service con Map<string, T[]> en memoria

**Choice**: Map donde key = predioId, value = array de sub-recursos. Seed data fijo al instanciar.
**Alternatives**: Array global sin agrupar por predio.
**Rationale**: Simula comportamiento real de API — sub-recursos SIEMPRE pertenecen a un predio. El service recibe predioId como parámetro, igual que la API real.

### Decision: Query keys con sub-recurso anidado bajo predio

**Choice**: `queryKeys.potreros(predioId)` → `['predios', predioId, 'potreros']`.
**Alternatives**: `queryKeys.potreros.list()` → `['potreros', 'list']` (módulo separado).
**Rationale**: Sub-recursos son hijos de predio. Invalidar potreros de un predio específico sin afectar otros. El PRD Frontend §8.3 define este patrón exacto.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Page: /dashboard/predios/[id]                              │
│  ┌─────────────┐  ┌──────────────────────────────────────┐  │
│  │ PredioForm  │  │ Tabs: Info | Potreros | Lotes | Grupos│ │
│  │ (crear/edit)│  │  ┌─────────────────────────────────┐  │  │
│  └──────┬──────┘  │  │ PotrerosTable                   │  │  │
│         │         │  │  → usePotreros(predioId)        │  │  │
│         ▼         │  │  → prediosService.getPotreros()  │  │  │
│  useCreatePredio()│  └─────────────────────────────────┘  │  │
│  → prediosService │                                        │  │
│    .create()      │                                        │  │
│  → queryClient.   │                                        │  │
│    invalidate()   │                                        │  │
│  → usePredioStore │                                        │  │
│    .setPredios()  │                                        │  │
└───────────────────┴────────────────────────────────────────┘
```

**Invalidation cascade on create/update/delete predio:**
1. `queryClient.invalidateQueries({ queryKey: queryKeys.predios.all })`
2. `usePredioStore.getState().setPredios(refetchPredios)` — sincroniza Zustand
3. Si se eliminó el predio activo → `switchPredio()` al siguiente disponible

**Invalidation on sub-resource mutation:**
1. `queryClient.invalidateQueries({ queryKey: ['predios', predioId, 'potreros'] })`
2. Solo invalida sub-recursos del predio afectado

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/shared-types/src/schemas/predio.schema.ts` | Create | Zod schemas para Potrero, Sector, Lote, Grupo + form schemas |
| `packages/shared-types/src/schemas/auth.schema.ts` | Modify | Mover PredioSchema a predio.schema.ts, re-exportar |
| `packages/shared-types/src/index.ts` | Modify | Agregar export de predio.schema |
| `apps/web/src/modules/predios/services/predios.service.ts` | Create | Interface PrediosService + factory |
| `apps/web/src/modules/predios/services/predios.mock.ts` | Create | MockPrediosService con seed data |
| `apps/web/src/modules/predios/services/predios.api.ts` | Create | RealPrediosService placeholder |
| `apps/web/src/modules/predios/hooks/use-predios.ts` | Create | useQuery para lista de predios |
| `apps/web/src/modules/predios/hooks/use-predio.ts` | Create | useQuery para detalle |
| `apps/web/src/modules/predios/hooks/use-create-predio.ts` | Create | useMutation con optimistic update |
| `apps/web/src/modules/predios/hooks/use-update-predio.ts` | Create | useMutation |
| `apps/web/src/modules/predios/hooks/use-delete-predio.ts` | Create | useMutation + store sync |
| `apps/web/src/modules/predios/hooks/use-potreros.ts` | Create | useQuery sub-recurso |
| `apps/web/src/modules/predios/hooks/use-lotes.ts` | Create | useQuery sub-recurso |
| `apps/web/src/modules/predios/hooks/use-grupos.ts` | Create | useQuery sub-recurso |
| `apps/web/src/modules/predios/hooks/use-sectores.ts` | Create | useQuery sub-recurso |
| `apps/web/src/modules/predios/components/predio-table.tsx` | Create | DataTable wrapper con columnas |
| `apps/web/src/modules/predios/components/predio-form.tsx` | Create | RHF + Zod form |
| `apps/web/src/modules/predios/components/predio-detail.tsx` | Create | Vista detalle con tabs |
| `apps/web/src/modules/predios/components/potreros-table.tsx` | Create | Sub-recurso tabla |
| `apps/web/src/modules/predios/components/potrero-form.tsx` | Create | Sub-recurso form |
| `apps/web/src/modules/predios/components/lotes-table.tsx` | Create | Sub-recurso tabla |
| `apps/web/src/modules/predios/components/lote-form.tsx` | Create | Sub-recurso form |
| `apps/web/src/modules/predios/components/grupos-table.tsx` | Create | Sub-recurso tabla |
| `apps/web/src/modules/predios/components/grupo-form.tsx` | Create | Sub-recurso form |
| `apps/web/src/modules/predios/components/sectores-table.tsx` | Create | Sub-recurso tabla |
| `apps/web/src/modules/predios/components/sector-form.tsx` | Create | Sub-recurso form |
| `apps/web/src/app/dashboard/predios/page.tsx` | Create | Listado de predios |
| `apps/web/src/app/dashboard/predios/nuevo/page.tsx` | Create | Crear nuevo predio |
| `apps/web/src/app/dashboard/predios/[id]/page.tsx` | Create | Detalle con tabs |
| `apps/web/src/app/dashboard/predios/potreros/page.tsx` | Create | Listado global potreros |
| `apps/web/src/app/dashboard/predios/lotes/page.tsx` | Create | Listado global lotes |
| `apps/web/src/app/dashboard/predios/grupos/page.tsx` | Create | Listado global grupos |
| `apps/web/src/app/dashboard/predios/sectores/page.tsx` | Create | Listado global sectores |
| `apps/web/src/shared/lib/query-keys.ts` | Modify | Agregar factories para sub-recursos |
| `apps/web/src/store/predio.store.ts` | Modify | Agregar addPredio, updatePredio, removePredio |

**Total: 31 archivos (28 nuevos, 3 modificados)**

---

## Interfaces / Contracts

### PrediosService Interface

```typescript
export interface PrediosService {
  // Predios CRUD
  getPredios(): Promise<Predio[]>;
  getPredio(id: number): Promise<Predio>;
  createPredio(data: CreatePredioDto): Promise<Predio>;
  updatePredio(id: number, data: UpdatePredioDto): Promise<Predio>;
  deletePredio(id: number): Promise<void>;

  // Sub-recursos (patrón uniforme)
  getPotreros(predioId: number): Promise<Potrero[]>;
  createPotrero(predioId: number, data: CreatePotreroDto): Promise<Potrero>;
  updatePotrero(predioId: number, id: number, data: UpdatePotreroDto): Promise<Potrero>;
  deletePotrero(predioId: number, id: number): Promise<void>;

  // Mismo patrón para: getSectores, getLotes, getGrupos...
}
```

### Schemas Zod (en shared-types)

```typescript
// packages/shared-types/src/schemas/predio.schema.ts
export const PotreroSchema = z.object({
  id: z.number().int(),
  predioId: z.number().int(),
  codigo: z.string().min(1).max(20),
  nombre: z.string().min(1).max(100),
  areaHectareas: z.number().positive(),
  capacidadMaxima: z.number().int().nonnegative(),
  activo: z.number().int().default(1),
});

export const CreatePotreroSchema = PotreroSchema.omit({ id: true, predioId: true, activo: true });
// Mismo patrón para Sector, Lote, Grupo
```

### Query Keys Extension

```typescript
// apps/web/src/shared/lib/query-keys.ts
export const queryKeys = {
  predios: {
    ...createQueryKeys('predios'),
    potreros: (predioId: number) => ['predios', predioId, 'potreros'] as const,
    sectores: (predioId: number) => ['predios', predioId, 'sectores'] as const,
    lotes: (predioId: number) => ['predios', predioId, 'lotes'] as const,
    grupos: (predioId: number) => ['predios', predioId, 'grupos'] as const,
  },
  // ...
};
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | PrediosService mock — CRUD operations | Vitest: create, read, update, delete, not-found errors |
| Unit | Zod schemas — valid/invalid inputs | Vitest: boundary values, missing required fields |
| Unit | Hooks — useCreatePredio mutation | Vitest + @testing-library/react-hooks |
| Integration | PredioForm — submit flow | Vitest + React Testing Library |
| Integration | Cache invalidation on mutation | Vitest: verify queryClient.invalidateQueries called |
| E2E (manual) | Full CRUD flow through UI | Browser: list → create → edit → delete → verify store sync |

---

## Migration / Rollout

No migration required — all new files. Changes to existing files are additive:
- `predio.store.ts`: add 3 action methods (addPredio, updatePredio, removePredio) — backward compatible
- `query-keys.ts`: extend predios object with sub-recurso factories — backward compatible
- `auth.schema.ts`: move PredioSchema to predio.schema.ts, re-export — backward compatible

---

## Open Questions

- [ ] ¿Sectores tiene los mismos campos que Potreros o tiene campos adicionales? (PRD dice "patrón uniforme" pero no especifica diferencias)
- [ ] ¿Los sub-recursos globales (/dashboard/predios/potreros) muestran datos del predio activo O de TODOS los predios?
- [ ] ¿Necesitamos validación de capacidad máxima en potreros cuando se mueven animales? (probablemente en módulo animales, no aquí)

---

## Relevant Files Reference

- `apps/web/src/modules/auth/services/auth.service.ts` — Service pattern a seguir
- `apps/web/src/modules/auth/hooks/use-login.ts` — Hook pattern (RHF + service + store)
- `apps/web/src/store/predio.store.ts` — Store existente a extender
- `apps/web/src/shared/lib/query-keys.ts` — Key factory pattern
- `packages/shared-types/src/schemas/animal.schema.ts` — Zod schema pattern
- `apps/web/src/shared/components/ui/data-table.tsx` — DataTable component
- `apps/web/src/shared/components/ui/modal.tsx` — Modal component
- `apps/web/src/shared/lib/navigation.config.ts` — Rutas sidebar ya definidas
