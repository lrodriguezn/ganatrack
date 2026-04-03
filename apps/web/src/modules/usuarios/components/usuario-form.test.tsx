// apps/web/src/modules/usuarios/components/usuario-form.test.tsx
/**
 * Component tests for UsuarioForm.
 *
 * Tests:
 * - Form renders with all fields
 * - Validation errors display
 * - Submit calls onSubmit
 * - Duplicate email error
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsuarioForm } from './usuario-form';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
}));

// Mock useRoles hook
vi.mock('../hooks/use-roles', () => ({
  useRoles: () => ({
    data: [
      { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo', esSistema: true },
      { id: 2, nombre: 'Veterinario', descripcion: 'Servicios y reportes', esSistema: true },
    ],
    isLoading: false,
    error: null,
  }),
}));

// Mock predio store
vi.mock('@/store/predio.store', () => ({
  usePredioStore: () => ({ predioActivo: { id: 1, nombre: 'Finca Test' } }),
}));

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const renderForm = (props = {}) => {
  return render(
    <UsuarioForm
      mode="create"
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      isLoading={false}
      {...props}
    />,
  );
};

describe('UsuarioForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all required fields', () => {
    renderForm();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
  });

  it('should show validation error for empty nombre', async () => {
    renderForm();
    const submitButton = screen.getByRole('button', { name: /crear usuario/i });
    fireEvent.click(submitButton);

    // Wait for validation to trigger
    await vi.waitFor(() => {
      expect(screen.getByText(/nombre requerido/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    renderForm();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /crear usuario/i });
    fireEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for weak password', async () => {
    renderForm();
    const passwordInput = screen.getByLabelText(/contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    const submitButton = screen.getByRole('button', { name: /crear usuario/i });
    fireEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(screen.getByText(/contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form data on valid submit', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'Password1' } });

    const submitButton = screen.getByRole('button', { name: /crear usuario/i });
    fireEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show server error for duplicate email', () => {
    renderForm({
      serverError: 'El email "test@test.com" ya está registrado',
    });
    expect(screen.getByText(/ya está registrado/i)).toBeInTheDocument();
  });

  it('should not show password field in edit mode', () => {
    renderForm({
      mode: 'edit',
      initialData: { id: 1, nombre: 'Test', email: 'test@test.com', rolId: 1, predioId: 1, activo: true },
    });
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
  });
});
