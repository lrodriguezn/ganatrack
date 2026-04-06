# Proposal: E2E Testing con Playwright

## Intent

Implementar testing E2E para los 10 flujos críticos del PRD usando Playwright, cubriendo autenticación (incluyendo 2FA), CRUD de animales, wizards de servicios, cambio de predio, exportación de reportes, operaciones en lote, navegación mobile y modo offline. El objetivo es validar la experiencia de usuario completa de extremo a extremo, garantizando que los flujos principales funcionan correctamente antes de cada release.

## Scope

### In Scope
- Auth fixture con `storageState` para login reutilizable (API-based)
- 2FA fixture para flujo de autenticación con segundo factor
- Implementación de los 10 flujos críticos del PRD en E2E
- Utilidades de test comunes (login, selección de predio, navegación)
- Configuración de proyectos mobile (iPhone, Pixel viewports)
- CI/CD integration con reportes HTML y artefactos

### Out of Scope
- Testing de performance/load (separate concern)
- Testing de accesibilidad (a11y) — future work
- Testing de edge cases raros (< 1% uso)
- Stub tests existentes ya implementados (no modificar estructura)

## Capabilities

### New Capabilities
None — este cambio es infraestructura de testing. No introduce nuevo comportamiento de aplicación.

### Modified Capabilities
None — los specs existentes (servicios-veterinarios, servicios-grupal-wizard, mock-services, shared-feedback-components) no cambian sus requisitos. Solo se añade cobertura de tests E2E que validan el comportamiento ya especificado.

## Approach

**Estrategia de Auth Fixture:**
- `global-setup.ts` ejecuta login via API, guarda `storageState` con refresh token cookie
- Reserva de estado de autenticación por test file para paralelismo seguro
- Bypass de 2FA para tests que no prueban el flujo 2FA

**Organización de Tests:**
```
tests/e2e/
├── fixtures/
│   ├── auth.fixture.ts       # Login state reuse
│   ├── twofa.fixture.ts      # 2FA flow fixture
│   └── predsio.fixture.ts     # Predio selection helpers
├── auth/
│   ├── login.spec.ts         # Flow #1: Login completo
│   └── login-2fa.spec.ts     # Flow #2: Login + 2FA
├── animales/
│   ├── crud.spec.ts          # Flow #3: CRUD animal
│   └── bulk-operations.spec.ts # Flow #8: Operación en lote
├── servicios/
│   ├── wizard-palpacion.spec.ts  # Flow #4: Wizard palpación
│   └── registro-parto.spec.ts    # Flow #5: Registro parto
├── predios/
│   └── cambio-predio.spec.ts  # Flow #6: Cambio de predio
├── reportes/
│   └── exportacion.spec.ts   # Flow #7: Exportación
├── navigation/
│   └── mobile.spec.ts        # Flow #9: Navegación mobile
└── pwa/
    └── offline.spec.ts        # Flow #10: Modo offline
```

**Mock/Data Strategy:**
- Tests corren contra MSW mocks (ya configurados)
- Seed data determinístico con IDs fijos para assertions
- Helper `resetMocks()` antes de tests que mutan estado

**CI Integration:**
- Matrix de browsers: Chromium (primary), Firefox (smoke)
- Projects mobile para tests responsive
- Retries: 2 en CI, 0 en local
- Video + trace on failure para debugging

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/playwright.config.ts` | Modified | Añadir auth fixture, mobile projects, reporter config |
| `apps/web/tests/e2e/fixtures/` | New | Auth fixtures y helpers |
| `apps/web/tests/e2e/` | Modified | Implementar 10 critical flows |
| `apps/web/tests/mocks/handlers/` | Modified | Possible enhancements for E2E isolation |
| `apps/web/package.json` | Modified | Scripts de E2E build/integration |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth state memory-only (Zustand) complica fixtures | Medium | Usar API login + storageState con refresh token cookie; bypass token directo para tests que no prueban auth |
| 2FA flow testing complejo | Medium | Crear fixture dedicado con temp token y mock OTP |
| Offline/PWA testing requiere service worker | Low | Prioridad baja; usar `context.setOffline()` y mocking de SW |
| Flaky tests por timing | Low | Playwright auto-waiting + retry config + proper assertions |
| CI browser installation lento | Low | Playwright Docker image con browsers pre-installed |

## Rollback Plan

1. Revertir cambios en `playwright.config.ts`
2. Eliminar carpeta `tests/e2e/fixtures/`
3. Restaura tests existentes desde git history
4. Los tests E2E no bloquean deployment si fallan — infrastructure non-breaking

## Dependencies

- Playwright 1.59.1 ya instalado
- MSW 2.x handlers existentes
- Config de Vitest existente compatible con tests paralelos

## Success Criteria

- [x] Auth fixture permite login una vez por test file sin UI
- [x] Flow #1 (Login completo) test pasa con token en Zustand + cookie
- [x] Flow #2 (Login + 2FA) test valida redirect y OTP
- [x] Flow #3 (CRUD animal) test cubre create/read/update/delete/estado
- [x] Flow #4 (Wizard palpación) test valida 3-step wizard completo
- [x] Flow #5 (Registro parto) test valida link madre-cría
- [x] Flow #6 (Cambio predio) test valida cache invalidation
- [x] Flow #7 (Exportación) test valida polling y formats
- [x] Flow #8 (Bulk operations) test valida selección múltiple
- [x] Flow #9 (Mobile nav) test valida responsive <768px
- [x] Flow #10 (Offline) test valida offline banner y sync (lower priority)
- [ ] CI corre tests E2E en paralelo sin flakes
- [ ] HTML reporter genera artefactos en failure