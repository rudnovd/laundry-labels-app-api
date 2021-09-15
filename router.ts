import { Router } from 'express'
import { deleteItem, getItemById, getItems, postItem } from './api/items'
import { login, logout, refreshToken, registration } from './auth'

export const publicRouter = Router()
publicRouter.post('/auth/login', login)
publicRouter.post('/auth/registration', registration)
publicRouter.post('/auth/refreshtoken', refreshToken)
publicRouter.post('/auth/logout', logout)

export const apiRouter = Router()
apiRouter.get('/items', getItems)
apiRouter.post('/items', postItem)

apiRouter.get('/item/:_id', getItemById)
apiRouter.delete('/item/:_id', deleteItem)
