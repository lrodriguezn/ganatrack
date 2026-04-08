import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
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

export function registerAuthModule(): void {
  // No DI - instances created on-demand in routes
}

export async function registerAuthModuleRoutes(app: FastifyInstance): Promise<void> {
  // Create instances on-demand for this route registration
  const db = createClient()
  const authRepo: IAuthRepository = new DrizzleAuthRepository(db)
  const domainService = new AuthDomainService()

  const loginUseCase = new LoginUseCase(authRepo, domainService)
  const logoutUseCase = new LogoutUseCase(authRepo)
  const refreshTokenUseCase = new RefreshTokenUseCase(authRepo)
  const verify2faUseCase = new Verify2faUseCase(authRepo, domainService)
  const resend2faUseCase = new Resend2faUseCase(authRepo)
  const changePasswordUseCase = new ChangePasswordUseCase(authRepo)

  await registerAuthRoutes(app, {
    loginUseCase,
    logoutUseCase,
    refreshTokenUseCase,
    verify2faUseCase,
    resend2faUseCase,
    changePasswordUseCase,
  })
}
