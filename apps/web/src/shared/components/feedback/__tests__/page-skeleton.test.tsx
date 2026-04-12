// apps/web/src/shared/components/feedback/__tests__/page-skeleton.test.tsx
/**
 * Tests for PageSkeleton component.
 *
 * Coverage targets:
 * - Renders with default props (1 title, 1 subtitle, 4 content lines)
 * - Respects custom line counts
 * - Applies animation variant
 * - Has correct aria attributes
 * - Renders with custom className
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

async function renderPageSkeleton(props: Record<string, unknown> = {}) {
  vi.resetModules();
  const { PageSkeleton } = await import('../page-skeleton');
  return render(<PageSkeleton {...props} />);
}

describe('PageSkeleton — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar con valores por defecto', async () => {
    await renderPageSkeleton();

    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Cargando página');
    expect(container).toHaveAttribute('aria-busy', 'true');
  });

  it('debería respetar titleLines personalizado', async () => {
    await renderPageSkeleton({ titleLines: 3 });

    // Should have 3 title skeletons (h-8 w-2/3 for first, h-6 w-1/2 for rest)
    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    // 3 titles + 1 subtitle + 4 content = 8 total
    expect(skeletons.length).toBe(8);
  });

  it('debería respetar subtitleLines personalizado', async () => {
    await renderPageSkeleton({ subtitleLines: 0 });

    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    // 1 title + 0 subtitle + 4 content = 5 total
    expect(skeletons.length).toBe(5);
  });

  it('debería respetar contentLines personalizado', async () => {
    await renderPageSkeleton({ contentLines: 2 });

    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    // 1 title + 1 subtitle + 2 content = 4 total
    expect(skeletons.length).toBe(4);
  });
});

describe('PageSkeleton — animación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería aplicar animación pulse por defecto', async () => {
    await renderPageSkeleton();

    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  it('debería aplicar animación wave cuando se especifica', async () => {
    await renderPageSkeleton({ animation: 'wave' });

    const container = screen.getByRole('status');
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveClass('animate-shimmer');
    });
  });
});

describe('PageSkeleton — className', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería aplicar className personalizado', async () => {
    await renderPageSkeleton({ className: 'bg-red-500' });

    const container = screen.getByRole('status');
    expect(container).toHaveClass('bg-red-500');
  });
});
