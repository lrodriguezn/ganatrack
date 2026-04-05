# Servicios Backend Specification

## Purpose

Backend API for managing animal services: palpaciones, inseminaciones, partos, and veterinarios. Follows hexagonal architecture with tenant isolation via `predioId`. All endpoints require authentication and tenant context.

## Entities

| Entity | Key Fields | Notes |
|--------|------------|-------|
| PalpacionGrupal | id, predioId, codigo, fecha, veterinariosId, observaciones, activo | Group event header |
| PalpacionAnimal | id, palpacionGrupalId, animalId, veterinarioId, diagnosticoId, condicionCorporalId, fecha, diasGestacion, fechaParto, comentarios | Individual animal results |
| InseminacionGrupal | id, predioId, codigo, fecha, veterinariosId, observaciones, activo | Group event header |
| InseminacionAnimal | id, inseminacionGrupalId, animalId, veterinarioId, fecha, tipoInseminacionKey, codigoPajuela, diagnosticoId, observaciones | Individual animal records |
| PartoAnimal | id, predioId, animalId, fecha, macho, hembra, muertos, peso, tipoPartoKey, observaciones | Individual birth record |
| PartoCria | id, partoId, criaId, sexoKey, pesoNacimiento, observaciones | Offspring per birth |
| VeterinarioGrupal | id, predioId, codigo, fecha, veterinariosId, tipoServicio, observaciones | Group veterinary event |
| VeterinarioAnimal | id, servicioGrupalId, animalId, veterinarioId, diagnosticoId, fecha, tipoDiagnosticoKey, tratamiento, medicamentos, dosis, comentarios | Individual animal treatment |
| VeterinarioProducto | id, servicioAnimalId, productoId, cantidad, unidad | Product usage per animal |

## Endpoints

### Palpaciones

| Method | Route | Description | Request | Response |
|--------|-------|-------------|---------|----------|
| GET | /servicios/palpaciones | List events | ?predioId&page&limit | Paginated list |
| GET | /servicios/palpaciones/:id | Detail | - | Grupal + animal records |
| POST | /servicios/palpaciones | Create grupal | {predioId, codigo, fecha, ...animales[]} | Created event |
| PUT | /servicios/palpaciones/:id | Update grupal | Partial update | Updated event |
| POST | /servicios/palpaciones/:grupalId/animales | Add animal | {animalId, ...} | Created animal record |
| PUT | /servicios/palpaciones/animales/:id | Update animal result | Partial update | Updated record |
| DELETE | /servicios/palpaciones/animales/:id | Remove animal | - | 204 No Content |

### Inseminaciones

Same pattern as palpaciones with routes `/servicios/inseminaciones` and `/servicios/inseminaciones/:grupalId/animales`.

### Partos (Individual only)

| Method | Route | Description | Request | Response |
|--------|-------|-------------|---------|----------|
| GET | /servicios/partos | List births | ?predioId&page&limit | Paginated list |
| GET | /servicios/partos/:id | Detail | - | Parto + crias |
| POST | /servicios/partos | Register birth | {predioId, animalId, fecha, ...} | Created record |
| PUT | /servicios/partos/:id | Update birth | Partial update | Updated record |

### Veterinarios

Same pattern as palpaciones with routes `/servicios/veterinarios` and `/servicios/veterinarios/:grupalId/animales`. Additional junction for product usage.

## Requirements

### Requirement: Palpaciones Service

The system MUST provide CRUD for group palpation events with individual animal results.

#### Scenario: Create grupal event with animals

- GIVEN authenticated user with predioId 1
- WHEN POST /servicios/palpaciones with valid data and at least one animal
- THEN returns 201 with event id and animal records
- AND each animal record has generated id

#### Scenario: Add animal to existing event

- GIVEN grupal event id 5 exists
- WHEN POST /servicios/palpaciones/5/animales with animalId 10
- THEN returns 201 with new animal record
- AND animal is linked to event

#### Scenario: Update animal palpation result

- GIVEN animal record id 20 exists
- WHEN PUT /servicios/palpaciones/animales/20 with diasGestacion 90
- THEN returns updated record with diasGestacion 90

#### Scenario: Remove animal from event

- GIVEN animal record id 20 exists
- WHEN DELETE /servicios/palpaciones/animales/20
- THEN returns 204 No Content
- AND animal record is soft-deleted (activo=0)

### Requirement: Inseminaciones Service

The system MUST provide CRUD for group insemination events with individual animal records.

#### Scenario: Create insemination event with animals

- GIVEN authenticated user
- WHEN POST /servicios/inseminaciones with codigo, fecha, and animal records
- THEN returns 201 with event and animal records

### Requirement: Partos Service

The system MUST provide CRUD for individual birth records with offspring tracking.

#### Scenario: Register birth with offspring

- GIVEN animalId 10 exists
- WHEN POST /servicios/partos with fecha, macho=1, hembra=0, and crias array
- THEN returns 201 with parto and crias records

#### Scenario: Get birth detail with offspring

- GIVEN parto id 3 exists with 2 crias
- WHEN GET /servicios/partos/3
- THEN returns parto details and array of crias

### Requirement: Veterinarios Service

The system MUST provide CRUD for group veterinary services with product usage tracking.

#### Scenario: Create veterinary event with animal treatments and products

- GIVEN authenticated user
- WHEN POST /servicios/veterinarios with animal records including productos array
- THEN returns 201 with event, animal records, and product junctions

#### Scenario: Update animal treatment

- GIVEN animal treatment record id 15 exists
- WHEN PUT /servicios/veterinarios/animales/15 with tratamiento updated
- THEN returns updated record

### Requirement: Tenant Isolation

All queries MUST filter by `predioId` from tenant context.

#### Scenario: List events filtered by predio

- GIVEN events for predioId 1 and predioId 2 exist
- WHEN user with predioId 1 requests GET /servicios/palpaciones
- THEN only events with predioId 1 are returned

### Requirement: Pagination

List endpoints MUST support pagination with page and limit query parameters.

#### Scenario: Paginate results

- GIVEN 25 events for predioId 1
- WHEN GET /servicios/palpaciones?predioId=1&page=3&limit=10
- THEN returns events 21-25 (if page 3 exists)
- AND includes total count

### Requirement: Validation

All required fields MUST be validated.

#### Scenario: Missing required field

- GIVEN POST /servicios/palpaciones without codigo
- WHEN request processed
- THEN returns 400 with validation error

#### Scenario: Invalid foreign key reference

- GIVEN POST /servicios/palpaciones/1/animales with non-existent animalId
- WHEN request processed
- THEN returns 404 with error

### Requirement: Transaction Boundaries

Grupal creation with animals MUST be atomic.

#### Scenario: Atomic creation fails partially

- GIVEN POST /servicios/palpaciones with 3 animals, one invalid
- WHEN database constraint violated
- THEN entire transaction rolls back
- AND returns 400 with error

## Error Cases

- 400: Validation error (missing fields, invalid types)
- 401: Unauthorized (missing or invalid JWT)
- 403: Forbidden (predio mismatch)
- 404: Resource not found
- 409: Duplicate codigo per predio (unique constraint)
- 422: Business rule violation (e.g., animal already in event)
- 500: Internal server error