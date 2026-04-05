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