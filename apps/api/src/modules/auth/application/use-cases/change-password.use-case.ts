import { injectable, inject } from 'tsyringe'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'
import { AuthDomainService } from '../../domain/services/auth.domain-service.js'
import { UnauthorizedError } from '../../../../shared/errors/index.js'
import { verifyPassword, hashPassword } from '../../../../shared/utils/password.utils.js'
import type { ChangePasswordDto } from '../dtos/login.dto.js'

const PASSWORD_HISTORY_LIMIT = 5

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    private readonly domainService: AuthDomainService,
  ) {}

  async execute(usuarioId: number, dto: ChangePasswordDto): Promise<void> {
    // 1. Get current password hash
    const currentHash = await this.authRepo.getContrasenaHash(usuarioId)
    if (!currentHash) {
      throw new UnauthorizedError('Credenciales inválidas')
    }

    // 2. Verify current password
    const isValid = await verifyPassword(dto.passwordActual, currentHash)
    if (!isValid) {
      throw new UnauthorizedError('Credenciales inválidas')
    }

    // 3. Validate new password strength
    this.domainService.validatePasswordStrength(dto.passwordNuevo)

    // 4. Check new password not in history (last 5)
    const history = await this.authRepo.getPasswordHistory(usuarioId, PASSWORD_HISTORY_LIMIT)
    await this.domainService.validatePasswordNotInHistory(dto.passwordNuevo, history)

    // 5. Hash new password
    const newHash = await hashPassword(dto.passwordNuevo)

    // 6. Update password in DB
    await this.authRepo.updatePassword(usuarioId, newHash)

    // 7. Save old hash to history
    await this.authRepo.savePasswordHistory(usuarioId, currentHash)

    // 8. Revoke all refresh tokens for this user (security measure)
    await this.authRepo.revokeAllUserTokens(usuarioId)
  }
}
