// apps/web/src/modules/animales/components/animal-form.tsx
/**
 * AnimalForm — RHF + Zod form for creating/editing animals.
 *
 * Fields (20+ total):
 * - Required: codigo, sexoKey, fechaNacimiento, configRazasId
 * - Optional: nombre, codigoArete, codigoRfid, potreroId
 * - Conditional by sexo (FEMENINO): madreId, codigoMadre
 * - Conditional by origen (COMPRADO): precioCompra, pesoCompra
 * - Conditional by sexo (MASCULINO): tipoPadreKey
 *
 * Usage:
 *   <AnimalForm onSubmit={handleSubmit} isLoading={isLoading} />
 *   <AnimalForm initialData={animal} onSubmit={handleSubmit} isLoading={isLoading} />
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createAnimalSchema } from '@ganatrack/shared-types';
import { SexoEnum, OrigenAnimalEnum } from '@ganatrack/shared-types';
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { usePredioStore } from '@/store/predio.store';
import { catalogoService } from '@/modules/configuracion/services';
import type { CreateAnimalDto } from '../types/animal.types';
import type { CatalogoBase } from '@/modules/configuracion/types/catalogo.types';

// Extend schema with optional fields for edit mode
const animalFormSchema = createAnimalSchema;

type AnimalFormData = z.infer<typeof animalFormSchema>;

interface AnimalFormProps {
  initialData?: Partial<AnimalFormData> | null;
  onSubmit: (data: CreateAnimalDto) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AnimalForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AnimalFormProps): JSX.Element {
  const [razas, setRazas] = useState<CatalogoBase[]>([]);
  const [isLoadingRazas, setIsLoadingRazas] = useState(true);
  const { predioActivo } = usePredioStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      fechaNacimiento: new Date(),
      sexoKey: SexoEnum.MASCULINO,
      tipoIngresoId: OrigenAnimalEnum.NACIDO_PREDIO,
      configRazasId: 0,
      predioId: predioActivo?.id ?? 0,
      potreroId: undefined,
      madreId: undefined,
      padreId: undefined,
      codigoMadre: '',
      codigoPadre: '',
      tipoPadreKey: 0,
      precioCompra: undefined,
      pesoCompra: undefined,
      codigoRfid: '',
      codigoArete: '',
      estadoAnimalKey: 0,
      saludAnimalKey: 0,
    },
  });

  // Watch for conditional field visibility
  const sexoKey = watch('sexoKey');
  const tipoIngresoId = watch('tipoIngresoId');
  const fechaNacimiento = watch('fechaNacimiento');

  const isFemenino = sexoKey === SexoEnum.FEMENINO;
  const isComprado = tipoIngresoId === OrigenAnimalEnum.COMPRADO;

  // Load razass
  useEffect(() => {
    async function loadRazas() {
      try {
        setIsLoadingRazas(true);
        const data = await catalogoService.getAll('razas');
        // Ensure we always have an array, even if API returns something unexpected
        setRazas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading razas:', error);
        // On error, keep empty array to avoid crash
        setRazas([]);
      } finally {
        setIsLoadingRazas(false);
      }
    }
    loadRazas();
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    if (!initialData) return;

    // Wait for razas to load before resetting form to ensure select displays correctly
    if (isLoadingRazas) return;

    reset({
      codigo: initialData.codigo ?? '',
      nombre: initialData.nombre ?? '',
      fechaNacimiento: initialData.fechaNacimiento
        ? new Date(initialData.fechaNacimiento)
        : new Date(),
      sexoKey: initialData.sexoKey ?? SexoEnum.MASCULINO,
      tipoIngresoId: initialData.tipoIngresoId ?? OrigenAnimalEnum.NACIDO_PREDIO,
      configRazasId: initialData.configRazasId ?? 0,
      predioId: initialData.predioId ?? (predioActivo?.id ?? 0),
      potreroId: initialData.potreroId,
      madreId: initialData.madreId,
      padreId: initialData.padreId,
      codigoMadre: initialData.codigoMadre ?? '',
      codigoPadre: initialData.codigoPadre ?? '',
      tipoPadreKey: initialData.tipoPadreKey ?? 0,
      precioCompra: initialData.precioCompra,
      pesoCompra: initialData.pesoCompra,
      codigoRfid: initialData.codigoRfid ?? '',
      codigoArete: initialData.codigoArete ?? '',
      estadoAnimalKey: initialData.estadoAnimalKey ?? 0,
      saludAnimalKey: initialData.saludAnimalKey ?? 0,
    });
  }, [initialData, reset, isLoadingRazas, predioActivo?.id]);

  // Effect for when initialData is null/undefined (create mode) - reset to defaults
  useEffect(() => {
    if (initialData) return;
    if (isLoadingRazas) return;

    reset({
      codigo: '',
      nombre: '',
      fechaNacimiento: new Date(),
      sexoKey: SexoEnum.MASCULINO,
      tipoIngresoId: OrigenAnimalEnum.NACIDO_PREDIO,
      configRazasId: 0,
      predioId: predioActivo?.id ?? 0,
      potreroId: undefined,
      madreId: undefined,
      padreId: undefined,
      codigoMadre: '',
      codigoPadre: '',
      tipoPadreKey: 0,
      precioCompra: undefined,
      pesoCompra: undefined,
      codigoRfid: '',
      codigoArete: '',
      estadoAnimalKey: 0,
      saludAnimalKey: 0,
    });
  }, [initialData, reset, isLoadingRazas, predioActivo?.id]);

const onFormSubmit = (data: AnimalFormData) => {
  // Normalize null values for optional number fields
  // potreroId is not captured in form but must be sent as null
  const submitData: CreateAnimalDto = {
    ...data,
    fechaNacimiento: data.fechaNacimiento,
    predicatesId: data.predioId ?? (predioActivo?.id ?? 0),
    potreroId: null, // Not captured in form, send as null
    madreId: data.madreId == null ? undefined : data.madreId,
    padreId: data.padreId == null ? undefined : data.padreId,
    precioCompra: data.precioCompra == null ? undefined : data.precioCompra,
    pesoCompra: data.pesoCompra == null ? undefined : data.pesoCompra,
  };
onSubmit(submitData);
};

const onInvalid = (data: unknown) => {
  console.error('AnimalForm validation errors:', data);
};

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit, onInvalid)}
      className="flex flex-col gap-4"
    >
      {/* Row 1: Código + Raza */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="codigo"
          label="Código"
          control={control}
          rules={{ required: 'Código requerido' }}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="GAN-001"
              error={errors.codigo?.message}
              disabled={isLoading}
            />
          )}
        />

        <FormField
          name="configRazasId"
          label="Raza"
          control={control}
          rules={{ required: 'Raza requerida' }}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              disabled={isLoading || isLoadingRazas}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={0}>Seleccionar raza...</option>
              {razas.map((raza) => (
                <option key={raza.id} value={raza.id}>
                  {raza.nombre}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      {/* Row 2: Nombre + Fecha Nacimiento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="nombre"
          label="Nombre (opcional)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="Don Toro"
              disabled={isLoading}
            />
          )}
        />

        <FormField
          name="fechaNacimiento"
          label="Fecha de Nacimiento"
          control={control}
          rules={{ required: 'Fecha requerida' }}
          render={(field) => (
            <DatePicker
              value={field.value}
              onChange={(date) => field.onChange(date)}
              maxDate={new Date()}
              placeholder="Seleccionar fecha"
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Row 3: Sexo + Origen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="sexoKey"
          label="Sexo"
          control={control}
          rules={{ required: 'Sexo requerido' }}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={SexoEnum.MASCULINO}>Masculino</option>
              <option value={SexoEnum.FEMENINO}>Femenino</option>
            </select>
          )}
        />

        <FormField
          name="tipoIngresoId"
          label="Origen"
          control={control}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={OrigenAnimalEnum.NACIDO_PREDIO}>Nacido en el Predio</option>
              <option value={OrigenAnimalEnum.COMPRADO}>Comprado</option>
            </select>
          )}
        />
      </div>

      {/* Conditional: COMPRADO → precioCompra, pesoCompra */}
      {isComprado && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="precioCompra"
            label="Precio de Compra (COP)"
            control={control}
            render={(field) => (
              <Input
                {...field}
                type="number"
                value={field.value ?? ''}
                placeholder="2500000"
                disabled={isLoading}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />

          <FormField
            name="pesoCompra"
            label="Peso de Compra (kg)"
            control={control}
            render={(field) => (
              <Input
                {...field}
                type="number"
                value={field.value ?? ''}
                placeholder="180"
                disabled={isLoading}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />
        </div>
      )}

      {/* Row 4: Arete + RFID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="codigoArete"
          label="Código Arete (opcional)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="ARE-001"
              disabled={isLoading}
            />
          )}
        />

        <FormField
          name="codigoRfid"
          label="Código RFID (opcional)"
          control={control}
          render={(field) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="RFID-001"
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Conditional: FEMENINO → madre fields */}
      {isFemenino && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Datos de la Madre
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="madreId"
                label="ID Madre (opcional)"
                control={control}
                render={(field) => (
                  <Input
                    {...field}
                    type="number"
                    value={field.value ?? ''}
                    placeholder="14"
                    disabled={isLoading}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />

              <FormField
                name="codigoMadre"
                label="Código Madre (opcional)"
                control={control}
                render={(field) => (
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder="GAN-014"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          </div>
        </>
      )}

      {/* Conditional: MASCULINO → tipoPadreKey */}
      {!isFemenino && (
        <FormField
          name="tipoPadreKey"
          label="Tipo de Padre"
          control={control}
          render={(field) => (
            <select
              {...field}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={0}>Natural</option>
              <option value={1}>Inseminación</option>
            </select>
          )}
        />
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
          {initialData ? 'Guardar cambios' : 'Crear animal'}
        </Button>
      </div>
    </form>
  );
}