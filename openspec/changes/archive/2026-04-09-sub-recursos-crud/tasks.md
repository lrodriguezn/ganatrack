# Tasks: Completar CRUD Sub-recursos del Predio

## Phase 1: Hooks Foundation (16 hooks)

### 1.1 Potreros Hooks
- [ ] 1.1.1 Create `hooks/use-create-potrero.ts` with mutation + cache invalidation
- [ ] 1.1.2 Create `hooks/use-update-potrero.ts` with mutation + cache invalidation
- [ ] 1.1.3 Create `hooks/use-delete-potrero.ts` with mutation + cache invalidation
- [ ] 1.1.4 Create `hooks/use-potrero.ts` query hook for single potrero

### 1.2 Sectores Hooks
- [ ] 1.2.1 Create `hooks/use-create-sector.ts` with mutation + cache invalidation
- [ ] 1.2.2 Create `hooks/use-update-sector.ts` with mutation + cache invalidation
- [ ] 1.2.3 Create `hooks/use-delete-sector.ts` with mutation + cache invalidation
- [ ] 1.2.4 Create `hooks/use-sector.ts` query hook for single sector

### 1.3 Lotes Hooks
- [ ] 1.3.1 Create `hooks/use-create-lote.ts` with mutation + cache invalidation
- [ ] 1.3.2 Create `hooks/use-update-lote.ts` with mutation + cache invalidation
- [ ] 1.3.3 Create `hooks/use-delete-lote.ts` with mutation + cache invalidation
- [ ] 1.3.4 Create `hooks/use-lote.ts` query hook for single lote

### 1.4 Grupos Hooks
- [ ] 1.4.1 Create `hooks/use-create-grupo.ts` with mutation + cache invalidation
- [ ] 1.4.2 Create `hooks/use-update-grupo.ts` with mutation + cache invalidation
- [ ] 1.4.3 Create `hooks/use-delete-grupo.ts` with mutation + cache invalidation
- [ ] 1.4.4 Create `hooks/use-grupo.ts` query hook for single grupo

## Phase 2: Detail Components (4 components)

- [ ] 2.1 Create `components/potrero-detail.tsx` with fields + action buttons
- [ ] 2.2 Create `components/sector-detail.tsx` with fields + action buttons
- [ ] 2.3 Create `components/lote-detail.tsx` with fields + action buttons
- [ ] 2.4 Create `components/grupo-detail.tsx` with fields + action buttons

## Phase 3: Routing Pages (12 pages)

### 3.1 Potreros Pages
- [ ] 3.1.1 Create `[id]/potreros/nuevo/page.tsx` — create form with redirect
- [ ] 3.1.2 Create `[id]/potreros/[potreroId]/page.tsx` — detail with handlers
- [ ] 3.1.3 Create `[id]/potreros/[potreroId]/edit/page.tsx` — edit form

### 3.2 Sectores Pages
- [ ] 3.2.1 Create `[id]/sectores/nuevo/page.tsx` — create form with redirect
- [ ] 3.2.2 Create `[id]/sectores/[sectorId]/page.tsx` — detail with handlers
- [ ] 3.2.3 Create `[id]/sectores/[sectorId]/edit/page.tsx` — edit form

### 3.3 Lotes Pages
- [ ] 3.3.1 Create `[id]/lotes/nuevo/page.tsx` — create form with redirect
- [ ] 3.3.2 Create `[id]/lotes/[loteId]/page.tsx` — detail with handlers
- [ ] 3.3.3 Create `[id]/lotes/[loteId]/edit/page.tsx` — edit form

### 3.4 Grupos Pages
- [ ] 3.4.1 Create `[id]/grupos/nuevo/page.tsx` — create form with redirect
- [ ] 3.4.2 Create `[id]/grupos/[grupoId]/page.tsx` — detail with handlers
- [ ] 3.4.3 Create `[id]/grupos/[grupoId]/edit/page.tsx` — edit form

## Phase 4: List Page Updates (4 pages)

- [ ] 4.1 Modify `potreros/page.tsx` — add onRowClick, onEdit, onDelete, "Nuevo" button
- [ ] 4.2 Modify `sectores/page.tsx` — add onRowClick, onEdit, onDelete, "Nuevo" button
- [ ] 4.3 Modify `lotes/page.tsx` — add onRowClick, onEdit, onDelete, "Nuevo" button
- [ ] 4.4 Modify `grupos/page.tsx` — add onRowClick, onEdit, onDelete, "Nuevo" button

## Phase 5: Barrel Exports (2 files)

- [ ] 5.1 Update `hooks/index.ts` — export 16 new hooks (12 mutation + 4 query)
- [ ] 5.2 Update `components/index.ts` — export 4 new detail components
