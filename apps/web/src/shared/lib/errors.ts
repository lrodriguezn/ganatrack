// apps/web/src/shared/lib/errors.ts
/**
 * ApiError class and normalizeApiError helper.
 * Converts HTTP responses into typed error objects with user-facing messages.
 */

export class ApiError extends Error {
  /**
   * @param status - HTTP status code
   * @param code - Error code string (e.g., "INVALID_CREDENTIALS", "RATE_LIMITED")
   * @param message - User-facing error message in Spanish
   * @param details - Optional field-level validation errors for forms
   */
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Check if an error is an ApiError instance.
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

interface NormalizedError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Normalize a failed HTTP response into an ApiError-like object.
 * This is used in the api-client's afterResponse interceptor.
 *
 * Response body shapes by status:
 * - 400: { message: string, errors?: Record<string, string[]> }
 * - 401: { message: string }
 * - 403: { message: string }
 * - 404: { message: string }
 * - 422: { message: string, code?: string }
 * - 429: { message: string }
 * - 500: { message: string }
 */
export function normalizeApiError(response: Response, body?: unknown): NormalizedError {
  const status = response.status;

  // Handle known error shapes
  if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
    const payload = body as Record<string, unknown>;

    // 400: Validation error with field-level details
    if (status === 400) {
      return {
        code: 'VALIDATION_ERROR',
        message: (payload.message as string) || 'Datos inválidos',
        details: payload.errors as Record<string, string[]> | undefined,
      };
    }

    // 401: Invalid credentials
    if (status === 401) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: (payload.message as string) || 'Credenciales inválidas',
      };
    }

    // 403: Forbidden
    if (status === 403) {
      return {
        code: 'FORBIDDEN',
        message: (payload.message as string) || 'Acceso denegado',
      };
    }

    // 404: Not found
    if (status === 404) {
      return {
        code: 'NOT_FOUND',
        message: (payload.message as string) || 'Recurso no encontrado',
      };
    }

    // 422: Unprocessable entity (e.g., invalid OTP)
    if (status === 422) {
      return {
        code: (payload.code as string) || 'UNPROCESSABLE',
        message: (payload.message as string) || 'Solicitud no procesable',
      };
    }

    // 429: Rate limited
    if (status === 429) {
      return {
        code: 'RATE_LIMITED',
        message: (payload.message as string) || 'Demasiadas solicitudes. Intenta más tarde.',
      };
    }
  }

  // 500: Server error — never expose internal error details
  if (status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: 'Error del servidor. Intenta de nuevo.',
    };
  }

  // Fallback for unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ocurrió un error inesperado.',
  };
}
