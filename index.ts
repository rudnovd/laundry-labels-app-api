import { urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import jwt from 'express-jwt'
import helmet from 'helmet'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { jwtSecret } from './config'
import { apiRouter, publicRouter } from './router'

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
  .use(cookieParser())
  .use(helmet())

app
  .use(
    jwt({ secret: jwtSecret, algorithms: ['HS512'] }).unless({
      path: ['/', ...publicRouter.stack.map((route) => route.route.path)],
    })
  )
  .use(publicRouter)
  .use('/api', apiRouter)

app.listen(process.env.APP_PORT || 5000, () => console.log(`The server is running on port ${process.env.APP_PORT}`))
