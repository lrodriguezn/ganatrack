import { inject, injectable } from 'tsyringe'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'
import type { LoginDto, LoginResponseDto, TwoFactorResponseDto } from '../dtos/login.dto.js'
import type { AuthDomainService } from '../../domain/services/auth.domain-service.js'
import { UnauthorizedError } from '../../../../shared/errors/index.js'
import { verifyPassword } from '../../../../shared/utils/password.utils.js'
import { signAccessToken, signRefreshToken } from '../../../../shared/utils/jwt.utils.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
const JWT_SECRET_ASSERTED = JWT_SECRET as string
const ACCESS_TOKEN_TTL_SECONDS = 900 // 15 minutes
const TWO_FA_CODE_TTL_MINUTES = 5

@injectable()
export class LoginUseCase {
  constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    private readonly domainService: AuthDomainService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponseDto | TwoFactorResponseDto> {
    // 1. Find user by email
    const usuario = await this.authRepo.findUsuarioByEmail(dto.email)
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas')
    }

    // 2. Get password hash and verify
    const hash = await this.authRepo.getContrasenaHash(usuario.id)
    if (!hash) {
      throw new UnauthorizedError('Credenciales inválidas')
    }

    const isValidPassword = await verifyPassword(dto.password, hash)
    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas')
    }

    // 3. Check 2FA enabled
    const twoFactor = await this.authRepo.getTwoFactor(usuario.id)
    if (twoFactor && twoFactor.habilitado === 1) {
      // Generate OTP and tempToken
      const otpCode = this.domainService.generateOtpCode()
      const expiresAt = new Date(Date.now() + TWO_FA_CODE_TTL_MINUTES * 60 * 1000)

      await this.authRepo.saveTwoFactorCode(usuario.id, otpCode, expiresAt)

      // Create tempToken with usuarioId encoded
      const tempToken = jwt.sign(
        { usuarioId: usuario.id, type: '2fa' },
        JWT_SECRET_ASSERTED,
        { expiresIn: `${TWO_FA_CODE_TTL_MINUTES}m` },
      )

      return {
        requires2FA: true,
        tempToken,
      }
    }

    // 4. No 2FA - generate tokens directly
    const roles = await this.authRepo.getRoles(usuario.id)
    const permisos = await this.authRepo.getPermisos(usuario.id)
    const predioIds = await this.authRepo.getPredioIds(usuario.id)

    const payload = {
      sub: usuario.id,
      roles,
      permisos,
      predioIds:predioIds,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    // Save refresh token to DB
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await this.authRepo.saveRefreshToken(usuario.id, refreshToken, refreshExpiresAt)

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        roles,
      },
    }
  }
}
