// apps/web/src/app/dashboard/sincronizacion/components/__tests__/sync-queue-list.test.tsx
/**
 * Tests for sync-queue-list.tsx component.
 *
 * Coverage targets:
 * - Render list of items
 * - Handle empty state
 * - Handle navigation to item detail
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SyncQueueList', () => {
  const mockFailedItems = [
    {
      url: '/api/v1/animales/123',
      method: 'PUT',
      body: JSON.stringify({ id: '123', nombre: 'Vaca Test' }),
      timestamp: Date.now(),
      error: 'Error de validación',
      status: 400,
    },
    {
      url: '/api/v1/servicios/456',
      method: 'POST',
      body: JSON.stringify({ id: '456', tipo: 'veterinario' }),
      timestamp: Date.now() - 60000,
      error: 'Conflicto de versión',
      status: 409,
    },
  ];

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('debería renderizar la lista de items fallidos', async () => {
    const { SyncQueueList } = await import('../sync-queue-list');
    
    render(<SyncQueueList items={mockFailedItems} />);
    
    expect(screen.getByText(/animales/i)).toBeInTheDocument();
    expect(screen.getByText(/servicios/i)).toBeInTheDocument();
  });

  it('debería renderizar mensaje de estado vacío cuando no hay items', async () => {
    const { SyncQueueList } = await import('../sync-queue-list');
    
    render(<SyncQueueList items={[]} />);
    
    expect(screen.getByText(/no hay elementos pendientes/i)).toBeInTheDocument();
  });

  it('debería renderizar el título de la sección', async () => {
    const { SyncQueueList } = await import('../sync-queue-list');
    
    render(<SyncQueueList items={mockFailedItems} />);
    
    expect(screen.getByText(/elementos fallidos/i)).toBeInTheDocument();
  });
});
