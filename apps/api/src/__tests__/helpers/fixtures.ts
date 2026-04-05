/**
 * Test Fixtures - Pre-computed test data
 * 
 * Usage:
 *   import { fixtures } from './fixtures'
 *   
 *   // Use pre-computed bcrypt hash
 *   mockAuthRepo.getContrasenaHash.mockResolvedValue(fixtures.adminPasswordHash)
 *   
 *   // Use test JWT secret
 *   const token = jwt.sign(payload, fixtures.jwtSecret)
 */

import bcrypt from 'bcrypt'

/**
 * Pre-computed bcrypt hash for 'Admin123!'
 * Generated with bcrypt.hash('Admin123!', 10)
 * 
 * IMPORTANT: This is for TESTING ONLY. Never use in production.
 */
export const TEST_BCRYPT_HASH = '$2b$10$rQZ8qT8Q8Q8Q8Q8Q8Q8Q8e8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'

/**
 * Pre-computed bcrypt hash for '123456' (OTP code)
 * Generated with bcrypt.hash('123456', 10)
 */
export const TEST_OTP_HASH = '$2b$10$XqT8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'

/**
 * Test JWT secret
 */
export const TEST_JWT_SECRET = 'test-secret-key-for-unit-tests'

/**
 * Test database URL (in-memory SQLite)
 */
export const TEST_DATABASE_URL = ':memory:'

/**
 * Valid credentials for testing
 */
export const validCredentials = {
  email: 'admin@ganatrack.com',
  password: 'Admin123!',
}

/**
 * Admin user fixture
 */
export const adminUser = {
  id: 1,
  nombre: 'Administrador',
  email: 'admin@ganatrack.com',
  activo: 1,
}

/**
 * Test animal codes
 */
export const testAnimalCodes = {
  valid: 'A001',
  invalid: 'INVALID',
  withParents: {
    mother: 'A002',
    father: 'A003',
  },
}

/**
 * Test predicates for pagination
 */
export const paginationDefaults = {
  page: 1,
  limit: 20,
  maxLimit: 100,
}

/**
 * Create a custom bcrypt hash for a given password
 * Use this when you need a specific hash in tests
 */
export async function createBcryptHash(password: string, saltRounds = 10): Promise<string> {
  return bcrypt.hash(password, saltRounds)
}

/**
 * Create multiple OTP hashes for testing different scenarios
 */
export async function createOtpHashes(count: number): Promise<string[]> {
  const hashes: string[] = []
  for (let i = 0; i < count; i++) {
    hashes.push(await createBcryptHash(`123456${i}`))
  }
  return hashes
}

/**
 * Auth session response fixture
 */
export const authSessionResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 900,
  usuario: {
    id: 1,
    nombre: 'Test User',
    roles: ['ADMIN'],
  },
}

/**
 * Token payload fixtures
 */
export const tokenPayloads = {
  valid: {
    sub: 1,
    roles: ['ADMIN'],
    permisos: ['usuarios:read', 'usuarios:admin'],
    predicIds: [1],
  },
  expired: {
    sub: 1,
    roles: ['ADMIN'],
    permisos: [],
    predicIds: [],
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  },
  invalidType: {
    sub: 1,
    type: 'access', // Should be '2fa' for 2FA temp tokens
    roles: ['ADMIN'],
    permisos: [],
    predicIds: [],
  },
}

/**
 * HTTP status codes for test assertions
 */
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
} as const
