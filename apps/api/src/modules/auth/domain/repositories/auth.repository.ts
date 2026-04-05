export interface IAuthRepository {
  findUsuarioById(id: number): Promise<{ id: number; nombre: string; email: string; activo: number } | null>
  findUsuarioByEmail(email: string): Promise<{ id: number; nombre: string; email: string; activo: number } | null>
  getContrasenaHash(usuarioId: number): Promise<string | null>
  getRoles(usuarioId: number): Promise<string[]>
  getPermisos(usuarioId: number): Promise<string[]>
  getPredioIds(usuarioId: number): Promise<number[]>
  getTwoFactor(usuarioId: number): Promise<{
    habilitado: number
    metodo: string
    codigo: string | null
    fechaExpiracion: Date | null
    intentosFallidos: number
  } | null>
  saveTwoFactorCode(usuarioId: number, code: string, expiresAt: Date): Promise<void>
  incrementTwoFactorAttempts(usuarioId: number): Promise<void>
  resetTwoFactorAttempts(usuarioId: number): Promise<void>
  saveRefreshToken(usuarioId: number, refreshToken: string, expiresAt: Date): Promise<void>
  findRefreshToken(refreshToken: string): Promise<{ usuarioId: number; activo: number } | null>
  revokeRefreshToken(refreshToken: string): Promise<void>
  savePasswordHistory(usuarioId: number, hash: string): Promise<void>
  getPasswordHistory(usuarioId: number, limit: number): Promise<string[]>
  updatePassword(usuarioId: number, newHash: string): Promise<void>
  revokeAllUserTokens(usuarioId: number): Promise<void>
}

export const AUTH_REPOSITORY = Symbol('IAuthRepository')
