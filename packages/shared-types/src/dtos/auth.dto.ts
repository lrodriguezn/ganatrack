// packages/shared-types/src/dtos/auth.dto.ts
/**
 * Auth DTOs — z.infer type exports from Zod schemas.
 * These types are used throughout the frontend for type safety.
 */

export type {
  // Core domain
  User,
  Predio,
  Permission,
  Permissions,
  // Login flow
  LoginRequest,
  LoginResponse,
  AuthResponse,
  TwoFactorResponse,
  // 2FA
  Verify2FARequest,
  // Token refresh
  RefreshResponse,
  // Logout
  LogoutRequest,
} from '../schemas/auth.schema';
