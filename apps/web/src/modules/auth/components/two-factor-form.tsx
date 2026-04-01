// apps/web/src/modules/auth/components/two-factor-form.tsx
/**
 * TwoFactorForm — presentational component for 2FA OTP input.
 *
 * This component is purely presentational:
 * - NO direct authService calls
 * - NO Zustand store access
 * - Receives all data and handlers via props
 *
 * Features:
 * - 6 individual digit input boxes that auto-advance on input
 * - Paste support: distributes 6-digit code across all boxes
 * - Backspace on empty box moves to previous box
 * - Timer display showing mm:ss
 * - Submit button disabled when timeRemaining === 0
 * - Resend button with cooldown counter
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Verify2FAFormData } from '../schemas/login.schema';

interface TwoFactorFormProps {
  onSubmit: (code: string) => void;
  onResend: () => void;
  error: string | null;
  isLoading: boolean;
  secondsLeft: number;
  canResend: boolean;
  resendCooldown: number;
}

const INPUT_COUNT = 6;

export function TwoFactorForm({
  onSubmit,
  onResend,
  error,
  isLoading,
  secondsLeft,
  canResend,
  resendCooldown,
}: TwoFactorFormProps): JSX.Element {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState<string[]>(new Array(INPUT_COUNT).fill(''));

  // Format seconds as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = secondsLeft <= 60 && secondsLeft > 0;
  const isExpired = secondsLeft === 0;

  // Focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = code.findIndex((c) => c === '');
    const focusIndex = firstEmptyIndex === -1 ? INPUT_COUNT - 1 : firstEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  }, []);

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      // Only allow digits
      const digit = value.replace(/\D/g, '').slice(-1);

      setCode((prev) => {
        const next = [...prev];
        next[index] = digit;

        // Auto-advance to next input if digit entered
        if (digit && index < INPUT_COUNT - 1) {
          inputRefs.current[index + 1]?.focus();
        }

        // We need to trigger onSubmit when all 6 digits are entered
        const joined = next.join('');
        if (joined.length === INPUT_COUNT && !joined.includes('')) {
          onSubmit(joined);
        }

        return next;
      });
    },
    [onSubmit],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        setCode((prev) => {
          const next = [...prev];
          if (next[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            next[index - 1] = '';
          } else {
            next[index] = '';
          }
          return next;
        });
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < INPUT_COUNT - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, INPUT_COUNT);

      if (pastedData.length > 0) {
        setCode((prev) => {
          const next = [...prev];
          for (let i = 0; i < INPUT_COUNT; i++) {
            next[i] = pastedData[i] || '';
            if (inputRefs.current[i]) {
              inputRefs.current[i]!.value = pastedData[i] || '';
            }
          }
          return next;
        });

        // Focus last filled input or first empty
        const lastFilledIndex = Math.min(pastedData.length, INPUT_COUNT) - 1;
        const focusIndex = pastedData.length >= INPUT_COUNT ? INPUT_COUNT - 1 : pastedData.length;
        inputRefs.current[focusIndex]?.focus();

        // If we have 6 digits, trigger submit
        if (pastedData.length === INPUT_COUNT) {
          onSubmit(pastedData);
        }
      }
    },
    [onSubmit],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const joined = code.join('');
      if (joined.length === INPUT_COUNT) {
        onSubmit(joined);
      }
    },
    [onSubmit, code],
  );

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verificación de dos pasos
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Ingresa el código de 6 dígitos enviado a tu correo
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {Array.from({ length: INPUT_COUNT }).map((_, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading || isExpired}
              className="w-10 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          <p
            className={`text-sm font-medium ${
              isExpired
                ? 'text-red-600 dark:text-red-400'
                : isWarning
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {isExpired ? (
              <span>Código expirado</span>
            ) : (
              <span>Código expira en {formatTime(secondsLeft)}</span>
            )}
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || isExpired || code.join('').length !== INPUT_COUNT}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verificando...
            </span>
          ) : (
            'Verificar código'
          )}
        </button>

        {/* Resend button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onResend}
            disabled={!canResend}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0 ? (
              <span>Reenviar código en {resendCooldown}s</span>
            ) : (
              <span>Reenviar código</span>
            )}
          </button>
        </div>
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
