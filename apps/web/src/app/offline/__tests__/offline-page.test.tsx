// apps/web/src/app/offline/__tests__/offline-page.test.tsx
/**
 * Tests for offline/page.tsx component.
 *
 * Coverage targets:
 * - Renders the offline message
 * - Shows "Reintentar" button
 * - Shows links to Dashboard and Animales
 * - Shows sync message at bottom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

describe('OfflinePage', () => {
  it('debería renderizar el mensaje de sin conexión', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    expect(screen.getByText(/Sin conexión a internet/i)).toBeInTheDocument();
  });

  it('debería mostrar el ícono de WifiOff', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    // WifiOff icon is rendered as an SVG with aria-hidden, verify its presence by class
    const wifiOffIcon = document.querySelector('.lucide-wifi-off');
    expect(wifiOffIcon).toBeInTheDocument();
  });

  it('debería mostrar el botón Reintentar', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('debería recargar la página al hacer clic en Reintentar', async () => {
    const { default: OfflinePage } = await import('../page');
    const user = await import('@testing-library/user-event').then(m => m.default);
    
    render(<OfflinePage />);
    
    await user.click(screen.getByRole('button', { name: /Reintentar/i }));
    
    expect(mockReload).toHaveBeenCalled();
  });

  it('debería mostrar enlace al Dashboard', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    const dashboardLink = screen.getByRole('link', { name: /Ir al Dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('debería mostrar enlace a Animales', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    const animalesLink = screen.getByRole('link', { name: /Animales/i });
    expect(animalesLink).toBeInTheDocument();
    expect(animalesLink).toHaveAttribute('href', '/dashboard/animales');
  });

  it('debería mostrar mensaje de sincronización automática', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    expect(screen.getByText(/sincronizarán automáticamente/i)).toBeInTheDocument();
  });

  it('debería mostrar descripción de funcionalidad offline', async () => {
    const { default: OfflinePage } = await import('../page');
    
    render(<OfflinePage />);
    
    expect(screen.getByText(/Algunas secciones funcionan offline/i)).toBeInTheDocument();
  });
});
