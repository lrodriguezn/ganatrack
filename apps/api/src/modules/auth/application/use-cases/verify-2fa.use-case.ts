import { inject, injectable } from 'tsyringe'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'
import type { AuthDomainService } from '../../domain/services/auth.domain-service.js'
import { UnauthorizedError, ValidationError } from '../../../../shared/errors/index.js'
import { signAccessToken, signRefreshToken } from '../../../../shared/utils/jwt.utils.js'
import type { LoginResponseDto, Verify2faDto } from '../dtos/login.dto.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const TEMP_TOKEN_SECRET = process.env.JWT_SECRET
if (!TEMP_TOKEN_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
const TEMP_TOKEN_SECRET_ASSERTED = TEMP_TOKEN_SECRET as string
const ACCESS_TOKEN_TTL_SECONDS = 900 // 15 minutes
const TWO_FA_MAX_ATTEMPTS = 3

interface TempTokenPayload {
  usuarioId: number
  type: '2fa'
}

@injectable()
export class Verify2faUseCase {
  constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    private readonly domainService: AuthDomainService,
  ) {}

  async execute(dto: Verify2faDto): Promise<LoginResponseDto> {
    // 1. Verify tempToken JWT and extract usuarioId
    let tempPayload: TempTokenPayload
    try {
      const decoded = jwt.verify(dto.tempToken, TEMP_TOKEN_SECRET_ASSERTED) as unknown as TempTokenPayload
      if (decoded.type !== '2fa') {
        throw new UnauthorizedError('Token inválido')
      }
      tempPayload = decoded
    } catch {
      throw new UnauthorizedError('Token inválido o expirado')
    }

    const usuarioId = tempPayload.usuarioId

    // 2. Get 2FA record
    const twoFactor = await this.authRepo.getTwoFactor(usuarioId)
    if (!twoFactor) {
      throw new UnauthorizedError('2FA no configurado')
    }

    // 3. Check if locked (3 attempts)
    if (this.domainService.isOtpLocked(twoFactor.intentosFallidos, TWO_FA_MAX_ATTEMPTS)) {
      throw new UnauthorizedError('Demasiados intentos fallidos. Solicita un nuevo código')
    }

    // 4. Compare OTP codes using bcrypt
    console.log('[verify-2fa] Received code:', dto.codigo)
    console.log('[verify-2fa] Stored code hash:', twoFactor.codigo ? 'exists' : 'null')
    console.log('[verify-2fa] Expiration from DB:', twoFactor.fechaExpiracion)
    console.log('[verify-2fa] Current time:', new Date().toISOString())
    
    if (!twoFactor.codigo || !(await bcrypt.compare(dto.codigo, twoFactor.codigo))) {
      console.log('[verify-2fa] Code comparison FAILED')
      await this.authRepo.incrementTwoFactorAttempts(usuarioId)
      throw new ValidationError({ codigo: ['Código inválido'] })
    }
    
    console.log('[verify-2fa] Code comparison PASSED')

    // 5. Check expiration
    const isExpired = this.domainService.isOtpExpired(twoFactor.fechaExpiracion)
    console.log('[verify-2fa] Is expired:', isExpired)
    if (isExpired) {
      throw new UnauthorizedError('Código expirado. Solicita un nuevo código')
    }

    // 6. If correct: reset attempts, get roles + permisos + progressoIds, sign tokens
    await this.authRepo.resetTwoFactorAttempts(usuarioId)

    const roles = await this.authRepo.getRoles(usuarioId)
    const permisos = await this.authRepo.getPermisos(usuarioId)
    const progressoIds = await this.authRepo.getPredioIds(usuarioId)

    const tokenPayload = {
      sub: usuarioId,
      roles,
      permisos,
      predioIds:progressoIds,
    }

    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)

    // Save refresh token to DB
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await this.authRepo.saveRefreshToken(usuarioId, refreshToken, refreshExpiresAt)

    // Get usuario nombre
    const usuario = await this.authRepo.findUsuarioById(usuarioId)

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      usuario: {
        id: usuarioId,
        nombre: usuario?.nombre ?? '',
        roles,
      },
    }
  }
}
