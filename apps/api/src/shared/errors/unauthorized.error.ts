import { DomainError } from './domain.error.js'

export class UnauthorizedError extends DomainError {
  constructor(message = 'Token ausente o inválido') {
    super('UNAUTHORIZED', message, 401)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}
