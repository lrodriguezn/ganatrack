# Proposal: Fase 6 - Calidad Backend

## Intent

Mejorar calidad backend mediante testing, linting, coverage y refactorización de módulos críticos (auth, usuarios, notificaciones).

## Scope

### In Scope
- Configurar Vitest, ESLint 9 y coverage (80%) para backend
- Crear tests unitarios para auth, usuarios, notificaciones
- Refactorizar código y corregir linting en módulos críticos

### Out of Scope
- Frontend, nuevas funcionalidades, cambios de API

## Capabilities

### New Capabilities
- `backend-quality-assurance`: Testing, linting y coverage para backend

### Modified Capabilities
None — no API spec changes.

## Approach

1. **Infraestructura**: Configurar Vitest (coverage 80%), ESLint 9
2. **Tests**: Crear unit tests para auth, usuarios, notificaciones
3. **Calidad**: Ejecutar ESLint, corregir errores, refactorizar
4. **Verificación**: Judgment Day, asegurar tests pasan y coverage >= 80%

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/eslint.config.js` | New | ESLint 9 config |
| `apps/api/vitest.config.ts` | Modified | Coverage thresholds 80% |
| `apps/api/src/modules/auth/` | Modified | Tests + refactor |
| `apps/api/src/modules/usuarios/` | Modified | Tests + refactor |
| `apps/api/src/modules/notificaciones/` | Modified | Tests + refactor |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking changes refactor | Media | Judgment Day review antes de archivar |
| Tests flaky | Baja | Mocks, aislamiento |
| ESLint conflictivo | Media | Reglas base TypeScript + node |

## Rollback Plan

1. Revertir commits fase 6
2. Eliminar `eslint.config.js`
3. Revertir `package.json`, `vitest.config.ts`
4. Eliminar archivos test creados
5. Restaurar código original desde git

## Dependencies

- `vitest`, `@vitest/coverage-v8` (existentes)
- ESLint 9 (nuevo)
- Node.js 20+

## Success Criteria

- [ ] ESLint 9 configurado y sin errores en backend
- [ ] Coverage >= 80% en backend
- [ ] Tests unitarios para auth, usuarios, notificaciones creados y pasando
- [ ] Código crítico pasa ESLint
- [ ] Judgment Day ejecutado y aprobado
- [ ] Scripts test: `pnpm --filter @ganatrack/api test`
