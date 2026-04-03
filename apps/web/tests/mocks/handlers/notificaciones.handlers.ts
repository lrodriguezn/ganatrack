// apps/web/tests/mocks/handlers/notificaciones.handlers.ts
/**
 * MSW Handlers for Notificaciones API.
 *
 * Provides mock handlers for:
 * - GET /api/v1/notificaciones/resumen?predioId=X
 * - GET /api/v1/notificaciones?predioId=X&page=1&limit=10
 * - POST /api/v1/notificaciones/:id/read
 * - POST /api/v1/notificaciones/read-all
 * - GET /api/v1/notificaciones/preferencias
 * - PUT /api/v1/notificaciones/preferencias
 */

import { http, HttpResponse } from 'msw';

const SEED_NOTIFICACIONES = [
  { id: 1, tipo: 'vacunacion', titulo: 'Vacunación pendiente', mensaje: '5 animales requieren vacunación aftosa', predioId: 1, leida: false, createdAt: '2026-04-03T08:00:00Z' },
  { id: 2, tipo: 'nacimiento', titulo: 'Nuevo nacimiento registrado', mensaje: 'Roble (GAN-031) nació de GAN-020', predioId: 1, leida: false, createdAt: '2026-04-02T14:30:00Z' },
  { id: 3, tipo: 'tratamiento', titulo: 'Tratamiento completado', mensaje: 'Tratamiento de GAN-003 finalizado', predioId: 1, leida: true, createdAt: '2026-04-01T10:00:00Z' },
  { id: 4, tipo: 'movimiento', titulo: 'Movimiento de potrero', mensaje: '3 animales movidos a Potrero Norte', predioId: 1, leida: true, createdAt: '2026-03-30T09:00:00Z' },
  { id: 5, tipo: 'alerta', titulo: 'Alerta sanitaria', mensaje: 'Detectados 2 animales con síntomas similares', predioId: 1, leida: false, createdAt: '2026-03-28T16:00:00Z' },
  { id: 6, tipo: 'servicio', titulo: 'Inseminación programada', mensaje: '3 inseminaciones programadas para esta semana', predioId: 1, leida: true, createdAt: '2026-03-25T11:00:00Z' },
  { id: 7, tipo: 'venta', titulo: 'Venta registrada', mensaje: 'Relámpago (GAN-024) vendido por $3,500,000', predioId: 1, leida: true, createdAt: '2026-03-15T14:00:00Z' },
  { id: 8, tipo: 'desparasitacion', titulo: 'Desparasitación pendiente', mensaje: '8 animales requieren desparasitación', predioId: 1, leida: false, createdAt: '2026-03-10T08:00:00Z' },
];

const SEED_PREFERENCIAS = {
  email: true,
  push: true,
  sms: false,
  tipos: {
    vacunacion: true,
    nacimiento: true,
    tratamiento: true,
    movimiento: false,
    alerta: true,
    servicio: false,
    venta: true,
    desparasitacion: true,
  },
};

const storeNotificaciones = SEED_NOTIFICACIONES.map(n => ({ ...n }));
let idCounter = SEED_NOTIFICACIONES.length + 1;

export const notificacionesHandlers = [
  // GET /api/v1/notificaciones/resumen — notification summary
  http.get('*/api/v1/notificaciones/resumen', ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    let notifs = storeNotificaciones;
    if (predioId) {
      notifs = notifs.filter(n => n.predioId === Number(predioId));
    }

    const noLeidas = notifs.filter(n => !n.leida).length;
    const ultimas = notifs.slice(0, 10);

    return HttpResponse.json({ total: notifs.length, noLeidas, ultimas });
  }),

  // GET /api/v1/notificaciones — paginated list
  http.get('*/api/v1/notificaciones', ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const leida = url.searchParams.get('leida');

    let filtered = storeNotificaciones;
    if (predioId) {
      filtered = filtered.filter(n => n.predioId === Number(predioId));
    }
    if (leida !== null) {
      filtered = filtered.filter(n => n.leida === (leida === 'true'));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({ data, page, limit, total, totalPages });
  }),

  // POST /api/v1/notificaciones/:id/read — mark as read
  http.post('*/api/v1/notificaciones/:id/read', ({ params }) => {
    const id = Number(params.id);
    const index = storeNotificaciones.findIndex(n => n.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: `Notificación con ID ${id} no encontrada` },
        { status: 404 }
      );
    }

    storeNotificaciones[index].leida = true;
    return HttpResponse.json(storeNotificaciones[index]);
  }),

  // POST /api/v1/notificaciones/read-all — mark all as read
  http.post('*/api/v1/notificaciones/read-all', ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    storeNotificaciones.forEach(n => {
      if (!predioId || n.predioId === Number(predioId)) {
        n.leida = true;
      }
    });

    return HttpResponse.json({ message: 'Todas las notificaciones marcadas como leídas' });
  }),

  // GET /api/v1/notificaciones/preferencias
  http.get('*/api/v1/notificaciones/preferencias', () => {
    return HttpResponse.json(SEED_PREFERENCIAS);
  }),

  // PUT /api/v1/notificaciones/preferencias
  http.put('*/api/v1/notificaciones/preferencias', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...SEED_PREFERENCIAS, ...body });
  }),
];
