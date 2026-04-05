# Maestros Module Specification

## Purpose

CRUD operations for master data with mixed scope: tenant-scoped entities (veterinarios, propietarios, hierros) and global reference data (diagnosticos_veterinarios, motivos_ventas, causas_muerte, lugares_compras, lugares_ventas).

## Requirements

### Requirement: Tenant-scoped Veterinarios

The system MUST provide CRUD operations for veterinarios scoped to a predio.

#### Scenario: Create veterinario

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/maestros/veterinarios with predioId and valid data (nombre, telefono, email, direccion, numeroRegistro, especialidad)
- THEN the response status is 201
- AND the veterinario belongs to the specified predio

#### Scenario: List veterinarios by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/maestros/veterinarios?predioId={predioId}
- THEN the response includes only veterinarios belonging to that predio

#### Scenario: Tenant filtering for veterinarios

- GIVEN I am authenticated as user of predio A
- WHEN I GET /api/v1/maestros/veterinarios?predioId={predioB}
- THEN the response status is 403
- AND access is denied

#### Scenario: Update veterinario

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- AND veterinario {id} belongs to predio {predioId}
- WHEN I PATCH /api/v1/maestros/veterinarios/{id} with partial data
- THEN the response status is 200
- AND the veterinario is updated

#### Scenario: Delete veterinario

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- AND veterinario {id} belongs to predio {predioId}
- WHEN I DELETE /api/v1/maestros/veterinarios/{id}
- THEN the response status is 200
- AND the veterinario.activo is set to 0

### Requirement: Tenant-scoped Propietarios

The system MUST provide CRUD operations for propietarios scoped to a predio.

#### Scenario: Create propietario

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/maestros/propietarios with predioId and valid data (nombre, tipoDocumento, numeroDocumento, telefono, email, direccion)
- THEN the response status is 201
- AND the propietario belongs to the specified predio

#### Scenario: List propietarios by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/maestros/propietarios?predioId={predioId}
- THEN the response includes only propietarios belonging to that predio

### Requirement: Tenant-scoped Hierros

The system MUST provide CRUD operations for hierros (brand irons) scoped to a predio.

#### Scenario: Create hierro

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/maestros/hierros with predioId and valid data (nombre, descripcion)
- THEN the response status is 201
- AND the hierro belongs to the specified predio

#### Scenario: List hierros by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/maestros/hierros?predioId={predioId}
- THEN the response includes only hierros belonging to that predio

### Requirement: Global Diagnosticos Veterinarios

The system MUST provide CRUD operations for veterinary diagnoses accessible to all tenants.

#### Scenario: Create diagnostico veterinario as super-admin

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/maestros/diagnosticos-veterinarios with valid data (nombre, descripcion, categoria)
- THEN the response status is 201
- AND the diagnostico is created globally

#### Scenario: List diagnosticos veterinarios

- GIVEN I am authenticated
- WHEN I GET /api/v1/maestros/diagnosticos-veterinarios
- THEN the response includes all diagnosticos (no predio filtering)

#### Scenario: Create diagnostico as regular user

- GIVEN I am authenticated as regular user
- WHEN I POST /api/v1/maestros/diagnosticos-veterinarios with valid data
- THEN the response status is 403
- AND the error indicates insufficient permissions

### Requirement: Global Motivos Ventas

The system MUST provide CRUD operations for sale reasons accessible to all tenants.

#### Scenario: Create motivo venta as super-admin

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/maestros/motivos-ventas with valid data (nombre, descripcion)
- THEN the response status is 201
- AND the motivo is created globally

#### Scenario: List motivos ventas

- GIVEN I am authenticated
- WHEN I GET /api/v1/maestros/motivos-ventas
- THEN the response includes all motivos (no predio filtering)

### Requirement: Global Causas Muerte

The system MUST provide CRUD operations for death causes accessible to all tenants.

#### Scenario: Create causa muerte as super-admin

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/maestros/causas-muerte with valid data (nombre, descripcion)
- THEN the response status is 201
- AND the causa is created globally

#### Scenario: List causas muerte

- GIVEN I am authenticated
- WHEN I GET /api/v1/maestros/causas-muerte
- THEN the response includes all causas (no predio filtering)

### Requirement: Global Lugares Compras

The system MUST provide CRUD operations for purchase locations accessible to all tenants.

#### Scenario: Create lugar compra as super-admin

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/maestros/lugares-compras with valid data (nombre, tipo, ubicacion, contacto, telefono)
- THEN the response status is 201
- AND the lugar is created globally

#### Scenario: List lugares compras

- GIVEN I am authenticated
- WHEN I GET /api/v1/maestros/lugares-compras
- THEN the response includes all lugares (no predio filtering)

### Requirement: Global Lugares Ventas

The system MUST provide CRUD operations for sale locations accessible to all tenants.

#### Scenario: Create lugar venta as super-admin

- GIVEN I am authenticated as super-admin
- WHEN I POST /api/v1/maestros/lugares-ventas with valid data (nombre, tipo, ubicacion, contacto, telefono)
- THEN the response status is 201
- AND the lugar is created globally

#### Scenario: List lugares ventas

- GIVEN I am authenticated
- WHEN I GET /api/v1/maestros/lugares-ventas
- THEN the response includes all lugares (no predio filtering)

### Requirement: Dual Access Pattern

The system MUST implement different query patterns for tenant-scoped vs global entities.

#### Scenario: Tenant-scoped query pattern

- GIVEN I am authenticated
- AND I request tenant-scoped entity (veterinarios)
- WHEN I GET /api/v1/maestros/veterinarios?predioId={predioId}
- THEN the repository applies WHERE predio_id = ? AND activo = 1

#### Scenario: Global query pattern

- GIVEN I am authenticated
- AND I request global entity (diagnosticos_veterinarios)
- WHEN I GET /api/v1/maestros/diagnosticos-veterinarios
- THEN the repository applies WHERE activo = 1 (no predio filtering)

### Requirement: Soft-delete Filtering

The system MUST filter out soft-deleted entities (activo = 0) from all list and get operations.

#### Scenario: Exclude soft-deleted veterinarios

- GIVEN I am authenticated
- AND predio {predioId} has 4 veterinarios, 1 with activo = 0
- WHEN I GET /api/v1/maestros/veterinarios?predioId={predioId}
- THEN the response includes only the 3 active veterinarios

#### Scenario: Exclude soft-deleted diagnosticos

- GIVEN I am authenticated
- AND there are 10 diagnosticos, 3 with activo = 0
- WHEN I GET /api/v1/maestros/diagnosticos-veterinarios
- THEN the response includes only the 7 active diagnosticos