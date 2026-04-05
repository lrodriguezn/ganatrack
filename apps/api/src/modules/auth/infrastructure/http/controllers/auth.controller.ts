import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { LoginUseCase } from '../../../application/use-cases/login.use-case.js'
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case.js'
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case.js'
import { Verify2faUseCase } from '../../../application/use-cases/verify-2fa.use-case.js'
import { Resend2faUseCase } from '../../../application/use-cases/resend-2fa.use-case.js'
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case.js'
import type { LoginDto, Verify2faDto, ChangePasswordDto, LoginResponseDto, RefreshResponseDto } from '../../../application/dtos/login.dto.js'
import { AuthMapper } from '../../mappers/auth.mapper.js'

@injectable()
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly verify2faUseCase: Verify2faUseCase,
    private readonly resend2faUseCase: Resend2faUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) {
    const result = await this.loginUseCase.execute(request.body)

    if ('requires2FA' in result) {
      return reply.code(200).send({
        success: true,
        data: AuthMapper.toTwoFactorResponse(result.tempToken),
      })
    }

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies?.refreshToken ?? (request.body as { refreshToken?: string })?.refreshToken ?? ''
    await this.logoutUseCase.execute(refreshToken)

    reply.clearCookie('refreshToken')
    return reply.code(200).send({
      success: true,
      data: { message: 'Sesión cerrada' },
    })
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies?.refreshToken ?? ''
    const result = await this.refreshTokenUseCase.execute(refreshToken)

    // Set new refresh token cookie
    reply.setCookie('refreshToken', (result as LoginResponseDto).refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    })

    return reply.code(200).send({
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: (result as LoginResponseDto).expiresIn,
      },
    })
  }

  async verify2fa(request: FastifyRequest<{ Body: Verify2faDto }>, reply: FastifyReply) {
    const result = await this.verify2faUseCase.execute(request.body)

    // Set refresh token cookie
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return reply.code(200).send({
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        usuario: result.usuario,
      },
    })
  }

  async resend2fa(request: FastifyRequest<{ Body: { tempToken: string } }>, reply: FastifyReply) {
    const result = await this.resend2faUseCase.execute(request.body.tempToken)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async changePassword(request: FastifyRequest<{ Body: ChangePasswordDto }>, reply: FastifyReply) {
    // User is injected by auth middleware
    const user = request.user as { id: number }
    await this.changePasswordUseCase.execute(user.id, request.body)

    return reply.code(200).send({
      success: true,
      data: { message: 'Contraseña actualizada' },
    })
  }
}
