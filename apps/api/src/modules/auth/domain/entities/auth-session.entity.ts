export interface AuthSession {
  usuarioId: number
  accessToken: string
  refreshToken: string
  expiresIn: number
  usuario: {
    id: number
    nombre: string
    roles: string[]
  }
}

export interface TwoFactorChallenge {
  requires2FA: true
  tempToken: string
}

export interface TempTokenPayload {
  usuarioId: number
  type: '2fa'
}
