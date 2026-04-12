// apps/web/src/shared/components/feedback/__tests__/loading-spinner.test.tsx
/**
 * Tests for LoadingSpinner component.
 *
 * Coverage targets:
 * - Renders default centered variant with role="status"
 * - Renders inline variant (just the spinner, no wrapper)
 * - Renders fullscreen variant with backdrop overlay
 * - Applies correct size classes for sm/md/lg/xl
 * - Shows label text when provided
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

async function renderLoadingSpinner(props: Record<string, unknown> = {}) {
  vi.resetModules();
  const { LoadingSpinner } = await import('../loading-spinner');
  return render(<LoadingSpinner {...props} />);
}

describe('LoadingSpinner — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar la variante default con role="status"', async () => {
    await renderLoadingSpinner();

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Cargando');
  });

  it('debería renderizar la variante inline sin wrapper', async () => {
    await renderLoadingSpinner({ variant: 'inline' });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const svg = document.querySelector('svg') as SVGSVGElement | null;
    expect(svg).toBeInTheDocument();
  });

  it('debería renderizar la variante fullscreen con overlay', async () => {
    await renderLoadingSpinner({ variant: 'fullscreen' });

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('fixed', 'inset-0', 'z-50');
  });
});

describe('LoadingSpinner — tamaños', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería aplicar clase de tamaño sm (h-4 w-4)', async () => {
    await renderLoadingSpinner({ size: 'sm', variant: 'inline' });

    const svg = document.querySelector('svg') as SVGSVGElement | null;
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('debería aplicar clase de tamaño md (h-6 w-6) por defecto', async () => {
    await renderLoadingSpinner({ variant: 'inline' });

    const svg = document.querySelector('svg') as SVGSVGElement | null;
    expect(svg).toHaveClass('h-6', 'w-6');
  });

  it('debería aplicar clase de tamaño lg (h-10 w-10)', async () => {
    await renderLoadingSpinner({ size: 'lg', variant: 'inline' });

    const svg = document.querySelector('svg') as SVGSVGElement | null;
    expect(svg).toHaveClass('h-10', 'w-10');
  });

  it('debería aplicar clase de tamaño xl (h-14 w-14)', async () => {
    await renderLoadingSpinner({ size: 'xl', variant: 'inline' });

    const svg = document.querySelector('svg') as SVGSVGElement | null;
    expect(svg).toHaveClass('h-14', 'w-14');
  });
});

describe('LoadingSpinner — label', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar el texto del label en variante default', async () => {
    await renderLoadingSpinner({ label: 'Cargando datos…' });

    expect(screen.getByText('Cargando datos…')).toBeInTheDocument();
  });

  it('debería mostrar el texto del label en variante fullscreen', async () => {
    await renderLoadingSpinner({ label: 'Procesando…', variant: 'fullscreen' });

    expect(screen.getByText('Procesando…')).toBeInTheDocument();
  });

  it('debería actualizar aria-label con label personalizado', async () => {
    await renderLoadingSpinner({ label: 'Guardando' });

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Guardando');
  });
});
