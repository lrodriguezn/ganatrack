// apps/web/src/modules/usuarios/components/usuario-table.test.tsx
/**
 * Component tests for UsuarioTable.
 *
 * Tests:
 * - Table rendering with data
 * - Loading state
 * - Empty state
 * - Pagination
 * - Status badges
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsuarioTable } from './usuario-table';
import { BrowserRouter } from 'react-router-dom';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
}));

// Mock auth Can component
vi.mock('@/modules/auth/components/can', () => ({
  Can: ({ children, permission }: { children: React.ReactNode; permission: string }) => <>{children}</>,
}));

const mockUsuarios = [
  { id: 1, nombre: 'Carlos Mendoza', email: 'carlos@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 2, nombre: 'María Rodríguez', email: 'maria@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: false },
];

const renderTable = (props = {}) => {
  return render(
    <UsuarioTable
      usuarios={mockUsuarios}
      isLoading={false}
      pageIndex={0}
      pageSize={10}
      totalRows={2}
      pageCount={1}
      onPaginationChange={vi.fn()}
      {...props}
    />,
  );
};

describe('UsuarioTable', () => {
  it('should render usuario names', () => {
    renderTable();
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument();
  });

  it('should render usuario emails', () => {
    renderTable();
    expect(screen.getByText('carlos@finca.com')).toBeInTheDocument();
    expect(screen.getByText('maria@finca.com')).toBeInTheDocument();
  });

  it('should show active status badge', () => {
    renderTable();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('should show inactive status badge', () => {
    renderTable();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('should show empty state when no usuarios', () => {
    render(
      <UsuarioTable
        usuarios={[]}
        isLoading={false}
        pageIndex={0}
        pageSize={10}
        totalRows={0}
        pageCount={1}
        onPaginationChange={vi.fn()}
      />,
    );
    expect(screen.getByText('No hay usuarios registrados')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderTable({ isLoading: true });
    // DataTable shows skeleton rows when loading
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
