# GanaTrack — SDD Changes Index

> Generated: 2026-04-03 | Source: Engram persistent memory | Format: openspec

## Overview

| # | Change | Status | Phase | Files | Created |
|---|--------|--------|-------|-------|---------|
| 1 | [monorepo-bootstrap](changes/monorepo-bootstrap/) | ✅ completed | archive | 6 | 2026-03-31 |
| 2 | [auth-frontend](changes/auth-frontend/) | ✅ completed | archive | 7 | 2026-04-01 |
| 3 | [layout-navigation](changes/layout-navigation/) | ✅ completed | archive | 7 | 2026-04-01 |
| 4 | [shared-components](changes/shared-components/) | ✅ completed | apply | 7 | 2026-04-02 |
| 5 | [F2-predios](changes/F2-predios/) | 🔲 in-progress | tasks | 6 | 2026-04-02 |
| 6 | [F2-maestros](changes/F2-maestros/) | ✅ completed | apply | 2 | 2026-04-03 |
| 7 | [F2-animales](changes/F2-animales/) | ✅ completed | apply | 2 | 2026-04-03 |
| 8 | [F2-config](changes/F2-config/) | ✅ completed | apply | 2 | 2026-04-03 |
| 9 | [F3-servicios](changes/F3-servicios/) | 🔲 in-progress | apply | 7 | 2026-04-03 |
| 10 | [F3-productos-imagenes](changes/F3-productos-imagenes/) | 🔲 in-progress | design | 3 | 2026-04-03 |
| 11 | [F4-reportes](changes/F4-reportes/) | ✅ completed | archive | 6 | 2026-04-03 |

**Total: 55 files across 11 changes**

## Pipeline Status

```
monorepo-bootstrap:  explore → propose → spec → design → tasks → apply → verify → archive ✅
auth-frontend:       explore → propose → spec → design → tasks → apply → verify → archive ✅
layout-navigation:   explore → propose → spec → design → tasks → apply → verify → archive ✅
shared-components:   explore → propose → spec → design → tasks → apply                ✅
F2-predios:          explore → propose → spec → design → tasks                         🔲
F2-maestros:         apply                                                            ✅ (no planning artifacts)
F2-animales:         apply                                                            ✅ (no planning artifacts)
F2-config:           apply                                                            ✅ (no planning artifacts)
F3-servicios:        explore → propose → spec → design → tasks → apply                🔲
F3-productos-imagenes: propose → design                                                  🔲 (spec & tasks pending)
F4-reportes:         propose → spec → design → tasks → apply → verify → archive       ✅
```

## Change Details

### 1. monorepo-bootstrap
Bootstrap Turborepo + pnpm monorepo for GanaTrack.
- **Files**: explore.md, proposal.md, spec.md, design.md, tasks.md, state.yaml
- **Key**: Monorepo structure, shared packages, tsconfig, apps/web scaffolded from scratch

### 2. auth-frontend
Complete frontend authentication — login, 2FA, token refresh, RBAC, multi-predio switching.
- **Files**: explore.md, proposal.md, spec.md, design.md, tasks.md, apply-progress.md, state.yaml
- **Key**: 25 tasks, 9 phases, mock-first approach, Zustand auth store

### 3. layout-navigation
Authenticated dashboard shell — sidebar, header, breadcrumbs, notification bell.
- **Files**: explore.md, proposal.md, spec.md, design.md, tasks.md, apply-progress.md, state.yaml
- **Key**: 17 tasks, centralized navigation config, RBAC-filtered sidebar, Tailwind dark mode

### 4. shared-components
Reusable component library — Input, Select, DataTable, Toast, Dialog, Pagination.
- **Files**: explore.md, proposal.md, spec.md, design.md, tasks.md, apply-progress.md, state.yaml
- **Key**: 13 tasks, TanStack Query keys, form patterns, Radix UI primitives

### 5. F2-predios
CRUD completo de Predios — predios, potreros, sectores, lotes, grupos.
- **Files**: explore.md, proposal.md, spec.md, design.md, tasks.md, state.yaml
- **Key**: Multi-sub-resource CRUD, Zod schemas, Interface+Factory service pattern

### 6. F2-maestros
Generic CRUD for 8 Colombian cattle farm master data entities.
- **Files**: apply-progress.md, state.yaml
- **Key**: 4 tasks, generic MaestroForm component, 8 entity types. No planning artifacts (was part of F2-NÚCLEO pipeline).

### 7. F2-animales
Core cattle management module — CRUD for animals, genealogy tree, bulk ops, state changes.
- **Files**: apply-progress.md, state.yaml
- **Key**: 8 tasks (TASK-FE-2-22 to 2-29), AnimalTable + AnimalForm + AnimalDetail + GenealogiaTree, 163 tests. No planning artifacts.

### 8. F2-config
Configuration module — 5 editable catalogs (razas, condiciones corporales, tipos explotación, calidad animal, colores).
- **Files**: apply-progress.md, state.yaml
- **Key**: Reuses MaestroTable/MaestroForm from maestros, 141 tests. No planning artifacts.

### 9. F3-servicios
Servicios reproductivos — palpaciones, inseminaciones, partos.
- **Files**: explore.md, proposal.md, spec.md, design.md, tasks.md, apply-progress.md, state.yaml
- **Key**: 35 new files, wizard 3-step form, event-based service model

### 10. F3-productos-imagenes
Productos CRUD + Imágenes Upload/Gallery — Phase 3 (Weeks 5-6).
- **Files**: proposal.md, design.md, state.yaml
- **Key**: 33 new files planned, react-dropzone, Zustand upload queue, XHR progress tracking, CSS Grid gallery. In design phase — spec and tasks pending.

### 11. F4-reportes
Reportes — 5 dashboards con ApexCharts, exportación async con polling.
- **Files**: proposal.md, spec.md, design.md, tasks.md, archive-report.md, state.yaml
- **Key**: 5 report types, KPI dashboard, async export with polling, Zustand filter store sync

## Notes

- **F2-maestros, F2-animales, F2-config**: No tienen artifacts de planeación separados (explore, proposal, spec, design). Fueron implementados directamente como parte del pipeline F2-NÚCLEO. Solo tienen apply-progress.
- **F4-reportes**: No tiene explore.md — la exploración fue implícita o parte de otro cambio.
- All content sourced directly from Engram — no summarization or modification applied.
