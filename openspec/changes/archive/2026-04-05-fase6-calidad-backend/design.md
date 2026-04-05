# Design: Fase 6 - Calidad Backend

## Technical Approach

Esta fase se centra en mejorar la calidad del código backend mediante la configuración de herramientas de linting y testing, y la refactorización de módulos críticos para cumplir con estos estándares.

El enfoque técnico incluye:
1.  **Configuración de ESLint 9**: Integración de ESLint 9 con reglas estrictas para TypeScript y Node.js.
2.  **Mejora de Vitest**: Actualización de la configuración existente para incluir umbrales de cobertura estrictos (80% total, 85% módulos críticos).
3.  **Estructura de Tests**: Estandarización de la ubicación y nomenclatura de archivos de prueba en los módulos `auth`, `usuarios` y `notificaciones`.
4.  **Refactorización**: Corrección de errores de linting y alineación de la estructura de código con las convenciones del proyecto.

## Architecture Decisions

### Decision: Estructura de Tests Estándar

**Choice**: Todos los tests unitarios se ubicarán dentro de `src/`, espejando la estructura de código fuente en directorios `__tests__`, usando extensión `.test.ts`.

**Alternatives considered**:
-   Usar una carpeta `test/` a nivel raíz (paralela a `src/`).
-   Usar extensión `.spec.ts` para tests (común en otros ecosistemas).

**Rationale**:
-   La configuración actual de `vitest.config.ts` define `include: ['src/**/*.test.ts']`. Mover los tests fuera de `src/` rompería la ejecución actual sin reconfiguración previa.
-   La extensión `.test.ts` es la que coincide con la configuración actual y es un estándar claro para tests unitarios en este proyecto.
-   El uso de directorios `__tests__` permite agrupar pruebas sin mezclarlas con el código de producción en listados de directorios, manteniendo la co-localización (test cerca del código que prueba).

### Decision: Cobertura de Código con Umbrales Estrictos

**Choice**: Configurar `@vitest/coverage-v8` con umbrales mínimos del 80% global y 85% para módulos críticos (`auth`, `usuarios`, `notificaciones`).

**Alternatives considered**:
-   Sin umbrales estrictos, solo reporte de cobertura.

**Rationale**:
-   El requisito `REQ-03` especifica explícitamente un umbral mínimo del 80%.
-   Los módulos críticos requieren mayor garantía de calidad (85%).

### Decision: Configuración de ESLint 9

**Choice**: Crear `apps/api/eslint.config.js` utilizando el nuevo flat config de ESLint 9, extendiendo reglas base de TypeScript y Node.js.

**Alternatives considered**:
-   Mantener `.eslintrc.json` (obsoleto para ESLint 9).

**Rationale**:
-   ESLint 9 requiere el nuevo formato de configuración plano (`eslint.config.js`).
-   Se alineará con las convenciones de TypeScript del proyecto (`strict: true` en tsconfig).

## Data Flow

Flujo de ejecución de pruebas y linting:

```
[Desarrollador] -> [Script pnpm] -> [Vitest / ESLint]
      |                  |                  |
      |                  |                  +-> [Cobertura] -> Reporte HTML/JSON
      |                  |                  +-> [Salida] -> Consola
      +------------------+
      (Ejecución: pnpm test, pnpm lint)
```

Estructura de directorios de tests propuesta:

```
apps/api/src/modules/
├── auth/
│   ├── application/use-cases/
│   │   ├── login.use-case.ts
│   │   └── __tests__/              <-- Mover tests aquí desde __tests__ actual
│   │       └── login.use-case.test.ts
│   └── domain/services/
│       ├── auth.domain-service.ts
│       └── __tests__/
│           └── auth.domain-service.test.ts
├── usuarios/
│   └── ... (similar a auth)
└── notificaciones/
    ├── test/                        <-- Renombrar a __tests__
    │   ├── alert-engine.service.spec.ts -> alert-engine.service.test.ts
    │   └── ...
    └── __tests__/                   <-- Nueva ubicación estandarizada
        └── ...
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/api/eslint.config.js` | **Create** | Configuración de ESLint 9 (flat config) para backend. |
| `apps/api/vitest.config.ts` | **Modify** | Añadir `coverage.thresholds` (80% global, 85% críticos). Asegurar `include` cubre `.test.ts`. |
| `apps/api/package.json` | **Modify** | Añadir script `lint`. Añadir dependencias ESLint si es necesario (instalación manual previa). |
| `apps/api/src/modules/auth/application/use-cases/__tests__/` | **Modify** | Estandarizar ubicación (ya existe, verificar nombres). |
| `apps/api/src/modules/notificaciones/test/` | **Rename/Move** | Mover a `src/modules/notificaciones/__tests__/` y renombrar `.spec.ts` a `.test.ts`. |
| `apps/api/src/modules/notificaciones/__tests__/` | **Create** | Nueva ubicación para tests de notificaciones. |
| `apps/api/src/modules/usuarios/application/use-cases/__tests__/` | **Modify** | Estandarizar ubicación (ya existe, verificar nombres). |

## Interfaces / Contracts

### ESLint Config (`eslint.config.js`)

```javascript
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Reglas estrictas
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // ... otras reglas
    },
  }
);
```

### Vitest Coverage Config

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: ['src/**/*.ts'],
  exclude: ['src/**/*.test.ts', 'src/server.ts'],
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Umbrales específicos para módulos críticos (85%)
    // Vitest permite configuración por glob pattern
    'src/modules/auth/**': {
      lines: 85,
      branches: 85,
      functions: 85,
      statements: 85,
    },
    'src/modules/usuarios/**': {
      lines: 85,
      branches: 85,
      functions: 85,
      statements: 85,
    },
    'src/modules/notificaciones/**': {
      lines: 85,
      branches: 85,
      functions: 85,
      statements: 85,
    },
  },
}
```
*Nota: La configuración de thresholds por módulo específico en Vitest usa glob patterns como claves del objeto `thresholds`. Los umbrales globales se aplican a todos los archivos, y los patrones específicos los sobrescriben para los archivos que coinciden.*

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Use Cases (Login, GetPerfil, etc.) | Mock de repositorios (`vi.fn()`), prueba de lógica de negocio. |
| Unit | Domain Services | Aislamiento de dependencias externas. |
| Unit | Mappers | Transformación de datos entre capas. |
| Integration | Repositories (Drizzle) | (Opcional/Posterior) Tests con base de datos en memoria (SQLite). |

## Migration / Rollout

1.  **Paso 1**: Crear `eslint.config.js` y ejecutar `pnpm lint` para identificar errores.
2.  **Paso 2**: Corregir errores de linting en módulos críticos (`auth`, `usuarios`, `notificaciones`).
3.  **Paso 3**: Mover y renombrar archivos de test en `notificaciones`.
4.  **Paso 4**: Actualizar `vitest.config.ts` con thresholds.
5.  **Paso 5**: Ejecutar `pnpm test:coverage` y verificar que se alcanza el 80%.
6.  **Paso 6**: Ejecutar Judgment Day para revisión final.

## Open Questions

-   [ ] ¿Cómo manejar los thresholds específicos por módulo en Vitest sin etiquetas? (Se puede verificar en CI con scripts custom o usar reportes de cobertura por carpeta).
-   [ ] Dependencias de ESLint 9: ¿Instalar manualmente o asumir que están en el root? (Dado que es un monorepo, probablemente se instalen en `apps/api`).

## Persistence

Este diseño se guarda en:
-   `openspec/changes/fase6-calidad-backend/design.md` (archivo del sistema de archivos)
-   Engram: `sdd/fase6-calidad-backend/design`
