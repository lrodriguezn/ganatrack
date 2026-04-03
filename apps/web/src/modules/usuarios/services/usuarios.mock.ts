// apps/web/src/modules/usuarios/services/usuarios.mock.ts
/**
 * Mock Usuarios Service — simulates API for development.
 *
 * Provides 15 realistic users with various roles.
 * In-memory CRUD supports pagination, search, activation/deactivation.
 * Simulated delay: 300ms.
 */

import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  PaginatedUsuarios,
  UsuarioFilters,
} from '../types/usuarios.types';
import type {
  PermisoMatrixState,
  BatchSavePermisosPayload,
  Rol,
  PermisoCell,
  ModuloKey,
  AccionPermiso,
} from '../types/roles.types';
import type { UsuariosService } from './usuarios.service';
import { ApiError } from '@/shared/lib/errors';
import { MODULOS_PERMISOS, ACCIONES_PERMISOS } from '../types/roles.types';

// ============================================================================
// Seed Data — 15 realistic users
// ============================================================================

const SEED_ROLES: Rol[] = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo a todos los módulos', esSistema: true },
  { id: 2, nombre: 'Veterinario', descripcion: 'Gestión de servicios y reportes de salud', esSistema: true },
  { id: 3, nombre: 'Operario', descripcion: 'Registro diario de actividades', esSistema: true },
  { id: 4, nombre: 'Contador', descripcion: 'Acceso a reportes y configuración financiera', esSistema: true },
  { id: 5, nombre: 'Consulta', descripcion: 'Solo lectura de datos', esSistema: true },
];

const SEED_USUARIOS: Usuario[] = [
  { id: 1, nombre: 'Carlos Mendoza', email: 'carlos@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-04-03T08:00:00Z' },
  { id: 2, nombre: 'María Rodríguez', email: 'maria@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-04-02T14:30:00Z' },
  { id: 3, nombre: 'José Herrera', email: 'jose@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-04-01T06:00:00Z' },
  { id: 4, nombre: 'Ana Gutiérrez', email: 'ana@finca.com', rolId: 4, rolNombre: 'Contador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-03-28T10:00:00Z' },
  { id: 5, nombre: 'Pedro Ramírez', email: 'pedro@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-03-30T07:00:00Z' },
  { id: 6, nombre: 'Luisa Fernández', email: 'luisa@finca.com', rolId: 5, rolNombre: 'Consulta', predioId: 1, predioNombre: 'Finca La Esperanza', activo: false },
  { id: 7, nombre: 'Roberto Díaz', email: 'roberto@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 2, predioNombre: 'Finca El Progreso', activo: true, lastLoginAt: '2026-04-03T09:00:00Z' },
  { id: 8, nombre: 'Sandra Morales', email: 'sandra@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 2, predioNombre: 'Finca El Progreso', activo: true, lastLoginAt: '2026-04-02T16:00:00Z' },
  { id: 9, nombre: 'Diego Vargas', email: 'diego@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 2, predioNombre: 'Finca El Progreso', activo: true },
  { id: 10, nombre: 'Camila Torres', email: 'camila@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 2, predioNombre: 'Finca El Progreso', activo: false },
  { id: 11, nombre: 'Andrés Castillo', email: 'andres@finca.com', rolId: 5, rolNombre: 'Consulta', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 12, nombre: 'Valentina Ruiz', email: 'valentina@finca.com', rolId: 4, rolNombre: 'Contador', predioId: 2, predioNombre: 'Finca El Progreso', activo: true },
  { id: 13, nombre: 'Felipe Moreno', email: 'felipe@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: false },
  { id: 14, nombre: 'Isabella López', email: 'isabella@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-04-01T11:00:00Z' },
  { id: 15, nombre: 'Mateo Silva', email: 'mateo@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true, lastLoginAt: '2026-04-03T07:00:00Z' },
];

const storeUsuarios: Usuario[] = SEED_USUARIOS.map(u => ({ ...u }));
const storeRoles: Rol[] = SEED_ROLES.map(r => ({ ...r }));
let idCounter = 16;

// Generate default permission matrix for a role
function generateDefaultMatrix(rolId: number): PermisoMatrixState {
  const cells: PermisoCell[] = [];

  for (const mod of MODULOS_PERMISOS) {
    for (const accion of ACCIONES_PERMISOS) {
      // Admin gets all permissions, Consulta only gets 'ver'
      let enabled = false;
      if (rolId === 1) {
        enabled = true; // Admin: all
      } else if (rolId === 5) {
        enabled = accion === 'ver'; // Consulta: read-only
      } else if (rolId === 2) {
        // Veterinario: ver, crear, editar on servicios, reportes, animales
        enabled = (['ver', 'crear', 'editar'].includes(accion)) &&
          (['servicios', 'reportes', 'animales', 'dashboard'].includes(mod.key));
      } else if (rolId === 3) {
        // Operario: ver, crear on animales, servicios, dashboard
        enabled = (['ver', 'crear'].includes(accion)) &&
          (['animales', 'servicios', 'dashboard'].includes(mod.key));
      } else if (rolId === 4) {
        // Contador: ver, crear, editar on reportes, configuracion, dashboard
        enabled = (['ver', 'crear', 'editar'].includes(accion)) &&
          (['reportes', 'configuracion', 'dashboard'].includes(mod.key));
      }

      cells.push({
        modulo: mod.key as ModuloKey,
        accion: accion as AccionPermiso,
        enabled,
        conflicted: false,
      });
    }
  }

  return {
    rolId,
    cells,
    isDirty: false,
    conflicts: [],
  };
}

// In-memory permission matrices per role
const storePermisos: Record<number, PermisoMatrixState> = {};
for (const rol of SEED_ROLES) {
  storePermisos[rol.id] = generateDefaultMatrix(rol.id);
}

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function applyFilters(usuarios: Usuario[], filters: UsuarioFilters): Usuario[] {
  let result = usuarios.filter(u => u.predioId === filters.predioId);

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(u =>
      u.nombre.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  if (filters.rolId !== undefined) {
    result = result.filter(u => u.rolId === filters.rolId);
  }

  if (filters.activo !== undefined) {
    result = result.filter(u => u.activo === filters.activo);
  }

  return result;
}

// ============================================================================
// MockUsuariosService
// ============================================================================

export class MockUsuariosService implements UsuariosService {
  async getAll(filters: UsuarioFilters): Promise<PaginatedUsuarios> {
    await delay(300);

    const filtered = applyFilters(storeUsuarios, filters);
    const total = filtered.length;
    const totalPages = Math.ceil(total / filters.limit);
    const start = (filters.page - 1) * filters.limit;
    const data = filtered.slice(start, start + filters.limit);

    return { data, page: filters.page, limit: filters.limit, total, totalPages };
  }

  async getById(id: number): Promise<Usuario> {
    await delay(300);
    const usuario = storeUsuarios.find(u => u.id === id);
    if (!usuario) {
      throw new ApiError(404, 'NOT_FOUND', `Usuario con ID ${id} no encontrado`);
    }
    return { ...usuario };
  }

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    await delay(300);

    // Check duplicate email
    const duplicate = storeUsuarios.find(u => u.email === data.email);
    if (duplicate) {
      throw new ApiError(409, 'DUPLICATE_EMAIL', `El email "${data.email}" ya está registrado`);
    }

    const newUsuario: Usuario = {
      id: idCounter++,
      nombre: data.nombre,
      email: data.email,
      rolId: data.rolId,
      rolNombre: storeRoles.find(r => r.id === data.rolId)?.nombre,
      predioId: data.predioId,
      predioNombre: `Predio ${data.predioId}`,
      telefono: data.telefono,
      activo: true,
    };
    storeUsuarios.push(newUsuario);
    return { ...newUsuario };
  }

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    await delay(300);
    const index = storeUsuarios.findIndex(u => u.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Usuario con ID ${id} no encontrado`);
    }

    // Check duplicate email (excluding self)
    if (data.email && data.email !== storeUsuarios[index].email) {
      const duplicate = storeUsuarios.find(u => u.email === data.email && u.id !== id);
      if (duplicate) {
        throw new ApiError(409, 'DUPLICATE_EMAIL', `El email "${data.email}" ya está registrado`);
      }
    }

    storeUsuarios[index] = { ...storeUsuarios[index], ...data };
    if (data.rolId) {
      storeUsuarios[index].rolNombre = storeRoles.find(r => r.id === data.rolId)?.nombre;
    }
    return { ...storeUsuarios[index] };
  }

  async deactivate(id: number): Promise<void> {
    await delay(300);
    const index = storeUsuarios.findIndex(u => u.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Usuario con ID ${id} no encontrado`);
    }
    storeUsuarios[index].activo = false;
  }

  async activate(id: number): Promise<Usuario> {
    await delay(300);
    const index = storeUsuarios.findIndex(u => u.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Usuario con ID ${id} no encontrado`);
    }
    storeUsuarios[index].activo = true;
    return { ...storeUsuarios[index] };
  }

  async getRoles(): Promise<Rol[]> {
    await delay(300);
    return storeRoles.map(r => ({ ...r }));
  }

  async getRolPermisos(rolId: number): Promise<PermisoMatrixState> {
    await delay(300);
    const matrix = storePermisos[rolId];
    if (!matrix) {
      throw new ApiError(404, 'NOT_FOUND', `Rol con ID ${rolId} no encontrado`);
    }
    return { ...matrix, cells: matrix.cells.map(c => ({ ...c })) };
  }

  async updateRolPermisos(
    payload: BatchSavePermisosPayload,
  ): Promise<PermisoMatrixState> {
    await delay(300);
    const matrix = storePermisos[payload.rolId];
    if (!matrix) {
      throw new ApiError(404, 'NOT_FOUND', `Rol con ID ${payload.rolId} no encontrado`);
    }

    // Apply batch updates
    for (const perm of payload.permisos) {
      const cell = matrix.cells.find(
        c => c.modulo === perm.modulo && c.accion === perm.accion,
      );
      if (cell) {
        cell.enabled = perm.enabled;
      }
    }

    matrix.isDirty = false;
    return { ...matrix, cells: matrix.cells.map(c => ({ ...c })) };
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetUsuariosMock(): void {
  storeUsuarios.length = 0;
  storeUsuarios.push(...SEED_USUARIOS.map(u => ({ ...u })));
  idCounter = 16;

  // Reset roles
  storeRoles.length = 0;
  storeRoles.push(...SEED_ROLES.map(r => ({ ...r })));

  // Reset permissions
  for (const rol of SEED_ROLES) {
    storePermisos[rol.id] = generateDefaultMatrix(rol.id);
  }
}
