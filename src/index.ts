import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import fileUpload from 'express-fileupload'
import { expressjwt } from 'express-jwt'
import rateLimit from 'express-rate-limit'
import { access, constants } from 'fs/promises'
import helmet from 'helmet'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import morgan from 'morgan'
import ms from 'ms'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config.js'
import type { AppError } from './error.js'
import { logger } from './logger.js'
import './redis.js'
import { apiRouter, authRouter, uploadRouter } from './router.js'

const __filename = fileURLToPath(import.meta.url)
global.__basedir = path.dirname(__filename)

if (config.databaseURI) {
  mongoose.set({ sanitizeFilter: true, strictQuery: false })
  mongoose
    .connect(config.databaseURI)
    .then(() => logger.info(`Server: connected to database`))
    .catch((error) => logger.error(`Server: ${error}`))
} else {
  throw new Error('DATABASE_URI not found in .env file')
}

if (!process.env.IS_CLOUD_SERVER) {
  access(config.uploadPath, constants.F_OK).catch(() => {
    throw new Error('Upload directory are not created')
  })
  access(config.logsPath, constants.F_OK).catch(() => {
    throw new Error('Logs directory are not created')
  })
}

export const app = express()

morgan.token('user', (req: Request) => (req.auth?.data._id ? `user - ${req.auth.data._id}` : ''))
app
  .use(
    morgan(':method :url :status - :response-time ms :user', {
      stream: { write: (message) => logger.http(message.substring(0, message.lastIndexOf('\n'))) },
    })
  )
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(cookieParser())
  .use(
    fileUpload({
      createParentPath: true,
      abortOnLimit: true,
      limits: { fileSize: 15 * 1024 * 1024 }, //15mb,
    })
  )
  .use(helmet())
  .use(
    rateLimit({
      windowMs: ms('1m'),
      max: 50,
    })
  )

app
  .use(
    expressjwt({ secret: config.jwtSecret, algorithms: ['HS512'] }).unless({
      path: ['/', /^\/auth\/.*/, { url: /^\/upload\/items\/.*/, methods: ['GET'] }],
    })
  )
  .use('/auth', authRouter)
  .use('/upload', uploadRouter)
  .use('/api', apiRouter)
  .use('/', (_, res) => res.send())
  .use((error: AppError, _request: Request, res: Response, _next: NextFunction) => {
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
