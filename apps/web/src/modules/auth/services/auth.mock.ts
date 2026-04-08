// apps/web/src/modules/auth/services/auth.mock.ts
/**
 * Mock Auth Service — simulates auth API for development.
 *
 * 4 hardcoded users with realistic delays:
 * - admin@ganatrack.com / Admin123!  → admin role, all permissions (*:*)
 * - vet@ganatrack.com / Vet123!     → operario role, limited permissions
 * - visor@ganatrack.com / Visor123!  → visor role, read-only permissions
 * - vet2fa@ganatrack.com / Vet2FA123! → operario + 2FA enabled
 *
 * Simulated delays:
 * - login(): ~800ms
 * - verify2FA(): ~600ms
 * - refreshToken(): ~300ms
 * - logout(): ~400ms
 * - getMe(): ~200ms
 * - getPredios(): ~500ms
 */

import type {
  LoginRequest,
  LoginResponse,
  AuthResponse,
  User,
  Predio,
} from '@ganatrack/shared-types';
import { ApiError } from '@/shared/lib/errors';
import type { AuthService } from './auth.service';

// ============================================================================
// Hardcoded Users
// ============================================================================

interface MockUser {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: 'admin' | 'operario' | 'visor';
  permissions: string[];
  has2FA: boolean;
}

const MOCK_USERS: MockUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@ganatrack.com',
    password: 'Admin123!',
    nombre: 'Administrador',
    rol: 'admin',
    permissions: ['*:*', 'predios:read'],
    has2FA: false,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'vet@ganatrack.com',
    password: 'Vet123!',
    nombre: 'Veterinario Principal',
    rol: 'operario',
    permissions: [
      'animales:read',
      'animales:write',
      'predios:read',
      'predios:write',
      'servicios:read',
      'servicios:write',
      'reportes:read',
    ],
    has2FA: false,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'visor@ganatrack.com',
    password: 'Visor123!',
    nombre: 'Visor de Reportes',
    rol: 'visor',
    permissions: ['animales:read', 'reportes:read'],
    has2FA: false,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'vet2fa@ganatrack.com',
    password: 'Vet2FA123!',
    nombre: 'Veterinario 2FA',
    rol: 'operario',
    permissions: ['animales:read', 'animales:write'],
    has2FA: true,
  },
];

// Valid 2FA code
const VALID_2FA_CODE = '123456';

// Mock Predios — synchronized with predios.mock.ts schema (id: number, areaHectareas, tipo)
const MOCK_PREDIOS: Predio[] = [
  {
    id: 1,
    nombre: 'Finca La Esperanza',
    departamento: 'Antioquia',
    municipio: 'Rionegro',
    vereda: 'La Palma',
    areaHectareas: 150.5,
    tipo: 'doble propósito',
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Hacienda El Roble',
    departamento: 'Cundinamarca',
    municipio: 'Zipaquirá',
    areaHectareas: 320.0,
    tipo: 'lechería',
    estado: 'activo',
  },
  {
    id: 3,
    nombre: 'Finca San José',
    departamento: 'Caldas',
    municipio: 'Manizales',
    areaHectareas: 85.3,
    tipo: 'cría',
    estado: 'activo',
  },
  {
    id: 4,
    nombre: 'Hacienda Santa María',
    departamento: 'Tolima',
    municipio: 'Ibagué',
    areaHectareas: 450.0,
    tipo: 'engorde',
    estado: 'activo',
  },
  {
    id: 5,
    nombre: 'Finca El Porvenir',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    vereda: 'Cerro Largo',
    areaHectareas: 200.75,
    tipo: 'doble propósito',
    estado: 'activo',
  },
];

// Internal state to simulate logged-in user
let mockLoggedInUser: MockUser | null = null;

// ============================================================================
// Delays
// ============================================================================

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const loginDelay = () => delay(800);
const verify2FADelay = () => delay(600);
const refreshDelay = () => delay(300);
const logoutDelay = () => delay(400);
const getMeDelay = () => delay(200);
const getPrediosDelay = () => delay(500);

// ============================================================================
// MockAuthService
// ============================================================================

export class MockAuthService implements AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await loginDelay();

    const user = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password,
    );

    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    // Simulate httpOnly cookie by storing in module-level state
    mockLoggedInUser = user;

    if (user.has2FA) {
      return {
        requires2FA: true,
        tempToken: `temp-token-${user.id}-${Date.now()}`,
      };
    }

    return {
      accessToken: `mock-access-token-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
      permissions: user.permissions,
    };
  }

  async verify2FA(tempToken: string, code: string): Promise<AuthResponse> {
    await verify2FADelay();

    if (!tempToken || !tempToken.startsWith('temp-token-')) {
      throw new ApiError(422, 'INVALID_TEMP_TOKEN', 'Token inválido o expirado');
    }

    if (code !== VALID_2FA_CODE) {
      throw new ApiError(422, 'INVALID_OTP', 'Código inválido');
    }

    if (!mockLoggedInUser) {
      throw new ApiError(401, 'SESSION_EXPIRED', 'Sesión expirada');
    }

    return {
      accessToken: `mock-access-token-${mockLoggedInUser.id}`,
      user: {
        id: mockLoggedInUser.id,
        email: mockLoggedInUser.email,
        nombre: mockLoggedInUser.nombre,
        rol: mockLoggedInUser.rol,
      },
      permissions: mockLoggedInUser.permissions,
    };
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    await refreshDelay();

    if (!mockLoggedInUser) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Sesión expirada');
    }

    return {
      accessToken: `mock-access-token-${mockLoggedInUser.id}-refreshed-${Date.now()}`,
    };
  }

  async logout(): Promise<void> {
    await logoutDelay();
    mockLoggedInUser = null;
  }

  async getMe(): Promise<User> {
    await getMeDelay();

    if (!mockLoggedInUser) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'No autenticado');
    }

    return {
      id: mockLoggedInUser.id,
      email: mockLoggedInUser.email,
      nombre: mockLoggedInUser.nombre,
      rol: mockLoggedInUser.rol,
    };
  }

  async getPredios(): Promise<Predio[]> {
    await getPrediosDelay();

    if (!mockLoggedInUser) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'No autenticado');
    }

    return MOCK_PREDIOS;
  }
}
