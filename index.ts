import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { NextFunction, Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import jwt from 'express-jwt'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import 'module-alias/register'
import mongoose from 'mongoose'
import morgan from 'morgan'
import ms from 'ms'
import path from 'path'
import { jwtSecret } from './config'
import { AppError } from './error'
import './redis'
import { apiRouter, authRouter, uploadRouter } from './router'

global.__basedir = path.dirname(__filename)

if (process.env.DATABASE_URL) {
  mongoose
    .connect(process.env.DATABASE_URL as string, {
      authSource: 'admin',
      dbName: process.env.DATABASE_NAME,
      auth: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
      },
    })
    .then(() => console.log(`connected to database`))
    .catch((error) => console.error(error))
} else {
  console.error('DATABASE_URL in .env not found')
}

const app = express()

app
  .use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'tiny'))
  .use(urlencoded({ extended: true }))
  .use(json())
  .use(cookieParser())
  .use(fileUpload({ createParentPath: true }))
  .use(helmet())
  .use(
    rateLimit({
      windowMs: ms('5m'),
      max: 100,
    })
  )

app
  .use(
    jwt({ secret: jwtSecret, algorithms: ['HS512'] }).unless({
      path: ['/', /^\/auth\/.*/, { url: /^\/upload\/items\/.*/, methods: ['GET'] }],
    })
  )
  .use('/auth', authRouter)
  .use('/upload', uploadRouter)
  .use('/api', apiRouter)

app.use((error: AppError, _request: Request, res: Response, _next: NextFunction) => {
  console.error(`${error.name}:${error.stack}`)
  res.status(error.status || 500).json({
    error: {
      name: error.name,
      message: error.message,
    },
  })
})

app.listen(process.env.APP_PORT || 5000, () => console.log(`The server is running on port ${process.env.APP_PORT}`))
