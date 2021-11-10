export class AppError extends Error {
  public readonly name: string
  public readonly status: number
  public readonly message: string
  public readonly originalError: unknown | undefined

  constructor(name: string, status: number, message: string, originalError?: unknown) {
    super()
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.status = status
    this.message = message
    this.originalError = originalError

    Error.captureStackTrace(this)
  }
}
