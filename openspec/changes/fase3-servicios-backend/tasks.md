# Tasks: Fase 3 - Servicios Backend

## Phase 1: Foundation / Infrastructure

### 1.1 Database Schema Verification
- [x] 1.1.1 Verify `servicios_palpaciones_grupal` table exists in schema
- [x] 1.1.2 Verify `servicios_palpaciones_animales` table exists in schema
- [x] 1.1.3 Verify `servicios_inseminacion_grupal` table exists in schema
- [x] 1.1.4 Verify `servicios_inseminacion_animales` table exists in schema
- [x] 1.1.5 Verify `servicios_partos_animales` table exists in schema
- [x] 1.1.6 Verify `servicios_partos_crias` table exists in schema
- [x] 1.1.7 Verify `servicios_veterinarios_grupal` table exists in schema
- [x] 1.1.8 Verify `servicios_veterinarios_animales` table exists in schema
- [x] 1.1.9 Verify `servicios_veterinarios_productos` table exists in schema
- [x] 1.1.10 Verify `productos` table exists in schema
- [x] 1.1.11 Verify `productos_imagenes` table exists in schema
- [x] 1.1.12 Verify `imagenes` table exists in schema (shared)

### 1.2 Shared Transaction Manager
- [x] 1.2.1 Create `apps/api/src/shared/types/transaction.ts` with TransactionCallback and ITransactionManager
- [x] 1.2.2 Create `apps/api/src/shared/services/transaction-manager.ts` with Drizzle implementation

### 1.3 Module Directory Structure
- [x] 1.3.1 Create directory `apps/api/src/modules/servicios/domain/entities`
- [x] 1.3.2 Create directory `apps/api/src/modules/servicios/domain/repositories`
- [x] 1.3.3 Create directory `apps/api/src/modules/servicios/application/dtos`
- [x] 1.3.4 Create directory `apps/api/src/modules/servicios/application/use-cases`
- [x] 1.3.5 Create directory `apps/api/src/modules/servicios/infrastructure/persistence`
- [x] 1.3.6 Create directory `apps/api/src/modules/servicios/infrastructure/mappers`
- [x] 1.3.7 Create directory `apps/api/src/modules/servicios/infrastructure/http/controllers`
- [x] 1.3.8 Create directory `apps/api/src/modules/servicios/infrastructure/http/routes`
- [x] 1.3.9 Create directory `apps/api/src/modules/servicios/infrastructure/http/schemas`
- [x] 1.3.10 Create directory `apps/api/src/modules/productos/domain/entities`
- [x] 1.3.11 Create directory `apps/api/src/modules/productos/domain/repositories`
- [x] 1.3.12 Create directory `apps/api/src/modules/productos/application/dtos`
- [x] 1.3.13 Create directory `apps/api/src/modules/productos/application/use-cases`
- [x] 1.3.14 Create directory `apps/api/src/modules/productos/infrastructure/persistence`
- [x] 1.3.15 Create directory `apps/api/src/modules/productos/infrastructure/mappers`
- [x] 1.3.16 Create directory `apps/api/src/modules/productos/infrastructure/http/controllers`
- [x] 1.3.17 Create directory `apps/api/src/modules/productos/infrastructure/http/routes`
- [x] 1.3.18 Create directory `apps/api/src/modules/productos/infrastructure/http/schemas`
- [x] 1.3.19 Create directory `apps/api/src/modules/imagenes/domain/entities`
- [x] 1.3.20 Create directory `apps/api/src/modules/imagenes/domain/repositories`
- [x] 1.3.21 Create directory `apps/api/src/modules/imagenes/application/dtos`
- [x] 1.3.22 Create directory `apps/api/src/modules/imagenes/application/use-cases`
- [x] 1.3.23 Create directory `apps/api/src/modules/imagenes/infrastructure/persistence`
- [x] 1.3.24 Create directory `apps/api/src/modules/imagenes/infrastructure/mappers`
- [x] 1.3.25 Create directory `apps/api/src/modules/imagenes/infrastructure/http/controllers`
- [x] 1.3.26 Create directory `apps/api/src/modules/imagenes/infrastructure/http/routes`
- [x] 1.3.27 Create directory `apps/api/src/modules/imagenes/infrastructure/http/schemas`

---

## Phase 2: Servicios Module - Domain Layer

### 2.1 Palpaciones Entities
- [x] 2.1.1 Create `apps/api/src/modules/servicios/domain/entities/palpacion-grupal.entity.ts` interface
- [x] 2.1.2 Create `apps/api/src/modules/servicios/domain/entities/palpacion-animal.entity.ts` interface

### 2.2 Palpaciones Repositories
- [x] 2.2.1 Create `apps/api/src/modules/servicios/domain/repositories/palpacion-grupal.repository.ts` interface + Symbol
- [x] 2.2.2 Create `apps/api/src/modules/servicios/domain/repositories/palpacion-animal.repository.ts` interface + Symbol

### 2.3 Inseminaciones Entities
- [x] 2.3.1 Create `apps/api/src/modules/servicios/domain/entities/inseminacion-grupal.entity.ts` interface
- [x] 2.3.2 Create `apps/api/src/modules/servicios/domain/entities/inseminacion-animal.entity.ts` interface

### 2.4 Inseminaciones Repositories
- [x] 2.4.1 Create `apps/api/src/modules/servicios/domain/repositories/inseminacion-grupal.repository.ts` interface + Symbol
- [x] 2.4.2 Create `apps/api/src/modules/servicios/domain/repositories/inseminacion-animal.repository.ts` interface + Symbol

### 2.5 Partos Entities
- [x] 2.5.1 Create `apps/api/src/modules/servicios/domain/entities/parto-animal.entity.ts` interface
- [x] 2.5.2 Create `apps/api/src/modules/servicios/domain/entities/parto-cria.entity.ts` interface

### 2.6 Partos Repositories
- [x] 2.6.1 Create `apps/api/src/modules/servicios/domain/repositories/parto-animal.repository.ts` interface + Symbol
- [x] 2.6.2 Create `apps/api/src/modules/servicios/domain/repositories/parto-cria.repository.ts` interface + Symbol

### 2.7 Veterinarios Entities
- [x] 2.7.1 Create `apps/api/src/modules/servicios/domain/entities/veterinario-grupal.entity.ts` interface
- [x] 2.7.2 Create `apps/api/src/modules/servicios/domain/entities/veterinario-animal.entity.ts` interface
- [x] 2.7.3 Create `apps/api/src/modules/servicios/domain/entities/veterinario-producto.entity.ts` interface

### 2.8 Veterinarios Repositories
- [x] 2.8.1 Create `apps/api/src/modules/servicios/domain/repositories/veterinario-grupal.repository.ts` interface + Symbol
- [x] 2.8.2 Create `apps/api/src/modules/servicios/domain/repositories/veterinario-animal.repository.ts` interface + Symbol
- [x] 2.8.3 Create `apps/api/src/modules/servicios/domain/repositories/veterinario-producto.repository.ts` interface + Symbol

---

## Phase 3: Servicios Module - Application Layer

### 3.1 Palpaciones DTOs
- [x] 3.1.1 Create `apps/api/src/modules/servicios/application/dtos/palpacion-grupal.dto.ts` (Create, Update, Response)
- [x] 3.1.2 Create `apps/api/src/modules/servicios/application/dtos/palpacion-animal.dto.ts` (Create, Update, Response)

### 3.2 Palpaciones Use Cases
- [x] 3.2.1 Create `apps/api/src/modules/servicios/application/use-cases/list-palpaciones-grupales.use-case.ts`
- [x] 3.2.2 Create `apps/api/src/modules/servicios/application/use-cases/get-palpacion-grupal.use-case.ts`
- [x] 3.2.3 Create `apps/api/src/modules/servicios/application/use-cases/crear-palpacion-grupal.use-case.ts` (with transaction)
- [x] 3.2.4 Create `apps/api/src/modules/servicios/application/use-cases/update-palpacion-grupal.use-case.ts`
- [x] 3.2.5 Create `apps/api/src/modules/servicios/application/use-cases/delete-palpacion-grupal.use-case.ts`
- [x] 3.2.6 Create `apps/api/src/modules/servicios/application/use-cases/add-palpacion-animal.use-case.ts`
- [x] 3.2.7 Create `apps/api/src/modules/servicios/application/use-cases/update-palpacion-animal.use-case.ts`
- [x] 3.2.8 Create `apps/api/src/modules/servicios/application/use-cases/remove-palpacion-animal.use-case.ts`

### 3.3 Inseminaciones DTOs
- [x] 3.3.1 Create `apps/api/src/modules/servicios/application/dtos/inseminacion-grupal.dto.ts` (Create, Update, Response)
- [x] 3.3.2 Create `apps/api/src/modules/servicios/application/dtos/inseminacion-animal.dto.ts` (Create, Update, Response)

### 3.4 Inseminaciones Use Cases
- [x] 3.4.1 Create `apps/api/src/modules/servicios/application/use-cases/list-inseminaciones-grupales.use-case.ts`
- [x] 3.4.2 Create `apps/api/src/modules/servicios/application/use-cases/get-inseminacion-grupal.use-case.ts`
- [x] 3.4.3 Create `apps/api/src/modules/servicios/application/use-cases/crear-inseminacion-grupal.use-case.ts` (with transaction)
- [x] 3.4.4 Create `apps/api/src/modules/servicios/application/use-cases/update-inseminacion-grupal.use-case.ts`
- [x] 3.4.5 Create `apps/api/src/modules/servicios/application/use-cases/delete-inseminacion-grupal.use-case.ts`
- [x] 3.4.6 Create `apps/api/src/modules/servicios/application/use-cases/add-inseminacion-animal.use-case.ts`
- [x] 3.4.7 Create `apps/api/src/modules/servicios/application/use-cases/update-inseminacion-animal.use-case.ts`
- [x] 3.4.8 Create `apps/api/src/modules/servicios/application/use-cases/remove-inseminacion-animal.use-case.ts`

### 3.5 Partos DTOs
- [x] 3.5.1 Create `apps/api/src/modules/servicios/application/dtos/parto-animal.dto.ts` (Create, Update, Response)
- [x] 3.5.2 Create `apps/api/src/modules/servicios/application/dtos/parto-cria.dto.ts` (Create, Response)

### 3.6 Partos Use Cases
- [x] 3.6.1 Create `apps/api/src/modules/servicios/application/use-cases/list-partos.use-case.ts`
- [x] 3.6.2 Create `apps/api/src/modules/servicios/application/use-cases/get-parto.use-case.ts`
- [x] 3.6.3 Create `apps/api/src/modules/servicios/application/use-cases/crear-parto.use-case.ts` (with crias transaction)
- [x] 3.6.4 Create `apps/api/src/modules/servicios/application/use-cases/update-parto.use-case.ts`
- [x] 3.6.5 Create `apps/api/src/modules/servicios/application/use-cases/delete-parto.use-case.ts`

### 3.7 Veterinarios DTOs
- [x] 3.7.1 Create `apps/api/src/modules/servicios/application/dtos/veterinario-grupal.dto.ts` (Create, Update, Response)
- [x] 3.7.2 Create `apps/api/src/modules/servicios/application/dtos/veterinario-animal.dto.ts` (Create, Update, Response)
- [x] 3.7.3 Create `apps/api/src/modules/servicios/application/dtos/veterinario-producto.dto.ts` (Create, Response)

### 3.8 Veterinarios Use Cases
- [x] 3.8.1 Create `apps/api/src/modules/servicios/application/use-cases/list-veterinarios-grupales.use-case.ts`
- [x] 3.8.2 Create `apps/api/src/modules/servicios/application/use-cases/get-veterinario-grupal.use-case.ts`
- [x] 3.8.3 Create `apps/api/src/modules/servicios/application/use-cases/crear-veterinario-grupal.use-case.ts` (with transaction)
- [x] 3.8.4 Create `apps/api/src/modules/servicios/application/use-cases/update-veterinario-grupal.use-case.ts`
- [x] 3.8.5 Create `apps/api/src/modules/servicios/application/use-cases/delete-veterinario-grupal.use-case.ts`
- [x] 3.8.6 Create `apps/api/src/modules/servicios/application/use-cases/add-veterinario-animal.use-case.ts`
- [x] 3.8.7 Create `apps/api/src/modules/servicios/application/use-cases/update-veterinario-animal.use-case.ts`
- [x] 3.8.8 Create `apps/api/src/modules/servicios/application/use-cases/remove-veterinario-animal.use-case.ts`

---

## Phase 4: Servicios Module - Infrastructure Layer

### 4.1 Palpaciones Infrastructure
- [x] 4.1.1 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-palpacion-grupal.repository.ts`
- [x] 4.1.2 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-palpacion-animal.repository.ts`
- [x] 4.1.3 Create `apps/api/src/modules/servicios/infrastructure/mappers/palpacion-grupal.mapper.ts`
- [x] 4.1.4 Create `apps/api/src/modules/servicios/infrastructure/mappers/palpacion-animal.mapper.ts`
- [x] 4.1.5 Create `apps/api/src/modules/servicios/infrastructure/http/controllers/palpaciones.controller.ts`
- [x] 4.1.6 Create `apps/api/src/modules/servicios/infrastructure/http/routes/palpaciones.routes.ts`
- [x] 4.1.7 Create `apps/api/src/modules/servicios/infrastructure/http/schemas/palpaciones.schema.ts`

### 4.2 Inseminaciones Infrastructure
- [x] 4.2.1 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-inseminacion-grupal.repository.ts`
- [x] 4.2.2 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-inseminacion-animal.repository.ts`
- [x] 4.2.3 Create `apps/api/src/modules/servicios/infrastructure/mappers/inseminacion-grupal.mapper.ts`
- [x] 4.2.4 Create `apps/api/src/modules/servicios/infrastructure/mappers/inseminacion-animal.mapper.ts`
- [x] 4.2.5 Create `apps/api/src/modules/servicios/infrastructure/http/controllers/inseminaciones.controller.ts`
- [x] 4.2.6 Create `apps/api/src/modules/servicios/infrastructure/http/routes/inseminaciones.routes.ts`
- [x] 4.2.7 Create `apps/api/src/modules/servicios/infrastructure/http/schemas/inseminaciones.schema.ts`

### 4.3 Partos Infrastructure
- [x] 4.3.1 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-parto-animal.repository.ts`
- [x] 4.3.2 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-parto-cria.repository.ts`
- [x] 4.3.3 Create `apps/api/src/modules/servicios/infrastructure/mappers/parto-animal.mapper.ts`
- [x] 4.3.4 Create `apps/api/src/modules/servicios/infrastructure/mappers/parto-cria.mapper.ts`
- [x] 4.3.5 Create `apps/api/src/modules/servicios/infrastructure/http/controllers/partos.controller.ts`
- [x] 4.3.6 Create `apps/api/src/modules/servicios/infrastructure/http/routes/partos.routes.ts`
- [x] 4.3.7 Create `apps/api/src/modules/servicios/infrastructure/http/schemas/partos.schema.ts`

### 4.4 Veterinarios Infrastructure
- [x] 4.4.1 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-veterinario-grupal.repository.ts`
- [x] 4.4.2 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-veterinario-animal.repository.ts`
- [x] 4.4.3 Create `apps/api/src/modules/servicios/infrastructure/persistence/drizzle-veterinario-producto.repository.ts`
- [x] 4.4.4 Create `apps/api/src/modules/servicios/infrastructure/mappers/veterinario-grupal.mapper.ts`
- [x] 4.4.5 Create `apps/api/src/modules/servicios/infrastructure/mappers/veterinario-animal.mapper.ts`
- [x] 4.4.6 Create `apps/api/src/modules/servicios/infrastructure/mappers/veterinario-producto.mapper.ts`
- [x] 4.4.7 Create `apps/api/src/modules/servicios/infrastructure/http/controllers/veterinarios.controller.ts`
- [x] 4.4.8 Create `apps/api/src/modules/servicios/infrastructure/http/routes/veterinarios.routes.ts`
- [x] 4.4.9 Create `apps/api/src/modules/servicios/infrastructure/http/schemas/veterinarios.schema.ts`

### 4.5 Servicios Module Registration
- [x] 4.5.1 Create `apps/api/src/modules/servicios/index.ts` with DI registration for all repositories and use cases

---

## Phase 5: Productos Module - Full Implementation

### 5.1 Domain Layer
- [x] 5.1.1 Create `apps/api/src/modules/productos/domain/entities/producto.entity.ts` interface
- [x] 5.1.2 Create `apps/api/src/modules/productos/domain/entities/producto-imagen.entity.ts` interface
- [x] 5.1.3 Create `apps/api/src/modules/productos/domain/repositories/producto.repository.ts` interface + Symbol
- [x] 5.1.4 Create `apps/api/src/modules/productos/domain/repositories/producto-imagen.repository.ts` interface + Symbol

### 5.2 Application Layer
- [x] 5.2.1 Create `apps/api/src/modules/productos/application/dtos/producto.dto.ts` (Create, Update, Response, List)
- [x] 5.2.2 Create `apps/api/src/modules/productos/application/dtos/producto-imagen.dto.ts` (Create, Response)
- [x] 5.2.3 Create `apps/api/src/modules/productos/application/use-cases/list-productos.use-case.ts`
- [x] 5.2.4 Create `apps/api/src/modules/productos/application/use-cases/get-producto.use-case.ts`
- [x] 5.2.5 Create `apps/api/src/modules/productos/application/use-cases/crear-producto.use-case.ts`
- [x] 5.2.6 Create `apps/api/src/modules/productos/application/use-cases/update-producto.use-case.ts`
- [x] 5.2.7 Create `apps/api/src/modules/productos/application/use-cases/delete-producto.use-case.ts`

### 5.3 Infrastructure Layer
- [x] 5.3.1 Create `apps/api/src/modules/productos/infrastructure/persistence/drizzle-producto.repository.ts`
- [x] 5.3.2 Create `apps/api/src/modules/productos/infrastructure/persistence/drizzle-producto-imagen.repository.ts`
- [x] 5.3.3 Create `apps/api/src/modules/productos/infrastructure/mappers/producto.mapper.ts`
- [x] 5.3.4 Create `apps/api/src/modules/productos/infrastructure/mappers/producto-imagen.mapper.ts`
- [x] 5.3.5 Create `apps/api/src/modules/productos/infrastructure/http/controllers/productos.controller.ts`
- [x] 5.3.6 Create `apps/api/src/modules/productos/infrastructure/http/routes/productos.routes.ts`
- [x] 5.3.7 Create `apps/api/src/modules/productos/infrastructure/http/schemas/productos.schema.ts`
- [x] 5.3.8 Create `apps/api/src/modules/productos/index.ts` with DI registration

---

## Phase 6: Imagenes Module - Full Implementation

### 6.1 Domain Layer
- [x] 6.1.1 Create `apps/api/src/modules/imagenes/domain/entities/imagen.entity.ts` interface (extract from animales)
- [x] 6.1.2 Create `apps/api/src/modules/imagenes/domain/repositories/imagen.repository.ts` interface + Symbol

### 6.2 Application Layer
- [x] 6.2.1 Create `apps/api/src/modules/imagenes/application/dtos/imagen.dto.ts` (Upload, Response, List)
- [x] 6.2.2 Create `apps/api/src/modules/imagenes/application/use-cases/upload-imagen.use-case.ts`
- [x] 6.2.3 Create `apps/api/src/modules/imagenes/application/use-cases/get-imagen.use-case.ts`
- [x] 6.2.4 Create `apps/api/src/modules/imagenes/application/use-cases/list-imagenes.use-case.ts`
- [x] 6.2.5 Create `apps/api/src/modules/imagenes/application/use-cases/delete-imagen.use-case.ts`

### 6.3 Infrastructure Layer
- [x] 6.3.1 Create `apps/api/src/modules/imagenes/infrastructure/persistence/drizzle-imagen.repository.ts`
- [x] 6.3.2 Create `apps/api/src/modules/imagenes/infrastructure/mappers/imagen.mapper.ts`
- [x] 6.3.3 Create `apps/api/src/modules/imagenes/infrastructure/http/controllers/imagenes.controller.ts`
- [x] 6.3.4 Create `apps/api/src/modules/imagenes/infrastructure/http/routes/imagenes.routes.ts`
- [x] 6.3.5 Create `apps/api/src/modules/imagenes/infrastructure/http/schemas/imagenes.schema.ts`
- [x] 6.3.6 Create `apps/api/src/modules/imagenes/index.ts` with DI registration

---

## Phase 7: Integration / Wiring

### 7.1 App Registration
- [x] 7.1.1 Import and call `registerServiciosModule()` in `apps/api/src/app.ts`
- [x] 7.1.2 Import and call `registerProductosModule()` in `apps/api/src/app.ts`
- [x] 7.1.3 Import and call `registerImagenesModule()` in `apps/api/src/app.ts`
- [x] 7.1.4 Import and call `registerServiciosModuleRoutes()` in `apps/api/src/app.ts`
- [x] 7.1.5 Import and call `registerProductosModuleRoutes()` in `apps/api/src/app.ts`
- [x] 7.1.6 Import and call `registerImagenesModuleRoutes()` in `apps/api/src/app.ts`

### 7.2 Cross-Module References
- [ ] 7.2.1 Update `apps/api/src/modules/animales/index.ts` to remove Imagen-related DI tokens
- [ ] 7.2.2 Import ImagenEntity from imagenes module in animales where needed
- [ ] 7.2.3 Add IAnimalReferenceService interface for cross-module validation
- [ ] 7.2.4 Create `apps/api/src/modules/servicios/domain/services/animal-reference.service.ts` interface

### 7.3 Animales Module Cleanup (if imagenes extracted)
- [ ] 7.3.1 Verify animales module still works with shared ImagenRepository from imagenes module
- [ ] 7.3.2 Update animales routes to use imagenes module exports

---

## Phase 8: Testing

### 8.1 Unit Tests - Servicios
- [ ] 8.1.1 Write tests for `crear-palpacion-grupal.use-case.ts` (transaction success/failure)
- [ ] 8.1.2 Write tests for `crear-inseminacion-grupal.use-case.ts` (transaction success/failure)
- [ ] 8.1.3 Write tests for `crear-parto.use-case.ts` (with crias)
- [ ] 8.1.4 Write tests for `crear-veterinario-grupal.use-case.ts` (with products)
- [ ] 8.1.5 Write tests for palpaciones repository (tenant isolation)

### 8.2 Unit Tests - Productos
- [ ] 8.2.1 Write tests for `crear-producto.use-case.ts` (duplicate codigo validation)
- [ ] 8.2.2 Write tests for productos repository (soft delete)

### 8.3 Unit Tests - Imagenes
- [ ] 8.3.1 Write tests for `upload-imagen.use-case.ts` (file validation)
- [ ] 8.3.2 Write tests for `delete-imagen.use-case.ts` (soft delete)

### 8.4 Integration Tests
- [ ] 8.4.1 Test atomic transaction rollback for grupal+animales creation
- [ ] 8.4.2 Test cross-predio isolation (403/404 handling)
- [ ] 8.4.3 Test duplicate codigo within same predio returns 409

### 8.5 E2E Tests
- [ ] 8.5.1 E2E test: POST /servicios/palpaciones with animals
- [ ] 8.5.2 E2E test: POST /servicios/inseminaciones with animals
- [ ] 8.5.3 E2E test: POST /servicios/partos with crias
- [ ] 8.5.4 E2E test: POST /servicios/veterinarios with animal treatments and products
- [ ] 8.5.5 E2E test: POST /productos with unique codigo
- [ ] 8.5.6 E2E test: GET /imagenes/animal/:id returns associated images

---

## Phase 9: Verification & Documentation

### 9.1 Verification Against Specs
- [ ] 9.1.1 Verify Palpaciones scenarios from spec pass
- [ ] 9.1.2 Verify Inseminaciones scenarios from spec pass
- [ ] 9.1.3 Verify Partos scenarios from spec pass
- [ ] 9.1.4 Verify Veterinarios scenarios from spec pass
- [ ] 9.1.5 Verify Productos scenarios from spec pass
- [ ] 9.1.6 Verify Imagenes scenarios from spec pass

### 9.2 Error Handling Verification
- [ ] 9.2.1 Verify 400 validation errors return correct format
- [ ] 9.2.2 Verify 401 unauthorized errors return correct format
- [ ] 9.2.3 Verify 403 forbidden errors return correct format
- [ ] 9.2.4 Verify 404 not found errors return correct format
- [ ] 9.2.5 Verify 409 conflict errors return correct format

### 9.3 Documentation
- [ ] 9.3.1 Add JSDoc to all use case classes
- [ ] 9.3.2 Add JSDoc to all repository interfaces
- [ ] 9.3.3 Add JSDoc to all controller methods
- [ ] 9.3.4 Update API documentation with new endpoints

---

## Summary

| Module | Entities | Files to Create | Estimated Hours |
|--------|----------|-----------------|-----------------|
| Servicios | 10 | ~50 | 16-20 |
| Productos | 2 | ~15 | 5-6 |
| Imagenes | 1 | ~12 | 4-5 |
| Integration | - | ~8 | 3-4 |
| Testing | - | ~15 tests | 8-10 |
| **Total** | **13** | **~100 files** | **36-45** |

### Implementation Order Recommendation
1. Phase 1 (Foundation) → Phase 9 can proceed in parallel
2. Phase 2-4 (Servicios) → Do Palpaciones first as template, then replicate
3. Phase 5 (Productos) → Simpler CRUD pattern
4. Phase 6 (Imagenes) → Shared module, depends on extraction decision
5. Phase 7 (Integration) → Wire everything together
6. Phase 8-9 (Testing & Verification) → Validate against specs

### Critical Path Dependencies
- Transaction manager must be done before any grupal+animales use cases
- Imagenes module must be done before ProductosImagen junction testing
- All domain entities must be done before application layer
- All repositories must be done before use cases that inject them
