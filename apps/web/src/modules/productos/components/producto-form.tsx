// apps/web/src/modules/productos/components/producto-form.tsx
/**
 * ProductoForm — RHF + Zod form for creating/editing products.
 *
 * Fields:
 * - Required: nombre, tipoKey, unidadMedida
 * - Optional: descripcion, precioUnitario, stockActual, stockMinimo, fechaVencimiento, estadoKey
 *
 * Usage:
 *   <ProductoForm onSubmit={handleSubmit} isLoading={isLoading} />
 *   <ProductoForm initialData={producto} onSubmit={handleSubmit} isLoading={isLoading} />
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { CreateProductoDto } from '../types/producto.types';

// Zod schema for producto form
const productoFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  tipoKey: z.number().min(1, 'El tipo es requerido'),
  unidadMedida: z.string().min(1, 'La unidad de medida es requerida'),
  precioUnitario: z.coerce.number().positive('El precio debe ser mayor a 0').optional().or(z.literal(0)),
  stockActual: z.coerce.number().min(0, 'El stock no puede ser negativo').default(0),
  stockMinimo: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo').optional().or(z.literal(0)),
  fechaVencimiento: z.string().optional().or(z.literal('')),
  estadoKey: z.coerce.number().default(1),
  proveedorId: z.coerce.number().optional().or(z.literal(0)),
});

type ProductoFormData = z.infer<typeof productoFormSchema>;

const TIPOS = [
  { key: 1, label: 'Medicamento' },
  { key: 2, label: 'Suplemento' },
  { key: 3, label: 'Insumo' },
];

const UNIDADES = [
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'dosis', label: 'Dosis' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'l', label: 'Litros (l)' },
];

interface ProductoFormProps {
  initialData?: Partial<CreateProductoDto> | null;
  onSubmit: (data: CreateProductoDto) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductoForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductoFormProps): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoFormSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      tipoKey: 0,
      unidadMedida: '',
      precioUnitario: undefined,
      stockActual: 0,
      stockMinimo: undefined,
      fechaVencimiento: '',
      estadoKey: 1,
      proveedorId: undefined,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre ?? '',
        descripcion: initialData.descripcion ?? '',
        tipoKey: initialData.tipoKey ?? 0,
        unidadMedida: initialData.unidadMedida ?? '',
        precioUnitario: initialData.precioUnitario,
        stockActual: initialData.stockActual ?? 0,
        stockMinimo: initialData.stockMinimo,
        fechaVencimiento: initialData.fechaVencimiento ?? '',
        estadoKey: initialData.estadoKey ?? 1,
        proveedorId: initialData.proveedorId,
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: ProductoFormData) => {
    const submitData: CreateProductoDto = {
      nombre: data.nombre,
      tipoKey: data.tipoKey,
      unidadMedida: data.unidadMedida,
      stockActual: data.stockActual,
      estadoKey: data.estadoKey,
      predioId: 0, // Will be set by the page component from predio store
      descripcion: data.descripcion || undefined,
      precioUnitario: data.precioUnitario || undefined,
      stockMinimo: data.stockMinimo || undefined,
      fechaVencimiento: data.fechaVencimiento || undefined,
      proveedorId: data.proveedorId || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {/* Row 1: Nombre + Tipo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="nombre"
          label="Nombre"
          control={control}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="Ivermectina 1%"
              error={errors.nombre?.message}
              disabled={isLoading}
            />
          )}
        />

        <FormField
          name="tipoKey"
          label="Tipo"
          control={control}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? 0}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={0}>Seleccionar tipo...</option>
              {TIPOS.map((tipo) => (
                <option key={tipo.key} value={tipo.key}>
                  {tipo.label}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      {/* Row 2: Descripción */}
      <FormField
        name="descripcion"
        label="Descripción (opcional)"
        control={control}
        render={(field) => (
          <textarea
            {...field}
            value={field.value ?? ''}
            placeholder="Descripción del producto..."
            rows={3}
            disabled={isLoading}
            className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        )}
      />

      {/* Row 3: Unidad de Medida + Stock Actual */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="unidadMedida"
          label="Unidad de Medida"
          control={control}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? ''}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar unidad...</option>
              {UNIDADES.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          )}
        />

        <FormField
          name="stockActual"
          label="Stock Actual"
          control={control}
          render={(field) => (
            <Input
              {...field}
              type="number"
              value={field.value ?? ''}
              placeholder="0"
              error={errors.stockActual?.message}
              disabled={isLoading}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
            />
          )}
        />
      </div>

      {/* Row 4: Precio + Stock Mínimo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="precioUnitario"
          label="Precio Unitario (COP)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              type="number"
              value={field.value ?? ''}
              placeholder="45000"
              error={errors.precioUnitario?.message}
              disabled={isLoading}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            />
          )}
        />

        <FormField
          name="stockMinimo"
          label="Stock Mínimo (opcional)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              type="number"
              value={field.value ?? ''}
              placeholder="5"
              error={errors.stockMinimo?.message}
              disabled={isLoading}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            />
          )}
        />
      </div>

      {/* Row 5: Fecha Vencimiento + Estado */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="fechaVencimiento"
          label="Fecha de Vencimiento (opcional)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              type="date"
              value={field.value ?? ''}
              disabled={isLoading}
            />
          )}
        />

        <FormField
          name="estadoKey"
          label="Estado"
          control={control}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? 1}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>Activo</option>
              <option value={2}>Inactivo</option>
            </select>
          )}
        />
      </div>

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
          {initialData ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
