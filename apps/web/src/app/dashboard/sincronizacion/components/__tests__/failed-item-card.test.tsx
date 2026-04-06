// apps/web/src/app/dashboard/sincronizacion/components/__tests__/failed-item-card.test.tsx
/**
 * Tests for failed-item-card.tsx component.
 *
 * Coverage targets:
 * - Renders item with timestamp, method, entity, error
 * - Shows appropriate styling based on error type
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('FailedItemCard', () => {
  const mockItem = {
    url: '/api/v1/animales/123',
    method: 'PUT',
    body: JSON.stringify({ id: '123', nombre: 'Vaca Test' }),
    timestamp: Date.now(),
    error: 'Error de validación',
    status: 400,
  };

  it('debería renderizar el método HTTP', async () => {
    const { FailedItemCard } = await import('../failed-item-card');
    
    render(<FailedItemCard item={mockItem} />);
    
    expect(screen.getByText('PUT')).toBeInTheDocument();
  });

  it('debería renderizar la URL legible (nombre de entidad)', async () => {
    const { FailedItemCard } = await import('../failed-item-card');
    
    render(<FailedItemCard item={mockItem} />);
    
    // Should show "animales" as the entity name
    expect(screen.getByText(/animales/i)).toBeInTheDocument();
  });

  it('debería renderizar el mensaje de error', async () => {
    const { FailedItemCard } = await import('../failed-item-card');
    
    render(<FailedItemCard item={mockItem} />);
    
    expect(screen.getByText(/Error de validación/i)).toBeInTheDocument();
  });

  it('debería mostrar botón de descarte', async () => {
    const { FailedItemCard } = await import('../failed-item-card');
    
    render(<FailedItemCard item={mockItem} />);
    
    expect(screen.getByRole('button', { name: /descartar/i })).toBeInTheDocument();
  });

  it('debería mostrar botón de reintento', async () => {
    const { FailedItemCard } = await import('../failed-item-card');
    
    render(<FailedItemCard item={mockItem} />);
    
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});
