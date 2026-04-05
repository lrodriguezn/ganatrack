# Delta Spec: Fase 6.1 - Corrección de Calidad Backend

## Change Summary

This delta spec defines requirements and test scenarios for correcting critical quality issues discovered in the GanaTrack backend: failing tests, inadequate E2E assertions, missing test infrastructure, and coverage gaps across 8 modules.

## Scope

### In Scope
- Fix 2 failing unit tests in auth module (verify-2fa)
- Fix 13 E2E assertions using array.contains pattern
- Create test infrastructure (factories, mock builders, fixtures)
- Create unit tests for 8 untested modules (animales, servicios, predios, configuracion, productos, reportes, imagenes, maestros)
- Standardize test file naming (.test.ts → .spec.ts)
- Update vitest.config.ts coverage thresholds for new modules

### Out of Scope
- Frontend changes
- New API endpoints
- Business logic changes
- Database schema changes
- Performance optimization

## Requirements

### REQ-1: Fix Verify-2FA Failing Tests

#### Description
The `Verify2faUseCase` tests fail because the mock uses plain text `'123456'` but the implementation uses `bcrypt.compare()` against a hash.

#### Acceptance Criteria
- [ ] `validTwoFactor.codigo` in test must be a bcrypt hash generated with `await bcrypt.hash('123456', 12)`
- [ ] Happy path test passes: returns `LoginResponseDto` with tokens
- [ ] Expired code test passes: throws `UnauthorizedError` with message 'Código expirado. Solicita un nuevo código'
- [ ] Both tests use the same hash value for consistency

#### Test Scenarios

**TC-1.1: Happy Path - Correct Code**
```gherkin
Given a valid tempToken for usuarioId=1
And validTwoFactor.codigo is bcrypt.hash('123456', 12)
And fechaExpiracion is 5 minutes from now
When Verify2faUseCase.execute is called with codigo='123456'
Then it should return an object with accessToken, refreshToken, expiresIn
And usuario.id should be 1
And usuario.nombre should be 'Test User'
And resetTwoFactorAttempts should be called with usuarioId=1
```

**TC-1.2: Expired Code**
```gherkin
Given a valid tempToken for usuarioId=1
And validTwoFactor.codigo is bcrypt.hash('123456', 12)
And fechaExpiracion is 1 minute in the past
When Verify2faUseCase.execute is called with codigo='123456'
Then it should throw UnauthorizedError
And the error message should be 'Código expirado. Solicita un nuevo código'
```

#### Files Affected
- `apps/api/src/modules/auth/application/use-cases/__tests__/verify-2fa.use-case.test.ts`

---

### REQ-2: Fix E2E Test Assertions

#### Description
All 13 E2E test assertions use the pattern `expect([200,401,500]).toContain(response.statusCode)` which validates nothing useful. Each test must assert the EXACT expected status code and validate response body where applicable.

#### Acceptance Criteria
- [ ] Each E2E test asserts exact status code (200, 201, 400, 401, 409, etc.)
- [ ] Response body is validated for success cases (200/201)
- [ ] Error messages are validated for error cases (4xx)
- [ ] No `toContain` patterns remain

#### Test Scenarios

**TC-2.1: Login - Valid Credentials**
```gherkin
Given admin user exists with email='admin@ganatrack.com' and password='Admin123!'
When POST /api/v1/auth/login with correct credentials
Then response.statusCode should be 200
And response.body should have accessToken, refreshToken, expiresIn
And response.body.usuario should have id, nombre, roles
```

**TC-2.2: Login - Wrong Password**
```gherkin
Given admin user exists
When POST /api/v1/auth/login with wrong password
Then response.statusCode should be 401
And response.body.message should contain 'Credenciales inválidas'
```

**TC-2.3: Login - Missing Email**
```gherkin
When POST /api/v1/auth/login without email field
Then response.statusCode should be 400
And response.body should have validation error for 'email'
```

**TC-2.4: Refresh Token - Valid Token**
```gherkin
Given valid refreshToken cookie exists
When POST /api/v1/auth/refresh
Then response.statusCode should be 200
And response.body should have new accessToken, refreshToken
```

**TC-2.5: Refresh Token - No Cookie**
```gherkin
When POST /api/v1/auth/refresh without cookie
Then response.statusCode should be 401
```

**TC-2.6: Logout - Valid Request**
```gherkin
Given valid refreshToken cookie exists
When POST /api/v1/auth/logout
Then response.statusCode should be 200
```

**TC-2.7: Change Password - Valid Request**
```gherkin
Given valid Bearer token for admin
When POST /api/v1/auth/change-password with correct current password
Then response.statusCode should be 200
```

**TC-2.8: Change Password - No Auth**
```gherkin
When POST /api/v1/auth/change-password without authorization header
Then response.statusCode should be 401
```

**TC-2.9: Get Current User - Valid Token**
```gherkin
Given valid Bearer token for admin
When GET /api/v1/usuarios/me
Then response.statusCode should be 200
And response.body should have id, nombre, email
```

**TC-2.10: Get Current User - No Token**
```gherkin
When GET /api/v1/usuarios/me without token
Then response.statusCode should be 401
```

**TC-2.11: List Users - Valid Token**
```gherkin
Given valid Bearer token for admin
When GET /api/v1/usuarios
Then response.statusCode should be 200
And response.body should be an array
```

**TC-2.12: List Users - No Token**
```gherkin
When GET /api/v1/usuarios without token
Then response.statusCode should be 401
```

**TC-2.13: Create User - Valid Data**
```gherkin
Given valid Bearer token for admin
When POST /api/v1/usuarios with unique email
Then response.statusCode should be 201
And response.body should have id, nombre, email
```

**TC-2.14: Create User - No Token**
```gherkin
When POST /api/v1/usuarios without token
Then response.statusCode should be 401
```

#### Files Affected
- `apps/api/src/__tests__/e2e/auth.e2e.test.ts`

---

### REQ-3: Test Infrastructure

#### Description
Create reusable test infrastructure with factories, mock builders, and fixtures to reduce duplication and improve test maintainability.

#### Acceptance Criteria
- [ ] `src/__tests__/helpers/factories.ts` with entity factories
- [ ] `src/__tests__/helpers/mock-builders.ts` with repository mock builders
- [ ] `src/__tests__/helpers/fixtures.ts` with common test data
- [ ] Update `src/__tests__/setup.ts` with global test utilities
- [ ] All factories use faker for random data where appropriate

#### Test Scenarios

**TC-3.1: Factory - Create Valid Usuario**
```gherkin
When calling createUsuario() factory
Then it returns a valid Usuario entity
And all required fields are populated
And timestamps are set
```

**TC-3.2: Factory - Create Valid Animal**
```gherkin
When calling createAnimal() factory
Then it returns a valid Animal entity
And all required fields are populated
And references are valid (predioId, usuarioId)
```

**TC-3.3: Mock Builder - Auth Repository**
```gherkin
When calling createAuthRepositoryMock()
Then it returns a mock implementing IAuthRepository
And all methods are vi.fn() mocks
And default behavior returns valid data
```

**TC-3.4: Mock Builder - Animal Repository**
```gherkin
When calling createAnimalRepositoryMock()
Then it returns a mock implementing IAnimalRepository
And all methods are vi.fn() mocks
```

**TC-3.5: Fixtures - Common Test Data**
```gherkin
When importing test fixtures
Then I can access adminUser, testAnimal, testPredio, etc.
And data is consistent across test files
```

#### Files Affected (New)
- `apps/api/src/__tests__/helpers/factories.ts`
- `apps/api/src/__tests__/helpers/mock-builders.ts`
- `apps/api/src/__tests__/helpers/fixtures.ts`
- `apps/api/src/__tests__/setup.ts` (modify)

---

### REQ-4: Unit Tests for Untested Modules

#### Description
Create comprehensive unit tests for 8 modules with zero coverage: animales, servicios, predios, configuracion, productos, reportes, imagenes, maestros.

#### Acceptance Criteria
- [ ] Each module has tests for all use cases (happy path + error paths)
- [ ] Domain services are tested (all methods)
- [ ] Mappers are tested (toDomain, toResponse, edge cases)
- [ ] Repositories have critical query tests
- [ ] Tests follow existing patterns (beforeEach setup, vi.mock, describe blocks)
- [ ] Each test file uses `.spec.ts` extension

#### Module-Specific Requirements

##### REQ-4.1: Animales Module (Priority 1)

**Use Cases to Test (16+):**
- `list-animales.use-case.ts` - pagination, filters
- `get-animal.use-case.ts` - happy path, not found
- `crear-animal.use-case.ts` - happy path, validation errors
- `update-animal.use-case.ts` - happy path, not found, validation
- `delete-animal.use-case.ts` - happy path, not found
- `get-genealogia-animal.use-case.ts` - happy path, no parents
- `list-animales.use-case.ts` - with filters, pagination

**Domain Services:**
- `AnimalDomainService` - all business rules

**Mappers:**
- `AnimalMapper` - toDomain, toResponse, edge cases

**Repositories:**
- `DrizzleAnimalRepository` - findById, list with filters, create

**Test Scenarios Example:**
```gherkin
Scenario: List Animals with Pagination
  Given 15 animals exist in database
  When listAnimalesUseCase.execute({ page: 1, limit: 10 })
  Then it should return 10 animals
  And pagination metadata: total=15, page=1, totalPages=2

Scenario: Create Animal - Validation Error
  When crearAnimalUseCase.execute with invalid data (missing required fields)
  Then it should throw ValidationError
  And error should contain field-specific messages
```

##### REQ-4.2: Servicios Module (Priority 2)

**Use Cases to Test (20+):**
- Parto: create, update, delete, get, list
- Inseminacion: create group, update, delete, list
- Palpacion: add animal, remove, list group, delete
- Veterinario: add animal, remove, create group, update, list

**Test Scenarios Example:**
```gherkin
Scenario: Create Inseminacion Grupal
  Given valid animal IDs and inseminacion data
  When crearInseminacionGrupalUseCase.execute
  Then it should create inseminacion records for all animals
  And return created records

Scenario: Update Palpacion - Animal Not Found
  When updatePalpacionAnimalUseCase.execute with non-existent animalId
  Then it should throw NotFoundError
```

##### REQ-4.3: Predios Module (Priority 3)

**Use Cases to Test:**
- CRUD operations for predios
- List with filters, pagination
- Assign/remove users to predios

##### REQ-4.4: Configuracion Module (Priority 4)

**Use Cases to Test (30+):**
- Configuracion CRUD
- Bulk update operations
- Validation of config values

##### REQ-4.5: Productos Module (Priority 5)

**Use Cases to Test:**
- Product CRUD
- List with filters
- Inventory updates

##### REQ-4.6: Reportes Module (Priority 6)

**Use Cases to Test (12+):**
- Report generation (sanitario, inventario, reproductivo, mortalidad, movimiento)
- Export jobs (enqueue, status, download, delete)
- Data counting

**Test Scenarios Example:**
```gherkin
Scenario: Generate Inventario Report
  Given animals exist in database
  When getInventarioReportUseCase.execute({ predioId: 1 })
  Then it should return report data with animal counts
  And summary statistics

Scenario: Enqueue Export Job
  When enqueueExportJobUseCase.execute({ tipo: 'inventario', formato: 'csv' })
  Then it should create job with status 'pending'
  And return job ID
```

##### REQ-4.7: Imagenes Module (Priority 7)

**Use Cases to Test (4):**
- upload-imagen
- get-imagen
- list-imagenes
- delete-imagen

##### REQ-4.8: Maestros Module (Priority 8)

**Use Cases to Test (25+):**
- Hierro: CRUD
- Veterinario: CRUD
- Propietario: CRUD
- Lugar Compra/Venta: CRUD
- Motivo Venta: CRUD
- Causa Muerte: CRUD
- Diagnostico Veterinario: CRUD

#### Files Affected (New)
- `apps/api/src/modules/animales/**/__tests__/*.spec.ts`
- `apps/api/src/modules/servicios/**/__tests__/*.spec.ts`
- `apps/api/src/modules/predios/**/__tests__/*.spec.ts`
- `apps/api/src/modules/configuracion/**/__tests__/*.spec.ts`
- `apps/api/src/modules/productos/**/__tests__/*.spec.ts`
- `apps/api/src/modules/reportes/**/__tests__/*.spec.ts`
- `apps/api/src/modules/imagenes/**/__tests__/*.spec.ts`
- `apps/api/src/modules/maestros/**/__tests__/*.spec.ts`

---

### REQ-5: Test Infrastructure for Auth and Usuarios

#### Description
Add repository tests for auth and usuarios modules (currently only notificaciones has repository tests).

#### Acceptance Criteria
- [ ] `DrizzleAuthRepository` tests for critical queries
- [ ] `DrizzleUsuarioRepository` tests for critical queries
- [ ] Tests use SQLite in-memory for isolation
- [ ] Tests cover: findById, findByEmail, save operations

#### Test Scenarios

**TC-5.1: Auth Repository - Get Two Factor**
```gherkin
Given usuario with 2FA configured exists
When authRepo.getTwoFactor(usuarioId)
Then it should return TwoFactor record with codigo hash
And intentosFallidos count
```

**TC-5.2: Auth Repository - Save Refresh Token**
```gherkin
When authRepo.saveRefreshToken(usuarioId, token, expiresAt)
Then token should be persisted in database
And findRefreshToken should return it
```

**TC-5.3: Usuario Repository - Find By Email**
```gherkin
Given usuario with email 'test@example.com' exists
When usuarioRepo.findUsuarioByEmail('test@example.com')
Then it should return the usuario entity
```

#### Files Affected (New)
- `apps/api/src/modules/auth/infrastructure/persistence/__tests__/drizzle-auth.repository.spec.ts`
- `apps/api/src/modules/usuarios/infrastructure/persistence/__tests__/drizzle-usuario.repository.spec.ts`

---

### REQ-6: Standardize Test Naming

#### Description
Rename all `.test.ts` files to `.spec.ts` for consistency and update vitest configuration.

#### Acceptance Criteria
- [ ] All test files renamed from `*.test.ts` to `*.spec.ts`
- [ ] `vitest.config.ts` include pattern updated to `['src/**/*.spec.ts']`
- [ ] No broken imports after rename
- [ ] All tests still pass after rename

#### Files Affected
- All `*.test.ts` files in `apps/api/src/`
- `apps/api/vitest.config.ts`

---

### REQ-7: Coverage Validation

#### Description
Ensure coverage meets thresholds after adding new module tests.

#### Acceptance Criteria
- [ ] `pnpm test:coverage` runs successfully
- [ ] Global coverage >= 80%
- [ ] Auth module coverage >= 85%
- [ ] Usuarios module coverage >= 85%
- [ ] Notificaciones module coverage >= 85%
- [ ] New modules have reasonable thresholds (start at 70%, adjust as needed)

#### Coverage Thresholds (vitest.config.ts)

```typescript
thresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  // Critical modules
  './src/modules/auth/**': { branches: 85, functions: 85, lines: 85, statements: 85 },
  './src/modules/usuarios/**': { branches: 85, functions: 85, lines: 85, statements: 85 },
  './src/modules/notificaciones/**': { branches: 85, functions: 85, lines: 85, statements: 85 },
  // New modules - start conservative
  './src/modules/animales/**': { branches: 70, functions: 70, lines: 70, statements: 70 },
  './src/modules/servicios/**': { branches: 70, functions: 70, lines: 70, statements: 70 },
  './src/modules/predios/**': { branches: 70, functions: 70, lines: 70, statements: 70 },
  './src/modules/configuracion/**': { branches: 65, functions: 65, lines: 65, statements: 65 },
  './src/modules/productos/**': { branches: 70, functions: 70, lines: 70, statements: 70 },
  './src/modules/reportes/**': { branches: 70, functions: 70, lines: 70, statements: 70 },
  './src/modules/imagenes/**': { branches: 70, functions: 70, lines: 70, statements: 70 },
  './src/modules/maestros/**': { branches: 65, functions: 65, lines: 65, statements: 65 },
}
```

#### Files Affected
- `apps/api/vitest.config.ts`

---

## Implementation Phases

### Phase 1: Immediate Fixes (Day 1)
1. Fix verify-2fa tests with bcrypt hash
2. Fix all 13 E2E assertions with exact status codes

### Phase 2: Infrastructure (Day 1-2)
1. Create factories.ts with entity builders
2. Create mock-builders.ts with repository mocks
3. Create fixtures.ts with common data
4. Update setup.ts with global utilities

### Phase 3: Module Tests (Day 2-5)
Priority order:
1. animales (16+ use cases)
2. servicios (20+ use cases)
3. predios
4. configuracion (30+ use cases)
5. productos
6. reportes (12+ use cases)
7. imagenes (4 use cases)
8. maestros (25+ use cases)

### Phase 4: Cleanup (Day 5)
1. Rename all .test.ts → .spec.ts
2. Update vitest.config.ts include pattern
3. Add per-module coverage thresholds

### Phase 5: Verification
1. Run `pnpm test` - all passing
2. Run `pnpm test:coverage` - thresholds met

## Success Criteria

- [ ] All tests pass (0 failures)
- [ ] Global coverage >= 80%
- [ ] Critical modules coverage >= 85%
- [ ] E2E assertions are specific (no array.contains)
- [ ] Test infrastructure created (factories, mocks, fixtures)
- [ ] 11 modules have unit tests
- [ ] All test files use .spec.ts extension
- [ ] vitest.config.ts updated with .spec.ts pattern

## Dependencies

- vitest (existing)
- @vitest/coverage-v8 (existing)
- bcrypt (existing)
- @faker-js/faker (to install for factories)

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Coverage threshold too high for new modules | Medium | Medium | Start with conservative thresholds (65-70%), adjust after initial tests |
| configuracion/maestros have 55+ use cases (time-intensive) | High | High | Prioritize critical paths, mark edge cases with `it.skip()` and TODOs |
| bcrypt hash generation slows tests | Low | Low | Pre-compute hashes in fixtures, use static hashes |
| Renaming breaks imports | Low | Medium | Automated find/replace, run tests after each batch |
| E2E tests require better-sqlite3 native module | High | Low | Already handled with conditional skip |

## Rollback Plan

1. `git revert` all commits from this change
2. Restore vitest.config.ts from git
3. Delete `src/__tests__/helpers/` directory
4. Delete all new test files in modules
5. Revert .spec.ts → .test.ts renames
6. Run `pnpm test` to verify original state