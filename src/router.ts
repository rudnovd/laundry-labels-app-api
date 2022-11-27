import { Router } from 'express'
import { deleteItem, editItem, getItemById, getItems, postItem } from './api/items.js'
import { getItemImage, uploadItemImage } from './api/upload.js'
import { login, logout, refreshToken, registration } from './auth.js'

export const authRouter = Router()
authRouter.post('/login', login)
authRouter.post('/registration', registration)
authRouter.post('/refreshtoken', refreshToken)
authRouter.post('/logout', logout)

export const apiRouter = Router()
apiRouter.get('/items', getItems)
apiRouter.post('/items', postItem)

apiRouter.put('/item/:_id', editItem)
apiRouter.get('/item/:_id', getItemById)
apiRouter.delete('/item/:_id', deleteItem)

apiRouter.post('/upload/items', uploadItemImage)

export const uploadRouter = Router()
uploadRouter.get('/items/:file', getItemImage)
