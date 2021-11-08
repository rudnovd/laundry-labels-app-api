export class AppError extends Error {
  public readonly name: string
  public readonly status: number

  constructor(name: string, status: number, description: string) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.status = status

    Error.captureStackTrace(this)
  }
}
