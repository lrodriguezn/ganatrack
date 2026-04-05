import { inject, injectable } from 'tsyringe'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'
import { UnauthorizedError } from '../../../../shared/errors/index.js'
import { signAccessToken, signRefreshToken, verifyToken } from '../../../../shared/utils/jwt.utils.js'
import type { LoginResponseDto, RefreshResponseDto } from '../dtos/login.dto.js'
import type { JwtPayload } from '../../../../shared/utils/jwt.utils.js'

const ACCESS_TOKEN_TTL_SECONDS = 900 // 15 minutes

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
  ) {}

  async execute(refreshToken: string): Promise<RefreshResponseDto | LoginResponseDto> {
    // 1. Verify JWT signature
    let payload: JwtPayload
    try {
      payload = verifyToken(refreshToken)
    } catch {
      throw new UnauthorizedError('Token inválido o expirado')
    }

    // 2. Check token exists and is active in DB
    const tokenRecord = await this.authRepo.findRefreshToken(refreshToken)
    if (!tokenRecord || tokenRecord.activo !== 1) {
      throw new UnauthorizedError('Token inválido o expirado')
    }

    // 3. Revoke old token (rotation)
    await this.authRepo.revokeRefreshToken(refreshToken)

    // 4. Get user roles, permisos and progressoIds
    const roles = await this.authRepo.getRoles(payload.sub)
    const permisos = await this.authRepo.getPermisos(payload.sub)
    const progressoIds = await this.authRepo.getPredioIds(payload.sub)

    // 5. Sign new access + refresh tokens
    const tokenPayload = {
      sub: payload.sub,
      roles,
      permisos,
      predioIds:progressoIds,
    }

    const newAccessToken = signAccessToken(tokenPayload)
    const newRefreshToken = signRefreshToken(tokenPayload)

    // 6. Save new refresh token
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await this.authRepo.saveRefreshToken(payload.sub, newRefreshToken, refreshExpiresAt)

    // Return the full response including the new refresh token
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      usuario: {
        id: payload.sub,
        nombre: '', // Not fetched for refresh, frontend should use cached user data
        roles,
      },
    }
  }
}
