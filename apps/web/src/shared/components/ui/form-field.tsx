// apps/web/src/shared/components/ui/form-field.tsx
/**
 * FormField — RHF Controller wrapper with error display.
 *
 * Integrates React Hook Form's Controller with any input component.
 * Displays Zod validation error messages when validation fails.
 *
 * @example
 * <FormField
 *   name="email"
 *   label="Email"
 *   control={control}
 *   rules={{ required: 'Email is required' }}
 *   required
 *   render={({ field }) => <Input {...field} />}
 * />
 */

'use client';

import { Controller, type ControllerProps, type FieldValues, type ControllerRenderProps } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: ControllerProps<T>['name'];
  label?: string;
  control: ControllerProps<T>['control'];
  rules?: ControllerProps<T>['rules'];
  render: (field: ControllerRenderProps<T, ControllerProps<T>['name']>) => React.ReactNode;
  required?: boolean;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  control,
  rules,
  render,
  required,
}: FormFieldProps<T>): JSX.Element {
  const displayLabel = required && label ? `${label} (required)` : label;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;

        return (
          <div className="flex flex-col gap-1.5">
            {label && (
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {displayLabel}
              </label>
            )}
            {render(field)}
            {error && (
              <span className="text-sm text-red-500 dark:text-red-400" role="alert">
                {error}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}
