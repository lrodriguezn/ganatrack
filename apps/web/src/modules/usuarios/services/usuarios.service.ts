// apps/web/src/modules/usuarios/services/usuarios.service.ts
/**
 * UsuariosService — interface + factory.
 *
 * Swaps between MockUsuariosService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealUsuariosService (production).
 *
 * Base API path: /usuarios
 */

import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  PaginatedUsuarios,
  UsuarioFilters,
  Rol,
  RolDetail,
  PermisoMatrix,
} from '../types/usuarios.types';
import type {
  PermisoMatrixState,
  RolSummary,
  BatchSavePermisosPayload,
} from '../types/roles.types';

// ============================================================================
// UsuariosService Interface
// ============================================================================

export interface UsuariosService {
  // CRUD
  getAll(filters: UsuarioFilters): Promise<PaginatedUsuarios>;
  getById(id: number): Promise<Usuario>;
  create(data: CreateUsuarioDto): Promise<Usuario>;
  update(id: number, data: UpdateUsuarioDto): Promise<Usuario>;
  deactivate(id: number): Promise<void>;
  activate(id: number): Promise<Usuario>;

  // Roles
  getRoles(): Promise<Rol[]>;
  getRolPermisos(rolId: number): Promise<PermisoMatrixState>;
  updateRolPermisos(payload: BatchSavePermisosPayload): Promise<PermisoMatrixState>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): UsuariosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockUsuariosService } = require('./usuarios.mock');
  return new MockUsuariosService();
}

function createRealService(): UsuariosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealUsuariosService } = require('./usuarios.api');
  return new RealUsuariosService();
}

/**
 * Usuarios service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real when env var is not set (falsy).
 */
export const usuariosService: UsuariosService = USE_MOCKS
  ? createMockService()
  : createRealService();
