// apps/web/src/tests/mocks/handlers/reportes.handlers.ts
/**
 * MSW Handlers for Reportes API.
 *
 * Provides mock handlers for:
 * - GET /api/v1/reportes/dashboard?predioId=X
 * - GET /api/v1/reportes/inventario, reproductivo, mortalidad, movimiento, sanitario
 * - POST /api/v1/reportes/export
 * - GET /api/v1/reportes/export/:jobId/status
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

export const reportesHandlers = [
  // GET /api/v1/reportes/dashboard — dashboard summary
  http.get(`${BASE_URL}/api/v1/reportes/dashboard`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    return HttpResponse.json({
      predioId: predioId ? Number(predioId) : 1,
      resumen: {
        totalAnimales: 25,
        activos: 22,
        vendidos: 2,
        muertos: 1,
        hembras: 10,
        machos: 15,
        enTratamiento: 3,
      },
      ultimosNacimientos: [
        { id: 31, codigo: 'GAN-031', nombre: 'Roble', fecha: '2023-02-10', madre: 'GAN-020' },
        { id: 32, codigo: 'GAN-032', nombre: 'Centella', fecha: '2023-04-18', madre: 'N/A' },
      ],
      proximosEventos: [
        { tipo: 'vacunacion', fecha: '2026-04-10', descripcion: 'Vacunación aftosa' },
        { tipo: 'desparasitacion', fecha: '2026-04-15', descripcion: 'Desparasitación general' },
      ],
    });
  }),

  // GET /api/v1/reportes/inventario
  http.get(`${BASE_URL}/api/v1/reportes/inventario`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    return HttpResponse.json({
      predioId: predioId ? Number(predioId) : 1,
      periodo: { inicio: url.searchParams.get('fechaInicio'), fin: url.searchParams.get('fechaFin') },
      total: 25,
      porRaza: [
        { raza: 'Brahman', cantidad: 8 },
        { raza: 'Holstein', cantidad: 4 },
        { raza: 'Romosinuano', cantidad: 4 },
        { raza: 'Nelore', cantidad: 3 },
        { raza: 'Simmental', cantidad: 3 },
        { raza: 'Gyr', cantidad: 2 },
        { raza: 'Criollo', cantidad: 1 },
      ],
      porEstado: [
        { estado: 'Activo', cantidad: 22 },
        { estado: 'Vendido', cantidad: 2 },
        { estado: 'Muerto', cantidad: 1 },
      ],
      porSexo: [
        { sexo: 'Macho', cantidad: 15 },
        { sexo: 'Hembra', cantidad: 10 },
      ],
      porPotrero: [
        { potrero: 'Potrero Norte', cantidad: 7 },
        { potrero: 'Potrero Sur', cantidad: 6 },
        { potrero: 'Potrero Este', cantidad: 7 },
        { potrero: 'Potrero Oeste', cantidad: 3 },
      ],
    });
  }),

  // GET /api/v1/reportes/reproductivo
  http.get(`${BASE_URL}/api/v1/reportes/reproductivo`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    return HttpResponse.json({
      predioId: predioId ? Number(predioId) : 1,
      periodo: { inicio: url.searchParams.get('fechaInicio'), fin: url.searchParams.get('fechaFin') },
      nacimientos: 5,
        palpacionesPositivas: 8,
        inseminaciones: 12,
        partos: 4,
        tasaPreñez: 66.7,
        tasaMortalidadNeonatal: 0,
        detallePartos: [
          { id: 1, madre: 'GAN-014', cria: 'GAN-031', fecha: '2023-02-10', tipo: 'Natural' },
          { id: 2, madre: 'GAN-020', cria: 'GAN-032', fecha: '2023-04-18', tipo: 'Natural' },
        ],
    });
  }),

  // GET /api/v1/reportes/mortalidad
  http.get(`${BASE_URL}/api/v1/reportes/mortalidad`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    return HttpResponse.json({
      predioId: predioId ? Number(predioId) : 1,
      periodo: { inicio: url.searchParams.get('fechaInicio'), fin: url.searchParams.get('fechaFin') },
      totalMuertes: 1,
      tasaMortalidad: 4.0,
      porCausa: [
        { causa: 'Enfermedad', cantidad: 1 },
        { causa: 'Accidente', cantidad: 0 },
        { causa: 'Depredación', cantidad: 0 },
      ],
      detalle: [
        { id: 25, codigo: 'GAN-025', nombre: 'Sombra', fecha: '2023-01-15', causa: 'Enfermedad' },
      ],
    });
  }),

  // GET /api/v1/reportes/movimiento
  http.get(`${BASE_URL}/api/v1/reportes/movimiento`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    return HttpResponse.json({
      predioId: predioId ? Number(predioId) : 1,
      periodo: { inicio: url.searchParams.get('fechaInicio'), fin: url.searchParams.get('fechaFin') },
      ingresos: 3,
      salidas: 2,
      movimientosPotrero: 5,
      detalleIngresos: [
        { id: 5, codigo: 'GAN-005', nombre: 'El Herrero', tipo: 'Compra', fecha: '2020-11-05' },
        { id: 9, codigo: 'GAN-009', nombre: 'El Zorro', tipo: 'Compra', fecha: '2022-01-08' },
        { id: 13, codigo: 'GAN-013', nombre: 'Navarro', tipo: 'Compra', fecha: '2021-03-03' },
      ],
      detalleSalidas: [
        { id: 24, codigo: 'GAN-024', nombre: 'Relámpago', tipo: 'Venta', fecha: '2023-03-15' },
        { id: 25, codigo: 'GAN-025', nombre: 'Sombra', tipo: 'Muerte', fecha: '2023-01-15' },
      ],
    });
  }),

  // GET /api/v1/reportes/sanitario
  http.get(`${BASE_URL}/api/v1/reportes/sanitario`, ({ request }) => {
    const url = new URL(request.url);
    const predioId = url.searchParams.get('predioId');

    return HttpResponse.json({
      predioId: predioId ? Number(predioId) : 1,
      periodo: { inicio: url.searchParams.get('fechaInicio'), fin: url.searchParams.get('fechaFin') },
      animalesEnTratamiento: 3,
      vacunacionesPendientes: 5,
      desparasitacionesPendientes: 8,
      detalleTratamientos: [
        { id: 1, animal: 'GAN-001', diagnostico: 'Enfermedad respiratoria', fechaInicio: '2023-06-01', estado: 'En curso' },
        { id: 2, animal: 'GAN-003', diagnostico: 'Parásitos', fechaInicio: '2023-05-15', estado: 'En curso' },
        { id: 3, animal: 'GAN-007', diagnostico: 'Herida', fechaInicio: '2023-06-10', estado: 'En curso' },
      ],
    });
  }),

  // POST /api/v1/reportes/export — trigger export
  http.post(`${BASE_URL}/api/v1/reportes/export`, async () => {
    const jobId = `export-${Date.now()}`;
    return HttpResponse.json({
      jobId,
      status: 'processing',
      message: 'Exportación iniciada. Verifica el estado con GET /reportes/export/:jobId',
    });
  }),

  // GET /api/v1/reportes/export/:jobId/status — check export status
  http.get(`${BASE_URL}/api/v1/reportes/export/:jobId`, ({ params }) => {
    return HttpResponse.json({
      jobId: params.jobId,
      status: 'completed',
      downloadUrl: `/api/v1/reportes/export/${params.jobId}/download`,
      completedAt: new Date().toISOString(),
    });
  }),
];
