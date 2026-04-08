// DI tokens for usuarios module - separated to avoid circular dependency
export const USUARIO_TOKENS = {
  UsuarioRepository: Symbol('UsuarioRepository'),
  RolRepository: Symbol('RolRepository'),
  PermisoRepository: Symbol('PermisoRepository'),
  DbClient: Symbol('UsuarioDbClient'),
}

// Export DB client symbol for use cases
export const USUARIO_DB_CLIENT = USUARIO_TOKENS.DbClient
