// apps/web/src/app/dashboard/sincronizacion/components/__tests__/conflict-resolver.test.tsx
/**
 * Tests for conflict-resolver.tsx component.
 *
 * Coverage targets:
 * - Render side-by-side diff
 * - Handle local/server choice
 * - Show conflict metadata
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('ConflictResolver', () => {
  const mockConflictItem = {
    url: '/api/v1/animales/123',
    method: 'PUT',
    body: JSON.stringify({ id: '123', nombre: 'Mi Versión' }),
    timestamp: Date.now(),
    error: 'Conflicto de versión',
    status: 409,
  };

  const mockServerData = {
    id: '123',
    nombre: 'Versión del Servidor',
    estadoAnimalKey: 0,
    saludAnimalKey: 0,
  };

  it('debería renderizar el título del modal', async () => {
    const { ConflictResolver } = await import('../conflict-resolver');
    
    render(
      <ConflictResolver
        item={mockConflictItem}
        serverData={mockServerData}
        onKeepLocal={() => {}}
        onAcceptServer={() => {}}
      />
    );
    
    expect(screen.getByRole('heading', { name: /resolver conflicto/i })).toBeInTheDocument();
  });

  it('debería tener botón para mantener mi versión', async () => {
    const { ConflictResolver } = await import('../conflict-resolver');
    
    render(
      <ConflictResolver
        item={mockConflictItem}
        serverData={mockServerData}
        onKeepLocal={() => {}}
        onAcceptServer={() => {}}
      />
    );
    
    expect(screen.getByRole('button', { name: /mantener mi versión/i })).toBeInTheDocument();
  });

  it('debería tener botón para aceptar versión servidor', async () => {
    const { ConflictResolver } = await import('../conflict-resolver');
    
    render(
      <ConflictResolver
        item={mockConflictItem}
        serverData={mockServerData}
        onKeepLocal={() => {}}
        onAcceptServer={() => {}}
      />
    );
    
    expect(screen.getByRole('button', { name: /aceptar versión servidor/i })).toBeInTheDocument();
  });

  it('debería llamar a onKeepLocal cuando se hace click en mantener versión', async () => {
    const onKeepLocal = vi.fn();
    const { ConflictResolver } = await import('../conflict-resolver');
    
    render(
      <ConflictResolver
        item={mockConflictItem}
        serverData={mockServerData}
        onKeepLocal={onKeepLocal}
        onAcceptServer={() => {}}
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: /mantener mi versión/i }));
    
    expect(onKeepLocal).toHaveBeenCalled();
  });

  it('debería llamar a onAcceptServer cuando se hace click en aceptar servidor', async () => {
    const onAcceptServer = vi.fn();
    const { ConflictResolver } = await import('../conflict-resolver');
    
    render(
      <ConflictResolver
        item={mockConflictItem}
        serverData={mockServerData}
        onKeepLocal={() => {}}
        onAcceptServer={onAcceptServer}
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: /aceptar versión servidor/i }));
    
    expect(onAcceptServer).toHaveBeenCalled();
  });
});
