import { injectable, inject } from 'tsyringe'
import { PUSH_TOKEN_REPOSITORY } from '../../domain/repositories/push-token.repository.js'
import type { IPushTokenRepository } from '../../domain/repositories/push-token.repository.js'
import { ConflictError } from '../../../../shared/errors/index.js'
import type { PushTokenResponseDto, RegistrarPushTokenBodyDto } from '../dtos/notificacion.dto.js'
import { PushTokenMapper } from '../../infrastructure/mappers/push-token.mapper.js'

@injectable()
export class RegistrarPushTokenUseCase {
  constructor(
    @inject(PUSH_TOKEN_REPOSITORY) private readonly repo: IPushTokenRepository
  ) {}

  async execute(usuarioId: number, data: RegistrarPushTokenBodyDto): Promise<PushTokenResponseDto> {
    // Check if token already exists
    const existing = await this.repo.findByToken(data.token)

    if (existing && existing.activo === 1) {
      // Token already registered
      return PushTokenMapper.toResponseDto(existing)
    }

    if (existing) {
      // Reactivate existing token
      // For now, just create new - could implement reactivation
    }

    const token = await this.repo.create({
      usuarioId,
      token: data.token,
      plataforma: data.plataforma,
    })

    return PushTokenMapper.toResponseDto(token)
  }
}
