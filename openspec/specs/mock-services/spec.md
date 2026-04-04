# Delta for Mock Services

## Purpose

Standardize mock service pattern across all 11 modules: enforce interface implementation, extract real services to `.api.ts`, fix misleading comments.

## ADDED Requirements

### Requirement: Reportes mock implements interface

`MockReportesService` in `reportes.mock.ts` MUST explicitly `implements ReportesService`. All method signatures MUST match exactly. A `resetReportesMock()` function MUST be exported for test cleanup.

#### Scenario: Mock class implements interface

- GIVEN `ReportesService` defines 9 methods
- WHEN `MockReportesService` is compiled
- THEN TypeScript reports zero interface mismatch errors

#### Scenario: Reset function exists

- GIVEN a test needs to reset mock state
- WHEN `resetReportesMock()` is called
- THEN internal state returns to initial values

### Requirement: Reportes real service extracted to .api.ts

`RealReportesService` MUST be moved from `reportes.service.ts` to `reportes.api.ts`. The `.service.ts` file MUST use dynamic `require` factory pattern like other 10 modules. No HTTP endpoint or behavioral changes permitted.

#### Scenario: reportes.api.ts exports RealReportesService

- GIVEN `reportes.api.ts` exists
- WHEN imported
- THEN it exports `RealReportesService` implementing `ReportesService`

#### Scenario: Factory uses dynamic require

- GIVEN `reportes.service.ts` is the factory
- WHEN `NEXT_PUBLIC_USE_MOCKS` is not set
- THEN `createRealService()` dynamically requires `./reportes.api`

## MODIFIED Requirements

### Requirement: Consistent factory comments

All 11 `.service.ts` singleton JSDoc comments MUST accurately describe default behavior. Since `USE_MOCKS` defaults to `false`, real service is the default. Comments MUST say "Default to real" — never "Default to mock".

(Previously: 5 of 11 modules had incorrect "Default to mock" comments)

#### Scenario: animales.service.ts comment fixed

- GIVEN line 68 says "Default to mock when env var is not set (falsy)"
- WHEN updated
- THEN reads "Default to real when env var is not set (falsy)"

#### Scenario: notificaciones.service.ts comment fixed

- GIVEN line 67 says "Default to mock when env var is not set (falsy)"
- WHEN updated
- THEN reads "Default to real when env var is not set (falsy)"

#### Scenario: configuracion/catalogo.service.ts comment fixed

- GIVEN line 44 says "Default to mock when env var is not set (falsy)"
- WHEN updated
- THEN reads "Default to real when env var is not set (falsy)"

#### Scenario: maestros.service.ts comment fixed

- GIVEN line 42 says "Default to mock when env var is not set (falsy)"
- WHEN updated
- THEN reads "Default to real when env var is not set (falsy)"

#### Scenario: predios.service.ts comment fixed

- GIVEN line 90 says "Default to mock when env var is not set (falsy)"
- WHEN updated
- THEN reads "Default to real when env var is not set (falsy)"

#### Scenario: Already-correct modules unchanged

- GIVEN `usuarios`, `auth`, `imagenes`, `productos`, `servicios` already say "Default to real"
- WHEN standardization completes
- THEN these 5 files have no comment changes

## Module Summary

| Module | Interface Impl | Extract .api.ts | Comment Fix |
|--------|---------------|-----------------|-------------|
| reportes | Add `implements` + `resetReportesMock()` | Extract inline class | N/A |
| animales | Already correct | Already correct | "mock" → "real" |
| notificaciones | Already correct | Already correct | "mock" → "real" |
| configuracion | Already correct | Already correct | "mock" → "real" |
| maestros | Already correct | Already correct | "mock" → "real" |
| predios | Already correct | Already correct | "mock" → "real" |
| usuarios, auth, imagenes, productos, servicios | Already correct | Already correct | Already correct |
