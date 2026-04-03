# Tasks: Shared Components — GanaTrack

## Phase 1: Infrastructure & Dependencies

- [x] **TASK-SHARED-01** — Install npm packages: `@tanstack/react-table`, `@tanstack/react-query`, `flatpickr`
  - File: `apps/web/package.json` (modified) — ALREADY INSTALLED
- [x] **TASK-SHARED-02** — Create `query-client.ts` with QueryClient singleton (staleTime: list=30s, detail=5min, catalog=Infinity)
  - File: `apps/web/src/shared/lib/query-client.ts` — ALREADY EXISTED
- [x] **TASK-SHARED-03** — Create `query-keys.ts` with type-safe key factory (animales, sitios, predios)
  - File: `apps/web/src/shared/lib/query-keys.ts` (new)
- [x] **TASK-SHARED-04** — Create `use-debounce.ts` hook: `<T>(value: T, delay: number) => T`
  - File: `apps/web/src/shared/hooks/use-debounce.ts` (new)
- [x] **TASK-SHARED-05** — Create `use-online-status.ts` hook: `() => boolean` with online/offline listeners
  - File: `apps/web/src/shared/hooks/use-online-status.ts` (new)

## Phase 2: UI Atoms

- [x] **TASK-SHARED-06** — Create `input.tsx` atom with label, error, disabled, variant (default/error/success), size (sm/md/lg)
  - File: `apps/web/src/shared/components/ui/input.tsx` (new)
- [x] **TASK-SHARED-07** — Create `skeleton.tsx` atom with width, height, variant (text/circular/rectangular), animation (pulse/wave)
  - File: `apps/web/src/shared/components/ui/skeleton.tsx` (new)

## Phase 3: UI Molecules

- [x] **TASK-SHARED-08** — Create `form-field.tsx` molecule: RHF Controller wrapper with error display
  - File: `apps/web/src/shared/components/ui/form-field.tsx` (new)
- [x] **TASK-SHARED-09** — Create `date-picker.tsx` molecule: flatpickr wrapper with Tailwind styling
  - File: `apps/web/src/shared/components/ui/date-picker.tsx` (new)
- [x] **TASK-SHARED-10** — Create `pagination.tsx` molecule: page navigation controls
  - File: `apps/web/src/shared/components/ui/pagination.tsx` (new)

## Phase 4: UI Organisms

- [x] **TASK-SHARED-11** — Create `data-table.tsx` organism: TanStack Table v8 generic wrapper with server-side pagination/sorting/filtering
  - File: `apps/web/src/shared/components/ui/data-table.tsx` (new)
- [x] **TASK-SHARED-12** — Create `modal.tsx` organism: Radix Dialog wrapper with size variants (sm/md/lg/xl)
  - File: `apps/web/src/shared/components/ui/modal.tsx` (new)

## Phase 5: Integration

- [x] **TASK-SHARED-13** — Add QueryClientProvider to `app-providers.tsx`
  - File: `apps/web/src/shared/providers/app-providers.tsx` (modified)

---

## Summary
| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1 | 5 | ✅ Complete |
| Phase 2 | 2 | ✅ Complete |
| Phase 3 | 3 | ✅ Complete |
| Phase 4 | 2 | ✅ Complete |
| Phase 5 | 1 | ✅ Complete |
| **Total** | **13** | **✅ All Complete** |
