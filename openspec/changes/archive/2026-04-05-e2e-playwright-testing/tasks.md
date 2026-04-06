# Tasks: E2E Testing con Playwright

## Phase 1: Infrastructure & Auth Fixture
- [x] T1.1: Update `playwright.config.ts` with projects (chromium, firefox, mobile-chrome, mobile-safari), add globalSetup, configure reporters
- [x] T1.2: Create `tests/e2e/global-setup.ts` — API login via POST /api/v1/auth/login, persist storageState to `.playwright/auth/admin.json`
- [x] T1.3: Create `tests/e2e/fixtures/auth.fixture.ts` — extend base test with `authenticatedPage` using `storageState: '.playwright/auth/admin.json'`
- [x] T1.4: Create `tests/e2e/fixtures/twofa.fixture.ts` — fixture for 2FA flow with email `2fa@ganatrack.com` and code `123456`
- [x] T1.5: Create `tests/e2e/fixtures/index.ts` — barrel export for fixtures
- [x] T1.6: Create `tests/e2e/helpers/test-data.ts` — deterministic seed data (TEST_ANIMAL, TEST_PREDIOS) for assertions

## Phase 2: Page Objects (Complex Flows)
- [x] T2.1: Create `tests/e2e/helpers/page-objects/animales.po.ts` — Page Object with methods: `createAnimal()`, `editAnimal()`, `deleteAnimal()`, `searchAnimal()`, `selectAnimalCheckbox()`
- [x] T2.2: Create `tests/e2e/helpers/page-objects/servicios-wizard.po.ts` — Page Object with methods: `fillStep1()`, `fillStep2()`, `fillStep3()`, `submitWizard()`, `verifySummary()`
- [x] T2.3: Create `tests/e2e/helpers/page-objects/login.po.ts` — Page Object with methods: `login()`, `verify2FA()`, `logout()`

## Phase 3: Auth Flows
- [x] T3.1: Implement `auth.spec.ts` — Login completo (6 tests): éxito con credenciales válidas, error con credenciales inválidas, logout redirige a login, sesión expirada redirige a login, remember me, validación de email
- [x] T3.2: Create `auth-2fa.spec.ts` — Login + 2FA (6 tests): flujo completo 2FA exitoso, error con código inválido, redirección automática a 2FA, reenvío de código con countdown, sesión inválida

## Phase 4: CRUD & Batch Operations
- [x] T4.1: Extend `animales-crud.spec.ts` — CRUD animal completo (7 tests): crear animal con datos válidos, editar animal existente, eliminar animal, ver detalle animal, búsqueda con filtros, validación campos obligatorios, código duplicado
- [x] T4.2: Create `batch-operations.spec.ts` — Operación en lote (5 scenarios): selección múltiple animales, acción en lote "Cambiar estado", confirmación antes de ejecutar, éxito con toast, error parcial con rollback UI

## Phase 5: Services Wizards
- [x] T5.1: Create `servicios-palpacion.spec.ts` — Wizard palpación (5 tests): navegación 3 pasos completo, validación datos reproductivos, resumen previo a guardar, éxito redirige a detalle servicio, sin animales disponibles
- [x] T5.2: Create `servicios-parto.spec.ts` — Registro parto (5 tests): registro madre-cría vinculado, wizard datos nacimiento, actualización automática estado madre, historial parto visible, peso fuera rango

## Phase 6: Navigation & Reports
- [x] T6.1: Extend `predios.spec.ts` — Cambio de predio (5 tests): cambio predio desde dropdown, persistencia predio seleccionado, óptener un solo acceso, caché invalidado al cambiar, permisos por diterapkan
- [x] T6.2: Extend `reportes.spec.ts` — Exportación reportes (6 tests): selección rango fechas, formato PDF generado, formato Excel generado, polling progreso exportación, descarga archivo finalizado, error sin filtros

## Phase 7: Mobile & Offline
- [x] T7.1: Create `mobile.spec.ts` — Navegación mobile (6 tests): menú hamburguesa funcional en <768px, tabla animales scroll horizontal, formularios adaptativos, bottom sheet filtros, touch targets mínimos 44px, pull-to-refresh
- [x] T7.2: Create `offline.spec.ts` — Modo offline PWA (6 tests): banner offline visible sin conexión, datos cacheados accesibles offline, acción offline encolada, sincronización automática reconexión, manejo conflictos sincronización, navegación offline

## Phase 8: CI & Polish
- [ ] T8.1: Add GitHub Actions workflow `.github/workflows/e2e.yml` — ejecutar Playwright en CI con `continue-on-error: true` inicialmente
- [ ] T8.2: Configure screenshot/video/trace on failure en `playwright.config.ts` — `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'`
- [ ] T8.3: Run full suite local, identificar y fix flaky tests con `test.retry()` o esperas explícitas
- [ ] T8.4: Document E2E testing en `apps/web/README.md` — comandos, estructura, cómo añadir tests

---

## Summary

| Phase | Tasks Completed | Total |
|-------|-----------------|-------|
| Phase 1: Infrastructure | 6/6 | 100% |
| Phase 2: Page Objects | 3/3 | 100% |
| Phase 3: Auth Flows | 2/2 | 100% |
| Phase 4: CRUD & Batch | 2/2 | 100% |
| Phase 5: Services Wizards | 2/2 | 100% |
| Phase 6: Navigation & Reports | 2/2 | 100% |
| Phase 7: Mobile & Offline | 2/2 | 100% |
| Phase 8: CI & Polish | 0/4 | 0% |
| **Total** | **21/25** | **84%** |

### Pending Work (Next Session)
- T8.1: GitHub Actions workflow
- T8.2: Configure screenshot/video/trace on failure
- T8.3: Run full suite and fix flaky tests
- T8.4: Documentation

### Notes
- 57 E2E tests implemented across 10 spec files
- 100% spec scenario coverage achieved
- Phase 8 CI work deferred to next session