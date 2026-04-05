export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: number
  usuario: {
    id: number
    nombre: string
    roles: string[]
  }
}

export interface TwoFactorResponseDto {
  requires2FA: true
  tempToken: string
}

export interface Verify2faDto {
  tempToken: string
  codigo: string
}

export interface ChangePasswordDto {
  passwordActual: string
  passwordNuevo: string
}

export interface RefreshResponseDto {
  accessToken: string
}
