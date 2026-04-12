// apps/web/src/shared/components/feedback/__tests__/empty-state.test.tsx
/**
 * Tests for EmptyState component.
 *
 * Coverage targets:
 * - Renders icon, title, and description
 * - Renders CTA button when action prop is provided
 * - Does NOT render button when action is omitted
 * - Calls onClick when CTA button is clicked
 * - Accessible: heading role, descriptive text
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Package } from 'lucide-react';

async function renderEmptyState(props: Record<string, unknown>) {
  vi.resetModules();
  const { EmptyState } = await import('../empty-state');
  return render(<EmptyState icon={Package} {...props} />);
}

describe('EmptyState — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el icono, título y descripción', async () => {
    await renderEmptyState({
      title: 'No hay animales registrados',
      description: 'Comienza agregando tu primer animal',
    });

    expect(screen.getByText('No hay animales registrados')).toBeInTheDocument();
    expect(screen.getByText('Comienza agregando tu primer animal')).toBeInTheDocument();

    // Icon should be rendered (svg inside the circle)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('debería renderizar el botón CTA cuando action está presente', async () => {
    await renderEmptyState({
      title: 'Sin datos',
      description: 'Agrega algo',
      action: { label: 'Agregar', onClick: vi.fn() },
    });

    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
  });

  it('NO debería renderizar botón cuando action está ausente', async () => {
    await renderEmptyState({
      title: 'Sin datos',
      description: 'Agrega algo',
    });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('EmptyState — interacción', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería llamar onClick al hacer click en el botón CTA', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    await renderEmptyState({
      title: 'Sin datos',
      description: 'Agrega algo',
      action: { label: 'Agregar', onClick },
    });

    const button = screen.getByRole('button', { name: 'Agregar' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState — accesibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería tener el título como heading visible', async () => {
    await renderEmptyState({
      title: 'Lista vacía',
      description: 'No hay elementos',
    });

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Lista vacía');
  });
});
