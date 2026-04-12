// apps/web/src/shared/components/feedback/__tests__/offline-banner.test.tsx
/**
 * Tests for OfflineBanner component.
 *
 * Coverage targets:
 * - Returns null when online
 * - Renders amber banner with WifiOff icon when offline
 * - Has role="alert" and aria-live="polite"
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useOnlineStatus hook
vi.mock('@/shared/hooks/use-online-status', () => ({
  useOnlineStatus: vi.fn(),
}));

async function renderOfflineBanner() {
  vi.resetModules();
  const { OfflineBanner } = await import('../offline-banner');
  return render(<OfflineBanner />);
}

describe('OfflineBanner — estado online', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar null cuando está online', async () => {
    const { useOnlineStatus } = await import('@/shared/hooks/use-online-status');
    vi.mocked(useOnlineStatus).mockReturnValue(true);

    const { container } = await renderOfflineBanner();

    expect(container.firstChild).toBeNull();
  });
});

describe('OfflineBanner — estado offline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el banner amber cuando está offline', async () => {
    const { useOnlineStatus } = await import('@/shared/hooks/use-online-status');
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    await renderOfflineBanner();

    const banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('debería mostrar el mensaje de sin conexión', async () => {
    const { useOnlineStatus } = await import('@/shared/hooks/use-online-status');
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    await renderOfflineBanner();

    expect(
      screen.getByText(/Sin conexión.*guardarán.*vuelva/i),
    ).toBeInTheDocument();
  });

  it('debería mostrar el icono WifiOff', async () => {
    const { useOnlineStatus } = await import('@/shared/hooks/use-online-status');
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    await renderOfflineBanner();

    // WifiOff renders as an SVG
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
