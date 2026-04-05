# Configuración Module Specification

## Purpose

CRUD operations for global catalog tables shared across all tenants. These tables have no predio_id and are read-accessible to all authenticated users. Write operations are restricted to super-admin users.

## Requirements

### Requirement: Global Catalog Access

The system MUST provide read access to all configuration catalogs for authenticated users.

#### Scenario: List razas without authentication

- GIVEN I am not authenticated
- WHEN I GET /api/v1/configuracion/razas
- THEN the response status is 401
- AND authentication is required

#### Scenario: List razas with authentication

- GIVEN I am authenticated with valid JWT
- WHEN I GET /api/v1/configuracion/razas
- THEN the response status is 200
- AND the response includes data array of razas
- AND pagination is applied (page, limit, total)

#### Scenario: Get raza by id

- GIVEN I am authenticated
- AND the raza exists
- WHEN I GET /api/v1/configuracion/razas/{id}
- THEN the response status is 200
- AND the data contains the raza

### Requirement: Super-admin Write Access

The system MUST restrict write operations (create, update, delete) to super-admin users only.

#### Scenario: Create raza as super-admin

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/razas with valid data (nombre, descripcion, origen, tipoProduccion)
- THEN the response status is 201
- AND the raza is created

#### Scenario: Create raza as regular user

- GIVEN I am authenticated as regular user (not super-admin)
- WHEN I POST /api/v1/configuracion/razas with valid data
- THEN the response status is 403
- AND the error indicates insufficient permissions

#### Scenario: Update raza as super-admin

- GIVEN I am authenticated as super-admin
- AND the raza exists
- WHEN I PATCH /api/v1/configuracion/razas/{id} with partial data
- THEN the response status is 200
- AND the raza is updated

#### Scenario: Delete raza as super-admin

- GIVEN I am authenticated as super-admin
- AND the raza exists
- WHEN I DELETE /api/v1/configuracion/razas/{id}
- THEN the response status is 200
- AND the raza.activo is set to 0

### Requirement: Config Condiciones Corporales

The system MUST provide CRUD for body condition scores with valorMin and valorMax constraints.

#### Scenario: Create condicion corporal

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/condiciones-corporales with valid data (nombre, descripcion, valorMin, valorMax)
- THEN the response status is 201
- AND the condicion corporal is created

#### Scenario: List condiciones corporales

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/condiciones-corporales
- THEN the response includes data array of condiciones corporales

### Requirement: Config Tipos Explotacion

The system MUST provide CRUD for farm exploitation types.

#### Scenario: Create tipo explotacion

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/tipos-explotacion with valid data (nombre, descripcion)
- THEN the response status is 201
- AND the tipo explotacion is created

#### Scenario: List tipos explotacion

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/tipos-explotacion
- THEN the response includes data array of tipos explotacion

### Requirement: Config Calidad Animal

The system MUST provide CRUD for animal quality grades.

#### Scenario: Create calidad animal

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/calidad-animal with valid data (nombre, descripcion)
- THEN the response status is 201
- AND the calidad animal is created

#### Scenario: List calidad animal

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/calidad-animal
- THEN the response includes data array of calidad animal

### Requirement: Config Colores

The system MUST provide CRUD for animal colors with optional codigo.

#### Scenario: Create color

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/colores with valid data (nombre, codigo)
- THEN the response status is 201
- AND the color is created

#### Scenario: List colores

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/colores
- THEN the response includes data array of colores

### Requirement: Config Rangos Edades

The system MUST provide CRUD for age range categories with rango1, rango2, and sexo fields.

#### Scenario: Create rango edad

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/rangos-edades with valid data (nombre, rango1, rango2, sexo, descripcion)
- THEN the response status is 201
- AND the rango edad is created

#### Scenario: List rangos edades

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/rangos-edades
- THEN the response includes data array of rangos edades

### Requirement: Config Key Values

The system MUST provide CRUD for generic key-value configuration with unique (opcion, key) constraint.

#### Scenario: Create key value

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/configuracion/key-values with valid data (opcion, key, value, descripcion)
- THEN the response status is 201
- AND the key value is created

#### Scenario: Duplicate key value violation

- GIVEN I am authenticated as super-admin
- AND a key value with opcion "SISTEMA" and key "VERSION" already exists
- WHEN I POST /api/v1/configuracion/key-values with opcion "SISTEMA" and key "VERSION"
- THEN the response status is 409
- AND the error indicates duplicate (opcion, key)

#### Scenario: List key values by opcion

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/key-values?opcion=SISTEMA
- THEN the response includes only key values with opcion "SISTEMA"

### Requirement: Soft-delete Filtering

The system MUST filter out soft-deleted entities (activo = 0) from all list and get operations.

#### Scenario: Exclude soft-deleted razas

- GIVEN I am authenticated
- AND there are 5 razas, 2 with activo = 0
- WHEN I GET /api/v1/configuracion/razas
- THEN the response includes only the 3 active razas

### Requirement: Pagination Defaults

The system MUST apply default pagination values and enforce maximum limits.

#### Scenario: Default pagination

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/razas
- THEN the response uses default page=1 and limit=20

#### Scenario: Maximum limit enforcement

- GIVEN I am authenticated
- WHEN I GET /api/v1/configuracion/razas?limit=1000
- THEN the response uses limit=100 (maximum allowed)
- AND pagination meta reflects the applied limit