# Delta Spec: Maestros CRUD Fix

## ADDED Requirements

### Requirement: Frontend Field Alignment — Propietarios

The frontend Propietarios page MUST send `tipoDocumento` and `numeroDocumento` fields instead of the single `documento` field, matching the backend DTO `CreatePropietarioDto`.

#### Scenario: Create propietario with document fields

- GIVEN the user opens the "Nuevo Propietario" form
- WHEN the user fills `tipoDocumento` (e.g., "CC") and `numeroDocumento` (e.g., "12345678")
- THEN the API request body contains `{ nombre, tipoDocumento, numeroDocumento, telefono, email }`
- AND the backend returns 201 with the created entity

#### Scenario: Edit propietario preserves document split

- GIVEN an existing propietario with `tipoDocumento: "CC"` and `numeroDocumento: "98765"`
- WHEN the user opens the edit form
- THEN the form displays two separate fields: "Tipo de documento" and "Número de documento"
- AND the submitted payload contains both fields separately

#### Scenario: Table columns display document fields

- GIVEN a list of propietarios
- WHEN the table renders
- THEN columns show `tipoDocumento` and `numeroDocumento` as separate columns
- AND no `documento` column exists

### Requirement: Frontend Field Alignment — Hierros

The frontend Hierros page MUST NOT send `codigo` or `imagen_url` fields. The backend schema only supports `nombre` and `descripcion`. These fields MUST be removed from the form FIELDS array and table columns.

#### Scenario: Create hierro with valid fields only

- GIVEN the user opens the "Nuevo Hierro" form
- WHEN the user fills `nombre` and `descripcion`
- THEN the API request body contains ONLY `{ nombre, descripcion }`
- AND no `codigo` or `imagen_url` fields are sent
- AND the backend returns 201

#### Scenario: Hierro form has no code or image fields

- GIVEN the user views the Hierro form
- THEN the form shows only "Nombre" (required) and "Descripción" (optional) fields
- AND no "Código" or "URL de imagen" fields are rendered

### Requirement: Frontend Field Alignment — Diagnósticos

The frontend Diagnósticos page MUST send `categoria` instead of `tipo`, matching the backend DTO `CreateDiagnosticoVeterinarioDto` and database column `categoria`.

#### Scenario: Create diagnóstico with categoria field

- GIVEN the user opens the "Nuevo Diagnóstico" form
- WHEN the user fills `nombre`, `descripcion`, and `categoria`
- THEN the API request body contains `{ nombre, descripcion, categoria }`
- AND no `tipo` field is sent
- AND the backend returns 201

#### Scenario: Diagnóstico table shows categoria column

- GIVEN a list of diagnósticos
- WHEN the table renders
- THEN the column header reads "Categoría" (not "Tipo")
- AND the column maps to the `categoria` field

### Requirement: Frontend Field Alignment — Lugares Compra/Venta

The frontend Lugares Compra and Lugares Venta pages MUST send `tipo`, `ubicacion`, `contacto`, and `telefono` fields instead of `municipio` and `departamento`, matching the backend DTOs.

#### Scenario: Create lugar compra with correct fields

- GIVEN the user opens the "Nuevo Lugar" form for compras
- WHEN the user fills `nombre`, `tipo`, `ubicacion`, `contacto`, and `telefono`
- THEN the API request body contains `{ nombre, tipo, ubicacion, contacto, telefono }`
- AND no `municipio` or `departamento` fields are sent
- AND the backend returns 201

#### Scenario: Create lugar venta with correct fields

- GIVEN the user opens the "Nuevo Lugar" form for ventas
- WHEN the user fills `nombre`, `tipo`, `ubicacion`, `contacto`, and `telefono`
- THEN the API request body contains `{ nombre, tipo, ubicacion, contacto, telefono }`
- AND no `municipio` or `departamento` fields are sent
- AND the backend returns 201

#### Scenario: Table columns match backend fields

- GIVEN a list of lugares compra or venta
- WHEN the table renders
- THEN columns show: Nombre, Tipo, Ubicación, Contacto, Teléfono, Estado
- AND no "Municipio" or "Departamento" columns exist

### Requirement: Pagination Connection

The frontend `getAll()` method in `RealMaestrosService` MUST accept and pass pagination parameters `{ page, limit, search }` as query string parameters to the backend API.

#### Scenario: Fetch first page with default pagination

- GIVEN the `useMaestro` hook is called for any entity
- WHEN the initial load occurs
- THEN the API call includes query params `?page=1&limit=20`
- AND the response includes `{ data: [...], meta: { page, limit, total } }`

#### Scenario: Fetch with custom page and limit

- GIVEN the user navigates to page 3 with 10 items per page
- WHEN the API call is made
- THEN the request includes `?page=3&limit=10`
- AND the response contains the correct page of results

#### Scenario: Search with pagination

- GIVEN the user types "vacuna" in the search field
- WHEN the API call is made
- THEN the request includes `?page=1&limit=20&search=vacuna`
- AND results are filtered by the search term

#### Scenario: Pagination state exposed in hook

- GIVEN the `useMaestro` hook is used
- WHEN pagination controls are needed
- THEN the hook exposes `{ page, limit, total, setPage, setLimit }` state
- AND consumers can control pagination programmatically

### Requirement: Controller DI Registration

The `MaestrosController` MUST be registered in the DI container (tsyringe) and used as the sole handler for all 40 maestro endpoints. The inline route handlers in `maestros.routes.ts` MUST be removed.

#### Scenario: Controller handles list request

- GIVEN a GET request to `/veterinarios?page=1&limit=20`
- WHEN the request reaches the server
- THEN `MaestrosController.listVeterinarios()` is invoked
- AND the controller extracts pagination from `request.query`
- AND the controller calls `ListVeterinariosUseCase.execute()`
- AND the response is `{ success: true, data: [...], meta: { page, limit, total } }`

#### Scenario: Controller handles create request

- GIVEN a POST request to `/propietarios` with valid body
- WHEN the request reaches the server
- THEN `MaestrosController.crearPropietario()` is invoked
- AND the controller passes `request.body` and `predioId` to the use case
- AND the response is 201 with `{ success: true, data: createdEntity }`

#### Scenario: Controller handles delete request

- GIVEN a DELETE request to `/hierros/5`
- WHEN the request reaches the server
- THEN `MaestrosController.deleteHierro()` is invoked
- AND the controller passes `id=5` and `predioId` to the use case
- AND the response is 200 with `{ success: true, data: { message: 'Hierro eliminado' } }`

#### Scenario: All 40 endpoints use controller methods

- GIVEN the route registration module
- WHEN routes are registered
- THEN all 40 endpoints (8 entities × 5 operations) delegate to `MaestrosController` methods
- AND no inline route handlers exist in `maestros.routes.ts`
- AND routes only define: path, HTTP method, schema validation, preHandler, and controller method reference

### Requirement: E2E Test Coverage

E2E tests MUST cover CREATE, UPDATE, and DELETE operations for all 8 maestro entities, verifying field alignment and pagination.

#### Scenario: E2E test for propietarios CRUD

- GIVEN the test environment is set up
- WHEN creating a propietario with `{ nombre, tipoDocumento, numeroDocumento }`
- THEN the response contains the created entity with correct fields
- WHEN updating the propietario
- THEN the updated fields are persisted
- WHEN deleting the propietario
- THEN the entity is soft-deleted (activo = 0)

#### Scenario: E2E test for hierros field validation

- GIVEN the test environment is set up
- WHEN creating a hierro with `{ nombre, descripcion }`
- THEN the response is 201 with the entity
- WHEN attempting to create a hierro with `codigo` or `imagen_url`
- THEN the response is 400 (additionalProperties: false rejects unknown fields)

#### Scenario: E2E test for pagination params

- GIVEN the test environment is set up with 25 diagnosticos
- WHEN requesting `GET /diagnosticos?page=2&limit=10`
- THEN the response contains exactly 10 items
- AND `meta.total` equals 25
- AND `meta.page` equals 2

#### Scenario: E2E test for working entities regression

- GIVEN the 3 currently-working entities (Veterinarios, Motivos Venta, Causas Muerte)
- WHEN running their existing E2E tests
- THEN all tests pass without modification
- AND no regression is introduced

## MODIFIED Requirements

### Requirement: Frontend Zod Schema Validation

The Zod schemas in `maestro.types.ts` MUST match the backend JSON schemas exactly. Currently, `PropietarioSchema`, `HierroSchema`, `DiagnosticoSchema`, `LugarCompraSchema`, and `LugarVentaSchema` have field names that do not match the backend.

**Field alignment table**:

| Entity | Frontend Field (WRONG) | Backend Field (CORRECT) | Action |
|--------|----------------------|------------------------|--------|
| Propietarios | `documento` | `tipoDocumento`, `numeroDocumento` | Split into 2 fields |
| Hierros | `codigo`, `imagen_url` | (not in backend) | Remove from frontend |
| Diagnósticos | `tipo` | `categoria` | Rename field |
| Lugares Compra | `municipio`, `departamento` | `tipo`, `ubicacion`, `contacto`, `telefono` | Replace fields |
| Lugares Venta | `municipio`, `departamento` | `tipo`, `ubicacion`, `contacto`, `telefono` | Replace fields |

Previously: Frontend schemas had field names that did not match backend DTOs, causing CREATE/UPDATE requests to fail with 400 errors.

#### Scenario: Zod schema rejects unknown fields

- GIVEN the `PropietarioSchema`
- WHEN validating `{ nombre: "Test", documento: "123" }`
- THEN validation fails because `documento` is not a schema field
- AND only `tipoDocumento` and `numeroDocumento` are accepted

#### Scenario: Hierro schema only accepts valid fields

- GIVEN the `HierroSchema`
- WHEN validating `{ nombre: "Test", codigo: "ABC", imagen_url: "http://..." }`
- THEN validation fails because `codigo` and `imagen_url` are not schema fields
- AND only `nombre` and `descripcion` are accepted

### Requirement: Maestros API Service Pagination

The `RealMaestrosService.getAll()` method MUST accept an optional `params` argument with `{ page, limit, search }` and pass them as query parameters.

Previously: `getAll()` accepted only `tipo` and made requests without query parameters, ignoring pagination entirely.

#### Scenario: getAll with pagination params

- GIVEN `maestrosService.getAll('veterinarios', { page: 2, limit: 10, search: 'juan' })`
- WHEN the method executes
- THEN the HTTP request is `GET /veterinarios?page=2&limit=10&search=juan`

#### Scenario: getAll without params uses defaults

- GIVEN `maestrosService.getAll('veterinarios')`
- WHEN the method executes
- THEN the HTTP request is `GET /veterinarios?page=1&limit=20`

### Requirement: Maestros Routes Use Controller

The `maestros.routes.ts` file MUST register routes that delegate to `MaestrosController` methods instead of instantiating use cases inline.

Previously: Routes instantiated all 40 use cases directly and handled requests inline, duplicating the controller logic and bypassing DI.

#### Scenario: Route delegates to controller

- GIVEN a route registration for `POST /veterinarios`
- WHEN the route is defined
- THEN it references `controller.crearVeterinario` as the handler
- AND no use case is instantiated in the routes file

## REMOVED Requirements

### Requirement: Inline Use Case Instantiation in Routes

(Reason: All use case instantiation and request handling is moved to `MaestrosController` registered in DI container. Routes file becomes a thin routing layer with schema validation only.)

### Requirement: Frontend Single Document Field for Propietarios

(Reason: Backend expects `tipoDocumento` and `numeroDocumento` as separate fields. The single `documento` field causes 400 errors on CREATE because it's not in the backend JSON schema.)

### Requirement: Frontend Extra Fields for Hierros

(Reason: `codigo` and `imagen_url` are not in the backend schema, DTOs, or database. Keeping them causes 400 errors due to `additionalProperties: false` validation.)
