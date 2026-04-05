import { inject, injectable } from 'tsyringe'
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.js'
import type { IAuthRepository } from '../../domain/repositories/auth.repository.js'

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await this.authRepo.revokeRefreshToken(refreshToken)
    }
  }
}
