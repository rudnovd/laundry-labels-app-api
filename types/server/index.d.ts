export {}

declare global {
  namespace Express {
    interface User {
      data: {
        _id: string
        email: string
      }
    }

    interface Request {
      user?: User | undefined
    }
  }
}
