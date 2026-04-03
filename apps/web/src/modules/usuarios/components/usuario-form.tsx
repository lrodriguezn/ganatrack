// apps/web/src/modules/usuarios/components/usuario-form.tsx
/**
 * UsuarioForm — RHF + Zod form for creating/editing usuarios.
 *
 * Fields:
 * - Required: nombre, email, rolId, predioId
 * - Optional: telefono
 * - Create-only: password
 *
 * Usage:
 *   <UsuarioForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
 *   <UsuarioForm mode="edit" initialData={usuario} onSubmit={handleSubmit} isLoading={isLoading} />
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUsuarioSchema, UpdateUsuarioSchema } from '@ganatrack/shared-types';
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { usePredioStore } from '@/store/predio.store';
import { useRoles } from '../hooks/use-roles';
import { RolesSelector } from './roles-selector';
import type { CreateUsuarioDto, UpdateUsuarioDto, Usuario } from '../types/usuarios.types';

interface UsuarioFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Usuario> | null;
  onSubmit: (data: CreateUsuarioDto | UpdateUsuarioDto) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  serverError?: string | null;
}

export function UsuarioForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  serverError,
}: UsuarioFormProps): JSX.Element {
  const { predioActivo } = usePredioStore();
  const { data: roles } = useRoles();

  const schema = mode === 'create'
    ? CreateUsuarioSchema
    : UpdateUsuarioSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      rolId: 0,
      predioId: predioActivo?.id ?? 0,
      telefono: '',
      ...initialData,
      // Don't populate password on edit
      ...(mode === 'edit' ? { password: undefined } : {}),
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      reset({
        nombre: initialData.nombre ?? '',
        email: initialData.email ?? '',
        rolId: initialData.rolId ?? 0,
        predioId: initialData.predioId ?? predioActivo?.id ?? 0,
        telefono: initialData.telefono ?? '',
      });
    }
  }, [initialData, mode, predioActivo?.id, reset]);

  const onFormSubmit = (data: CreateUsuarioDto | UpdateUsuarioDto) => {
    // Ensure predioId is set from active predio
    const submitData = {
      ...data,
      predioId: data.predioId ?? (predioActivo?.id ?? 0),
    };

    // Check for duplicate email error from server
    if (serverError?.includes('DUPLICATE_EMAIL') || serverError?.includes('ya está registrado')) {
      setError('email', { type: 'manual', message: 'Este email ya está registrado' });
      return;
    }

    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col gap-4"
      noValidate
      aria-label={mode === 'create' ? 'Formulario de creación de usuario' : 'Formulario de edición de usuario'}
    >
      {/* Row 1: Nombre + Email */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="nombre"
          label="Nombre completo"
          control={control}
          rules={{ required: 'Nombre requerido' }}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="Carlos Mendoza"
              error={errors.nombre?.message}
              disabled={isLoading}
              aria-required="true"
            />
          )}
        />

        <FormField
          name="email"
          label="Email"
          control={control}
          rules={{ required: 'Email requerido' }}
          render={(field) => (
            <Input
              {...field}
              type="email"
              value={field.value ?? ''}
              placeholder="carlos@finca.com"
              error={errors.email?.message || (serverError?.includes('email') ? serverError : undefined)}
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.email}
            />
          )}
        />
      </div>

      {/* Password (create only) */}
      {mode === 'create' && (
        <FormField
          name="password"
          label="Contraseña"
          control={control}
          rules={{ required: 'Contraseña requerida' }}
          render={(field) => (
            <Input
              {...field}
              type="password"
              value={field.value ?? ''}
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              disabled={isLoading}
              aria-required="true"
              aria-describedby="password-hint"
            />
          )}
        />
      )}
      {mode === 'create' && (
        <p id="password-hint" className="text-xs text-gray-500 dark:text-gray-400">
          Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
        </p>
      )}

      {/* Row 2: Rol + Teléfono */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="rolId"
          label="Rol"
          control={control}
          rules={{ required: 'Rol requerido' }}
          render={(field) => (
            <RolesSelector
              value={field.value ?? 0}
              onChange={(value) => field.onChange(value)}
              roles={roles ?? []}
              disabled={isLoading}
              error={errors.rolId?.message}
            />
          )}
        />

        <FormField
          name="telefono"
          label="Teléfono (opcional)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="+57 300 123 4567"
              error={errors.telefono?.message}
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Server error display */}
      {serverError && !serverError.includes('email') && (
        <div role="alert" className="rounded-md bg-red-50 dark:bg-red-500/10 p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
