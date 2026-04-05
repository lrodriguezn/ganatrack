# Animales Module Specification

## Purpose

CRUD operations for animals with self-referencing lineage (madre_id, padre_id), image associations via junction table, and multiple identification systems (codigo, RFID, arete, QR). Animals are tenant-scoped via predio_id.

## Requirements

### Requirement: Animal Creation with Lineage

The system MUST create animals with optional madre_id and padre_id references to existing animals.

#### Scenario: Create animal without lineage

- GIVEN I am authenticated with valid JWT
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/animales with predioId and valid data (codigo, nombre, fechaNacimiento, sexoKey, configRazasId, potreroId)
- THEN the response status is 201
- AND the animal is created with madre_id and padre_id as null

#### Scenario: Create animal with madre reference

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- AND animal {madreId} exists in predio {predioId}
- WHEN I POST /api/v1/animales with madreId = {madreId}
- THEN the response status is 201
- AND the animal.madreId references the existing animal

#### Scenario: Create animal with padre reference

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- AND animal {padreId} exists in predio {predioId}
- WHEN I POST /api/v1/animales with padreId = {padreId}
- THEN the response status is 201
- AND the animal.padreId references the existing animal

#### Scenario: Create animal with both parents

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- AND animals {madreId} and {padreId} exist in predio {predioId}
- WHEN I POST /api/v1/animales with madreId = {madreId} and padreId = {padreId}
- THEN the response status is 201
- AND the animal has both parent references

#### Scenario: Invalid madre reference

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/animales with madreId = 999999
- THEN the response status is 400
- AND the error indicates invalid madre reference

#### Scenario: Cross-predio lineage prevention

- GIVEN I am authenticated
- AND I have access to predio A
- AND animal {madreId} belongs to predio B
- WHEN I POST /api/v1/animales with predioId = A and madreId = {madreId}
- THEN the response status is 400
- AND the error indicates madre must belong to same predio

### Requirement: Animal Unique Constraint

The system MUST enforce unique (predio_id, codigo) constraint for animals.

#### Scenario: Duplicate animal codigo within predio

- GIVEN I am authenticated
- AND predio {predioId} has animal with codigo "ANIMAL001"
- WHEN I POST /api/v1/animales with predioId = {predioId} and codigo "ANIMAL001"
- THEN the response status is 409
- AND the error indicates duplicate codigo within predio

#### Scenario: Same codigo in different predios

- GIVEN I am authenticated
- AND predio A has animal with codigo "ANIMAL001"
- WHEN I POST /api/v1/animales with predioId = B and codigo "ANIMAL001"
- THEN the response status is 201
- AND the animal is created (different predios allow same codigo)

### Requirement: Multiple Identification Systems

The system MUST support multiple identification fields: codigo, codigoRfid, codigoArete, codigoQr.

#### Scenario: Create animal with RFID

- GIVEN I am authenticated
- WHEN I POST /api/v1/animales with codigoRfid = "RFID123456"
- THEN the animal is created with codigoRfid stored

#### Scenario: Create animal with arete

- GIVEN I am authenticated
- WHEN I POST /api/v1/animales with codigoArete = "ARETE789"
- THEN the animal is created with codigoArete stored

#### Scenario: Create animal with QR code

- GIVEN I am authenticated
- WHEN I POST /api/v1/animales with codigoQr = "QR456"
- THEN the animal is created with codigoQr stored

### Requirement: Animal Filtering

The system MUST support filtering animals by predio, potrero, grupo, and estado.

#### Scenario: Filter by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/animales?predioId={predioId}
- THEN the response includes only animals belonging to that predio

#### Scenario: Filter by potrero

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/animales?predioId={predioId}&potreroId={potreroId}
- THEN the response includes only animals in that potrero

#### Scenario: Filter by estado

- GIVEN I am authenticated
- WHEN I GET /api/v1/animales?predioId={predioId}&estadoAnimalKey=1
- THEN the response includes only animals with that estado

#### Scenario: Filter by grupo (future)

- GIVEN I am authenticated
- WHEN I GET /api/v1/animales?predioId={predioId}&grupoId={grupoId}
- THEN the response includes only animals in that grupo
- NOTE: grupo_id field not yet in schema, reserved for future

### Requirement: Animal Genealogy Query

The system MUST provide genealogy information for an animal.

#### Scenario: Get animal with lineage

- GIVEN I am authenticated
- AND animal {id} has madre_id and padre_id
- WHEN I GET /api/v1/animales/{id}
- THEN the response includes animal data with madre and padre references

#### Scenario: Get animal genealogy tree

- GIVEN I am authenticated
- WHEN I GET /api/v1/animales/{id}/genealogia
- THEN the response includes ancestors up to configurable depth
- AND includes madre, padre, abuelos (padre's parents, madre's parents)

### Requirement: Image Association

The system MUST manage animal-image associations via junction table.

#### Scenario: Assign image to animal

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- AND image {imagenId} exists in predio {predioId}
- AND animal {animalId} exists in predio {predioId}
- WHEN I POST /api/v1/animales/{animalId}/imagenes with imagenId
- THEN the response status is 201
- AND the association is created in animales_imagenes

#### Scenario: Remove image from animal

- GIVEN I am authenticated
- AND animal {animalId} has association with image {imagenId}
- WHEN I DELETE /api/v1/animales/{animalId}/imagenes/{imagenId}
- THEN the response status is 200
- AND the association.activo is set to 0

#### Scenario: List animal images

- GIVEN I am authenticated
- AND animal {animalId} has 3 active image associations
- WHEN I GET /api/v1/animales/{animalId}/imagenes
- THEN the response includes the 3 images with their details

#### Scenario: Duplicate image association

- GIVEN I am authenticated
- AND animal {animalId} already has association with image {imagenId}
- WHEN I POST /api/v1/animales/{animalId}/imagenes with imagenId
- THEN the response status is 409
- AND the error indicates duplicate association

#### Scenario: Cross-predio image association

- GIVEN I am authenticated
- AND animal {animalId} belongs to predio A
- AND image {imagenId} belongs to predio B
- WHEN I POST /api/v1/animales/{animalId}/imagenes with imagenId
- THEN the response status is 400
- AND the error indicates image must belong to same predio

### Requirement: Image Management

The system MUST provide CRUD operations for images scoped to a predio.

#### Scenario: Create image

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I POST /api/v1/imagenes with predioId and valid data (ruta, nombreOriginal, mimeType, tamanoBytes, descripcion)
- THEN the response status is 201
- AND the image belongs to the specified predio

#### Scenario: List images by predio

- GIVEN I am authenticated
- AND I have access to predio {predioId}
- WHEN I GET /api/v1/imagenes?predioId={predioId}
- THEN the response includes only images belonging to that predio

### Requirement: Soft-delete Filtering

The system MUST filter out soft-deleted entities (activo = 0) from all list and get operations.

#### Scenario: Exclude soft-deleted animals

- GIVEN I am authenticated
- AND predio {predioId} has 10 animals, 2 with activo = 0
- WHEN I GET /api/v1/animales?predioId={predioId}
- THEN the response includes only the 8 active animals

#### Scenario: Exclude soft-deleted image associations

- GIVEN I am authenticated
- AND animal {animalId} has 5 image associations, 1 with activo = 0
- WHEN I GET /api/v1/animales/{animalId}/imagenes
- THEN the response includes only the 4 active associations

### Requirement: Animal Update

The system MUST allow updating animal data including lineage references.

#### Scenario: Update animal lineage

- GIVEN I am authenticated
- AND animal {id} exists
- AND animal {newMadreId} exists
- WHEN I PATCH /api/v1/animales/{id} with madreId = {newMadreId}
- THEN the response status is 200
- AND the animal.madreId is updated

#### Scenario: Update animal potrero

- GIVEN I am authenticated
- AND animal {id} exists
- AND potrero {newPotreroId} exists
- WHEN I PATCH /api/v1/animales/{id} with potreroId = {newPotreroId}
- THEN the response status is 200
- AND the animal.potreroId is updated

### Requirement: Animal Pagination

The system MUST support pagination for animal lists.

#### Scenario: Paginate animals

- GIVEN I am authenticated
- AND predio {predioId} has 50 animals
- WHEN I GET /api/v1/animales?predioId={predioId}&page=2&limit=20
- THEN the response includes animals 21-40
- AND meta contains page=2, limit=20, total=50, totalPages=3