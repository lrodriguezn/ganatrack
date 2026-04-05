export class DomainError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details: Record<string, string[]>

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    details: Record<string, string[]> = {},
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, DomainError.prototype)
  }
}
