// apps/web/src/shared/components/ui/date-picker.tsx
/**
 * DatePicker — flatpickr wrapper with Tailwind styling.
 *
 * Provides calendar date selection with Spanish locale support.
 * Supports single date and date range selection.
 *
 * @example
 * <DatePicker
 *   value={selectedDate}
 *   onChange={(date) => setSelectedDate(date)}
 *   placeholder="Select appointment"
 * />
 */

'use client';

import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import 'flatpickr/dist/flatpickr.css';

type DatePickerMode = 'single' | 'range';

interface DatePickerProps {
  value: Date | string | null | [Date | string | null, Date | string | null];
  onChange: (date: Date | null | [Date | null, Date | null]) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  disabled?: boolean;
  placeholder?: string;
  mode?: DatePickerMode;
  locale?: string;
  className?: string;
}

flatpickr.localize(Spanish);

/**
 * DatePicker component wrapping flatpickr.
 */
export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Select date',
  mode = 'single',
  locale = 'es',
  className,
}: DatePickerProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const config: flatpickr.Options.Options = {
      mode,
      dateFormat: 'Y-m-d',
      allowInput: true,
      disableMobile: true,
      locale: locale === 'es' ? Spanish : undefined,
      onChange: (selectedDates) => {
        if (mode === 'single') {
          onChange(selectedDates[0] || null);
        } else {
          onChange(selectedDates as [Date | null, Date | null]);
        }
      },
    };

    if (minDate) config.minDate = minDate;
    if (maxDate) config.maxDate = maxDate;

    pickerRef.current = flatpickr(inputRef.current, config);

    return () => {
      pickerRef.current?.destroy();
    };
  }, [mode, minDate, maxDate, locale]);

  // Update value when prop changes
  useEffect(() => {
    if (pickerRef.current && value) {
      pickerRef.current.setDate(value as Parameters<typeof pickerRef.current.setDate>[0]);
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        className={`
          flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none
          focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400
          disabled:cursor-not-allowed disabled:opacity-50
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${className || ''}
        `}
        autoComplete="off"
      />
    </div>
  );
}
