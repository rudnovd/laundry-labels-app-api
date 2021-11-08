export class AppError extends Error {
  public readonly name: string
  public readonly status: number
  public readonly message: string

  constructor(name: string, status: number, message: string) {
    super()
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.status = status
    this.message = message

    Error.captureStackTrace(this)
  }
}
