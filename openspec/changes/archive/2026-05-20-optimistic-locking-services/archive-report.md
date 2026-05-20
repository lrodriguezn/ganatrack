# Archive Report — Issue #41: Optimistic Locking Servicios

**Change**: optimistic-locking-services
**Issue**: #41 — Replicar optimistic locking a servicios (palpaciones, inseminaciones, partos, veterinarios)
**Archived**: 2026-05-20
**Artifact Store**: hybrid (Engram + OpenSpec filesystem)

## Summary

Replicated the animales optimistic locking pattern to 4 servicios modules (palpaciones, inseminaciones, partos, veterinarios). All 4 root/grupal tables now have a `version` column, update use cases perform version checks with `VersionConflictError`, PUT routes enforce `If-Match`/`X-Resource-Version` headers, and frontend service methods attach version headers on updates.

## What Was Built

| Layer | Changes |
|-------|---------|
| **Schema** | Added `version INTEGER NOT NULL DEFAULT 1` to 4 root tables |
| **Entities** | Added `readonly version: number` to 4 domain entities |
| **DTOs** | Added `version: number` to 4 response DTOs |
| **Mappers** | Map `entity.version` → `dto.version` in 4 mappers |
| **Use Cases** | Added `expectedVersion` param + `VersionConflictError` check to 4 update use cases |
| **Routes** | 4 PUT routes with If-Match guard (400/409) + X-Resource-Version response header |
| **Frontend Types** | Added `version: number` to EventoGrupal, Parto, and derived types |
| **Frontend Service** | 4 `update*` methods with `If-Match` header in RealServiciosService |
| **Frontend Mock** | 4 `update*` methods with version bump in MockServiciosService |
| **GET Routes** | X-Resource-Version header on all 4 GET responses |

## Modified Files (29 files)

### Database
- `packages/database/src/schema/servicios.ts` — Added version to 4 root tables
- `packages/database/migrations/0001_polite_punisher.sql` — Migration generated
- `packages/database/migrations/meta/_journal.json` — Migration metadata
- `packages/database/migrations/meta/0001_snapshot.json` — Snapshot

### API — Domain
- `apps/api/src/modules/servicios/domain/entities/palpacion.entity.ts`
- `apps/api/src/modules/servicios/domain/entities/inseminacion.entity.ts`
- `apps/api/src/modules/servicios/domain/entities/parto.entity.ts`
- `apps/api/src/modules/servicios/domain/entities/veterinario.entity.ts`

### API — Application (DTOs)
- `apps/api/src/modules/servicios/application/dtos/palpacion.dto.ts`
- `apps/api/src/modules/servicios/application/dtos/inseminacion.dto.ts`
- `apps/api/src/modules/servicios/application/dtos/parto.dto.ts`
- `apps/api/src/modules/servicios/application/dtos/veterinario.dto.ts`

### API — Application (Use Cases)
- `apps/api/src/modules/servicios/application/use-cases/update-palpacion-grupal.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/update-inseminacion-grupal.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/update-parto.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/update-veterinario-grupal.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/crear-palpacion-grupal.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/crear-inseminacion-grupal.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/crear-parto.use-case.ts`
- `apps/api/src/modules/servicios/application/use-cases/crear-veterinario-grupal.use-case.ts`

### API — Infrastructure (Mappers)
- `apps/api/src/modules/servicios/infrastructure/mappers/palpacion.mapper.ts`
- `apps/api/src/modules/servicios/infrastructure/mappers/inseminacion.mapper.ts`
- `apps/api/src/modules/servicios/infrastructure/mappers/parto.mapper.ts`
- `apps/api/src/modules/servicios/infrastructure/mappers/veterinario.mapper.ts`

### API — Infrastructure (Routes)
- `apps/api/src/modules/servicios/infrastructure/http/routes/servicios.routes.ts`
- `apps/api/src/modules/servicios/infrastructure/http/controllers/servicios.controller.ts`

### API — Tests (new files)
- `apps/api/src/modules/servicios/application/use-cases/__tests__/update-palpacion-grupal.use-case.spec.ts`
- `apps/api/src/modules/servicios/application/use-cases/__tests__/update-inseminacion-grupal.use-case.spec.ts`
- `apps/api/src/modules/servicios/application/use-cases/__tests__/update-parto.use-case.spec.ts`
- `apps/api/src/modules/servicios/application/use-cases/__tests__/update-veterinario-grupal.use-case.spec.ts`
- `apps/api/src/modules/servicios/infrastructure/http/routes/__tests__/` — Integration tests

### Web
- `apps/web/src/modules/servicios/types/servicios.types.ts`
- `apps/web/src/modules/servicios/services/servicios.api.ts`
- `apps/web/src/modules/servicios/services/servicios.mock.ts`
- `apps/web/src/modules/servicios/services/servicios.service.ts`

## Final State

| Check | Result |
|-------|--------|
| **API Typecheck** | ✅ Clean |
| **Web Typecheck** | ✅ Clean |
| **API Tests** | ✅ 302 passed (34 new: 17 unit + 17 integration) |
| **Web Tests** | ✅ 570 passed |
| **Pre-existing Failures** | 2 (E2E server + producto, unrelated) |
| **Spec Compliance** | 15/15 requirements compliant |
| **Design Coherence** | 10/10 decisions followed |
| **Verification Verdict** | APPROVED |

## Deviations from Plan

**None.** Implementation followed the approved proposal, design, and spec exactly.

## Lessons Learned

1. **No txManager needed** for version bumps — each use case only touches a single root row, so the version increment is atomic within the UPDATE statement.
2. **ServiciosController is dead code** — routes are wired directly in `servicios.routes.ts` following the animales pattern. The controller was updated only to compile.
3. **Frontend has no update forms yet** — optimistic locking is backend-complete; UI testing is deferred until update forms are built.
4. **predioId=0 hardcoding preserved** — kept out of scope per approved proposal boundaries.
5. **Single PR was sufficient** — ~500-600 changed lines, medium risk on 400-line budget, but manageable as one PR with work-unit commits.

## Artifact Observation IDs (Engram Traceability)

| Artifact | Observation ID |
|----------|---------------|
| proposal | #113 |
| design | #114 |
| spec | #115 |
| tasks | #116 |
| apply-progress | #117 |
| verify-report | #118 |

## Git State

- **Base commit**: `dc1500f` — docs(repo): add SDD archive artifacts
- **Status**: 29 modified files, 5 new test files, migration artifacts
- **Branch**: main (working directory)
