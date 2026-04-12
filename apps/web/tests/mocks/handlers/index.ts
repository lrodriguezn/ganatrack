// apps/web/tests/mocks/handlers/index.ts
/**
 * Barrel export for all MSW E2E handlers.
 */
import { animalesHandlers } from './animales.handlers';
import { authHandlers } from './auth.handlers';
import { configHandlers } from './config.handlers';
import { imagenesHandlers } from './imagenes.handlers';
import { maestrosHandlers } from './maestros.handlers';
import { notificacionesHandlers } from './notificaciones.handlers';
import { prediosHandlers } from './predios.handlers';
import { productosHandlers } from './productos.handlers';
import { reportesHandlers } from './reportes.handlers';
import { rolesHandlers } from './roles.handlers';
import { serviciosHandlers } from './servicios.handlers';
import { syncHandlers } from './sync.handlers';
import { usuariosHandlers } from './usuarios.handlers';

export const allHandlers = [
  ...animalesHandlers,
  ...authHandlers,
  ...configHandlers,
  ...imagenesHandlers,
  ...maestrosHandlers,
  ...notificacionesHandlers,
  ...prediosHandlers,
  ...productosHandlers,
  ...reportesHandlers,
  ...rolesHandlers,
  ...serviciosHandlers,
  ...syncHandlers,
  ...usuariosHandlers,
];
