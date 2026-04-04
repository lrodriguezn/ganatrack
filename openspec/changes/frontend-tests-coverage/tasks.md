# Tasks: Frontend Tests Coverage

## Phase 1: Foundation (2 tasks)

- [ ] 1.1 Inspect existing test pattern in `apps/web/src/tests/modules/animales/use-animales.test.ts` for mock service, wrapper, and test structure
- [ ] 1.2 Verify hooks exist in source: check `apps/web/src/modules/notificaciones/`, `servicios/`, `predios/`, `productos/`, `imagenes/` for corresponding hooks

## Phase 2: Notificaciones Module (4 tests)

- [ ] 2.1 Create `apps/web/src/tests/modules/notificaciones/use-notificaciones.test.ts` - query hook tests for pagination, loading, error states
- [ ] 2.2 Create `apps/web/src/tests/modules/notificaciones/use-notificaciones-resumen.test.ts` - query hook tests for summary with unread count
- [ ] 2.3 Create `apps/web/src/tests/modules/notificaciones/use-mark-read.test.ts` - mutation tests with query invalidation
- [ ] 2.4 Create `apps/web/src/tests/modules/notificaciones/notificaciones.service.test.ts` - service layer tests

## Phase 3: Servicios Module (12 tests)

- [ ] 3.1 Create `apps/web/src/tests/modules/servicios/use-palpaciones.test.ts` - list query hook tests
- [ ] 3.2 Create `apps/web/src/tests/modules/servicios/use-palpacion.test.ts` - detail query hook tests
- [ ] 3.3 Create `apps/web/src/tests/modules/servicios/use-create-palpacion.test.ts` - create mutation tests
- [ ] 3.4 Create `apps/web/src/tests/modules/servicios/use-inseminaciones.test.ts` - list query hook tests
- [ ] 3.5 Create `apps/web/src/tests/modules/servicios/use-inseminacion.test.ts` - detail query hook tests
- [ ] 3.6 Create `apps/web/src/tests/modules/servicios/use-create-inseminacion.test.ts` - create mutation tests
- [ ] 3.7 Create `apps/web/src/tests/modules/servicios/use-partos.test.ts` - list query hook tests
- [ ] 3.8 Create `apps/web/src/tests/modules/servicios/use-create-parto.test.ts` - create mutation tests
- [ ] 3.9 Create `apps/web/src/tests/modules/servicios/use-servicios-veterinarios.test.ts` - list query hook tests
- [ ] 3.10 Create `apps/web/src/tests/modules/servicios/use-servicio-veterinario.test.ts` - detail query hook tests
- [ ] 3.11 Create `apps/web/src/tests/modules/servicios/use-create-servicio-veterinario.test.ts` - create mutation tests with validation handling

## Phase 4: Predios Module (9 tests)

- [ ] 4.1 Create `apps/web/src/tests/modules/predios/use-predios.test.ts` - list query with search filtering
- [ ] 4.2 Create `apps/web/src/tests/modules/predios/use-predio.test.ts` - detail query hook tests
- [ ] 4.3 Create `apps/web/src/tests/modules/predios/use-create-predio.test.ts` - create mutation with optimistic update
- [ ] 4.4 Create `apps/web/src/tests/modules/predios/use-update-predio.test.ts` - update mutation with query invalidation
- [ ] 4.5 Create `apps/web/src/tests/modules/predios/use-delete-predio.test.ts` - delete mutation with optimistic removal
- [ ] 4.6 Create `apps/web/src/tests/modules/predios/use-potreros.test.ts` - query with key pattern validation
- [ ] 4.7 Create `apps/web/src/tests/modules/predios/use-sectores.test.ts` - query tests for sectores
- [ ] 4.8 Create `apps/web/src/tests/modules/predios/use-lotes.test.ts` - query tests for lotes
- [ ] 4.9 Create `apps/web/src/tests/modules/predios/use-grupos.test.ts` - query tests for grupos

## Phase 5: Productos Module (5 tests)

- [ ] 5.1 Create `apps/web/src/tests/modules/productos/use-productos.test.ts` - list query with filters
- [ ] 5.2 Create `apps/web/src/tests/modules/productos/use-producto.test.ts` - detail query hook tests
- [ ] 5.3 Create `apps/web/src/tests/modules/productos/use-create-producto.test.ts` - create mutation tests
- [ ] 5.4 Create `apps/web/src/tests/modules/productos/use-update-producto.test.ts` - update mutation tests
- [ ] 5.5 Create `apps/web/src/tests/modules/productos/use-delete-producto.test.ts` - delete mutation with query cleanup

## Phase 6: Imagenes Module (3 tests)

- [ ] 6.1 Create `apps/web/src/tests/modules/imagenes/use-imagenes.test.ts` - query tests for entity images
- [ ] 6.2 Create `apps/web/src/tests/modules/imagenes/use-upload-imagen.test.ts` - upload mutation with queue handling
- [ ] 6.3 Create `apps/web/src/tests/modules/imagenes/use-delete-imagen.test.ts` - delete mutation with cache cleanup

## Phase 7: Verification (2 tasks)

- [ ] 7.1 Run `pnpm test` to verify all 32 test files pass
- [ ] 7.2 Verify test coverage increased for all modules