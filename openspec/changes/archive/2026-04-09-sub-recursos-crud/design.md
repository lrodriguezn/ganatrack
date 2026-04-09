# Design: Completar CRUD Sub-recursos del Predio

## Technical Approach

Replicar el patrón de CRUD ya implementado para Predios, adaptándolo para sub-recursos (Potreros, Sectores, Lotes, Grupos). Cada sub-recurso requiere:
- **3 mutation hooks** (create, update, delete)
- **3 routing pages** (nuevo, detail, edit)
- **1 detail component** (vista simplificada sin tabs)

Los componentes de tabla y formulario ya existen. El service API ya tiene todos los endpoints. Solo se implementan las capas de navegación y mutación.

## Architecture Decisions

### Decision 1: Mutation Hook Pattern

**Choice**: Replicar use-create-predio.ts con optimizaciones simplificadas
**Alternatives considered**: 
- Sin optimismo (solo invalidar cache) — más lento pero más simple
- Con store sync — innecesario, los sub-recursos no tienen estado global
**Rationale**: Los sub-recursos no tienen store global (no `usePredioStore`), solo TanStack Query cache. Simplifica hooks vs Predios.

### Decision 2: Routing Structure

**Choice**: URLs anidadas bajo `/dashboard/predios/[id]/X/` 
**Alternatives considered**:
- URLs planas con query param `?predioId=` — rompe breadcrumbs y UX
- Separar en `/potreros/[id]` — pierde contexto del predio padre
**Rationale**: Mantiene jerarquía semántica (Potrero pertenece a Predio), facilita breadcrumbs y navegación contextual.

URLs finales:
- `GET /dashboard/predios/[id]/potreros` — lista (modificar existente)
- `GET /dashboard/predios/[id]/potreros/nuevo` — crear
- `GET /dashboard/predios/[id]/potreros/[potreroId]` — detalle
- `GET /dashboard/predios/[id]/potreros/[potreroId]/edit` — editar

### Decision 3: Detail Component Pattern

**Choice**: Componentes de detalle simplificados SIN tabs de sub-recursos
**Alternatives considered**:
- Reutilizar PredioDetail con tabs — incorrecto, los sub-recursos no tienen sub-recursos
- Inline en la misma página — pierde reutilización
**Rationale**: Los sub-recursos son entidades simples. El patrón de tabs de PredioDetail (potreros, sectores, etc.) no aplica aquí.

### Decision 4: List Page Updates

**Choice**: Agregar `onRowClick` + `onEdit`, `onDelete` handlers + botón "Nuevo"
**Alternatives considered**:
- Tabla existente sin modificaciones — no permite CRUD
- Nueva tabla CRUD separada — duplicación
**Rationale**: PotrerosTable ya tiene props `onEdit` y `onDelete`, solo falta conectarlos y agregar `onRowClick` para navegación a detalle.

## Data Flow

```
Lista (global o en tab de Predio)
│
├─ onRowClick ──────→ Detalle /[id]/X/[xId]
│                       └─ Botones: Editar, Eliminar
│                           └─ Eliminar → Modal → useDeleteX → invalidate → redirect
│                           └─ Editar → /[id]/X/[xId]/edit
│
├─ onEdit ───────────→ /[id]/X/[xId]/edit
│                       └─ Form con defaultValues
│                       └─ useUpdateX → onSuccess → redirect to detail
│
├─ onDelete ─────────→ Modal de confirmación
│                       └─ useDeleteX → onSuccess → invalidate + close
│
└─ "Nuevo" ──────────→ /[id]/X/nuevo
                       └─ Form vacío
                       └─ useCreateX → onSuccess → redirect to detail
```

Query key invalidation:
```
useCreatePotrero → invalidate(queryKeys.predios.potreros(predioId))
useUpdatePotrero → invalidate(queryKeys.predios.potreros(predioId))
useDeletePotrero → invalidate(queryKeys.predios.potreros(predioId))
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/modules/predios/hooks/use-create-potrero.ts` | Create | Mutation hook for creating potreros |
| `apps/web/src/modules/predios/hooks/use-update-potrero.ts` | Create | Mutation hook for updating potreros |
| `apps/web/src/modules/predios/hooks/use-delete-potrero.ts` | Create | Mutation hook for deleting potreros |
| `apps/web/src/modules/predios/hooks/use-create-sector.ts` | Create | Mutation hook for creating sectores |
| `apps/web/src/modules/predios/hooks/use-update-sector.ts` | Create | Mutation hook for updating sectores |
| `apps/web/src/modules/predios/hooks/use-delete-sector.ts` | Create | Mutation hook for deleting sectores |
| `apps/web/src/modules/predios/hooks/use-create-lote.ts` | Create | Mutation hook for creating lotes |
| `apps/web/src/modules/predios/hooks/use-update-lote.ts` | Create | Mutation hook for updating lotes |
| `apps/web/src/modules/predios/hooks/use-delete-lote.ts` | Create | Mutation hook for deleting lotes |
| `apps/web/src/modules/predios/hooks/use-create-grupo.ts` | Create | Mutation hook for creating grupos |
| `apps/web/src/modules/predios/hooks/use-update-grupo.ts` | Create | Mutation hook for updating grupos |
| `apps/web/src/modules/predios/hooks/use-delete-grupo.ts` | Create | Mutation hook for deleting grupos |
| `apps/web/src/modules/predios/hooks/use-potrero.ts` | Create | Query hook for single potrero detail |
| `apps/web/src/modules/predios/hooks/use-sector.ts` | Create | Query hook for single sector detail |
| `apps/web/src/modules/predios/hooks/use-lote.ts` | Create | Query hook for single lote detail |
| `apps/web/src/modules/predios/hooks/use-grupo.ts` | Create | Query hook for single grupo detail |
| `apps/web/src/modules/predios/hooks/index.ts` | Modify | Export 16 new hooks |
| `apps/web/src/modules/predios/components/potrero-detail.tsx` | Create | Detail view for single potrero |
| `apps/web/src/modules/predios/components/sector-detail.tsx` | Create | Detail view for single sector |
| `apps/web/src/modules/predios/components/lote-detail.tsx` | Create | Detail view for single lote |
| `apps/web/src/modules/predios/components/grupo-detail.tsx` | Create | Detail view for single grupo |
| `apps/web/src/modules/predios/components/index.ts` | Modify | Export 4 new detail components |
| `apps/web/src/app/dashboard/predios/[id]/potreros/nuevo/page.tsx` | Create | Create potrero page |
| `apps/web/src/app/dashboard/predios/[id]/potreros/[potreroId]/page.tsx` | Create | Potrero detail page |
| `apps/web/src/app/dashboard/predios/[id]/potreros/[potreroId]/edit/page.tsx` | Create | Edit potrero page |
| `apps/web/src/app/dashboard/predios/[id]/sectores/nuevo/page.tsx` | Create | Create sector page |
| `apps/web/src/app/dashboard/predios/[id]/sectores/[sectorId]/page.tsx` | Create | Sector detail page |
| `apps/web/src/app/dashboard/predios/[id]/sectores/[sectorId]/edit/page.tsx` | Create | Edit sector page |
| `apps/web/src/app/dashboard/predios/[id]/lotes/nuevo/page.tsx` | Create | Create lote page |
| `apps/web/src/app/dashboard/predios/[id]/lotes/[loteId]/page.tsx` | Create | Lote detail page |
| `apps/web/src/app/dashboard/predios/[id]/lotes/[loteId]/edit/page.tsx` | Create | Edit lote page |
| `apps/web/src/app/dashboard/predios/[id]/grupos/nuevo/page.tsx` | Create | Create grupo page |
| `apps/web/src/app/dashboard/predios/[id]/grupos/[grupoId]/page.tsx` | Create | Grupo detail page |
| `apps/web/src/app/dashboard/predios/[id]/grupos/[grupoId]/edit/page.tsx` | Create | Edit grupo page |
| `apps/web/src/app/dashboard/predios/potreros/page.tsx` | Modify | Add onRowClick, onEdit, onDelete, "Nuevo" button |
| `apps/web/src/app/dashboard/predios/sectores/page.tsx` | Modify | Add onRowClick, onEdit, onDelete, "Nuevo" button |
| `apps/web/src/app/dashboard/predios/lotes/page.tsx` | Modify | Add onRowClick, onEdit, onDelete, "Nuevo" button |
| `apps/web/src/app/dashboard/predios/grupos/page.tsx` | Modify | Add onRowClick, onEdit, onDelete, "Nuevo" button |

**Total**: 16 create hooks (12 mutation + 4 query), 4 detail components, 12 routing pages, 6 modified files

## Interfaces / Contracts

### Mutation Hook Interface (Create)

```typescript
// use-create-potrero.ts
export interface UseCreatePotreroOptions {
  predioId: number;
  onSuccess?: (potrero: Potrero) => void;
  onError?: (error: Error) => void;
}

export interface UseCreatePotreroReturn {
  mutate: (data: CreatePotreroDto) => void;
  mutateAsync: (data: CreatePotreroDto) => Promise<Potrero>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreatePotrero(options: UseCreatePotreroOptions): UseCreatePotreroReturn;
```

### Mutation Hook Interface (Update)

```typescript
// use-update-potrero.ts
export interface UseUpdatePotreroOptions {
  predioId: number;
  onSuccess?: (potrero: Potrero) => void;
  onError?: (error: Error) => void;
}

export interface UseUpdatePotreroReturn {
  mutate: (id: number, data: UpdatePotreroDto) => void;
  mutateAsync: (id: number, data: UpdatePotreroDto) => Promise<Potrero>;
  isLoading: boolean;
  error: Error | null;
}

export function useUpdatePotrero(options: UseUpdatePotreroOptions): UseUpdatePotreroReturn;
```

### Mutation Hook Interface (Delete)

```typescript
// use-delete-potrero.ts
export interface UseDeletePotreroOptions {
  predioId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseDeletePotreroReturn {
  mutate: (id: number) => void;
  mutateAsync: (id: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDeletePotrero(options: UseDeletePotreroOptions): UseDeletePotreroReturn;
```

### Query Hook Interface (Single Item)

```typescript
// use-potrero.ts
export interface UsePotreroOptions {
  predioId: number;
  id: number;
}

export interface UsePotreroReturn {
  potrero: Potrero | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function usePotrero(options: UsePotreroOptions): UsePotreroReturn;
```

### Detail Component Interface

```typescript
// potrero-detail.tsx
interface PotreroDetailProps {
  potrero: Potrero;
  predioId: number;
  onEdit?: (potrero: Potrero) => void;
  onDelete?: (potrero: Potrero) => void;
}
```

### Table Component Update

```typescript
// potreros-table.tsx (INTERFACE CHANGE - add onRowClick)
interface PotrerosTableProps {
  potreros: Potrero[];
  isLoading?: boolean;
  onRowClick?: (potrero: Potrero) => void;  // NEW
  onEdit?: (potrero: Potrero) => void;
  onDelete?: (potrero: Potrero) => void;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Mutation hooks (optimistic update, cache invalidation) | Vitest + @testing-library/react-hooks |
| Unit | Query hooks (enabled flag, stale time) | Vitest + MSW for API mocking |
| Integration | Create/Edit page flow | Playwright E2E: create → redirect → edit → redirect |
| Integration | Delete confirmation flow | Playwright E2E: delete → modal confirm → list refresh |
| Integration | Navigation flow | Playwright E2E: list → row click → detail → edit → back |

## Migration / Rollback Plan

No database migration required — all changes are frontend-only.

**Rollback**: Delete 32 new files, revert 6 modified files. No backend impact.

## Open Questions

- [ ] ¿Deberían las páginas de lista global (`/predios/potreros`) mostrar el botón "Nuevo" o solo desde el detalle del predio? **Resolution**: Desde el detalle del predio (nested routes), la lista global requiere predioActivo del store.
- [ ] ¿Deberían los sub-recursos mostrarse también como tabs dentro del detalle del Predio con acciones CRUD? **Resolution**: Sí, pero este cambio está fuera del scope actual (requiere refactor de PredioDetail). Este diseño asume que las tabs de PredioDetail solo muestran listas sin acciones.

---

**Decisiones Confirmadas**:
1. Sin store global para sub-recursos (solo TanStack Query)
2. URLs anidadas para contexto semántico
3. Handlers conectados en tablas existentes
4. Detail components simples sin tabs de sub-recursos