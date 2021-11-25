/* eslint-disable no-var */
export {}

declare global {
  var __basedir: string

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
