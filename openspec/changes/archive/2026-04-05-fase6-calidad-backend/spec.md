# Delta for Backend Quality Assurance (Fase 6)

## Purpose

Mejorar calidad backend mediante testing, linting, coverage y refactorización de módulos críticos (auth, usuarios, notificaciones).

## ADDED Requirements

### Requirement: REQ-01 Configurar Vitest

El sistema DEBE configurar Vitest como runner de pruebas unitarias.

#### Scenario: Instalación y configuración
- GIVEN proyecto backend existe
- WHEN se ejecuta instalación de Vitest
- THEN `vitest.config.ts` se crea/actualiza
- AND script `test` en `package.json` funciona

### Requirement: REQ-02 Configurar ESLint 9

El sistema DEBE configurar ESLint 9 para linting backend.

#### Scenario: Configuración de ESLint
- GIVEN proyecto backend existe
- WHEN se crea `apps/api/eslint.config.js`
- THEN `eslint` se ejecuta sin errores críticos
- AND soporta TypeScript y Node.js

### Requirement: REQ-03 Configurar Coverage (80%)

El sistema DEBE configurar coverage con umbral mínimo del 80%.

#### Scenario: Configuración de coverage
- GIVEN Vitest instalado
- WHEN se configura `@vitest/coverage-v8`
- THEN comando `test:coverage` genera reporte
- AND umbral es >= 80%

### Requirement: REQ-04 Tests Unitarios para Auth

El sistema DEBE incluir tests para el módulo de autenticación.

#### Scenario: Login exitoso
- GIVEN usuario válido
- WHEN invoca caso de uso login
- THEN devuelve token JWT válido

#### Scenario: Login fallido
- GIVEN credenciales inválidas
- WHEN invoca caso de uso login
- THEN devuelve error de autenticación

### Requirement: REQ-05 Tests Unitarios para Usuarios

El sistema DEBE incluir tests para el módulo de usuarios.

#### Scenario: Obtención de perfil
- GIVEN usuario autenticado
- WHEN solicita su perfil
- THEN devuelve datos del usuario (sin contraseña)

#### Scenario: Actualización de perfil
- GIVEN usuario autenticado
- WHEN actualiza su información
- THEN cambios se persisten

### Requirement: REQ-06 Tests Unitarios para Notificaciones

El sistema DEBE incluir tests para el módulo de notificaciones.

#### Scenario: Creación de notificación
- GIVEN datos de notificación válidos
- WHEN se invoca creación
- THEN notificación se guarda con estado `pending`

#### Scenario: Envío de notificación
- GIVEN notificación pendiente
- WHEN worker procesa cola
- THEN notificación se envía y estado cambia

### Requirement: REQ-07 Refactorización y Linting

El sistema DEBE refactorizar código crítico y corregir linting.

#### Scenario: Refactorización módulos críticos
- GIVEN módulos auth, usuarios, notificaciones
- WHEN se aplican mejoras de estructura
- THEN código cumple ESLint 9
- AND tests continúan pasando

## Métricas de Calidad

| Métrica | Umbral |
|---------|--------|
| Coverage total backend | >= 80% |
| Coverage módulos críticos | >= 85% |
| Tiempo ejecución tests | < 60s |
| Tiempo linting | < 10s |
| Errores ESLint | 0 críticos |

## Criterios de Salida

- [ ] ESLint 9 configurado y sin errores
- [ ] Coverage >= 80%
- [ ] Tests unitarios (auth, usuarios, notificaciones) pasando
- [ ] Código crítico pasa ESLint
- [ ] Judgment Day ejecutado y aprobado
- [ ] Scripts test funcionan (`pnpm --filter @ganatrack/api test`)