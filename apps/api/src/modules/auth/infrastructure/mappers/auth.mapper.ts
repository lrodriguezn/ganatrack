import type { LoginResponseDto, TwoFactorResponseDto } from '../../application/dtos/login.dto.js'

export class AuthMapper {
  static toLoginResponse(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    usuarioId: number,
    nombre: string,
    roles: string[],
  ): LoginResponseDto {
    return {
      accessToken,
      refreshToken,
      expiresIn,
      usuario: {
        id: usuarioId,
        nombre,
        roles,
      },
    }
  }

  static toTwoFactorResponse(tempToken: string): TwoFactorResponseDto {
    return {
      requires2FA: true,
      tempToken,
    }
  }
}
