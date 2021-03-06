import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import fileUpload from 'express-fileupload'
import { expressjwt } from 'express-jwt'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import morgan from 'morgan'
import ms from 'ms'
import path from 'path'
import { jwtSecret } from './config'
import type { AppError } from './error'
import { logger } from './logger'
import './redis'
import { apiRouter, authRouter, uploadRouter } from './router'

global.__basedir = path.dirname(__filename)

if (process.env.DATABASE_URI) {
  mongoose
    .connect(process.env.DATABASE_URI as string)
    .then(() => logger.info(`Server: connected to database`))
    .catch((error) => logger.error(`Server: ${error}`))
} else {
  logger.error('Server: DATABASE_URL in .env not found')
  throw new Error('DATABASE_URL in .env not found')
}

const app = express()

morgan.token('user', (req: Request) => (req.auth?.data._id ? `user - ${req.auth.data._id}` : ''))
app
  .use(
    morgan(':method :url :status - :response-time ms :user', {
      stream: { write: (message) => logger.http(message.substring(0, message.lastIndexOf('\n'))) },
    })
  )
  .use(urlencoded({ extended: true }))
  .use(json())
  .use(cookieParser())
  .use(
    fileUpload({
      createParentPath: true,
      abortOnLimit: true,
      limits: { fileSize: 15 * 1024 * 1024 }, //5mb,
    })
  )
  .use(helmet())
  .use(
    rateLimit({
      windowMs: ms('5m'),
      max: 100,
    })
  )

app
  .use(
    expressjwt({ secret: jwtSecret, algorithms: ['HS512'] }).unless({
      path: ['/', /^\/auth\/.*/, { url: /^\/upload\/items\/.*/, methods: ['GET'] }],
    })
  )
  .use('/auth', authRouter)
  .use('/upload', uploadRouter)
  .use(apiRouter)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: AppError, _request: Request, res: Response, _: NextFunction) => {
  let logMessage = `Code: ${error.name}; message: ${error.message};`

  const originalError = (error.originalError as Error) || ''
  if (originalError) logMessage += ` original stack: ${originalError.stack}`

  logger.error(logMessage)
  res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: {
      name: error.name,
      message: error.message,
    },
  })
})

app.listen(process.env.PORT || 5000, () => {
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`)
  logger.info(`Server: The server is running on port ${process.env.PORT}`)
})
