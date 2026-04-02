// apps/web/src/modules/auth/hooks/use-login.ts
/**
 * useLogin — container hook for login form orchestration.
 *
 * Responsibilities:
 * - Form validation with react-hook-form + zodResolver
 * - Call authService.login() with credentials
 * - On success (AuthResponse): set auth state, fetch predios, redirect to dashboard
 * - On success (TwoFactorResponse): redirect to 2FA page with tempToken
 * - On error: show appropriate error message
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';
import type { AuthResponse, TwoFactorResponse } from '@ganatrack/shared-types';
import { ApiError } from '@/shared/lib/errors';

export interface UseLoginReturn {
  form: ReturnType<typeof useForm<LoginFormData>>;
  error: string | null;
  isLoading: boolean;
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const setPredios = usePredioStore((s) => s.setPredios);
  const switchPredio = usePredioStore((s) => s.switchPredio);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(data);

      // Check if 2FA is required
      if (isTwoFactorResponse(response)) {
        setIsLoading(false);
        // Redirect to 2FA page with tempToken
        const redirectUrl = searchParams.get('redirect');
        const targetUrl = redirectUrl
          ? `/verificar-2fa?temp=${response.tempToken}&redirect=${encodeURIComponent(redirectUrl)}`
          : `/verificar-2fa?temp=${response.tempToken}`;
        router.push(targetUrl);
        return;
      }

      // Direct login success — AuthResponse
      const authData = response as AuthResponse;
      setAuth({
        accessToken: authData.accessToken,
        user: authData.user,
        permissions: authData.permissions,
      });

      // DEV ONLY: Set cookie so middleware can detect authenticated state
      // In production, the backend sets httpOnly refreshToken cookie
      if (process.env.NODE_ENV === 'development') {
        document.cookie = 'ganatrack-refresh=mock-token; path=/; max-age=604800';
      }

      // Fetch predios after successful auth
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
        if (err.status === 401) {
          setError('Credenciales inválidas');
          // Clear password field on 401 for security
          form.setValue('password', '');
        } else if (err.status === 429) {
          setError('Demasiados intentos. Intenta más tarde.');
        } else {
          setError('Error del servidor');
        }
      } else {
        setError('Error de conexión. Verifica tu internet.');
      }
    }
  };

  return {
    form,
    error,
    isLoading,
    onSubmit,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Type guard to check if response is TwoFactorResponse
 */
function isTwoFactorResponse(
  response: AuthResponse | TwoFactorResponse,
): response is TwoFactorResponse {
  return 'requires2FA' in response && response.requires2FA === true;
}

/**
 * Validate redirect URL is internal (same-origin, starts with /)
 */
function isValidRedirect(redirect: string): boolean {
  if (!redirect.startsWith('/')) return false;
  if (redirect.includes('://')) return false;
  if (redirect.startsWith('//')) return false;
  return true;
}
