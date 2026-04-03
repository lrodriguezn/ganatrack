**What**: Investigated existing patterns for F2-PREDIOS module implementation
**Why**: Need to understand current architecture, patterns, and requirements before building the predios module
**Where**: apps/web/src/modules/auth/, packages/shared-types/src/, apps/web/src/store/predio.store.ts, apps/web/src/shared/components/layout/sitio-selector.tsx
**Learned**: 
- Auth module follows clear pattern: components/, hooks/, services/, schemas/
- Predio store already exists with setPredios, switchPredio, clearPredios
- SitioSelector component handles predio switching UI
- Shared types has Predio schema with id (uuid), nombre, departamento, municipio, area, estado
- Navigation config shows predios routes: /dashboard/predios/potreros, sectores, lotes, grupos
- Query keys factory has predios key factory
- Need to create predios module with forms, tables, and hooks for CRUD operations
