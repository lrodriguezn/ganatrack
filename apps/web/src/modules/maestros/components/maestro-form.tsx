// apps/web/src/modules/maestros/components/maestro-form.tsx
/**
 * MaestroForm — generic form component for any maestro entity.
 *
 * Renders fields dynamically from Zod schema + MaestroFieldDef[] config.
 * Uses React Hook Form + Zod validation via zodResolver.
 *
 * Usage:
 *   <MaestroForm
 *     fields={FIELDS}
 *     schema={VeterinarioSchema}
 *     defaultValues={item}
 *     onSubmit={handleSubmit}
 *     onCancel={() => setIsOpen(false)}
 *     isLoading={isCreating || isUpdating}
 *   />
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Path } from 'react-hook-form';
import { useEffect } from 'react';
import { FormField } from '@/shared/components/ui/form-field';
import { Input, Textarea } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { MaestroFieldDef } from '../types/maestro.types';
import type { z } from 'zod';

interface MaestroFormProps<T extends z.ZodSchema> {
  fields: MaestroFieldDef[];
  schema: T;
  defaultValues?: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MaestroForm<T extends z.ZodSchema>({
  fields,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: MaestroFormProps<T>): JSX.Element {
  type FormData = z.infer<T>;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? ({} as FormData),
  });

  useEffect(() => {
    console.log('[MaestroForm] MOUNTED - onSubmit:', onSubmit);
    console.log('[MaestroForm] MOUNTED - onCancel:', onCancel);
  }, [onSubmit, onCancel]);

  const onFormSubmit = async (data: FormData) => {
    console.log('[MaestroForm] onFormSubmit called with data:', data);
    console.log('[MaestroForm] onSubmit prop:', onSubmit);
    if (onSubmit) {
      console.log('[MaestroForm] calling onSubmit...');
      await onSubmit(data);
      console.log('[MaestroForm] onSubmit completed');
    } else {
      console.log('[MaestroForm] onSubmit is undefined!');
    }
  };

  console.log('[MaestroForm] Render - onSubmit prop:', onSubmit);

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {fields.map((fieldDef) => (
        <FormField
          key={fieldDef.name}
          name={fieldDef.name as Path<FormData>}
          label={fieldDef.label}
          control={control}
          render={(field) => {
            // Extract only the properties needed for input/textarea
            const { value, onChange, onBlur, name, ref } = field;
            const inputProps = {
              value,
              onChange,
              onBlur,
              name,
              ref,
              disabled: isLoading,
              placeholder: fieldDef.label,
            };

            if (fieldDef.type === 'textarea') {
              return <Textarea {...inputProps} />;
            }
            // Map 'tel' to 'text' since Input doesn't support tel type
            const inputType = fieldDef.type === 'tel' ? 'text' : fieldDef.type;
            return <Input {...inputProps} type={inputType} />;
          }}
        />
      ))}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          isLoading={isLoading}
          onClick={() => {
            console.log('[MaestroForm] Button clicked, calling handleSubmit');
            handleSubmit(onFormSubmit)().then(() => {
              console.log('[MaestroForm] handleSubmit resolved');
            }).catch((err) => {
              console.log('[MaestroForm] handleSubmit rejected:', err);
            });
          }}
        >
          Guardar
        </Button>
      </div>
    </form>
  );
}
