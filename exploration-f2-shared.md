# Exploration: F2-SHARED — Shared Components for GanaTrack

## Current State

The GanaTrack frontend currently has a basic shared components structure with:

- **Existing UI Atoms** (5 components):
  - `badge.tsx` - Notification count badge
  - `button.tsx` - Primary button with variants (primary, secondary, ghost, danger) and sizes (sm, md, lg)
  - `dropdown-menu.tsx` - Radix UI DropdownMenu wrapper
  - `separator.tsx` - Radix UI Separator wrapper
  - `tooltip.tsx` - Radix UI Tooltip wrapper

- **Existing Shared Lib** (3 files):
  - `api-client.ts` - Configured ky instance with auth interceptors
  - `errors.ts` - ApiError class and normalization utilities
  - `navigation.config.ts` - Sidebar navigation configuration

- **Missing Shared Hooks** - No hooks directory exists yet

- **Tech Stack**: Next.js 15, React 18, Tailwind CSS v4, Radix UI primitives

## Affected Areas

### Components to Create
- `shared/components/ui/input.tsx` - Form input atom
- `shared/components/ui/skeleton.tsx` - Loading skeleton atom
- `shared/components/ui/form-field.tsx` - RHF + Zod integrated molecule
- `shared/components/ui/date-picker.tsx` - Flatpickr-based molecule
- `shared/components/ui/pagination.tsx` - Pagination controls molecule
- `shared/components/ui/data-table.tsx` - TanStack Table v8 wrapper organism
- `shared/components/ui/modal.tsx` - Radix Dialog wrapper organism

### Libraries to Implement
- `shared/lib/query-client.ts` - Query client with stale time configuration
- `shared/lib/query-keys.ts` - Centralized query key factory

### Hooks to Create
- `shared/hooks/use-permission.ts` - RBAC permission checking
- `shared/hooks/use-debounce.ts` - Debounce utility
- `shared/hooks/use-online-status.ts` - Online/offline detection

### Dependencies to Install
- `@tanstack/react-table@8.x` - For DataTable implementation
- `flatpickr` - For DatePicker implementation
- `@radix-ui/react-dialog` - For Modal implementation

## Approaches

### 1. **Monolithic SDD Change**
- Implement all F2-SHARED tasks in a single SDD change
- Pros: Complete foundation in one go, no partial implementations
- Cons: Large scope, higher risk, longer implementation time
- Effort: High

### 2. **Modular SDD Changes**
- Split into logical sub-changes:
  - Change 1: UI Components (atoms + molecules)
  - Change 2: Organisms (DataTable + Modal)
  - Change 3: Query Infrastructure (query-client + query-keys)
  - Change 4: Shared Hooks
- Pros: Smaller scope, easier review, incremental progress
- Cons: Multiple changes to manage, potential dependencies between changes
- Effort: Medium

### 3. **Hybrid Approach**
- Group by logical dependencies:
  - Change 1: UI Components + Query Infrastructure (foundational)
  - Change 2: Shared Hooks (depends on query infrastructure)
- Pros: Balanced scope, logical grouping
- Cons: Still requires careful dependency management
- Effort: Medium

## Recommendation

**Hybrid Approach** is recommended for F2-SHARED implementation:

1. **First Change**: UI Components + Query Infrastructure
   - Create all UI atoms and molecules
   - Implement query-client.ts and query-keys.ts
   - Install required dependencies
   - This provides the complete foundation for other modules

2. **Second Change**: Shared Hooks
   - Implement use-permission.ts, use-debounce.ts, use-online-status.ts
   - These depend on the query infrastructure being in place

**Rationale**: 
- UI components and query infrastructure are foundational and have no dependencies
- Shared hooks logically depend on query infrastructure
- This grouping provides clear separation while maintaining logical coherence
- Each change is substantial but not overwhelming

## Risks

- **Tailwind v4 Compatibility**: Need to ensure all new components work with Tailwind v4
- **Radix UI Integration**: Modal implementation must follow existing Radix patterns
- **TanStack Table v8**: Need to verify it works with Next.js 15 and React 18
- **Flatpickr Styling**: May require custom CSS to match Tailwind theme
- **Dependency Conflicts**: New packages must not conflict with existing setup
- **Scope Creep**: F2-SHARED is substantial - careful scoping needed

## Ready for Proposal

**Yes** - The exploration is complete and ready for proposal creation.

**Recommendations for Orchestrator**:
1. Create two SDD changes following the hybrid approach
2. First change: "F2-SHARED-UI: UI Components and Query Infrastructure"
3. Second change: "F2-SHARED-HOOKS: Shared Hooks Implementation"
4. Ensure proper dependency management between changes
5. Allocate sufficient time for testing and integration