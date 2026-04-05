import { DomainError } from './domain.error.js'

export class ForbiddenError extends DomainError {
  constructor(message = 'Sin permiso para el recurso') {
    super('FORBIDDEN', message, 403)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}
