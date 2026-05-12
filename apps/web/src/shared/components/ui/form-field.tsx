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

import {
  Controller,
  type ControllerProps,
  type FieldValues,
  type FieldPath,
  type ControllerRenderProps,
} from 'react-hook-form';

interface FormFieldProps<T extends FieldValues, K extends FieldPath<T>> {
  name: K;
  label?: string;
  control: ControllerProps<T>['control'];
  rules?: ControllerProps<T>['rules'];
  render: (field: ControllerRenderProps<T, K> & { id: string }) => React.ReactNode;
  required?: boolean;
}

export function FormField<T extends FieldValues, K extends FieldPath<T>>({
  name,
  label,
  control,
  rules,
  render,
  required,
}: FormFieldProps<T, K>): JSX.Element {
  const displayLabel = required && label ? `${label} (required)` : label;
  const fieldId = name.toString();

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
              <label htmlFor={fieldId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {displayLabel}
              </label>
            )}
            {render({ ...field, id: fieldId })}
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
