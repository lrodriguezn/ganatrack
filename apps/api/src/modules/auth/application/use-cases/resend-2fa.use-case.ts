import { inject, injectable } from 'tsyringe'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'
import type { AuthDomainService } from '../../domain/services/auth.domain-service.js'
import { UnauthorizedError } from '../../../../shared/errors/index.js'
import jwt from 'jsonwebtoken'

const TWO_FA_CODE_TTL_MINUTES = 5
const TEMP_TOKEN_SECRET = process.env.JWT_SECRET ?? 'super-secret-key-change-in-production'

interface TempTokenPayload {
  usuarioId: number
  type: '2fa'
}

@injectable()
export class Resend2faUseCase {
  constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    private readonly domainService: AuthDomainService,
  ) {}

  async execute(tempToken: string): Promise<{ success: boolean }> {
    // 1. Verify tempToken JWT and extract usuarioId
    let tempPayload: TempTokenPayload
    try {
      const decoded = jwt.verify(tempToken, TEMP_TOKEN_SECRET) as unknown as TempTokenPayload
      if (decoded.type !== '2fa') {
        throw new UnauthorizedError('Token inválido')
      }
      tempPayload = decoded
    } catch {
      throw new UnauthorizedError('Token inválido o expirado')
    }

    const usuarioId = tempPayload.usuarioId

    // 2. Generate new OTP code
    const otpCode = this.domainService.generateOtpCode()
    const expiresAt = new Date(Date.now() + TWO_FA_CODE_TTL_MINUTES * 60 * 1000)

    // 3. Save to DB (overwrites old)
    await this.authRepo.saveTwoFactorCode(usuarioId, otpCode, expiresAt)

    // 4. In real app would send via email/SMS - for now just return success
    // TODO: Integrate with email/sms service

    return { success: true }
  }
}
