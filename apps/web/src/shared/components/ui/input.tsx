// apps/web/src/shared/components/ui/input.tsx
/**
 * Input — UI atom for form text fields.
 *
 * Variants:
 * - default: standard input styling
 * - error: red border with error message display
 * - success: green border for validation success
 *
 * Sizes: sm | md | lg
 * Types: text, email, password, number, textarea
 *
 * Supports all standard input attributes via spread.
 */

'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type InputVariant = 'default' | 'error' | 'success';
type InputSize = 'sm' | 'md' | 'lg';

interface InputBaseProps {
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
}

export interface InputProps
  extends InputBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  type?: 'text' | 'email' | 'password' | 'number';
  as?: 'input';
}

type TextareaProps = InputBaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    type?: 'textarea';
    as?: 'textarea';
  };

const variantClasses: Record<InputVariant, string> = {
  default:
    'border border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
  error:
    'border border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400',
  success:
    'border border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400',
};

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const baseClasses =
  'flex w-full rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

function getInputClasses(
  variant: InputVariant,
  size: InputSize,
  className?: string,
): string {
  return twMerge(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

/**
 * Input component for text fields with label and validation states.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      variant = 'default',
      size = 'md',
      type = 'text',
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={getInputClasses(variant, size, className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-sm text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

/**
 * Textarea variant for multi-line text input.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      variant = 'default',
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;
    const effectiveVariant = error ? 'error' : variant;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={twMerge(
            baseClasses,
            'min-h-[80px] resize-y',
            variantClasses[effectiveVariant],
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-sm text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
