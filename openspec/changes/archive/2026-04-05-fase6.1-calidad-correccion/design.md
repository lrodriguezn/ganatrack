# Design: Fase 6.1 - Corrección de Calidad Backend

## Technical Approach

This change addresses critical quality issues discovered post-phase6: fix failing bcrypt tests, replace useless E2E assertions, create reusable test infrastructure, add unit tests for 8 modules without coverage, standardize test file naming, and update coverage thresholds incrementally.

The approach follows existing GanaTrack patterns: Jasmine-style `vi.fn()` mocks, fluent entity construction, and hexagonal layer separation (domain services → use cases → repositories).

## Architecture Decisions

### Decision 1: Test Data Factory Pattern

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Builder pattern with fluent API | Flexible, readable, supports overrides, more verbose | ✅ Selected |
|Fixed fixture objects | Simple, fast, rigid, hard to customize | ❌ Rejected |
| Faker-based generation | Realistic data, adds dependency, slower | ❌ Rejected |

**Rationale**: Builder pattern allows per-test customization without duplicating setup code. Matches existing test style where entities are constructed inline with explicit values.

```typescript
// Pattern: src/__tests__/helpers/factories/animal.factory.ts
export const AnimalFactory = {
  build: (overrides?: Partial<AnimalEntity>) => ({
    id: 1, predioId: 1, codigo: 'A001', nombre: null,
    fechaNacimiento: null, activo: 1, ...overrides
  })
}
```

### Decision 2: Mock Repository Strategy

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Complete mock objects with `vi.fn()` | Isolates unit tests, fast execution, follows existing pattern | ✅ Selected |
| Partial mocks | More realistic, slower, complex setup | ❌ Rejected |
| Real in-memory SQLite | Integration-level, requires schema setup | ❌ Reserved for E2E only |

**Rationale**: `vi.fn()` mocks are already used in notificaciones tests. Fast execution, no DB dependency, complete isolation. Pattern aligns with existing test suite.

```typescript
// Pattern from notificaciones tests
mockRepo = {
  findById: vi.fn(),
  findByPredio: vi.fn().mockResolvedValue({ data: [mockNotificacion], total: 1 }),
  // ...other methods
}
```

### Decision 3: Coverage Thresholds

| Module Category | Coverage Target | Rationale |
|-----------------|-----------------|-----------|
| Critical (auth, usuarios, notificaciones) | 85% | Security-sensitive, high traffic |
| New modules (animales, servicios, etc.) | 70% initially → 75% final | Allow incremental improvement |
| Global baseline | 80% | Practical minimum |

**Configuration**:
```typescript
// vitest.config.ts - add per-module thresholds
'./src/modules/animales/**': { lines: 70, branches: 70, functions: 70, statements: 70 },
```

### Decision 4: E2E Assertion Pattern

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Exact status codes + response body shape | Meaningful tests, catches real bugs | ✅ Selected |
| Array `.toContain(status)` | Fast to write, catches nothing | ❌ Rejected |

**Pattern**:
```typescript
// FROM: expect([200,401,500]).toContain(response.statusCode)
// TO:
expect(response.statusCode).toBe(200)
expect(response.json()).toMatchObject({ success: true, data: expect.any(Object) })
```

### Decision 5: Test File Naming

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Rename `.test.ts` → `.spec.ts` | Standard convention, matches vitest best practices | ✅ Selected |
| Keep `.test.ts` | No migration effort, inconsistent with many projects | ❌ Rejected |

**Migration**: Batch rename with `git mv`, update vitest.config.ts `include` pattern.

### Decision 6: bcrypt Hash Fix for verify-2fa Tests

| Approach | Tradeoffs | Decision |
|----------|-----------|----------|
| Pre-compute hashes in fixtures | Fast, deterministic | ✅ Selected |
| Generate dynamically in beforeEach | Realistic, slower tests | ❌ Rejected |

**Pattern**: The verify-2fa use case calls `bcrypt.compare(dto.codigo, twoFactor.codigo)` where `twoFactor.codigo` must be a hash. Tests must provide pre-hashed OTP codes.

```typescript
// Fix: generate bcrypt hash for mock data
const validTwoFactor = {
  habilitado: 1,
  metodo: 'email',
  codigo: await bcrypt.hash('123456', 12), // NOW CORRECT
  fechaExpiracion: new Date(Date.now() + 5 * 60 * 1000),
  intentosFallidos: 0,
}
```

## Data Flow

```
Test Infrastructure Creation
──────────────────────────────
1. Factory files created in __tests__/helpers/factories/
2. Mock builder files in __tests__/helpers/mocks/
3. Tests import from helpers

Test Execution Flow
───────────────────
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Factory.build() │────▶│ MockRepository │────▶│ UseCase.execute() │
│ (test data)     │     │ (vi.fn mocks)   │     │ (unit under test)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        └─────────────── expect(result) ◀───────────────┘

E2E Assertion Flow
──────────────────
app.inject() ──▶ Fastify Route ──▶ Controller ──▶ UseCase
                                           │
                    expect(statusCode).toBe(expected) ◀───┘
                    expect(body).toMatchObject(shape)
```

## File Changes

### Phase 1: Critical Fixes

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/modules/auth/application/use-cases/__tests__/verify-2fa.use-case.test.ts` | Modify | Change `validTwoFactor.codigo` from plain `'123456'` to `await bcrypt.hash('123456', 12)` |
| `apps/api/src/__tests__/e2e/auth.e2e.test.ts` | Modify | Replace all `.toContain(status)` with exact `.toBe(expectedCode)` and add body validation |

### Phase 2: Test Infrastructure

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/__tests__/helpers/factories/entity.factory.ts` | Create | Base factory pattern with `build()` method |
| `apps/api/src/__tests__/helpers/factories/animal.factory.ts` | Create | Animal entity factory |
| `apps/api/src/__tests__/helpers/factories/usuario.factory.ts` | Create | Usuario entity factory |
| `apps/api/src/__tests__/helpers/mocks/repository.mock.ts` | Create | Generic repository mock builder |

### Phase 3-4: Module Tests (Per Module)

Pattern for each module (animales, servicios, predios, etc.):

| File Pattern | Action | Description |
|--------------|--------|-------------|
| `modules/{module}/domain/services/__tests__/{service}.spec.ts` | Create | Domain service unit tests |
| `modules/{module}/application/use-cases/__tests__/{use-case}.spec.ts` | Create | Use case unit tests |
| `modules/{module}/infrastructure/mappers/__tests__/{mapper}.spec.ts` | Create | Mapper unit tests |
| `modules/{module}/infrastructure/persistence/__tests__/{repo}.spec.ts` | Create | Repository interface contract tests |

### Phase 5: Configuration

| File | Action | Description |
|------|--------|-------------|
| `apps/api/vitest.config.ts` | Modify | Change `include: ['src/**/*.test.ts']` → `['src/**/*.spec.ts']` |
| All `*.test.ts` files | Rename | Batch rename to `*.spec.ts` |

### Phase 6: Repository Tests

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/modules/auth/infrastructure/persistence/__tests__/drizzle-auth.repository.spec.ts` | Create | Auth repository tests |
| `apps/api/src/modules/usuarios/infrastructure/persistence/__tests__/drizzle-usuario.repository.spec.ts` | Create | Usuario repository tests |

## Interfaces / Contracts

### Entity Factory

```typescript
// src/__tests__/helpers/factories/entity.factory.ts
export interface Factory<T> {
  build(overrides?: Partial<T>): T
}

export function createFactory<T>(defaults: () => T): Factory<T> {
  return {
    build: (overrides?: Partial<T>) => ({ ...defaults(), ...overrides })
  }
}
```

### Mock Repository Builder

```typescript
// src/__tests__/helpers/mocks/repository.mock.ts
export function createMockRepo<T extends Record<string, Function>>(methods: T): { [K in keyof T]: Mock } {
  const mock = {} as { [K in keyof T]: Mock }
  for (const key of Object keys(methods)) {
    mock[key] = vi.fn()
  }
  return mock
}
```

### Test Status Codes (E2E Fix)

```typescript
// Map of test expectations to status codes
const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const
```

## Testing Strategy

### Unit Tests

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Domain services | Business rules, validation, state transitions | Pure functions, no mocks needed |
| Use cases | Orchestration, error handling, repository calls | Mock repositories with `vi.fn()` |
| Mappers | Entity ↔ DTO conversion, snake_case ↔ camelCase | Direct assertions on output |
| Repositories | Interface contract, method signatures | Placeholder tests (integration tests for real DB) |

### E2E Tests

| Scenario | What to Test | Approach |
|----------|--------------|----------|
| Auth flow | Login, 2FA, refresh, logout | Pre-seeded SQLite in-memory, exact status codes |
| CRUD operations | Create, read, update, delete | Auth headers injected, response body shape validation |
| Error paths | Invalid input, unauthorized, not found | Expect specific error codes and messages |

### Coverage Incremental Plan

**Week 1**: Fix critical tests + infrastructure (2-3 days)
**Week 2-3**: Core modules (animales, servicios, predios) - 16 use cases total
**Week 4**: Large modules (configuracion, maestros) - 55+ use cases, prioritize critical paths
**Week 5**: Remaining modules (productos, reportes, imagenes) + naming migration

## Migration / Rollout

### Naming Migration Script

```bash
# Batch rename test files
find apps/api/src -name "*.test.ts" -exec sh -c 'git mv "$1" "${1%.test.ts}.spec.ts"' _ {} \;

# Update vitest.config.ts
# Change: include: ['src/**/*.test.ts']
# To: include: ['src/**/*.spec.ts']
```

### Coverage Threshold Increment

```typescript
// vitest.config.ts - phased threshold increase
const phase = process.env.COVERAGE_PHASE || 'initial' // 'initial' | 'final'

const moduleThresholds = {
  animales: phase === 'final' ? 75 : 70,
  servicios: phase === 'final' ? 75 : 70,
  // ...
}
```

## Open Questions

- [ ] Should repository tests use real in-memory SQLite or remain as interface contract tests?
- [ ] Priority ordering for configuracion/maestros (55+ use cases) - which use cases are critical?
- [ ] Should E2E tests run by default in CI or as a separate job due to better-sqlite3 compilation requirement?