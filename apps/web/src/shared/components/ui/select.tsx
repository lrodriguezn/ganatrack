// apps/web/src/shared/components/ui/select.tsx
/**
 * Select — Radix UI Select wrapper with optional search, error display,
 * and 3 size variants.
 *
 * Sizes: sm | md | lg
 *
 * RHF integration:
 *   <FormField name="category" control={control}
 *     render={({ field }) => (
 *       <Select value={field.value} onValueChange={field.onChange} options={opts} />
 *     )}
 *   />
 */

'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Types
// ============================================================================

type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options: SelectOption[];
  label?: string;
  error?: string;
  size?: SelectSize;
  className?: string;
  searchable?: boolean;
  id?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-4 text-lg',
};

// ============================================================================
// Icons
// ============================================================================

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function CheckMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Select component with optional search/filter, error display, and size variants.
 *
 * @example
 * <Select options={[{ value: 'a', label: 'Option A' }]} value={selected} onValueChange={setSelected} />
 * <Select searchable options={largeList} placeholder="Search..." />
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      placeholder = 'Select...',
      options = [],
      label,
      error,
      size = 'md',
      searchable = false,
      id,
      ...props
    },
    ref,
  ) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        const val = target.value;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setSearch(val);
        }, 150);
      },
      [],
    );

    const filteredOptions = useMemo(() => {
      if (!searchable || !search) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
      );
    }, [options, searchable, search]);

    const selectedLabel = useMemo(() => {
      const found = options.find((opt) => opt.value === value);
      return found?.label;
    }, [options, value]);

    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          open={open}
          onOpenChange={setOpen}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            aria-label={placeholder}
            className={twMerge(
              // Base
              'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white',
              'dark:border-gray-600 dark:bg-gray-900',
              // Focus ring
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Error
              hasError && 'border-red-500 focus-visible:ring-red-500 dark:border-red-400',
              sizeClasses[size],
              className,
            )}
            {...props}
          >
            <SelectPrimitive.Value placeholder={placeholder}>
              {!value && <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
            </SelectPrimitive.Value>
            <SelectPrimitive.Icon asChild>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={twMerge(
                'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md',
                'dark:border-gray-700 dark:bg-gray-800',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              )}
              position="popper"
            >
              {searchable && (
                <div className="border-b border-gray-200 p-2 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <SelectPrimitive.Viewport className="p-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchable ? 'No results found' : 'No options available'}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={twMerge(
                        'relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none',
                        'focus:bg-gray-100 dark:focus:bg-gray-700',
                        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                      )}
                    >
                      <SelectPrimitive.ItemText className="flex-1">
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator>
                        <CheckMarkIcon className="ml-2 h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))
                )}
              </SelectPrimitive.Viewport>
              <SelectPrimitive.Arrow className="fill-white dark:fill-gray-800" />
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {hasError && (
          <span className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
