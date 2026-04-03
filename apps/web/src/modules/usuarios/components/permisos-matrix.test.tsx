// apps/web/src/modules/usuarios/components/permisos-matrix.test.tsx
/**
 * Component tests for PermisosMatrix.
 *
 * Tests:
 * - Grid rendering (11 modules × 4 actions)
 * - Toggle checkbox
 * - Conflict detection
 * - Batch save button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PermisosMatrix } from './permisos-matrix';
import type { PermisoMatrixState } from '../types/usuarios.types';

const createMockMatrix = (): PermisoMatrixState => ({
  rolId: 1,
  cells: [
    { modulo: 'dashboard', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'dashboard', accion: 'crear', enabled: true, conflicted: false },
    { modulo: 'dashboard', accion: 'editar', enabled: true, conflicted: false },
    { modulo: 'dashboard', accion: 'eliminar', enabled: true, conflicted: false },
    { modulo: 'animales', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'animales', accion: 'crear', enabled: true, conflicted: false },
    { modulo: 'animales', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'animales', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'predios', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'predios', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'predios', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'predios', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'servicios', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'servicios', accion: 'crear', enabled: true, conflicted: false },
    { modulo: 'servicios', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'servicios', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'reportes', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'reportes', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'reportes', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'reportes', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'configuracion', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'configuracion', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'configuracion', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'configuracion', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'maestros', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'maestros', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'maestros', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'maestros', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'productos', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'productos', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'productos', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'productos', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'imagenes', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'imagenes', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'imagenes', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'imagenes', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'notificaciones', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'notificaciones', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'notificaciones', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'notificaciones', accion: 'eliminar', enabled: false, conflicted: false },
    { modulo: 'usuarios', accion: 'ver', enabled: true, conflicted: false },
    { modulo: 'usuarios', accion: 'crear', enabled: false, conflicted: false },
    { modulo: 'usuarios', accion: 'editar', enabled: false, conflicted: false },
    { modulo: 'usuarios', accion: 'eliminar', enabled: false, conflicted: false },
  ],
  isDirty: false,
  conflicts: [],
});

const renderMatrix = (props = {}) => {
  return render(
    <PermisosMatrix
      matrix={createMockMatrix()}
      onToggle={vi.fn()}
      onSave={vi.fn()}
      isSaving={false}
      isDirty={false}
      {...props}
    />,
  );
};

describe('PermisosMatrix', () => {
  it('should render all 11 module rows', () => {
    renderMatrix();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Animales')).toBeInTheDocument();
    expect(screen.getByText('Predios')).toBeInTheDocument();
    expect(screen.getByText('Servicios')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Maestros')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Imágenes')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('should render 4 action columns', () => {
    renderMatrix();
    expect(screen.getByText('ver')).toBeInTheDocument();
    expect(screen.getByText('crear')).toBeInTheDocument();
    expect(screen.getByText('editar')).toBeInTheDocument();
    expect(screen.getByText('eliminar')).toBeInTheDocument();
  });

  it('should render 44 checkboxes (11 × 4)', () => {
    renderMatrix();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(44);
  });

  it('should show checked state for enabled permissions', () => {
    renderMatrix();
    const dashboardVer = screen.getByLabelText('Dashboard - ver');
    expect(dashboardVer).toBeChecked();
  });

  it('should show unchecked state for disabled permissions', () => {
    renderMatrix();
    const prediosCrear = screen.getByLabelText('Predios - crear');
    expect(prediosCrear).not.toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    renderMatrix({ onToggle });
    const checkbox = screen.getByLabelText('Dashboard - ver');
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith('dashboard', 'ver');
  });

  it('should call onSave when save button is clicked', () => {
    const onSave = vi.fn();
    renderMatrix({ onSave, isDirty: true });
    fireEvent.click(screen.getByRole('button', { name: /guardar permisos/i }));
    expect(onSave).toHaveBeenCalled();
  });

  it('should disable save button when not dirty', () => {
    renderMatrix({ isDirty: false });
    expect(screen.getByRole('button', { name: /guardar permisos/i })).toBeDisabled();
  });

  it('should show loading state when saving', () => {
    renderMatrix({ isSaving: true, isDirty: true });
    expect(screen.getByRole('button', { name: /guardar permisos/i })).toBeDisabled();
  });

  it('should show loading indicator when matrix is undefined', () => {
    render(
      <PermisosMatrix
        matrix={undefined}
        onToggle={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Cargando matriz de permisos')).toBeInTheDocument();
  });
});
