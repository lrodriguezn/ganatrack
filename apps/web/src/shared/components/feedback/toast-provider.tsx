// apps/web/src/shared/components/feedback/toast-provider.tsx
/**
 * ToastProvider — Wraps Sonner's Toaster with GanaTrack branding.
 *
 * Provides a `toast` helper for programmatic notifications:
 * - toast.success(message)
 * - toast.error(message)
 * - toast.warning(message)
 * - toast.info(message)
 *
 * @example
 * import { toast } from '@/shared/components/feedback';
 * toast.success('Animal creado exitosamente');
 */

'use client';

import { Toaster, toast as sonnerToast } from 'sonner';

/**
 * GanaTrack-branded toast helper.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
  /** Passthrough for full Sonner API access */
  custom: sonnerToast,
};

/**
 * ToastProvider — renders the Sonner Toaster with GanaTrack defaults.
 * Place once at the root of your app.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      duration={5000}
      richColors
      closeButton
      className="font-sans"
      toastOptions={{
        classNames: {
          toast:
            'rounded-lg border shadow-lg dark:border-gray-700',
          success:
            'border-green-200 bg-white text-gray-900 dark:border-green-800 dark:bg-gray-800 dark:text-gray-100',
          error:
            'border-red-200 bg-white text-gray-900 dark:border-red-800 dark:bg-gray-800 dark:text-gray-100',
          warning:
            'border-amber-200 bg-white text-gray-900 dark:border-amber-800 dark:bg-gray-800 dark:text-gray-100',
          info:
            'border-blue-200 bg-white text-gray-900 dark:border-blue-800 dark:bg-gray-800 dark:text-gray-100',
        },
      }}
    />
  );
}
