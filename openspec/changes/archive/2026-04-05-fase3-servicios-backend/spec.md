# Delta for fase3-servicios-backend

## Domain: Servicios

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

---

## Domain: Productos

# Productos Backend Specification

## Purpose

Backend API for managing veterinary product inventory. Provides CRUD operations with tenant isolation and soft delete.

## Entities

| Entity | Key Fields | Notes |
|--------|------------|-------|
| Producto | id, predioId, codigo, nombre, descripcion, tipoProducto, categoria, presentacion, unidadMedida, precioUnitario, stockMinimo, stockActual, fechaVencimiento, laboratorio, registroInvima, activo | Unique constraint on predioId+codigo |
| ProductoImagen | id, productoId, imagenId, activo | Junction for product images |

## Endpoints

| Method | Route | Description | Request | Response |
|--------|-------|-------------|---------|----------|
| GET | /productos | List products | ?predioId&tipo_producto_key | Filtered list |
| GET | /productos/:id | Get one | - | Product details |
| POST | /productos | Create | {predioId, codigo, nombre, ...} | Created product |
| PUT | /productos/:id | Update | Partial update | Updated product |
| DELETE | /productos/:id | Soft delete | - | 204 No Content |

## Requirements

### Requirement: Product CRUD

The system MUST provide CRUD for veterinary products with tenant isolation.

#### Scenario: Create product with unique code

- GIVEN authenticated user with predioId 1
- WHEN POST /productos with codigo "VIT001" and nombre "Vitaminas"
- THEN returns 201 with product id
- AND product is active (activo=1)

#### Scenario: Duplicate code within same predio fails

- GIVEN product with codigo "VIT001" already exists for predioId 1
- WHEN POST /productos with same codigo for same predioId
- THEN returns 409 with duplicate error

#### Scenario: List products filtered by predio

- GIVEN products for predioId 1 and predioId 2 exist
- WHEN GET /productos?predioId=1
- THEN only products with predioId 1 are returned

#### Scenario: Filter by tipo_producto_key

- GIVEN products with different tipoProducto values
- WHEN GET /productos?tipo_producto_key=1
- THEN only products matching tipoProducto key are returned

#### Scenario: Update product stock

- GIVEN product id 5 with stockActual 10
- WHEN PUT /productos/5 with stockActual 15
- THEN returns updated product with stockActual 15

#### Scenario: Soft delete product

- GIVEN product id 5 exists
- WHEN DELETE /productos/5
- THEN returns 204 No Content
- AND product activo becomes 0
- AND subsequent GET /productos/5 returns 404

### Requirement: Validation

All required fields MUST be validated.

#### Scenario: Missing required fields

- GIVEN POST /productos without codigo
- WHEN request processed
- THEN returns 400 with validation error

#### Scenario: Invalid field types

- GIVEN POST /productos with precioUnitario as string
- WHEN request processed
- THEN returns 400 with type error

### Requirement: Tenant Isolation

All queries MUST filter by `predioId` from tenant context.

#### Scenario: Cross-predio access denied

- GIVEN user with predioId 1 tries to GET /productos/2 (where product belongs to predioId 2)
- WHEN request processed
- THEN returns 404 (not 403 to avoid leaking existence)

### Requirement: Pagination

List endpoint MAY support pagination if needed.

#### Scenario: Paginate large product list

- GIVEN 50 products for predioId 1
- WHEN GET /productos?predioId=1&page=2&limit=20
- THEN returns products 21-40 (if page 2 exists)

## Error Cases

- 400: Validation error (missing/invalid fields)
- 401: Unauthorized
- 403: Forbidden (predio mismatch)
- 404: Resource not found or soft-deleted
- 409: Duplicate codigo within predio
- 500: Internal server error

---

## Domain: Imagenes

# Imagenes Backend Specification

## Purpose

Backend API for image storage and association with animals and products. Handles file upload, metadata storage, and junction management.

## Entities

| Entity | Key Fields | Notes |
|--------|------------|-------|
| Imagen | id, predioId, ruta, nombreOriginal, mimeType, tamanoBytes, descripcion, activo | File path stored locally |
| AnimalImagen | id, animalId, imagenId, activo | Junction animal-image |
| ProductoImagen | id, productoId, imagenId, activo | Junction product-image (shared with productos module) |

## Endpoints

| Method | Route | Description | Request | Response |
|--------|-------|-------------|---------|----------|
| POST | /imagenes/upload | Upload image | multipart: file, predioId, descripcion? | { id, ruta } |
| GET | /imagenes/:id | Get metadata | - | Image metadata |
| DELETE | /imagenes/:id | Delete image | - | 204 No Content |
| GET | /imagenes/animal/:animalId | List animal images | - | Array of images |
| POST | /imagenes/animal/:animalId | Associate image | { imagenId } | Created junction |
| GET | /imagenes/producto/:productoId | List product images | - | Array of images |
| POST | /imagenes/producto/:productoId | Associate image | { imagenId } | Created junction |

## Requirements

### Requirement: Image Upload

The system MUST accept multipart file upload and store image metadata.

#### Scenario: Upload image successfully

- GIVEN authenticated user with predioId 1
- WHEN POST /imagenes/upload with file and predioId
- THEN returns 201 with image id and ruta
- AND metadata stored in imagenes table

#### Scenario: Upload fails with unsupported MIME type

- GIVEN file with .exe extension
- WHEN POST /imagenes/upload
- THEN returns 400 with unsupported type error

#### Scenario: Upload fails with file too large

- GIVEN file exceeding 10MB limit
- WHEN POST /imagenes/upload
- THEN returns 413 with size error

### Requirement: Image Metadata

The system MUST provide image metadata retrieval.

#### Scenario: Get existing image metadata

- GIVEN image id 5 exists
- WHEN GET /imagenes/5
- THEN returns image metadata (ruta, nombreOriginal, mimeType, tamanoBytes, descripcion)

#### Scenario: Get non-existent image

- GIVEN image id 999 does not exist
- WHEN GET /imagenes/999
- THEN returns 404

### Requirement: Image Deletion

The system MUST support soft delete of images.

#### Scenario: Delete image

- GIVEN image id 5 exists
- WHEN DELETE /imagenes/5
- THEN returns 204 No Content
- AND image activo becomes 0
- AND associated junctions remain (soft delete)

### Requirement: Animal Image Association

The system MUST manage image associations with animals.

#### Scenario: List images for animal

- GIVEN animal id 10 has 3 associated images
- WHEN GET /imagenes/animal/10
- THEN returns array of 3 image metadata objects

#### Scenario: Associate image with animal

- GIVEN image id 5 and animal id 10 exist
- WHEN POST /imagenes/animal/10 with imagenId 5
- THEN returns 201 with junction id
- AND association created in animales_imagenes

#### Scenario: Duplicate association fails

- GIVEN association between animal 10 and image 5 already exists
- WHEN POST /imagenes/animal/10 with same imagenId
- THEN returns 409 duplicate error

### Requirement: Product Image Association

The system MUST manage image associations with products.

#### Scenario: List images for product

- GIVEN product id 7 has 2 associated images
- WHEN GET /imagenes/producto/7
- THEN returns array of 2 image metadata objects

#### Scenario: Associate image with product

- GIVEN image id 6 and product id 7 exist
- WHEN POST /imagenes/producto/7 with imagenId 6
- THEN returns 201 with junction id

### Requirement: Tenant Isolation

All image operations MUST enforce predioId ownership.

#### Scenario: Upload image with wrong predio

- GIVEN user with predioId 1 tries to upload image with predioId 2
- WHEN request processed
- THEN returns 403 forbidden

#### Scenario: Access image from different predio

- GIVEN image id 5 belongs to predioId 2
- WHEN user with predioId 1 requests GET /imagenes/5
- THEN returns 404 (not 403)

### Requirement: Validation

File upload MUST validate file size and MIME type.

#### Scenario: Reject invalid MIME type

- GIVEN file with .txt extension
- WHEN POST /imagenes/upload
- THEN returns 400 with validation error

#### Scenario: Reject file over size limit

- GIVEN file larger than configured limit (default 10MB)
- WHEN POST /imagenes/upload
- THEN returns 413 payload too large

## Error Cases

- 400: Validation error (invalid file type, missing fields)
- 401: Unauthorized
- 403: Forbidden (predio mismatch)
- 404: Image or association not found
- 409: Duplicate association
- 413: File size exceeds limit
- 500: Internal server error (file system error)