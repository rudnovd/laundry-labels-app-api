import { NextFunction, Request, Response, Router } from 'express'
import { deleteItem, editItem, getItemById, getItems, postItem } from './api/items.js'
import { deleteProfile, getProfile, updateProfile } from './api/profile.js'
import { getItemImage, uploadItemImage } from './api/upload.js'
import { login, logout, refreshToken, registration } from './auth.js'
import { AppError, Errors } from './error.js'

async function asyncHandler(
  req: Request,
  res: Response,
  next: NextFunction,
  fn: Awaited<
    (_req: Request, _res: Response, _next: NextFunction) => Promise<void | Response<unknown, Record<string, unknown>>>
  >
) {
  try {
    await fn(req, res, next)
  } catch (error: unknown) {
    next(new AppError(Errors.COMMON.INTERNAL_SERVER_ERROR, error))
  }
}

export const authRouter = Router()
authRouter.post('/login', (req, res, next) => asyncHandler(req, res, next, login))
authRouter.post('/registration', (req, res, next) => asyncHandler(req, res, next, registration))
authRouter.post('/refreshtoken', (req, res, next) => asyncHandler(req, res, next, refreshToken))
authRouter.post('/logout', (req, res, next) => asyncHandler(req, res, next, logout))

export const apiRouter = Router()
apiRouter.get('/items', (req, res, next) => asyncHandler(req, res, next, getItems))
apiRouter.post('/items', (req, res, next) => asyncHandler(req, res, next, postItem))

apiRouter.put('/item/:_id', (req, res, next) => asyncHandler(req, res, next, editItem))
apiRouter.get('/item/:_id', (req, res, next) => asyncHandler(req, res, next, getItemById))
apiRouter.delete('/item/:_id', (req, res, next) => asyncHandler(req, res, next, deleteItem))

apiRouter.post('/upload/items', (req, res, next) => asyncHandler(req, res, next, uploadItemImage))

apiRouter.get('/profile', (req, res, next) => asyncHandler(req, res, next, getProfile))
apiRouter.put('/profile', (req, res, next) => asyncHandler(req, res, next, updateProfile))
apiRouter.delete('/profile', (req, res, next) => asyncHandler(req, res, next, deleteProfile))

export const uploadRouter = Router()
uploadRouter.get('/items/:file', (req, res, next) => asyncHandler(req, res, next, getItemImage))
