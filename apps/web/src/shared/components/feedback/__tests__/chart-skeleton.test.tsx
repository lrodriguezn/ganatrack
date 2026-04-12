// apps/web/src/shared/components/feedback/__tests__/chart-skeleton.test.tsx
/**
 * Tests for ChartSkeleton component.
 *
 * Coverage targets:
 * - Renders with default height (350px)
 * - Respects custom height prop (number and string)
 * - Applies animation variant
 * - Has correct aria attributes
 * - Renders with custom className
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

async function renderChartSkeleton(props: Record<string, unknown> = {}) {
  vi.resetModules();
  const { ChartSkeleton } = await import('../chart-skeleton');
  return render(<ChartSkeleton {...props} />);
}

describe('ChartSkeleton — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar con valores por defecto', async () => {
    await renderChartSkeleton();

    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Cargando gráfico');
    expect(container).toHaveAttribute('aria-busy', 'true');
  });

  it('debería aplicar height por defecto de 350px', async () => {
    await renderChartSkeleton();

    const container = screen.getByRole('status');
    expect(container).toHaveStyle({ height: '350px' });
  });

  it('debería respetar height numérico personalizado', async () => {
    await renderChartSkeleton({ height: 400 });

    const container = screen.getByRole('status');
    expect(container).toHaveStyle({ height: '400px' });
  });

  it('debería respetar height como string', async () => {
    await renderChartSkeleton({ height: '20rem' });

    const container = screen.getByRole('status');
    expect(container).toHaveStyle({ height: '20rem' });
  });
});

describe('ChartSkeleton — animación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería aplicar animación pulse por defecto', async () => {
    await renderChartSkeleton();

    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  it('debería aplicar animación wave cuando se especifica', async () => {
    await renderChartSkeleton({ animation: 'wave' });

    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveClass('animate-shimmer');
    });
  });
});

describe('ChartSkeleton — estilos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería tener estilos de contenedor de gráfico (border, rounded, bg)', async () => {
    await renderChartSkeleton();

    const container = screen.getByRole('status');
    expect(container).toHaveClass('rounded-lg', 'border', 'border-gray-200', 'bg-white');
  });

  it('debería aplicar className personalizado', async () => {
    await renderChartSkeleton({ className: 'my-custom-class' });

    const container = screen.getByRole('status');
    expect(container).toHaveClass('my-custom-class');
  });
});
