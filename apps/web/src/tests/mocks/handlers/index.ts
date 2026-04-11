// apps/web/src/tests/mocks/handlers/index.ts
/**
 * Barrel export for all MSW handlers.
 */
export { authHandlers } from './auth.handlers';
export { prediosHandlers, resetPrediosMock } from './predios.handlers';
export { animalesHandlers, resetAnimalMock } from './animales.handlers';
export { serviciosHandlers } from './servicios.handlers';
export { configHandlers } from './config.handlers';
export { imagenesHandlers } from './imagenes.handlers';
export { productosHandlers } from './productos.handlers';
export { rolesHandlers } from './roles.handlers';
export { usuariosHandlers } from './usuarios.handlers';
export { maestrosHandlers } from './maestros.handlers';
export { reportesHandlers } from './reportes.handlers';
export { notificacionesHandlers } from './notificaciones.handlers';
export { syncHandlers } from './sync.handlers';
export { setMockLoggedInUser } from './auth.handlers';

import { authHandlers } from './auth.handlers';
import { prediosHandlers } from './predios.handlers';
import { animalesHandlers } from './animales.handlers';
import { serviciosHandlers } from './servicios.handlers';
import { configHandlers } from './config.handlers';
import { imagenesHandlers } from './imagenes.handlers';
import { productosHandlers } from './productos.handlers';
import { rolesHandlers } from './roles.handlers';
import { usuariosHandlers } from './usuarios.handlers';
import { maestrosHandlers } from './maestros.handlers';
import { reportesHandlers } from './reportes.handlers';
import { notificacionesHandlers } from './notificaciones.handlers';
import { syncHandlers } from './sync.handlers';

export const allHandlers = [
  ...authHandlers,
  ...prediosHandlers,
  ...animalesHandlers,
  ...serviciosHandlers,
  ...configHandlers,
  ...imagenesHandlers,
  ...productosHandlers,
  ...rolesHandlers,
  ...usuariosHandlers,
  ...maestrosHandlers,
  ...reportesHandlers,
  ...notificacionesHandlers,
  ...syncHandlers,
];
