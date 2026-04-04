// apps/web/src/tests/mocks/handlers/roles.handlers.ts
/**
 * MSW Handlers for Roles and Permisos API.
 *
 * Provides mock handlers for:
 * - GET /api/v1/roles
 * - GET/PUT /api/v1/roles/:id/permisos
 * - Optimistic mock state for permission matrix
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

const MODULOS = [
  'dashboard', 'animales', 'predios', 'servicios', 'reportes',
  'configuracion', 'maestros', 'productos', 'imagenes', 'notificaciones', 'usuarios',
];
const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

const mockRoles = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo a todos los módulos', esSistema: true },
  { id: 2, nombre: 'Veterinario', descripcion: 'Gestión de servicios y reportes de salud', esSistema: true },
  { id: 3, nombre: 'Operario', descripcion: 'Registro diario de actividades', esSistema: true },
  { id: 4, nombre: 'Contador', descripcion: 'Acceso a reportes y configuración financiera', esSistema: true },
  { id: 5, nombre: 'Consulta', descripcion: 'Solo lectura de datos', esSistema: true },
];

// Default permissions per role
function getDefaultPermisos(rolId: number) {
  const permisos: { modulo: string; accion: string; enabled: boolean }[] = [];

  for (const modulo of MODULOS) {
    for (const accion of ACCIONES) {
      let enabled = false;
      if (rolId === 1) {
        enabled = true;
      } else if (rolId === 5) {
        enabled = accion === 'ver';
      } else if (rolId === 2) {
        enabled = (['ver', 'crear', 'editar'].includes(accion)) &&
          (['servicios', 'reportes', 'animales', 'dashboard'].includes(modulo));
      } else if (rolId === 3) {
        enabled = (['ver', 'crear'].includes(accion)) &&
          (['animales', 'servicios', 'dashboard'].includes(modulo));
      } else if (rolId === 4) {
        enabled = (['ver', 'crear', 'editar'].includes(accion)) &&
          (['reportes', 'configuracion', 'dashboard'].includes(modulo));
      }
      permisos.push({ modulo, accion, enabled });
    }
  }

  return permisos;
}

// In-memory permissions store
const storePermisos: Record<number, ReturnType<typeof getDefaultPermisos>> = {};
for (const rol of mockRoles) {
  storePermisos[rol.id] = getDefaultPermisos(rol.id);
}

export const rolesHandlers = [
  // GET /api/v1/roles — list all roles
  http.get(`${BASE_URL}/api/v1/roles`, () => {
    return HttpResponse.json(mockRoles);
  }),

  // GET /api/v1/roles/:id/permisos — get permission matrix for a role
  http.get(`${BASE_URL}/api/v1/roles/:id/permisos`, ({ params }) => {
    const rolId = Number(params.id);
    const permisos = storePermisos[rolId];

    if (!permisos) {
      return HttpResponse.json(
        { message: `Rol con ID ${rolId} no encontrado` },
        { status: 404 }
      );
    }

    // Build matrix response
    const cells = MODULOS.flatMap(modulo =>
      ACCIONES.map(accion => {
        const found = permisos.find(p => p.modulo === modulo && p.accion === accion);
        return {
          modulo,
          accion,
          enabled: found?.enabled ?? false,
          conflicted: false,
        };
      })
    );

    return HttpResponse.json({
      rolId,
      cells,
      isDirty: false,
      conflicts: [],
    });
  }),

  // PUT /api/v1/roles/:id/permisos — batch update permissions
  http.put(`${BASE_URL}/api/v1/roles/:id/permisos`, async ({ params, request }) => {
    const rolId = Number(params.id);
    const body = await request.json() as { permisos: { modulo: string; accion: string; enabled: boolean }[] };

    if (!storePermisos[rolId]) {
      return HttpResponse.json(
        { message: `Rol con ID ${rolId} no encontrado` },
        { status: 404 }
      );
    }

    // Apply batch updates
    for (const perm of body.permisos) {
      const existing = storePermisos[rolId].find(
        p => p.modulo === perm.modulo && p.accion === perm.accion
      );
      if (existing) {
        existing.enabled = perm.enabled;
      }
    }

    // Return updated matrix
    const cells = MODULOS.flatMap(modulo =>
      ACCIONES.map(accion => {
        const found = storePermisos[rolId].find(p => p.modulo === modulo && p.accion === accion);
        return {
          modulo,
          accion,
          enabled: found?.enabled ?? false,
          conflicted: false,
        };
      })
    );

    return HttpResponse.json({
      rolId,
      cells,
      isDirty: false,
      conflicts: [],
    });
  }),
];
