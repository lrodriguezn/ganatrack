import { injectable, inject } from 'tsyringe'
import { PUSH_TOKEN_REPOSITORY } from '../../domain/repositories/push-token.repository.js'
import type { IPushTokenRepository } from '../../domain/repositories/push-token.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class EliminarPushTokenUseCase {
  constructor(
    @inject(PUSH_TOKEN_REPOSITORY) private readonly repo: IPushTokenRepository
  ) {}

  async execute(usuarioId: number, token: string): Promise<void> {
    const existing = await this.repo.findByToken(token)

    if (!existing || existing.activo !== 1) {
      throw new NotFoundError('Token de push', 0)
    }

    if (existing.usuarioId !== usuarioId) {
      throw new NotFoundError('Token de push', 0)
    }

    await this.repo.deleteByToken(token)
  }
}
