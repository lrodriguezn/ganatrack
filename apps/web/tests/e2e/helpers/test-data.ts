// apps/web/tests/e2e/helpers/test-data.ts
/**
 * Deterministic test data for E2E tests.
 *
 * These values are used in assertions and form fills to ensure
 * tests are deterministic and match the MSW mock data.
 *
 * IMPORTANT: Keep these in sync with apps/web/tests/mocks/handlers/
 * data. If mock data changes, update these constants too.
 */

// =============================================================================
// Auth credentials (must match MSW handlers)
// =============================================================================

export const MOCK_ADMIN_EMAIL = 'admin@ganatrack.com';
export const MOCK_ADMIN_PASSWORD = 'password123';
export const MOCK_2FA_EMAIL = '2fa@ganatrack.com';
export const MOCK_2FA_PASSWORD = 'password123';
export const MOCK_2FA_CODE = '123456';

// =============================================================================
// Animales mock data (must match animales.handlers.ts)
// =============================================================================

export const TEST_ANIMAL = {
  id: 1,
  codigo: 'GAN-001',
  nombre: 'Don Toro',
  estado: 'activo',
  sexoKey: 0, // macho
  tipoIngresoId: 0,
  configRazasId: 1,
  potreroId: 1,
  potreroNombre: 'Potrero Norte',
  madreId: null,
  padreId: null,
  tipoPadreKey: 0,
  estadoAnimalKey: 0,
  saludAnimalKey: 0,
  razaNombre: 'Brahman',
} as const;

export const TEST_ANIMAL_2 = {
  id: 2,
  codigo: 'GAN-002',
  nombre: 'El Bravo',
  estado: 'activo',
  sexoKey: 0,
  tipoIngresoId: 0,
  configRazasId: 4,
  potreroId: 1,
  potreroNombre: 'Potrero Norte',
  madreId: null,
  padreId: null,
  tipoPadreKey: 0,
  estadoAnimalKey: 0,
  saludAnimalKey: 0,
  razaNombre: 'Nelore',
} as const;

export const TEST_ANIMAL_3 = {
  id: 3,
  codigo: 'GAN-003',
  nombre: 'Matambo',
  estado: 'activo',
  sexoKey: 0,
  tipoIngresoId: 0,
  configRazasId: 3,
  potreroId: 2,
  potreroNombre: 'Potrero Sur',
  madreId: null,
  padreId: null,
  tipoPadreKey: 0,
  estadoAnimalKey: 0,
  saludAnimalKey: 0,
  razaNombre: 'Romosinuano',
} as const;

// Animal specifically for delete test - not used by other tests
export const TEST_ANIMAL_DELETE = {
  id: 999,
  codigo: 'GAN-DELETE',
  nombre: 'Animal Para Eliminar',
  estado: 'activo',
  sexoKey: 0,
  tipoIngresoId: 0,
  configRazasId: 1,
  potreroId: 1,
  potreroNombre: 'Potrero Norte',
  madreId: null,
  padreId: null,
  tipoPadreKey: 0,
  estadoAnimalKey: 0,
  saludAnimalKey: 0,
  razaNombre: 'Brahman',
} as const;

export const TEST_ANIMALES_LIST = [TEST_ANIMAL, TEST_ANIMAL_2, TEST_ANIMAL_3];

// =============================================================================
// Predios mock data (must match predios.handlers.ts)
// =============================================================================

export const TEST_PREDIOS = [
  {
    id: 1,
    nombre: 'Finca La Esperanza',
    departamento: 'Antioquia',
    municipio: 'Jerusalén',
    vereda: 'El Centro',
    areaHectareas: 150,
    tipo: 'doble propósito',
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Finca El Progreso',
    departamento: 'Cundinamarca',
    municipio: 'Villeta',
    vereda: 'La Mesa',
    areaHectareas: 200,
    tipo: 'lechería',
    estado: 'activo',
  },
] as const;

export const TEST_PREDIOS_POTREROS = [
  {
    id: 1,
    predioId: 1,
    codigo: 'POT-001',
    nombre: 'Potrero Norte',
    areaHectareas: 30,
    tipoPasto: 'Brachiaria',
    capacidadMaxima: 50,
    estado: 'activo',
  },
  {
    id: 2,
    predioId: 1,
    codigo: 'POT-002',
    nombre: 'Potrero Sur',
    areaHectareas: 25,
    tipoPasto: 'Estrella',
    capacidadMaxima: 40,
    estado: 'activo',
  },
] as const;

// =============================================================================
// New animal form defaults
// =============================================================================

export const NEW_ANIMAL_DATA = {
  codigo: 'GAN-TEST',
  nombre: 'Animal de Prueba',
  fechaNacimiento: '2024-01-15',
  sexoKey: 0,
  tipoIngresoId: 0,
  configRazasId: 1,
  potreroId: 1,
  estadoAnimalKey: 0,
  saludAnimalKey: 0,
} as const;

// =============================================================================
// Servicios (palpación, parto) data
// =============================================================================

export const TEST_SERVICIO_PALPACION = {
  animalId: 1,
  tipoServicio: 'palpacion',
  fecha: '2024-03-01',
  resultado: 'preñada',
  semanasGestacion: 12,
  observaciones: 'Examen rutinario',
} as const;

export const TEST_SERVICIO_PARTO = {
  animalId: 1,
  tipoServicio: 'parto',
  fecha: '2024-03-15',
  resultado: 'normal',
  criaId: null, // Will be created
  observaciones: 'Seguimiento post-parto',
} as const;

// =============================================================================
// UI strings for assertions
// =============================================================================

export const UI_STRINGS = {
  login: {
    title: 'Ingresar',
    emailLabel: /correo/i,
    passwordLabel: /contraseña/i,
    submitButton: /ingresar/i,
    errorInvalidCredentials: /credenciales inválidas/i,
  },
  twoFA: {
    title: /verificación de dos pasos/i,
    codeExpired: /código expirado/i,
    resendButton: /reenviar código/i,
    verifyButton: /verificar código/i,
    invalidCode: /código inválido/i,
  },
  dashboard: {
    title: 'Dashboard',
    animales: /animales/i,
    servicios: /servicios/i,
    predios: /predios/i,
    reportes: /reportes/i,
  },
  animales: {
    title: 'Animales',
    nuevoAnimal: /nuevo animal/i,
    editarAnimal: /editar animal/i,
    buscarPlaceholder: /buscar por código/i,
  },
} as const;
