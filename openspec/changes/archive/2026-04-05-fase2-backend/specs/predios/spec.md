# Predios Module Specification

## Purpose

CRUD operations for farm management entities: predios (farms), potreros (paddocks), sectores (sectors), lotes (lots), grupos (groups), and config_parametros_predio (farm-specific parameters). All entities except predios are tenant-scoped via predio_id.

## Requirements

### Requirement: Predio Management

The system MUST provide CRUD operations for predios (farms) with unique codigo constraint.

#### Scenario: Create predio

- GIVEN I am authenticated with valid JWT
- WHEN I POST /api/v1/predios with valid data (codigo, nombre, departamento, municipio, vereda, areaHectareas, capacidadMaxima, tipoExplotacionId)
- THEN the response status is 201
- AND the response body has success: true
- AND the data contains the created predio with generated id and timestamps

#### Scenario: List predios with pagination

- GIVEN I am authenticated
- WHEN I GET /api/v1/predios?page=1&limit=20
- THEN the response includes data array of predios
- AND meta contains page, limit, total, totalPages

#### Scenario: Get predio by id

- GIVEN I am authenticated
- AND the predio exists
- WHEN I GET /api/v1/predios/{id}
- THEN the response status is 200
- AND the data contains the predio

#### Scenario: Update predio

- GIVEN I am authenticated
- AND the predio exists
- WHEN I PATCH /api/v1/predios/{id} with partial data
- THEN the response status is 200
- AND the data contains updated predio

#### Scenario: Soft-delete predio

- GIVEN I am authenticated
- AND the predio exists
- WHEN I DELETE /api/v1/predios/{id}
- THEN the response status is 200
- AND the predio.activo is set to 0

#### Scenario: Duplicate codigo violation

- GIVEN I am authenticated
- AND a predio with codigo "FINCA001" already exists
- WHEN I POST /api/v1/predios with codigo "FINCA001"
- THEN the response status is 409
- AND the error indicates duplicate codigo

### Requirement: Potrero Management

The system MUST provide CRUD operations for potreros (paddocks) scoped to a predio with unique (predio_id, codigo) constraint.

#### Scenario: Create potrero

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/predios/{predioId}/potreros with valid data
- THEN the response status is 201
- AND the potrero belongs to the specified predio

#### Scenario: List potreros by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/predios/{predioId}/potreros
- THEN the response includes only potreros belonging to that predio
- AND pagination is applied

#### Scenario: Tenant filtering

- GIVEN I am authenticated as user of predio A
- WHEN I GET /api/v1/predios/B/potreros (predio B not owned by user)
- THEN the response status is 403
- AND access is denied

#### Scenario: Duplicate potrero codigo within predio

- GIVEN I am authenticated
- AND predio {predioId} has potrero with codigo "POT001"
- WHEN I POST /api/v1/predios/{predioId}/potreros with codigo "POT001"
- THEN the response status is 409
- AND the error indicates duplicate codigo within predio

### Requirement: Sector Management

The system MUST provide CRUD operations for sectores (sectors) scoped to a predio with unique (predio_id, codigo) constraint.

#### Scenario: Create sector

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/predios/{predioId}/sectores with valid data
- THEN the response status is 201
- AND the sector belongs to the specified predio

#### Scenario: List sectors by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/predios/{predioId}/sectores
- THEN the response includes only sectors belonging to that predio

### Requirement: Lote Management

The system MUST provide CRUD operations for lotes (lots) scoped to a predio.

#### Scenario: Create lote

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/predios/{predioId}/lotes with valid data (nombre, descripcion, tipo)
- THEN the response status is 201
- AND the lote belongs to the specified predio

#### Scenario: List lotes by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/predios/{predioId}/lotes
- THEN the response includes only lotes belonging to that predio

### Requirement: Grupo Management

The system MUST provide CRUD operations for grupos (groups) scoped to a predio.

#### Scenario: Create grupo

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/predios/{predioId}/grupos with valid data (nombre, descripcion)
- THEN the response status is 201
- AND the grupo belongs to the specified predio

#### Scenario: List grupos by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/predios/{predioId}/grupos
- THEN the response includes only grupos belonging to that predio

### Requirement: Config Parametros Predio Management

The system MUST provide CRUD operations for farm-specific configuration parameters with unique (predio_id, codigo) constraint.

#### Scenario: Create config parametro

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/predios/{predioId}/parametros with valid data (codigo, valor, descripcion)
- THEN the response status is 201
- AND the parameter belongs to the specified predio

#### Scenario: List parametros by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/predios/{predioId}/parametros
- THEN the response includes only parameters belonging to that predio

#### Scenario: Duplicate parametro codigo within predio

- GIVEN I am authenticated
- AND predio {predioId} has parameter with codigo "PESO_MINIMO"
- WHEN I POST /api/v1/predios/{predioId}/parametros with codigo "PESO_MINIMO"
- THEN the response status is 409
- AND the error indicates duplicate codigo within predio

### Requirement: Soft-delete Filtering

The system MUST filter out soft-deleted entities (activo = 0) from all list and get operations.

#### Scenario: Exclude soft-deleted entities

- GIVEN I am authenticated
- AND predio {predioId} has 3 potreros, 1 with activo = 0
- WHEN I GET /api/v1/predios/{predioId}/potreros
- THEN the response includes only the 2 active potreros

#### Scenario: Update soft-deleted entity

- GIVEN I am authenticated
- AND potrero {id} has activo = 0
- WHEN I PATCH /api/v1/predios/{predioId}/potreros/{id}
- THEN the response status is 404
- AND the entity is not found

### Requirement: Invalid FK References

The system MUST validate foreign key references and return appropriate errors.

#### Scenario: Invalid predio reference

- GIVEN I am authenticated
- WHEN I POST /api/v1/predios/999999/potreros with valid data
- THEN the response status is 404
- AND the error indicates predio not found

#### Scenario: Invalid tipo_explotacion_id reference

- GIVEN I am authenticated
- WHEN I POST /api/v1/predios with tipoExplotacionId = 999999
- THEN the response status is 400
- AND the error indicates invalid reference