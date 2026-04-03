# Design: Shared Components for GanaTrack

## Technical Approach

Establish a reusable component layer following the existing `button.tsx` pattern: `forwardRef`, `twMerge` for class composition, Tailwind v4 dark mode classes (`dark:`), and Radix UI primitives where applicable. All new files are pure additions — no existing code modifications required.

## Architecture Decisions

### Decision: No Barrel Exports

**Choice**: Direct imports (`@/shared/components/ui/button`)
**Alternatives considered**: Barrel exports via `index.ts`
**Rationale**: Next.js 15 tree-shaking works better with direct imports; avoids circular dependency risks; matches existing project convention

### Decision: Manual Variant Maps (Not CVA)

**Choice**: `Record<VariantType, string>` with `twMerge`
**Alternatives considered**: `class-variance-authority` (cva)
**Rationale**: Zero new dependencies; existing `button.tsx` pattern already established; sufficient for current scope (4-5 variants max per component)

### Decision: RHF Controller Pattern for FormField

**Choice**: FormField wraps `Controller` + renders child input via `render` prop
**Alternatives considered**: Custom `useFormField` hook with context
**Rationale**: Matches how `useLogin` already uses RHF; simpler composition; explicit data flow; no hidden magic

### Decision: TanStack Query Provider Placement

**Choice**: Add `QueryClientProvider` inside existing `AppProviders`
**Alternatives considered**: Separate `QueryProvider` wrapper
**Rationale**: Single provider boundary; `app-providers.tsx` already has comment indicating future QueryClientProvider; minimal change

### Decision: Server-Side DataTable (Default)

**Choice**: DataTable defaults to server-side pagination/sorting; parent controls state
**Alternatives considered**: Client-side with auto-pagination
**Rationale**: PRD §10 specifies server-side; API already paginates; TanStack Table supports both via `manualPagination: true`

### Decision: flatpickr for DatePicker

**Choice**: flatpickr with CSS overrides
**Alternatives considered**: react-datepicker, native `<input type="date">`
**Rationale**: Proposal specifies flatpickr; lightweight; good i18n support; CSS styling challenge is manageable with wrapper approach

### Decision: Radix Dialog for Modal (Not Custom)

**Choice**: Wrap `@radix-ui/react-dialog` (already installed)
**Alternatives considered**: Custom portal + focus trap
**Rationale**: Zero new deps; existing Radix pattern in project; built-in a11y (focus trap, ESC close, ARIA)

## Data Flow

### FormField Integration

```
useForm<T>() ──→ FormField ──→ Input / DatePicker / Select
    │                │
    │          Controller
    │                │
    └──── errors ────┘──→ ErrorDisplay
```

### DataTable Data Flow

```
API (paginated) ──→ useQuery ──→ DataTable ──→ columns definition
                         │            │
                    TanStack Table    │
                         │            │
                    onPaginationChange / onSortingChange
                         │
                    Parent re-fetches with new params
```

### Query Infrastructure

```
query-keys.ts ──→ query-client.ts ──→ QueryClientProvider ──→ useQuery/useMutation
      │                    │
  Key Factory     staleTime config
  (type-safe)     (list=30s, detail=5min, catalog=∞)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/ui/input.tsx` | Create | Input atom: label, error, disabled, variant (default/error/success), size |
| `apps/web/src/shared/components/ui/skeleton.tsx` | Create | Skeleton atom: width, height, variant (text/circular/rectangular) |
| `apps/web/src/shared/components/ui/form-field.tsx` | Create | FormField molecule: RHF Controller wrapper + error display |
| `apps/web/src/shared/components/ui/date-picker.tsx` | Create | DatePicker molecule: flatpickr wrapper with Tailwind styling |
| `apps/web/src/shared/components/ui/pagination.tsx` | Create | Pagination molecule: page navigation controls |
| `apps/web/src/shared/components/ui/data-table.tsx` | Create | DataTable organism: TanStack Table v8 generic wrapper |
| `apps/web/src/shared/components/ui/modal.tsx` | Create | Modal organism: Radix Dialog with size variants |
| `apps/web/src/shared/lib/query-client.ts` | Create | QueryClient singleton with staleTime config |
| `apps/web/src/shared/lib/query-keys.ts` | Create | Query key factory with type-safe entity keys |
| `apps/web/src/shared/hooks/use-debounce.ts` | Create | Generic debounce hook |
| `apps/web/src/shared/hooks/use-online-status.ts` | Create | Navigator.onLine wrapper with event listeners |
| `apps/web/src/shared/providers/app-providers.tsx` | Modify | Add QueryClientProvider wrapper |
| `apps/web/package.json` | Modify | Add @tanstack/react-table, @tanstack/react-query, flatpickr |

## Interfaces / Contracts

### Input Component
```typescript
type InputVariant = 'default' | 'error' | 'success';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
}
```

### FormField Component
```typescript
interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
}
```

### DataTable Generic
```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  isLoading?: boolean;
}
```

### Query Key Factory
```typescript
const queryKeys = {
  animales: {
    all: ['animales'] as const,
    lists: () => [...queryKeys.animales.all, 'list'] as const,
    list: (filters: AnimalFilters) => [...queryKeys.animales.lists(), filters] as const,
    details: () => [...queryKeys.animales.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.animales.details(), id] as const,
  },
  // ... other entities
};
```

### Modal Component
```typescript
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Input variants render correct classes | Future: testing-library |
| Unit | FormField displays RHF errors | Future: testing-library |
| Unit | query-keys factory generates correct paths | Future: unit test |
| Integration | DataTable pagination triggers callbacks | Future: testing-library |
| Integration | Modal open/close state management | Future: testing-library |
| E2E | Form submission flow with validation | Future: Playwright |

**Note**: Testing infrastructure is a separate change. This design ensures testability via:
- Pure presentational components (props in, JSX out)
- Callback-based data flow (easy to mock)
- Generic typing (compile-time safety)

## Migration / Rollout

No migration required. All files are new additions. Rollout is simply:
1. `pnpm add @tanstack/react-table @tanstack/react-query flatpickr`
2. Create 11 new files
3. Add `QueryClientProvider` to `app-providers.tsx`

Rollback: delete files, remove packages, revert `app-providers.tsx`.

## Open Questions

- [ ] Should DataTable include built-in search/filter input, or leave to parent?
- [ ] DatePicker: should we support time selection in v1, or date-only?
- [ ] Query key factory: start with generic pattern or create keys per entity upfront?

## Dependencies to Install

```bash
pnpm add @tanstack/react-table @tanstack/react-query flatpickr
```

**Already installed** (no action): @radix-ui/react-dialog, react-hook-form, @hookform/resolvers, zod, tailwind-merge

**Peer deps**: flatpickr has no React peer dep (vanilla JS library). @tanstack/react-query requires React 16.8+ (we have 18.3.1 ✓).
