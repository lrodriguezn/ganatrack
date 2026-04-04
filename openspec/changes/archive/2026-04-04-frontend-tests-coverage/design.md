# Design: Frontend Tests Coverage

## Technical Approach

Implement comprehensive unit tests for GanaTrack frontend modules following existing test patterns from `apps/web/src/tests/modules/animales/`. Tests use Vitest with `@testing-library/react` for hook testing, mock services with `vi.fn()`, and verify query invalidation patterns.

## Architecture Decisions

### Decision: Test File Location

**Choice**: Follow existing pattern `apps/web/src/tests/modules/{module}/`
**Alternatives considered**: Global test directory, co-located with hooks
**Rationale**: Matches established codebase conventions; easy discovery by module

### Decision: Mock Strategy

**Choice**: `vi.mock()` at module level with `mockService` object using `vi.fn()`
**Alternatives considered**: MSW for HTTP mocking, dependency injection
**Rationale**: Matches existing `use-animales.test.ts` pattern; simpler for unit tests; MSW reserved for E2E

### Decision: Query Invalidation Testing

**Choice**: Verify query keys used match `queryKeys` factory patterns
**Alternatives considered**: Mock QueryClient and verify `invalidateQueries` calls
**Rationale**: Tests actual integration points; validates cache invalidation contracts

### Decision: Service Layer Testing

**Choice**: Use `MockAnimalService` pattern from existing tests (instantiate mock class)
**Alternatives considered**: Test actual API service with fetch mocking
**Rationale**: Provides deterministic data; faster execution; isolates unit from network

## Data Flow

```
Test File ──→ vi.mock(service) ──→ renderHook ──→ QueryClient
                    │                    │
                    └──── mockService ←──┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/tests/modules/notificaciones/use-notificaciones.test.ts` | Create | Hook tests for pagination, loading, error |
| `apps/web/src/tests/modules/notificaciones/use-notificaciones-resumen.test.ts` | Create | Hook tests for summary with unread count |
| `apps/web/src/tests/modules/notificaciones/use-mark-read.test.ts` | Create | Mutation tests with optimistic updates |
| `apps/web/src/tests/modules/notificaciones/notificaciones.service.test.ts` | Create | Service layer tests |
| `apps/web/src/tests/modules/servicios/use-palpaciones.test.ts` | Create | Query hook tests |
| `apps/web/src/tests/modules/servicios/use-palpacion.test.ts` | Create | Detail hook tests |
| `apps/web/src/tests/modules/servicios/use-create-palpacion.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/servicios/use-inseminaciones.test.ts` | Create | Query hook tests |
| `apps/web/src/tests/modules/servicios/use-inseminacion.test.ts` | Create | Detail hook tests |
| `apps/web/src/tests/modules/servicios/use-create-inseminacion.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/servicios/use-partos.test.ts` | Create | Query hook tests |
| `apps/web/src/tests/modules/servicios/use-create-parto.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/servicios/use-servicios-veterinarios.test.ts` | Create | Query hook tests |
| `apps/web/src/tests/modules/servicios/use-servicio-veterinario.test.ts` | Create | Detail hook tests |
| `apps/web/src/tests/modules/servicios/use-create-servicio-veterinario.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/predios/use-predios.test.ts` | Create | List hook with search filtering |
| `apps/web/src/tests/modules/predios/use-predio.test.ts` | Create | Detail hook tests |
| `apps/web/src/tests/modules/predios/use-create-predio.test.ts` | Create | Mutation with optimistic update |
| `apps/web/src/tests/modules/predios/use-update-predio.test.ts` | Create | Mutation with invalidation |
| `apps/web/src/tests/modules/predios/use-delete-predio.test.ts` | Create | Mutation with rollback |
| `apps/web/src/tests/modules/predios/use-potreros.test.ts` | Create | Query with key pattern validation |
| `apps/web/src/tests/modules/predios/use-sectores.test.ts` | Create | Query tests |
| `apps/web/src/tests/modules/predios/use-lotes.test.ts` | Create | Query tests |
| `apps/web/src/tests/modules/predios/use-grupos.test.ts` | Create | Query tests |
| `apps/web/src/tests/modules/productos/use-productos.test.ts` | Create | Query with filters |
| `apps/web/src/tests/modules/productos/use-producto.test.ts` | Create | Detail hook tests |
| `apps/web/src/tests/modules/productos/use-create-producto.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/productos/use-update-producto.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/productos/use-delete-producto.test.ts` | Create | Mutation tests |
| `apps/web/src/tests/modules/imagenes/use-imagenes.test.ts` | Create | Query tests |
| `apps/web/src/tests/modules/imagenes/use-upload-imagen.test.ts` | Create | Upload mutation tests |
| `apps/web/src/tests/modules/imagenes/use-delete-imagen.test.ts` | Create | Delete mutation tests |

## Test Structure Pattern

```typescript
// apps/web/src/tests/modules/{module}/{hook}.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockService = {
  method: vi.fn(),
};

vi.mock('@/modules/{module}/services', () => ({
  serviceName: mockService,
}));

const { useHook } = await import('@/modules/{module}/hooks/use-hook');

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

describe('useHook', () => {
  describe('happy path', () => {
    it('debería retornar data y estados de carga', async () => {
      mockService.method.mockResolvedValueOnce(mockData);
      const { result } = renderHook(() => useHook(params), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('error state', () => {
    it('debería retornar error cuando el servicio falla', async () => {
      mockService.method.mockRejectedValueOnce(new Error('API Error'));
      const { result } = renderHook(() => useHook(params), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
```

## Query Key Patterns

| Module | Query Key Pattern |
|--------|------------------|
| Notificaciones | `queryKeys.notificaciones.list(predioId, { page, limit })` |
| NotificacionesResumen | `queryKeys.notificaciones.resumen(predioId)` |
| Predios | `queryKeys.predios.list({ search })`, `queryKeys.predios.detail(id)` |
| Potreros/Sectores/Lotes/Grupos | `queryKeys.predios.potreros(predioId)`, etc. |
| Productos | `queryKeys.productos.list(filters)`, `queryKeys.productos.detail(id)` |
| Servicios | `queryKeys.servicios.palpaciones.list()`, etc. |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Hook return values (data, loading, error) | `renderHook` with mocked service |
| Unit | Service methods | Mock service class with vi.fn() |
| Unit | Query invalidation keys | Verify `queryKeys.*` usage matches spec |
| Integration | Mutation optimistic updates | Check store mutations and rollback |

## Migration / Rollout

No migration required. New test files are additive.

## Open Questions

- [ ] Should E2E tests be added for notification marking? (spec covers unit only)
- [ ] Should we add MSW handlers for integration tests? (currently using vi.mock)

## Next Step

Ready for tasks (sdd-tasks).
