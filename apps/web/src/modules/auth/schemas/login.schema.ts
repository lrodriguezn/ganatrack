// apps/web/src/modules/auth/schemas/login.schema.ts
/**
 * Login form validation schemas (form-level Zod).
 *
 * These schemas validate user input at the form level.
 * They complement the shared-types schemas which validate API responses.
 */

import { z } from 'zod';

// ============================================================================
// Login Form
// ============================================================================

/**
 * Login form validation schema.
 * - email: valid email format, required
 * - password: minimum 8 characters, required
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Contraseña requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// 2FA Verification Form
// ============================================================================

/**
 * 2FA OTP verification schema.
 * - code: exactly 6 digits, numeric only
 */
export const verify2FASchema = z.object({
  code: z
    .string()
    .min(1, 'Código requerido')
    .length(6, 'Código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'Solo números'),
});

export type Verify2FAFormData = z.infer<typeof verify2FASchema>;
