import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import { AUTH_REPOSITORY } from './domain/repositories/auth.repository.js'
import type { IAuthRepository } from './domain/repositories/auth.repository.js'
import { DrizzleAuthRepository } from './infrastructure/persistence/drizzle-auth.repository.js'
import { AuthDomainService } from './domain/services/auth.domain-service.js'
import { LoginUseCase } from './application/use-cases/login.use-case.js'
import { LogoutUseCase } from './application/use-cases/logout.use-case.js'
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case.js'
import { Verify2faUseCase } from './application/use-cases/verify-2fa.use-case.js'
import { Resend2faUseCase } from './application/use-cases/resend-2fa.use-case.js'
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case.js'
import { registerAuthRoutes } from './infrastructure/http/routes/auth.routes.js'
import type { FastifyInstance } from 'fastify'

export { AUTH_REPOSITORY }
export { registerAuthRoutes }

// DI tokens for the auth module
export const AUTH_TOKENS = {
  AuthRepository: AUTH_REPOSITORY,
  DbClient: Symbol('AuthDbClient'),
}

export function registerAuthModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance(AUTH_TOKENS.DbClient, db)

  // Register repository
  container.registerSingleton<IAuthRepository>(AUTH_TOKENS.AuthRepository, DrizzleAuthRepository)

  // Register domain services
  container.registerSingleton(AuthDomainService)

  // Register use cases
  container.registerSingleton(LoginUseCase)
  container.registerSingleton(LogoutUseCase)
  container.registerSingleton(RefreshTokenUseCase)
  container.registerSingleton(Verify2faUseCase)
  container.registerSingleton(Resend2faUseCase)
  container.registerSingleton(ChangePasswordUseCase)
}

export async function registerAuthModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerAuthRoutes(app)
}
