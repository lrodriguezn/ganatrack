// apps/web/src/shared/components/feedback/__tests__/error-boundary.test.tsx
/**
 * Tests for ErrorBoundary component.
 *
 * Coverage targets:
 * - Renders children when no error occurs
 * - Shows default fallback when child throws
 * - Custom fallback is rendered when provided
 * - onReset callback fires on retry button click
 * - Error message shown in dev, error ID in prod
 * - Resets state after handleReset
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

// Component that throws during render
function ThrowError({ message = 'Test error' }: { message?: string }): ReactNode {
  throw new Error(message);
}

async function renderErrorBoundary(props: Record<string, unknown> = {}) {
  vi.resetModules();
  const { ErrorBoundary } = await import('../error-boundary');
  const { children, ...rest } = props as { children?: ReactNode } & Record<string, unknown>;

  return render(
    <ErrorBoundary {...rest}>
      {children ?? <div>Contenido normal</div>}
    </ErrorBoundary>,
  );
}

describe('ErrorBoundary — renderizado normal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar los children cuando no hay error', async () => {
    await renderErrorBoundary({ children: <div>Hola mundo</div> });

    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
  });
});

describe('ErrorBoundary — captura de errores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('debería mostrar el fallback default cuando un child lanza error', async () => {
    await renderErrorBoundary({ children: <ThrowError /> });

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('debería mostrar el mensaje de error en modo development', async () => {
    await renderErrorBoundary({ children: <ThrowError message="Error específico" /> });

    expect(screen.getByText(/Ha ocurrido un error inesperado/)).toBeInTheDocument();
  });

  it('debería renderizar un fallback customizado cuando se proporciona', async () => {
    await renderErrorBoundary({
      fallback: <div data-testid="custom-fallback">Fallback personalizado</div>,
      children: <ThrowError />,
    });

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Fallback personalizado')).toBeInTheDocument();
  });
});

describe('ErrorBoundary — reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('debería llamar onReset al hacer click en Reintentar', async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();

    await renderErrorBoundary({
      onReset,
      children: <ThrowError />,
    });

    const button = screen.getByRole('button', { name: /Reintentar/i });
    await user.click(button);

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
