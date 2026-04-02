// apps/web/src/modules/auth/hooks/use-verify-2fa.ts
/**
 * useVerify2FA — container hook for 2FA verification orchestration.
 *
 * Responsibilities:
 * - Read tempToken from URL searchParams
 * - Form validation with react-hook-form + zodResolver
 * - Countdown timer (300 seconds = 5 min)
 * - Call authService.verify2FA() with tempToken + code
 * - On success: set auth state, fetch predios, redirect to dashboard
 * - On error: show appropriate error message
 * - Resend OTP action with 30-second cooldown
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { verify2FASchema, type Verify2FAFormData } from '../schemas/login.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';
import type { AuthResponse } from '@ganatrack/shared-types';
import { ApiError } from '@/shared/lib/errors';

const INITIAL_TIME_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 30;

export interface UseVerify2FAReturn {
  form: ReturnType<typeof useForm<Verify2FAFormData>>;
  error: string | null;
  isLoading: boolean;
  secondsLeft: number;
  canResend: boolean;
  resendCooldown: number;
  onSubmit: (data: Verify2FAFormData) => Promise<void>;
  onResend: () => Promise<void>;
}

export function useVerify2FA(tempToken: string): UseVerify2FAReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_TIME_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);

  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const setPredios = usePredioStore((s) => s.setPredios);
  const switchPredio = usePredioStore((s) => s.switchPredio);

  const form = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: '',
    },
  });

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft > 0]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown > 0]);

  const canResend = resendCooldown === 0 && secondsLeft > 0;

  const onSubmit = async (data: Verify2FAFormData): Promise<void> => {
    // Don't submit if timer expired
    if (secondsLeft === 0) {
      setError('Código expirado. Solicita uno nuevo.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const authData: AuthResponse = await authService.verify2FA(tempToken, data.code);

      setAuth({
        accessToken: authData.accessToken,
        user: authData.user,
        permissions: authData.permissions,
      });

      // DEV ONLY: Set cookie so middleware can detect authenticated state
      // In production, the backend sets httpOnly refreshToken cookie
      document.cookie = 'ganatrack-refresh=mock-token; path=/; max-age=604800';

      // Fetch predios after successful 2FA verification
      const predios = await authService.getPredios();
      setPredios(predios);

      // Auto-set single predio as activo
      if (predios.length === 1 && predios[0]) {
        switchPredio(predios[0].id);
      }

      setIsLoading(false);

      // Redirect to dashboard or original requested page
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl && isValidRedirect(redirectUrl)) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setIsLoading(false);

      if (err instanceof ApiError) {
        if (err.status === 422) {
          if (err.code === 'INVALID_OTP') {
            setError('Código inválido');
          } else {
            setError('Código expirado. Solicita uno nuevo.');
          }
        } else {
          setError('Error del servidor');
        }
      } else {
        setError('Error de conexión. Verifica tu internet.');
      }
    }
  };

  const onResend = useCallback(async (): Promise<void> => {
    if (!canResend) return;

    setError(null);

    try {
      // In a real implementation, this would call authService.resend2FA(tempToken)
      // For now, we just reset the timer and cooldown
      // The mock service doesn't have resend2FA, so we simulate it
      setSecondsLeft(INITIAL_TIME_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setError(null);
    } catch {
      setError('No se pudo reenviar. Intenta de nuevo.');
    }
  }, [canResend, tempToken]);

  return {
    form,
    error,
    isLoading,
    secondsLeft,
    canResend,
    resendCooldown,
    onSubmit,
    onResend,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Validate redirect URL is internal (same-origin, starts with /)
 */
function isValidRedirect(redirect: string): boolean {
  if (!redirect.startsWith('/')) return false;
  if (redirect.includes('://')) return false;
  if (redirect.startsWith('//')) return false;
  return true;
}
