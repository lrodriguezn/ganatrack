// apps/web/src/tests/mocks/handlers/usuarios.handlers.ts
/**
 * MSW Handlers for Usuarios API.
 *
 * Provides mock handlers for:
 * - GET/POST/PUT/DELETE /api/v1/usuarios
 * - Pagination, search, 404, duplicate email
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

// Seed data — 15 users
const mockUsuarios = [
  { id: 1, nombre: 'Carlos Mendoza', email: 'carlos@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 2, nombre: 'María Rodríguez', email: 'maria@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 3, nombre: 'José Herrera', email: 'jose@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 4, nombre: 'Ana Gutiérrez', email: 'ana@finca.com', rolId: 4, rolNombre: 'Contador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 5, nombre: 'Pedro Ramírez', email: 'pedro@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 6, nombre: 'Luisa Fernández', email: 'luisa@finca.com', rolId: 5, rolNombre: 'Consulta', predioId: 1, predioNombre: 'Finca La Esperanza', activo: false },
  { id: 7, nombre: 'Roberto Díaz', email: 'roberto@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 2, predioNombre: 'Finca El Progreso', activo: true },
  { id: 8, nombre: 'Sandra Morales', email: 'sandra@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 2, predioNombre: 'Finca El Progreso', activo: true },
  { id: 9, nombre: 'Diego Vargas', email: 'diego@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 2, predioNombre: 'Finca El Progreso', activo: true },
  { id: 10, nombre: 'Camila Torres', email: 'camila@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 2, predioNombre: 'Finca El Progreso', activo: false },
  { id: 11, nombre: 'Andrés Castillo', email: 'andres@finca.com', rolId: 5, rolNombre: 'Consulta', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 12, nombre: 'Valentina Ruiz', email: 'valentina@finca.com', rolId: 4, rolNombre: 'Contador', predioId: 2, predioNombre: 'Finca El Progreso', activo: true },
  { id: 13, nombre: 'Felipe Moreno', email: 'felipe@finca.com', rolId: 3, rolNombre: 'Operario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: false },
  { id: 14, nombre: 'Isabella López', email: 'isabella@finca.com', rolId: 2, rolNombre: 'Veterinario', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
  { id: 15, nombre: 'Mateo Silva', email: 'mateo@finca.com', rolId: 1, rolNombre: 'Administrador', predioId: 1, predioNombre: 'Finca La Esperanza', activo: true },
];

let idCounter = mockUsuarios.length + 1;

export const usuariosHandlers = [
  // GET /api/v1/usuarios — paginated list with search and filters
  http.get(`${BASE_URL}/api/v1/usuarios`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predio_id');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search');
    const rolId = url.searchParams.get('rol_id');
    const activo = url.searchParams.get('activo');

    let filtered = mockUsuarios;

    if (predioId) {
      filtered = filtered.filter(u => u.predioId === Number(predioId));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.nombre.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      );
    }
    if (rolId) {
      filtered = filtered.filter(u => u.rolId === Number(rolId));
    }
    if (activo !== null) {
      filtered = filtered.filter(u => u.activo === (activo === 'true'));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),

  // GET /api/v1/usuarios/:id — single usuario
  http.get(`${BASE_URL}/api/v1/usuarios/:id`, ({ params }) => {
    const id = Number(params.id);
    const usuario = mockUsuarios.find(u => u.id === id);

    if (!usuario) {
      return HttpResponse.json(
        { message: `Usuario con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    return HttpResponse.json(usuario);
  }),

  // POST /api/v1/usuarios — create usuario
  http.post(`${BASE_URL}/api/v1/usuarios`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    // Check duplicate email
    const duplicate = mockUsuarios.find(u => u.email === body.email);
    if (duplicate) {
      return HttpResponse.json(
        { message: `El email "${body.email}" ya está registrado`, code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    const newUsuario = {
      id: idCounter++,
      nombre: body.nombre,
      email: body.email,
      rolId: body.rolId,
      rolNombre: 'Nuevo Rol',
      predioId: body.predioId,
      predioNombre: `Predio ${body.predioId}`,
      telefono: body.telefono,
      activo: true,
    };

    mockUsuarios.push(newUsuario);
    return HttpResponse.json(newUsuario, { status: 201 });
  }),

  // PUT /api/v1/usuarios/:id — update usuario
  http.put(`${BASE_URL}/api/v1/usuarios/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const index = mockUsuarios.findIndex(u => u.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Usuario con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    const body = await request.json() as Record<string, unknown>;

    // Check duplicate email (excluding self)
    if (body.email && body.email !== mockUsuarios[index].email) {
      const duplicate = mockUsuarios.find(u => u.email === body.email && u.id !== id);
      if (duplicate) {
        return HttpResponse.json(
          { message: `El email "${body.email}" ya está registrado`, code: 'DUPLICATE_EMAIL' },
          { status: 409 }
        );
      }
    }

    mockUsuarios[index] = { ...mockUsuarios[index], ...body };
    return HttpResponse.json(mockUsuarios[index]);
  }),

  // DELETE /api/v1/usuarios/:id — deactivate usuario
  http.delete(`${BASE_URL}/api/v1/usuarios/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = mockUsuarios.findIndex(u => u.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Usuario con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    mockUsuarios[index].activo = false;
    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /api/v1/usuarios/:id/activate — activate usuario
  http.patch(`${BASE_URL}/api/v1/usuarios/:id/activate`, ({ params }) => {
    const id = Number(params.id);
    const index = mockUsuarios.findIndex(u => u.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Usuario con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    mockUsuarios[index].activo = true;
    return HttpResponse.json(mockUsuarios[index]);
  }),
];
