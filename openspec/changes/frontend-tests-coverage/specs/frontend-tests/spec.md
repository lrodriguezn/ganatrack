# Frontend Tests Coverage Specification

## Metadata

| Property | Value |
|----------|-------|
| **Change ID** | frontend-tests-coverage |
| **Version** | 1.0.0 |
| **Status** | draft |
| **Created** | 2026-04-04 |
| **Author** | lgrodriguezn |
| **Persistence** | hybrid (engram + openspec) |

---

## 1. Overview

This specification defines unit tests for GanaTrack frontend modules that currently lack test coverage. The tests follow the existing patterns established in `apps/web/src/tests/modules/animales/use-animales.test.ts` and `apps/web/src/tests/modules/animales/animal.service.test.ts`.

### Test Strategy

- **Unit Tests**: Mock service with `vi.fn()`, use `renderHook` from `@testing-library/react`, test loading/error/data states
- **Query Invalidation**: Verify correct query keys are used for invalidation
- **MSW Handlers**: Already exist at `apps/web/src/tests/mocks/handlers/notificaciones.handlers.ts`

---

## 2. Notificaciones Tests

### 2.1 use-notificaciones.ts Hook

**Given** a React component that uses the `useNotificaciones` hook  
**When** the hook is called with valid `predioId`, pagination params, and service returns data  
**Then** it should return data with loading and error states correctly

```gherkin
Scenario: Successful fetch of paginated notifications
  Given a mock service that returns notification data
  When useNotificaciones({predioId: 1, page: 1, limit: 10}) is called
  Then result.current.isLoading should be true initially
  And after waitFor, result.current.isLoading should be false
  And result.current.data should equal the mock response
  And result.current.error should be null
  And result.current.refetch should be a function
```

```gherkin
Scenario: Service error handling
  Given a mock service that throws an API error
  When useNotificaciones({predioId: 1}) is called
  Then after waitFor, result.current.error should be an Error instance
  And result.current.error.message should contain "API Error"
```

```gherkin
Scenario: Pagination parameters passed correctly
  Given a mock service that captures call parameters
  When useNotificaciones({predioId: 1, page: 2, limit: 5}) is called
  Then the service should be called with {predioId: 1, page: 2, limit: 5}
```

### 2.2 use-notificaciones-resumen.ts Hook

**Given** a React component using `useNotificacionesResumen`  
**When** the hook fetches summary data with unread count  
**Then** it should sync unread count to Zustand store and handle polling

```gherkin
Scenario: Successful summary fetch with unread count
  Given a mock service returning {total: 5, noLeidas: 3, ultimas: [...]}
  When useNotificacionesResumen(1) is called
  Then result.current.data.noLeidas should equal 3
  And result.current.isLoading should reflect loading state
```

```gherkin
Scenario: Error handling for summary fetch
  Given a mock service that throws an error
  When useNotificacionesResumen(1) is called
  Then result.current.error should be an Error instance
```

### 2.3 use-mark-read.ts Hook (Mutation)

**Given** a React component using `useMarkRead` mutation hook  
**When** markRead is called with a notification ID  
**Then** it should optimistically update unread count and invalidate queries

```gherkin
Scenario: Mark single notification as read
  Given a mock service that resolves successfully
  When markRead(1) is called
  Then mutation should complete without error
  And queryClient should invalidate 'notificaciones', 'resumen' key
```

```gherkin
Scenario: Mark all notifications as read
  Given a mock service that resolves successfully
  When markAllRead(1) is called
  Then all notifications should be marked as read
  And queryClient should invalidate resumen query
```

```gherkin
Scenario: Error during mark read
  Given a mock service that throws an error
  When markRead(999) is called
  Then result.current.error should be an Error instance
```

### 2.4 notificaciones.service.ts Tests

**Given** the NotificacionesService interface  
**When** methods are called (getAll, getResumen, markRead, etc.)  
**Then** they should return expected data types and handle errors

```gherkin
Scenario: getAll returns paginated notifications
  When notificacionesService.getAll(1, {page: 1, limit: 10}) is called
  Then response should have {data, page, limit, total, totalPages}
  And data should be an array of Notificacion objects
```

```gherkin
Scenario: getResumen returns notification summary
  When notificacionesService.getResumen(1) is called
  Then response should have {total, noLeidas, ultimas}
```

```gherkin
Scenario: markRead updates notification read state
  When notificacionesService.markRead(1) is called
  Then it should resolve without error
```

---

## 3. Servicios Tests

### 3.1 Palpaciones Subtype

#### use-palpaciones.ts

```gherkin
Scenario: Fetch palpaciones list
  Given a mock service returning {data: [...], page: 1, limit: 10, total: 5, totalPages: 1}
  When usePalpaciones({page: 1, limit: 10}) is called
  Then result.current.data should equal mock response
  And result.current.isLoading should toggle correctly
```

```gherkin
Scenario: Error state for palpaciones
  Given a mock service that throws an error
  When usePalpaciones({page: 1}) is called
  Then result.current.error should be an Error instance
```

#### use-palpacion.ts (detail)

```gherkin
Scenario: Fetch single palpacion detail
  Given a mock service returning {id: 1, tipoPalpacion: 'palpacion', resultado: 'positiva', ...}
  When usePalpacion(1) is called
  Then result.current.data should have id equal to 1
```

#### use-create-palpacion.ts (mutation)

```gherkin
Scenario: Create new palpacion
  Given a mock service that resolves successfully
  When mutateAsync({animalId: 1, tipoPalpacion: 0, resultado: 0}) is called
  Then it should resolve without error
  And queryClient should invalidate 'servicios', 'palpaciones' key
```

### 3.2 Inseminaciones Subtype

#### use-inseminaciones.ts

```gherkin
Scenario: Fetch inseminaciones list
  Given a mock service returning {data: [...], page: 1, limit: 10}
  When useInseminaciones({page: 1, limit: 10}) is called
  Then result.current.data should equal mock response
```

#### use-inseminacion.ts

```gherkin
Scenario: Fetch single inseminacion detail
  Given a mock service returning {id: 1, animalId: 5, tipoInseminacion: 0, resultado: 1, ...}
  When useInseminacion(1) is called
  Then result.current.data should have id equal to 1
```

#### use-create-inseminacion.ts

```gherkin
Scenario: Create new inseminacion
  Given a mock service that resolves successfully
  When mutateAsync({animalId: 1, tipoInseminacion: 0}) is called
  Then it should resolve without error
  And queryClient should invalidate 'servicios', 'inseminaciones' key
```

### 3.3 Partos Subtype

#### use-partos.ts

```gherkin
Scenario: Fetch partos list
  Given a mock service returning {data: [...], page: 1, limit: 10}
  When usePartos({page: 1, limit: 10}) is called
  Then result.current.data should equal mock response
```

#### use-create-parto.ts

```gherkin
Scenario: Create new parto
  Given a mock service that resolves successfully
  When mutateAsync({animalId: 1, fechaNacimiento: '2026-04-01', sexoCria: 0}) is called
  Then it should resolve without error
  And queryClient should invalidate 'servicios', 'partos' key
```

### 3.4 Servicios Veterinarios Subtype

#### use-servicios-veterinarios.ts

```gherkin
Scenario: Fetch servicios veterinarios list
  Given a mock service returning {data: [...], page: 1, limit: 10}
  When useServiciosVeterinarios({page: 1, limit: 10}) is called
  Then result.current.data should equal mock response
```

#### use-servicio-veterinario.ts

```gherkin
Scenario: Fetch single servicio veterinario detail
  Given a mock service returning {id: 1, animalId: 5, tipoServicio: 0, ...}
  When useServicioVeterinario(1) is called
  Then result.current.data should have id equal to 1
```

#### use-create-servicio-veterinario.ts

```gherkin
Scenario: Create new servicio veterinario
  Given a mock service that resolves successfully
  When mutateAsync({animalId: 1, tipoServicio: 0, descripcion: 'Tratamiento'}) is called
  Then it should resolve without error
  And queryClient should invalidate 'servicios', 'veterinarios' key
```

```gherkin
Scenario: Validation error handling
  Given a mock service that returns {success: false, message: 'Errores de validación'}
  When mutateAsync({...}) is called
  Then it should handle response with success: false gracefully
```

---

## 4. Predios Hooks Tests

### 4.1 use-predios.ts

**Given** a React component using `usePredios` hook  
**When** fetching all predios with optional search filter  
**Then** it should return predios with client-side search filtering

```gherkin
Scenario: Fetch all predios without search
  Given a mock service returning [{id: 1, nombre: 'Finca A'}, {id: 2, nombre: 'Finca B'}]
  When usePredios() is called
  Then result.current.predios should have length 2
  And result.current.isLoading should toggle correctly
```

```gherkin
Scenario: Client-side search filtering
  Given mock predios data
  When usePredios({search: 'Finca A'}) is called
  Then result.current.predios should filter to only matching items
```

### 4.2 use-predio.ts

```gherkin
Scenario: Fetch single Predio detail
  Given a mock service returning {id: 1, nombre: 'Finca A', hectares: 50, ...}
  When usePredio({id: 1}) is called
  Then result.current.predio should have id equal to 1
  And result.current.predio.hectares should equal 50
```

### 4.3 use-create-predio.ts

```gherkin
Scenario: Create new Predio
  Given mock service returning {id: 3, nombre: 'Nueva Finca', ...}
  When mutateAsync({nombre: 'Nueva Finca', departamento: 'Cundinamarca', ...}) is called
  Then queryClient should invalidate 'predios' queries
  And optimistic update should be applied
```

### 4.4 use-update-predio.ts

```gherkin
Scenario: Update existing Predio
  Given mock service returning updated Predio
  When mutateAsync(1, {nombre: 'Finca Actualizada'}) is called
  Then queryClient should invalidate 'predios' queries
  And queryClient should invalidate detail query
```

### 4.5 use-delete-predio.ts

```gherkin
Scenario: Delete Predio
  Given mock service that resolves successfully
  When mutateAsync(1) is called
  Then queryClient should invalidate 'predios' queries
  And Predio should be removed from cache optimistically
```

### 4.6 use-potreros.ts

```gherkin
Scenario: Fetch potreros for a Predio
  Given mock service returning [{id: 1, nombre: 'Potrero Norte'}, {id: 2, nombre: 'Potrero Sur'}]
  When usePotreros({predioId: 1}) is called
  Then result.current.potreros should have length 2
  And queryKey should include 'predios', 1, 'potreros'
```

### 4.7 use-sectores.ts

```gherkin
Scenario: Fetch sectores for a Predio
  Given mock service returning [{id: 1, nombre: 'Sector Este'}]
  When useSectores({predioId: 1}) is called
  Then result.current.sectores should have length 1
```

### 4.8 use-lotes.ts

```gherkin
Scenario: Fetch lotes for a Predio
  Given mock service returning [{id: 1, nombre: 'Lote 1'}, {id: 2, nombre: 'Lote 2'}]
  When useLotes({predioId: 1}) is called
  Then result.current.lotes should have length 2
```

### 4.9 use-grupos.ts

```gherkin
Scenario: Fetch grupos for a Predio
  Given mock service returning [{id: 1, nombre: 'Grupo A'}]
  When useGrupos({predioId: 1}) is called
  Then result.current.grupos should have length 1
```

---

## 5. Productos Tests

### 5.1 use-productos.ts

```gherkin
Scenario: Fetch productos with filters
  Given mock service returning {data: [{id: 1, nombre: 'Producto A', ...}], page: 1, limit: 10, total: 1}
  When useProductos({predioId: 1, page: 1, limit: 10}) is called
  Then result.current.data should equal mock response
  And queryKey should include 'productos', 'list', filters object
```

### 5.2 use-producto.ts

```gherkin
Scenario: Fetch single producto detail
  Given mock service returning {id: 1, nombre: 'Producto A', tipoKey: 0, ...}
  When useProducto(1) is called
  Then result.current.data should have id equal to 1
```

### 5.3 use-create-producto.ts

```gherkin
Scenario: Create new producto
  Given mock service returning {id: 3, nombre: 'Nuevo Producto', ...}
  When mutateAsync({nombre: 'Nuevo Producto', tipoKey: 0, precio: 10000}) is called
  Then queryClient should invalidate 'productos' all key
```

### 5.4 use-update-producto.ts

```gherkin
Scenario: Update existing producto
  Given mock service returning updated producto
  When mutateAsync({id: 1, data: {nombre: 'Producto Actualizado'}}) is called
  Then queryClient should invalidate 'productos' all key
  And queryClient should invalidate detail query
```

### 5.5 use-delete-producto.ts

```gherkin
Scenario: Delete producto
  Given mock service that resolves successfully
  When mutateAsync(1) is called
  Then queryClient should invalidate 'productos' all key
  And queryClient should remove detail query
  And queryClient should invalidate imagenes for this entity
```

---

## 6. Imagenes Tests

### 6.1 use-imagenes.ts

```gherkin
Scenario: Fetch imagenes by entity
  Given mock service returning [{id: 1, url: 'https://...', entidadId: 123, entidadTipo: 'producto'}]
  When useImagenes({entidadTipo: 'producto', entidadId: 123}) is called
  Then result.current.data should have length 1
  And result.current.data[0].entidadTipo should equal 'producto'
```

### 6.2 use-upload-imagen.ts (Mutation)

```gherkin
Scenario: Upload single image
  Given mock service that resolves with {id: 1, url: 'https://...'}
  When uploadFile('queue-item-id') is called
  Then queryClient should invalidate imagenes query for entity
  And store should update progress/complete status
```

```gherkin
Scenario: Upload all images in queue
  Given mock service and queue with pending items
  When uploadAll() is called
  Then all pending items should be processed
  And queryClient should invalidate imagenes query
```

### 6.3 use-delete-imagen.ts (Mutation)

```gherkin
Scenario: Delete imagen
  Given mock service that resolves successfully
  When mutateAsync({id: 1, entidadTipo: 'producto', entidadId: 123}) is called
  Then queryClient should invalidate imagenes query
  And queryClient should remove detail query
```

---

## 7. Test File Locations

| Module | Hook/Service Test File |
|--------|------------------------|
| Notificaciones | `apps/web/src/tests/modules/notificaciones/use-notificaciones.test.ts` |
| Notificaciones | `apps/web/src/tests/modules/notificaciones/use-notificaciones-resumen.test.ts` |
| Notificaciones | `apps/web/src/tests/modules/notificaciones/use-mark-read.test.ts` |
| Notificaciones | `apps/web/src/tests/modules/notificaciones/notificaciones.service.test.ts` |
| Palpaciones | `apps/web/src/tests/modules/servicios/use-palpaciones.test.ts` |
| Palpaciones | `apps/web/src/tests/modules/servicios/use-palpacion.test.ts` |
| Palpaciones | `apps/web/src/tests/modules/servicios/use-create-palpacion.test.ts` |
| Inseminaciones | `apps/web/src/tests/modules/servicios/use-inseminaciones.test.ts` |
| Inseminaciones | `apps/web/src/tests/modules/servicios/use-inseminacion.test.ts` |
| Inseminaciones | `apps/web/src/tests/modules/servicios/use-create-inseminacion.test.ts` |
| Partos | `apps/web/src/tests/modules/servicios/use-partos.test.ts` |
| Partos | `apps/web/src/tests/modules/servicios/use-create-parto.test.ts` |
| Servicios Veterinarios | `apps/web/src/tests/modules/servicios/use-servicios-veterinarios.test.ts` |
| Servicios Veterinarios | `apps/web/src/tests/modules/servicios/use-servicio-veterinario.test.ts` |
| Servicios Veterinarios | `apps/web/src/tests/modules/servicios/use-create-servicio-veterinario.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-predios.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-predio.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-create-predio.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-update-predio.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-delete-predio.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-potreros.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-sectores.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-lotes.test.ts` |
| Predios | `apps/web/src/tests/modules/predios/use-grupos.test.ts` |
| Productos | `apps/web/src/tests/modules/productos/use-productos.test.ts` |
| Productos | `apps/web/src/tests/modules/productos/use-producto.test.ts` |
| Productos | `apps/web/src/tests/modules/productos/use-create-producto.test.ts` |
| Productos | `apps/web/src/tests/modules/productos/use-update-producto.test.ts` |
| Productos | `apps/web/src/tests/modules/productos/use-delete-producto.test.ts` |
| Imagenes | `apps/web/src/tests/modules/imagenes/use-imagenes.test.ts` |
| Imagenes | `apps/web/src/tests/modules/imagenes/use-upload-imagen.test.ts` |
| Imagenes | `apps/web/src/tests/modules/imagenes/use-delete-imagen.test.ts` |

---

## 8. Mock Pattern

Each test file should follow this pattern from `use-animales.test.ts`:

```typescript
// Mock the service
const mockService = {
  method: vi.fn(),
};

// Mock at module level BEFORE importing
vi.mock('@/modules/module/services', () => ({
  serviceName: mockService,
}));

// Import AFTER mock
const { useHook } = await import('@/modules/module/hooks/use-hook');

// Wrapper for QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

---

## 9. Success Criteria

- [ ] Notificaciones: 5+ unit tests (hooks + service)
- [ ] Servicios: 8+ unit tests (palpaciones, inseminaciones, partos, veterinary hooks)
- [ ] Predios: 6+ unit tests (hooks)
- [ ] Productos: 4+ unit tests
- [ ] Imagenes: 3+ unit tests
- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage increases for untested modules
