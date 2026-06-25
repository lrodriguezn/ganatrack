// apps/web/src/modules/notificaciones/components/notification-center.test.tsx
/**
 * Tests for NotificationCenter slide-over panel.
 *
 * Coverage targets (JD Round 1, A.W1 / B.S3, A.W4):
 * - Renders the dialog
 * - Renders a NotificationItem for each entry in data.ultimas
 * - Shows empty-state message when data.ultimas is empty
 * - Shows empty-state message when data is undefined (regression: A.W4)
 * - Shows loading state when isLoading
 * - Shows error state when error
 * - Shows offline indicator when isOnline === false
 *
 * Regression: spec scenario 9 (panel lists ultimas) was not covered
 * by any existing test. The reverted empty-state condition would
 * not be caught without these tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Radix Dialog primitives — only the parts NotificationCenter actually uses
vi.mock('@radix-ui/react-dialog', () => {
  const ReactMod = require('react');
  return {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      ReactMod.createElement('div', { 'data-dialog-root': '', 'data-open': open }, children),
    Portal: ({ children }: { children: React.ReactNode }) => ReactMod.createElement('div', { 'data-dialog-portal': '' }, children),
    Overlay: ({ children }: { children?: React.ReactNode }) =>
      ReactMod.createElement('div', { 'data-dialog-overlay': '' }, children),
    Content: ({ children }: { children: React.ReactNode }) =>
      ReactMod.createElement('div', { 'data-dialog-content': '' }, children),
    Title: ({ children }: { children: React.ReactNode }) =>
      ReactMod.createElement('h2', null, children),
    Description: ({ children }: { children: React.ReactNode }) =>
      ReactMod.createElement('p', null, children),
    Close: ({ children, ...rest }: { children: React.ReactNode; [k: string]: unknown }) =>
      ReactMod.createElement('button', rest, children),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock online status (default: online)
const mockUseOnlineStatus = vi.fn(() => true);
vi.mock('@/shared/hooks/use-online-status', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

// Mock polling hook — tests will override
const mockUseNotificacionesResumen = vi.fn();
vi.mock('@/modules/notificaciones/hooks', () => ({
  useNotificacionesResumen: (...args: unknown[]) => mockUseNotificacionesResumen(...args),
  useMarkRead: () => ({ markRead: vi.fn(), markAllRead: vi.fn(), isPending: false, error: null }),
}));

// Mock store
const mockStore = {
  panelOpen: true,
  closePanel: vi.fn(),
  openPanel: vi.fn(),
  unreadCount: 0,
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

const mockPredioActivo = { id: 1 };
vi.mock('@/store/predio.store', () => ({
  usePredioStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ predioActivo: mockPredioActivo });
    }
    return { predioActivo: mockPredioActivo };
  },
}));

// Mock NotificationItem — capture count + props
const renderItemSpy = vi.fn();
vi.mock('./notification-item', () => ({
  NotificationItem: (props: { notification: { id: number; titulo: string } }) => {
    renderItemSpy(props);
    return <div data-testid="notification-item">{props.notification.titulo}</div>;
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const importCenter = async () => {
  const mod = await import('./notification-center');
  return mod.NotificationCenter;
};

const notif = (id: number, titulo: string) => ({
  id,
  tipo: 'PARTO_PROXIMO' as const,
  titulo,
  mensaje: 'mensaje',
  leida: false,
  fechaCreacion: new Date().toISOString(),
  entidadTipo: 'animal' as const,
  entidadId: 1,
  accionUrl: null,
});

describe('NotificationCenter — render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.panelOpen = true;
    mockUseOnlineStatus.mockReturnValue(true);
  });

  it('renders the dialog title "Notificaciones"', async () => {
    mockUseNotificacionesResumen.mockReturnValue({ data: undefined, isLoading: false, error: null });
    const NotificationCenter = await importCenter();
    render(<NotificationCenter />, { wrapper: createWrapper() });

    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
  });

  it('renders 3 NotificationItem components for 3 ultimas entries (regression: spec scenario 9)', async () => {
    mockUseNotificacionesResumen.mockReturnValue({
      data: { noLeidas: 3, porTipo: [], ultimas: [notif(1, 'A'), notif(2, 'B'), notif(3, 'C')] },
      isLoading: false,
      error: null,
    });
    const NotificationCenter = await importCenter();
    render(<NotificationCenter />, { wrapper: createWrapper() });

    const items = screen.getAllByTestId('notification-item');
    expect(items).toHaveLength(3);
    expect(renderItemSpy).toHaveBeenCalledTimes(3);
  });

  it('shows the empty-state message when data.ultimas is empty', async () => {
    mockUseNotificacionesResumen.mockReturnValue({
      data: { noLeidas: 0, porTipo: [], ultimas: [] },
      isLoading: false,
      error: null,
    });
    const NotificationCenter = await importCenter();
    render(<NotificationCenter />, { wrapper: createWrapper() });

    expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
    expect(screen.queryAllByTestId('notification-item')).toHaveLength(0);
  });

  it('shows the loading spinner when isLoading', async () => {
    mockUseNotificacionesResumen.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const NotificationCenter = await importCenter();
    const { container } = render(<NotificationCenter />, { wrapper: createWrapper() });

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the error message when error', async () => {
    mockUseNotificacionesResumen.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });
    const NotificationCenter = await importCenter();
    render(<NotificationCenter />, { wrapper: createWrapper() });

    expect(screen.getByText(/No se pudieron cargar las notificaciones/)).toBeInTheDocument();
  });

  it('shows the offline indicator when isOnline === false', async () => {
    mockUseOnlineStatus.mockReturnValue(false);
    mockUseNotificacionesResumen.mockReturnValue({
      data: { noLeidas: 0, porTipo: [], ultimas: [] },
      isLoading: false,
      error: null,
    });
    const NotificationCenter = await importCenter();
    render(<NotificationCenter />, { wrapper: createWrapper() });

    expect(screen.getByText(/Sin conexión/)).toBeInTheDocument();
  });
});
