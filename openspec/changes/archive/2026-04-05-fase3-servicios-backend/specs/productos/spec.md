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