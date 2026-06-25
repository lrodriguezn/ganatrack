// apps/web/src/shared/components/layout/notification-bell.test.tsx
/**
 * Tests for NotificationBell component.
 *
 * Coverage targets (JD Round 1, A.W1 / B.S3):
 * - Renders a button with aria-label "Notificaciones"
 * - Renders the Bell icon
 * - Shows badge with count when unreadCount > 0
 * - Hides badge when unreadCount === 0
 * - Shows "99+" when unreadCount > 99
 * - Clicking the bell toggles the panel (openPanel / closePanel)
 * - The bell itself triggers useNotificacionesResumen polling
 *
 * Regression: spec scenario 8 (badge visible) was not covered by
 * any existing test. Re-disabling polling would not be caught.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock online status
const mockUseOnlineStatus = vi.fn(() => true);
vi.mock('@/shared/hooks/use-online-status', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

// Mock notification store
const mockStore = {
  unreadCount: 0,
  panelOpen: false,
  openPanel: vi.fn(),
  closePanel: vi.fn(),
  setUnreadCount: vi.fn(),
};

vi.mock('@/store/notificaciones.store', () => ({
  useNotificacionesStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector(mockStore);
    }
    return mockStore;
  },
  selectPanelOpen: (s: { panelOpen: boolean }) => s.panelOpen,
}));

// Mock polling hook (we don't want to fire real queries in this test)
vi.mock('@/modules/notificaciones/hooks', () => ({
  useNotificacionesResumen: vi.fn(),
}));

// Mock predio store
const mockPredioActivo = { id: 1 };
vi.mock('@/store/predio.store', () => ({
  usePredioStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ predioActivo: mockPredioActivo });
    }
    return { predioActivo: mockPredioActivo };
  },
}));

const importBell = async () => {
  const mod = await import('./notification-bell');
  return mod.NotificationBell;
};

describe('NotificationBell — render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.unreadCount = 0;
    mockStore.panelOpen = false;
  });

  it('renders a button with aria-label "Notificaciones"', async () => {
    const NotificationBell = await importBell();
    render(<NotificationBell />);

    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
  });

  it('renders the bell icon SVG', async () => {
    const NotificationBell = await importBell();
    const { container } = render(<NotificationBell />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('hides the badge when unreadCount === 0', async () => {
    mockStore.unreadCount = 0;
    const NotificationBell = await importBell();
    render(<NotificationBell />);

    // Badge with aria-label "0 notificaciones" should NOT exist
    expect(screen.queryByLabelText('0 notificaciones')).not.toBeInTheDocument();
  });

  it('shows the badge with count when unreadCount > 0 (regression: spec scenario 8)', async () => {
    mockStore.unreadCount = 3;
    const NotificationBell = await importBell();
    render(<NotificationBell />);

    expect(screen.getByLabelText('3 notificaciones')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows "99+" when unreadCount > 99 (regression: max badge cap)', async () => {
    mockStore.unreadCount = 150;
    const NotificationBell = await importBell();
    render(<NotificationBell />);

    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(screen.getByLabelText('150 notificaciones')).toBeInTheDocument();
  });
});

describe('NotificationBell — interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.unreadCount = 0;
    mockStore.panelOpen = false;
  });

  it('calls openPanel when panel is closed', async () => {
    mockStore.panelOpen = false;
    const NotificationBell = await importBell();
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole('button'));

    expect(mockStore.openPanel).toHaveBeenCalledTimes(1);
    expect(mockStore.closePanel).not.toHaveBeenCalled();
  });

  it('calls closePanel when panel is already open', async () => {
    mockStore.panelOpen = true;
    const NotificationBell = await importBell();
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole('button'));

    expect(mockStore.closePanel).toHaveBeenCalledTimes(1);
    expect(mockStore.openPanel).not.toHaveBeenCalled();
  });

  it('triggers useNotificacionesResumen polling on mount (regression: polling must run)', async () => {
    const { useNotificacionesResumen } = await import('@/modules/notificaciones/hooks');
    vi.mocked(useNotificacionesResumen).mockClear();

    const NotificationBell = await importBell();
    render(<NotificationBell />);

    expect(useNotificacionesResumen).toHaveBeenCalledWith(mockPredioActivo.id);
  });
});
