// =============================================================================
// GanaTrack Database Schema - Barrel Export
// =============================================================================
// This file resolves all forward references between schema files.
// Import from this file in application code, NOT from individual schema files.
// =============================================================================

// Import all table definitions
import {
  // usuarios schema
  usuarios,
  usuariosContrasena,
  usuariosHistorialContrasenas,
  usuariosLogin,
  usuariosAutenticacionDosFactores,
  usuariosRoles,
  usuariosPermisos,
  rolesPermisos,
  usuariosPredios,
  usuariosRolesAsignacion,
} from './usuarios.js'

import {
  // predios schema
  predios,
  potreros,
  sectores,
  lotes,
  grupos,
  configParametrosPredio,
} from './predios.js'

import {
  // animales schema
  imagenes,
  animales,
  animalesImagenes,
} from './animales.js'

import {
  // maestros schema
  veterinarios,
  propietarios,
  hierros,
  diagnosticosVeterinarios,
  motivosVentas,
  causasMuerte,
  lugaresCompras,
  lugaresVentas,
} from './maestros.js'

import {
  // servicios schema
  serviciosPalpacionesGrupal,
  serviciosPalpacionesAnimales,
  serviciosInseminacionGrupal,
  serviciosInseminacionAnimales,
  serviciosPartosAnimales,
  serviciosPartosCrias,
  serviciosVeterinariosGrupal,
  serviciosVeterinariosAnimales,
  serviciosVeterinariosProductos,
} from './servicios.js'

import {
  // configuracion schema
  configRazas,
  configCondicionesCorporales,
  configTiposExplotacion,
  configCalidadAnimal,
  configColores,
  configRangosEdades,
  configKeyValues,
} from './configuracion.js'

import {
  // productos schema
  productos,
  productosImagenes,
} from './productos.js'

import {
  // reportes schema
  reportesExportaciones,
} from './reportes.js'

import {
  // notificaciones schema
  notificaciones,
  notificacionesPreferencias,
  notificacionesPushTokens,
} from './notificaciones.js'

// =============================================================================
// Re-export all tables
// =============================================================================
export {
  // usuarios
  usuarios,
  usuariosContrasena,
  usuariosHistorialContrasenas,
  usuariosLogin,
  usuariosAutenticacionDosFactores,
  usuariosRoles,
  usuariosPermisos,
  rolesPermisos,
  usuariosPredios,
  usuariosRolesAsignacion,
  // predios
  predios,
  potreros,
  sectores,
  lotes,
  grupos,
  configParametrosPredio,
  // animales
  imagenes,
  animales,
  animalesImagenes,
  // maestros
  veterinarios,
  propietarios,
  hierros,
  diagnosticosVeterinarios,
  motivosVentas,
  causasMuerte,
  lugaresCompras,
  lugaresVentas,
  // servicios
  serviciosPalpacionesGrupal,
  serviciosPalpacionesAnimales,
  serviciosInseminacionGrupal,
  serviciosInseminacionAnimales,
  serviciosPartosAnimales,
  serviciosPartosCrias,
  serviciosVeterinariosGrupal,
  serviciosVeterinariosAnimales,
  serviciosVeterinariosProductos,
  // configuracion
  configRazas,
  configCondicionesCorporales,
  configTiposExplotacion,
  configCalidadAnimal,
  configColores,
  configRangosEdades,
  configKeyValues,
  // productos
  productos,
  productosImagenes,
  // reportes
  reportesExportaciones,
  // notificaciones
  notificaciones,
  notificacionesPreferencias,
  notificacionesPushTokens,
}

// =============================================================================
// Type exports
// =============================================================================
export type { Usuario } from './usuarios.js'
export type { NuevoUsuario } from './usuarios.js'
export type { UsuarioContrasena } from './usuarios.js'
export type { NuevoUsuarioContrasena } from './usuarios.js'
export type { UsuarioHistorialContrasena } from './usuarios.js'
export type { NuevoUsuarioHistorialContrasena } from './usuarios.js'
export type { UsuarioLogin } from './usuarios.js'
export type { NuevoUsuarioLogin } from './usuarios.js'
export type { UsuarioAutenticacionDosFactores } from './usuarios.js'
export type { NuevoUsuarioAutenticacionDosFactores } from './usuarios.js'
export type { UsuarioRol } from './usuarios.js'
export type { NuevoUsuarioRol } from './usuarios.js'
export type { UsuarioPermiso } from './usuarios.js'
export type { NuevoUsuarioPermiso } from './usuarios.js'
export type { RolPermiso } from './usuarios.js'
export type { NuevoRolPermiso } from './usuarios.js'
export type { UsuarioPredio } from './usuarios.js'
export type { NuevoUsuarioPredio } from './usuarios.js'
export type { UsuarioRolesAsignacion } from './usuarios.js'
export type { NuevoUsuarioRolesAsignacion } from './usuarios.js'

export type { Predio } from './predios.js'
export type { NuevoPredio } from './predios.js'
export type { Potrero } from './predios.js'
export type { NuevoPotrero } from './predios.js'
export type { Sector } from './predios.js'
export type { NuevoSector } from './predios.js'
export type { Lote } from './predios.js'
export type { NuevoLote } from './predios.js'
export type { Grupo } from './predios.js'
export type { NuevoGrupo } from './predios.js'
export type { ConfigParametroPredio } from './predios.js'
export type { NuevoConfigParametroPredio } from './predios.js'

export type { Imagen } from './animales.js'
export type { NuevaImagen } from './animales.js'
export type { Animal } from './animales.js'
export type { NuevoAnimal } from './animales.js'
export type { AnimalImagen } from './animales.js'
export type { NuevaAnimalImagen } from './animales.js'

export type { Veterinario } from './maestros.js'
export type { NuevoVeterinario } from './maestros.js'
export type { Propietario } from './maestros.js'
export type { NuevoPropietario } from './maestros.js'
export type { Hierro } from './maestros.js'
export type { NuevoHierro } from './maestros.js'
export type { DiagnosticoVeterinario } from './maestros.js'
export type { NuevoDiagnosticoVeterinario } from './maestros.js'
export type { MotivoVenta } from './maestros.js'
export type { NuevoMotivoVenta } from './maestros.js'
export type { CausaMuerte } from './maestros.js'
export type { NuevaCausaMuerte } from './maestros.js'
export type { LugarCompra } from './maestros.js'
export type { NuevoLugarCompra } from './maestros.js'
export type { LugarVenta } from './maestros.js'
export type { NuevoLugarVenta } from './maestros.js'

export type { ServicioPalpacionGrupal } from './servicios.js'
export type { NuevoServicioPalpacionGrupal } from './servicios.js'
export type { ServicioPalpacionAnimal } from './servicios.js'
export type { NuevoServicioPalpacionAnimal } from './servicios.js'
export type { ServicioInseminacionGrupal } from './servicios.js'
export type { NuevoServicioInseminacionGrupal } from './servicios.js'
export type { ServicioInseminacionAnimal } from './servicios.js'
export type { NuevoServicioInseminacionAnimal } from './servicios.js'
export type { ServicioPartoAnimal } from './servicios.js'
export type { NuevoServicioPartoAnimal } from './servicios.js'
export type { ServicioPartoCria } from './servicios.js'
export type { NuevoServicioPartoCria } from './servicios.js'
export type { ServicioVeterinarioGrupal } from './servicios.js'
export type { NuevoServicioVeterinarioGrupal } from './servicios.js'
export type { ServicioVeterinarioAnimal } from './servicios.js'
export type { NuevoServicioVeterinarioAnimal } from './servicios.js'
export type { ServicioVeterinarioProducto } from './servicios.js'
export type { NuevoServicioVeterinarioProducto } from './servicios.js'

export type { ConfigRaza } from './configuracion.js'
export type { NuevoConfigRaza } from './configuracion.js'
export type { ConfigCondicionCorporal } from './configuracion.js'
export type { NuevoConfigCondicionCorporal } from './configuracion.js'
export type { ConfigTipoExplotacion } from './configuracion.js'
export type { NuevoConfigTipoExplotacion } from './configuracion.js'
export type { ConfigCalidadAnimal } from './configuracion.js'
export type { NuevoConfigCalidadAnimal } from './configuracion.js'
export type { ConfigColor } from './configuracion.js'
export type { NuevoConfigColor } from './configuracion.js'
export type { ConfigRangoEdad } from './configuracion.js'
export type { NuevoConfigRangoEdad } from './configuracion.js'
export type { ConfigKeyValue } from './configuracion.js'
export type { NuevoConfigKeyValue } from './configuracion.js'

export type { Producto } from './productos.js'
export type { NuevoProducto } from './productos.js'
export type { ProductoImagen } from './productos.js'
export type { NuevoProductoImagen } from './productos.js'

export type { ReporteExportacion } from './reportes.js'
export type { NuevoReporteExportacion } from './reportes.js'

export type { Notificacion } from './notificaciones.js'
export type { NuevaNotificacion } from './notificaciones.js'
export type { NotificacionPreferencia } from './notificaciones.js'
export type { NuevaNotificacionPreferencia } from './notificaciones.js'
export type { NotificacionPushToken } from './notificaciones.js'
export type { NuevaNotificacionPushToken } from './notificaciones.js'
