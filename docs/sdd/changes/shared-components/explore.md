**What**: Completed exploration of shared components needed for GanaTrack Phase 2 (F2-SHARED)
**Why**: To understand current state, identify missing components, and plan implementation approach
**Where**: apps/web/src/shared/components/ui/, apps/web/src/shared/lib/, apps/web/src/shared/hooks/
**Learned**: 
- Existing UI atoms: badge.tsx, button.tsx, dropdown-menu.tsx, separator.tsx, tooltip.tsx
- No existing Input, Skeleton, FormField, DatePicker, Pagination, DataTable, or Modal components
- No existing shared hooks directory
- Current lib files: api-client.ts, errors.ts, navigation.config.ts
- Missing query-client.ts and query-keys.ts
- Stack uses Next.js 15, React 18, Tailwind v4, Radix UI
- Need to install @tanstack/react-table and flatpickr
- Tailwind v4 is configured with custom theme and utilities
- Architecture follows Screaming Architecture with shared components in shared/components/ui/
- Existing patterns use twMerge for Tailwind class merging
- Radix UI primitives are already installed and used (dropdown-menu, tooltip, separator)
- Missing @radix-ui/react-dialog for Modal implementation
- No existing table or date picker implementations found

## Exploration: Shared Components (F2-SHARED)

### Current State Analysis

**Existing UI Atoms (already implemented in layout-navigation):**
- `shared/components/ui/button.tsx` — 4 variants, 3 sizes, loading state
- `shared/components/ui/badge.tsx` — count display with max cap
- `shared/components/ui/dropdown-menu.tsx` — Radix DropdownMenu wrapper
- `shared/components/ui/tooltip.tsx` — Radix Tooltip wrapper
- `shared/components/ui/separator.tsx` — Radix Separator wrapper

**Missing UI Components:**
- Input (form fields)
- Skeleton (loading placeholders)
- FormField (RHF + Zod integration)
- DatePicker (calendar widget)
- Pagination (page navigation)
- DataTable (TanStack Table wrapper)
- Modal (Radix Dialog wrapper)

**Existing Infrastructure:**
- `shared/lib/api-client.ts` — HTTP client
- `shared/lib/errors.ts` — Error types
- `shared/lib/navigation.config.ts` — Navigation menu config
- `shared/providers/app-providers.tsx` — App-level providers

**Missing Infrastructure:**
- `shared/lib/query-client.ts` — TanStack Query client
- `shared/lib/query-keys.ts` — Query key factory
- `shared/hooks/` — Shared hooks directory (doesn't exist)

### Component Requirements from PRD

#### §11 — Arquitectura de Componentes

**Atomic Design Hierarchy:**
- Atoms: Input, Skeleton
- Molecules: FormField, DatePicker, Pagination
- Organisms: DataTable, Modal

**Shared Hooks:**
- `useDebounce` — for search/filter debouncing
- `useOnlineStatus` — for offline detection

#### §10 — Arquitectura de Tablas

**DataTable Requirements:**
- Server-side pagination
- Server-side sorting
- Server-side filtering
- Row selection with bulk actions
- Loading skeleton states
- Empty state handling
- Generic `<TData>` typing

### Dependency Analysis

**Already Installed:**
- `@radix-ui/react-dialog` — for Modal
- `react-hook-form` — for FormField
- `@hookform/resolvers` — for Zod integration
- `zod` — for validation schemas
- `tailwind-merge` — for class composition

**Need to Install:**
- `@tanstack/react-table@^8.x` — DataTable engine
- `@tanstack/react-query@^5.x` — Query infrastructure
- `flatpickr@^4.x` — DatePicker calendar widget

### Pattern Analysis

**Existing button.tsx Pattern:**
```typescript
// forwardRef + twMerge + variant map
const button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
```

All new components should follow this pattern:
1. `forwardRef` for DOM access
2. `twMerge` for class composition
3. Tailwind v4 dark mode classes (`dark:`)
4. TypeScript strict mode with explicit interfaces

### Risks and Gotchas

1. **Flatpickr + Tailwind v4**: CSS conflicts likely — flatpickr has its own styles that may conflict with Tailwind v4's preflight. Need wrapper approach with CSS overrides.
2. **TanStack Table SSR**: Headless table is SSR-compatible but needs `'use client'` directive for interactive features.
3. **FormField Complexity**: RHF Controller pattern needs careful typing to work with Zod schemas.
4. **DataTable Scope**: Server-side features are complex — start with pagination + sorting, defer filtering to future.

### Recommended Approach

**Single SDD change** for all shared components:
- ~11 new files, ~800 lines estimated
- All components are foundational with no inter-dependencies
- Reduces overhead vs. splitting into multiple changes

**Phase Order:**
1. Infrastructure (query-client, query-keys, hooks)
2. UI Atoms (Input, Skeleton)
3. UI Molecules (FormField, DatePicker, Pagination)
4. UI Organisms (DataTable, Modal)
5. Integration (QueryClientProvider in app-providers)
