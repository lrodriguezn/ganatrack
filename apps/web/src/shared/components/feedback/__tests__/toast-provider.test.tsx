// apps/web/src/shared/components/feedback/__tests__/toast-provider.test.tsx
/**
 * Tests for ToastProvider and toast helper.
 *
 * Coverage targets:
 * - Renders Sonner Toaster with correct props
 * - toast.success/error/warning/info call sonnerToast
 * - toast.custom is passthrough to sonnerToast
 * - Custom classNames applied
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Sonner before importing
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockWarning = vi.fn();
const mockInfo = vi.fn();

vi.mock('sonner', () => ({
  Toaster: vi.fn(() => <div data-testid="toaster" />),
  toast: {
    success: mockSuccess,
    error: mockError,
    warning: mockWarning,
    info: mockInfo,
  },
}));

async function renderToastProvider() {
  vi.resetModules();
  // Re-import to get fresh mock
  const { Toaster } = await import('sonner');
  const { ToastProvider } = await import('../toast-provider');

  return render(<ToastProvider />);
}

describe('ToastProvider — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el Toaster', async () => {
    await renderToastProvider();

    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});

describe('toast helper — llamadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería exportar toast.success que llama a sonnerToast.success', async () => {
    const { toast } = await import('../toast-provider');

    toast.success('Éxito', 'Descripción');

    expect(mockSuccess).toHaveBeenCalledWith('Éxito', { description: 'Descripción' });
  });

  it('debería exportar toast.error que llama a sonnerToast.error', async () => {
    const { toast } = await import('../toast-provider');

    toast.error('Error', 'Detalle');

    expect(mockError).toHaveBeenCalledWith('Error', { description: 'Detalle' });
  });

  it('debería exportar toast.warning que llama a sonnerToast.warning', async () => {
    const { toast } = await import('../toast-provider');

    toast.warning('Advertencia');

    expect(mockWarning).toHaveBeenCalledWith('Advertencia', { description: undefined });
  });

  it('debería exportar toast.info que llama a sonnerToast.info', async () => {
    const { toast } = await import('../toast-provider');

    toast.info('Info');

    expect(mockInfo).toHaveBeenCalledWith('Info', { description: undefined });
  });

  it('debería exportar toast.custom como passthrough', async () => {
    const { toast } = await import('../toast-provider');

    expect(toast.custom).toBeDefined();
    expect(typeof toast.custom).toBe('object');
    expect(toast.custom.success).toBeDefined();
    expect(toast.custom.error).toBeDefined();
  });
});
