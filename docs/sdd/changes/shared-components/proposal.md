# Proposal: F2-SHARED — Shared Components for GanaTrack

## Intent

Establish a reusable component foundation for GanaTrack's Phase 2 (Núcleo) modules. Without shared components, each feature module would duplicate UI patterns, form handling, and data table implementations, violating DRY and creating maintenance burden. This proposal covers the complete shared component layer as specified in PRD §11 (Arquitectura de Componentes) and §10 (Arquitectura de Tablas).

## Scope

### In Scope
- **UI Atoms** (2): Input, Skeleton
- **UI Molecules** (3): FormField (RHF + Zod), DatePicker (flatpickr), Pagination
- **UI Organisms** (2): DataTable (TanStack Table v8), Modal (Radix Dialog)
- **Query Infrastructure** (2): query-client.ts, query-keys.ts factory
- **Shared Hooks** (2): use-debounce.ts, use-online-status.ts

### Out of Scope
- usePermission hook (already exists in `modules/auth/hooks/use-permission.ts`)
- Domain-specific components (animal cards, event forms, etc.)
- PWA/service worker infrastructure
- i18n setup
- Testing infrastructure (separate change)

## Capabilities

### New Capabilities
- `ui-atoms`: Input and Skeleton base components
- `ui-molecules`: FormField, DatePicker, Pagination composite components
- `ui-organisms`: DataTable and Modal complex components
- `query-infrastructure`: TanStack Query client configuration and key factory
- `shared-hooks`: Debounce and online status utility hooks

### Modified Capabilities
- None (all new)

## Approach

**Single SDD change** — all components are foundational with no inter-dependencies beyond shared styling patterns. The exploration recommended splitting into two changes, but given that:
1. Query infrastructure is tiny (2 files, ~50 lines total)
2. Hooks are independent utilities (no dependency on query infra)
3. All UI components follow the same established pattern (button.tsx)

A single change reduces overhead while remaining manageable (~10 files, ~800 lines estimated).

### Component Architecture Pattern
Follow existing `button.tsx` pattern:
- `forwardRef` for DOM access
- `twMerge` for class composition
- Tailwind v4 dark mode classes (`dark:`)
- Radix UI primitives where applicable
- TypeScript strict mode with explicit interfaces

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/ui/input.tsx` | New | Form input atom with validation states |
| `apps/web/src/shared/components/ui/skeleton.tsx` | New | Loading placeholder animation |
| `apps/web/src/shared/components/ui/form-field.tsx` | New | RHF Controller + Zod error display |
| `apps/web/src/shared/components/ui/date-picker.tsx` | New | Flatpickr wrapper with Tailwind styling |
| `apps/web/src/shared/components/ui/pagination.tsx` | New | Page navigation controls |
| `apps/web/src/shared/components/ui/data-table.tsx` | New | TanStack Table v8 wrapper with server-side features |
| `apps/web/src/shared/components/ui/modal.tsx` | New | Radix Dialog wrapper with size variants |
| `apps/web/src/shared/lib/query-client.ts` | New | QueryClient with staleTime config |
| `apps/web/src/shared/lib/query-keys.ts` | New | Centralized query key factory |
| `apps/web/src/shared/hooks/use-debounce.ts` | New | Generic debounce hook |
| `apps/web/src/shared/hooks/use-online-status.ts` | New | Navigator.onLine wrapper |
| `apps/web/package.json` | Modified | Add @tanstack/react-table, @tanstack/react-query, flatpickr |

## Install Plan

### New npm packages (apps/web)
```
@tanstack/react-table@^8.x    # DataTable headless table engine
@tanstack/react-query@^5.x    # Query infrastructure (not currently installed)
flatpickr@^4.x                 # DatePicker calendar widget
```

### Already installed (no action needed)
- `@radix-ui/react-dialog` ✓ (for Modal)
- `react-hook-form` ✓ (for FormField)
- `@hookform/resolvers` ✓ (for Zod integration)
- `zod` ✓ (for validation schemas)
- `tailwind-merge` ✓ (for class composition)

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Flatpickr styling conflicts with Tailwind v4 | Medium | Use CSS-in-JS wrapper with `!important` overrides; consider react-datepicker as alternative if issues persist |
| TanStack Table v8 + Next.js 15 SSR issues | Low | Use `'use client'` directive; TanStack Table is headless and SSR-compatible |
| TanStack Query not yet installed | Low | Simple `pnpm add`; no migration needed |
| DataTable complexity exceeds scope | Medium | Start with basic server-side pagination/sorting; defer column resizing, row grouping to future iteration |
| DatePicker accessibility with flatpickr | Medium | Ensure ARIA labels; flatpickr has basic a11y but may need enhancement |
| Dark mode inconsistencies | Low | Follow button.tsx pattern; test all components in both modes |

## Rollback Plan

1. Remove added npm packages: `pnpm remove @tanstack/react-table @tanstack/react-query flatpickr`
2. Delete all new files in `shared/components/ui/`, `shared/lib/`, `shared/hooks/`
3. No existing code is modified — pure addition, so rollback is clean

## Dependencies

- PRD v1.0.0 approved (§10, §11 define component architecture)
- Exploration F2-SHARED completed (engram #42)
- Existing button.tsx pattern established
- Radix UI primitives already in use

## Success Criteria

- [ ] All 11 new files created following button.tsx pattern
- [ ] All components render correctly in light and dark mode
- [ ] DataTable supports server-side pagination, sorting, and filtering
- [ ] FormField integrates with React Hook Form and Zod validation
- [ ] DatePicker provides calendar selection with Tailwind-styled UI
- [ ] query-client.ts configured with staleTimes: list=30s, detail=5min, catalog=Infinity
- [ ] All components have TypeScript strict mode compliance
- [ ] No TypeScript errors (`pnpm typecheck` passes)
- [ ] No ESLint errors (`pnpm lint` passes)

## Component Specifications

### UI Atoms
- **Input**: Props for label, error, disabled, variant (default/error/success), size (sm/md/lg)
- **Skeleton**: Props for width, height, variant (text/circular/rectangular), animation (pulse/wave)

### UI Molecules
- **FormField**: Wraps RHF Controller; props: name, label, rules, render (slot for input component)
- **DatePicker**: Flatpickr wrapper; props: value, onChange, minDate, maxDate, disabled, placeholder
- **Pagination**: Props: currentPage, totalPages, onPageChange, pageSize, totalItems

### UI Organisms
- **DataTable**: Generic `<TData>` wrapper; props: columns, data, pageCount, onPaginationChange, onSortingChange, onFilterChange
- **Modal**: Radix Dialog wrapper; props: open, onClose, title, size (sm/md/lg/xl), children

### Query Infrastructure
- **query-client.ts**: `new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })`
- **query-keys.ts**: Factory pattern `{ all: ['entity'] as const, lists: () => [...all, 'list'] as const, ... }`

### Shared Hooks
- **use-debounce.ts**: `<T>(value: T, delay: number) => T` — standard debounce with useEffect
- **use-online-status.ts**: `() => boolean` — navigator.onLine with online/offline event listeners
