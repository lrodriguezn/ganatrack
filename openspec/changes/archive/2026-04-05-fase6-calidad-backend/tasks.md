# Tasks: Fase 6 - Calidad Backend

## Phase 1: Infraestructura (ESLint, Vitest config)

- [ ] 1.1 Crear `apps/api/eslint.config.js` con configuración ESLint 9 flat config
- [ ] 1.2 Instalar dependencias ESLint 9: `typescript-eslint`, `@eslint/js`, `eslint`
- [ ] 1.3 Actualizar `apps/api/package.json` con script `lint` y dependencias dev
- [ ] 1.4 Actualizar `apps/api/vitest.config.ts` con thresholds de cobertura (80% global, 85% críticos)

## Phase 2: Tests Unitarios (auth, usuarios, notificaciones)

- [ ] 2.1 Escribir tests para LoginUseCase (escenarios exito/fracaso)
- [ ] 2.2 Escribir tests para AuthDomainService (autenticación, tokens)
- [ ] 2.3 Escribir tests para AuthMapper (transformación de datos)
- [ ] 2.4 Escribir tests para GetPerfilUseCase (obtención de perfil)
- [ ] 2.5 Escribir tests para UpdatePerfilUseCase (actualización de perfil)
- [ ] 2.6 Escribir tests para UsuarioMapper (transformación de datos)
- [ ] 2.7 Mover archivos test de notificaciones a ubicación estándar (`__tests__`)
- [ ] 2.8 Renombrar archivos `.spec.ts` a `.test.ts` en notificaciones
- [ ] 2.9 Escribir tests faltantes para módulo notificaciones (crear notificación, envío)

## Phase 3: Refactorización y Linting

- [ ] 3.1 Ejecutar `pnpm lint` en apps/api y corregir errores en auth
- [ ] 3.2 Ejecutar `pnpm lint` y corregir errores en usuarios
- [ ] 3.3 Ejecutar `pnpm lint` y corregir errores en notificaciones
- [ ] 3.4 Verificar que todos los tests pasan después de refactorización

## Phase 4: Verificación y Archivo

- [ ] 4.1 Ejecutar `pnpm test` y verificar que todos los tests pasan
- [ ] 4.2 Ejecutar `pnpm lint` y verificar 0 errores críticos
- [ ] 4.3 Ejecutar `pnpm test:coverage` y verificar cobertura >= 80%
- [ ] 4.4 Ejecutar Judgment Day para revisión adversarial final
- [ ] 4.5 Guardar tareas en Engram (sdd/fase6-calidad-backend/tasks)
