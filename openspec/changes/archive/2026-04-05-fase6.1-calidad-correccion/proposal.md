# Proposal: Fase 6.1 - Corrección de Calidad Backend

## Intent

Corregir problemas críticos de calidad descubiertos tras re-evaluación de fase6-calidad-backend: tests fallando, assertions inútiles en E2E, falta de infraestructura de tests, cobertura ausente en 8 módulos, e inconsistencia de nombrado.

## Scope

### In Scope
- **Fix failing tests (2)**: verify-2fa tests usan mock con texto plano pero implementación espera hash bcrypt
- **Fix E2E assertions**: Reemplazar `expect([200,401,500]).toContain(status)` con assertions específicas
- **Test infrastructure**: Crear `src/__tests__/helpers/` con factories y mock builders
- **Unit tests para 8 módulos sin cobertura**: animales (16 use cases), servicios, predios, configuracion (30+ use cases), productos, reportes (12 use cases), imagenes, maestros (25+ use cases)
- **Repository tests para auth y usuarios**: Solo notificaciones tiene tests de repositorio
- **Naming standardization**: Renombrar `.test.ts` → `.spec.ts`, actualizar vitest.config.ts
- **Actualizar vitest.config.ts**: Incluir `src/**/*.spec.ts`, ajustar thresholds para nuevos módulos

### Out of Scope
- Frontend changes
- Nuevos endpoints API
- Cambios de lógica de negocio
- Cambios de esquema de base de datos

## Capabilities

### New Capabilities
None — este cambio es puramente correctivo y de infraestructura de calidad.

### Modified Capabilities
None — no hay cambios a especificaciones de API.

## Approach

**Fase 1 - Fixes Inmediatos** (Día 1)
1. Fix verify-2fa tests: generar hash bcrypt en mock (`await bcrypt.hash('123456', 12)`)
2. Fix happy path test y expired code test que fallan
3. Fix cada E2E assertion: `expect(response.statusCode).toBe(200)` (no array.contains)

**Fase 2 - Infraestructura** (Día 1-2)
1. Crear `src/__tests__/helpers/factories/` con entity factories
2. Crear `src/__tests__/helpers/mocks/` con repository mock builders
3. Crear `src/__tests__/helpers/fixtures/` con datos de prueba comunes

**Fase 3 - Módulos Sin Cobertura** (Día 2-5)
1. animales: domain services, use cases, mappers, repository
2. servicios: usar patrón existente de notificaciones
3. predios: domain services, use cases, mappers
4. configuracion: priorizar use cases críticos
5. productos, reportes, imagenes, maestros

**Fase 4 - Naming Cleanup** (Día 5)
1. Renombrar todos los `.test.ts` → `.spec.ts`
2. Actualizar vitest.config.ts: `include: ['src/**/*.spec.ts']`

**Fase 5 - Verificación**
1. Ejecutar `pnpm test` - todos pasando
2. Ejecutar `pnpm test:coverage` - coverage >= 80%

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/modules/auth/application/use-cases/__tests__/verify-2fa.use-case.test.ts` | Modified | Fix bcrypt hash in mocks |
| `apps/api/src/__tests__/e2e/auth.e2e.test.ts` | Modified | Replace useless assertions |
| `apps/api/src/__tests__/helpers/` | New | Test factories and mock builders |
| `apps/api/src/modules/animales/**/__tests__/` | New | Unit tests for 16+ use cases |
| `apps/api/src/modules/servicios/**/__tests__/` | New | Unit tests |
| `apps/api/src/modules/predios/**/__tests__/` | New | Unit tests |
| `apps/api/src/modules/configuracion/**/__tests__/` | New | Unit tests for 30+ use cases |
| `apps/api/src/modules/productos/**/__tests__/` | New | Unit tests |
| `apps/api/src/modules/reportes/**/__tests__/` | New | Unit tests for 12 use cases |
| `apps/api/src/modules/imagenes/**/__tests__/` | New | Unit tests |
| `apps/api/src/modules/maestros/**/__tests__/` | New | Unit tests for 25+ use cases |
| `apps/api/src/modules/auth/**/__tests__/` | New | Repository tests |
| `apps/api/src/modules/usuarios/**/__tests__/` | New | Repository tests |
| `apps/api/vitest.config.ts` | Modified | Update include pattern to `.spec.ts` |
| All `*.test.ts` files | Renamed | → `*.spec.ts` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Coverage threshold adjustments needed | Medium | Per-module thresholds in vitest.config.ts, start conservative |
| Time-intensive for configuracion/maestros (55+ use cases combined) | High | Prioritize critical paths, mark others as skip with todos |
| bcrypt hash generation slows tests | Low | Pre-compute hashes in fixtures, use `bcrypt.hash()` only where dynamic |
| Renaming breaks imports | Low | Automated find/replace, run tests after each batch |

## Rollback Plan

1. `git revert` commits de fase 6.1
2. Restaurar vitest.config.ts desde git
3. Eliminar `src/__tests__/helpers/`
4. Eliminar tests de módulos nuevos
5. Revertir renombrado de `.test.ts` → `.spec.ts`
6. Ejecutar tests originales para verificar restauración

## Dependencies

- vitest (existente)
- @vitest/coverage-v8 (existente)
- bcrypt (existente) - para generar hashes en test fixtures

## Success Criteria

- [ ] Todos los tests pasan (`pnpm test` retorna 0 failures)
- [ ] Coverage global >= 80%
- [ ] Coverage >= 85% para auth, usuarios, notificaciones
- [ ] E2E tests tienen assertions específicas (no array.contains)
- [ ] Infraestructura de tests (factories, helpers) creada
- [ ] 11 módulos tienen unit tests completos
- [ ] Todos los archivos test usan extensión `.spec.ts`
- [ ] vitest.config.ts incluye `.spec.ts` pattern