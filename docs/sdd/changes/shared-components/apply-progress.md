**What**: Created all shared components for GanaTrack web app
**Why**: Phase 2 of the GanaTrack SDD process - establishing reusable component library
**Where**: `apps/web/src/shared/components/ui/`, `apps/web/src/shared/hooks/`, `apps/web/src/shared/lib/query-keys.ts`, `apps/web/src/shared/providers/app-providers.tsx`
**Learned**: 
- flatpickr types don't export `DateOption` in v4.6.13 — used `Parameters<typeof pickerRef.current.setDate>[0]` workaround
- This project uses Tailwind v4 with custom theme tokens (brand colors, gray scale) but no `bg-muted`/`text-muted-foreground` (shadcn-style) utilities — need to use explicit gray colors
- `@tanstack/react-query` and `@tanstack/react-table` were already installed
- Radix Dialog already installed (`@radix-ui/react-dialog`)
- verbatimModuleSyntax is enabled — must use `import type` for type-only imports

## Files Created

### UI Components (shared/components/ui/)
- input.tsx — Form input with label, error, variant (default/error/success), size (sm/md/lg), textarea support
- skeleton.tsx — Loading placeholder with pulse animation, variants (circular/rectangular)
- form-field.tsx — RHF Controller wrapper with Zod error display
- date-picker.tsx — flatpickr wrapper with Tailwind styling, Spanish locale, single/range mode
- pagination.tsx — Page navigation with page size selector
- data-table.tsx — TanStack Table v8 generic wrapper with server-side pagination/sorting
- modal.tsx — Radix Dialog wrapper with size variants (sm/md/lg/xl)

### Query Infrastructure (shared/lib/)
- query-keys.ts — Type-safe query key factory for animales, sitios, predios

### Shared Hooks (shared/hooks/)
- use-debounce.ts — Generic debounce hook with configurable delay
- use-online-status.ts — Browser online/offline status detection

### Modified
- shared/providers/app-providers.tsx — Added QueryClientProvider wrapper

## Build: ✅ PASS
## Typecheck: ✅ PASS

## Gotchas Encountered
1. flatpickr v4.6.13 doesn't export `DateOption` type — workaround: `Parameters<typeof pickerRef.current.setDate>[0]`
2. No shadcn-style `bg-muted`/`text-muted-foreground` tokens in Tailwind v4 config — used explicit gray colors
3. `verbatimModuleSyntax` requires `import type` for type-only imports
