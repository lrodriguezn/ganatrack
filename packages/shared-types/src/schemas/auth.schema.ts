// packages/shared-types/src/schemas/auth.schema.ts
import { z } from 'zod';

// ============================================================================
// User & Predio (Core Domain Types)
// ============================================================================

/**
 * User schema for authentication context.
 * ID format: z.string().uuid() per SDD spec.
 * Roles: admin, operario, visor per PRD §3.1
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nombre: z.string().min(1),
  rol: z.enum(['admin', 'operario', 'visor']),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Predio schema for multi-predio support.
 * Area is in hectares (número positivo).
 * Estado: activo | inactivo per PRD §4.2
 */
export const PredioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  departamento: z.string(),
  municipio: z.string(),
  area: z.number().positive(),
  estado: z.enum(['activo', 'inactivo']),
});

export type Predio = z.infer<typeof PredioSchema>;

// ============================================================================
// Permission (RBAC)
// ============================================================================

/**
 * Permission schema: "module:action" format.
 * Backend controls format. Frontend validates structure.
 * Wildcard "*" grants all permissions (admin).
 */
export const PermissionSchema = z.string().regex(/^[^:]+:[^:]+$|^[*]$/, {
  message: "Permission must be in 'module:action' format or '*'",
});

export type Permission = z.infer<typeof PermissionSchema>;

export const PermissionsArraySchema = z.array(PermissionSchema);
export type Permissions = z.infer<typeof PermissionsArraySchema>;

// ============================================================================
// Login
// ============================================================================

/**
 * Login request body schema.
 * Backend endpoint: POST /api/v1/auth/login
 */
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Standard auth response (no 2FA required).
 * Contains access token, user data, and permissions array.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
  permissions: PermissionsArraySchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Two-factor authentication response.
 * Returned when user has 2FA enabled and initial login succeeds.
 */
export const TwoFactorResponseSchema = z.object({
  requires2FA: z.literal(true),
  tempToken: z.string(),
});

export type TwoFactorResponse = z.infer<typeof TwoFactorResponseSchema>;

/**
 * Login response: union of success or 2FA required.
 * This is what authService.login() returns.
 * Use a regular union (not discriminatedUnion) since the two schemas
 * don't share the requires2FA discriminator key.
 */
export const LoginResponseSchema = z.union([
  AuthResponseSchema,
  TwoFactorResponseSchema,
]);

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ============================================================================
// 2FA Verification
// ============================================================================

/**
 * 2FA verification request.
 * tempToken: from LoginResponse when 2FA is required
 * code: 6-digit numeric OTP
 */
export const Verify2FARequestSchema = z.object({
  tempToken: z.string(),
  code: z
    .string()
    .length(6, 'Código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'Solo números'),
});

export type Verify2FARequest = z.infer<typeof Verify2FARequestSchema>;

// AuthResponse is reused for 2FA success

// ============================================================================
// Token Refresh
// ============================================================================

/**
 * Token refresh response.
 * Backend sets httpOnly cookie for refresh token.
 * Frontend just gets new access token.
 */
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// ============================================================================
// Logout
// ============================================================================

/**
 * Logout request is empty (cookie-based).
 * Backend clears the httpOnly refreshToken cookie.
 */
export const LogoutRequestSchema = z.object({});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

// ============================================================================
// Error Response (for reference — not a parsing schema)
// ============================================================================

/**
 * Standard API error response shape.
 * Status codes:
 * - 400: VALIDATION_ERROR (field errors in details)
 * - 401: INVALID_CREDENTIALS
 * - 403: FORBIDDEN
 * - 404: NOT_FOUND
 * - 422: UNPROCESSABLE / INVALID_OTP
 * - 429: RATE_LIMITED
 * - 500: SERVER_ERROR
 */
// export const ApiErrorResponseSchema = z.object({
//   message: z.string(),
//   code: z.string().optional(),
//   details: z.record(z.string(), z.array(z.string())).optional(),
// });
