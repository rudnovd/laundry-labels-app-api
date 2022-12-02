import { randomUUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { constants } from 'fs'
import fs from 'fs/promises'
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { AppError, Errors } from '../error.js'
import { redis } from '../redis.js'

export async function getItemImage(req: Request, res: Response, next: NextFunction) {
  try {
    await fs.access(`${global.__basedir}/upload/items/${req.params.file}`, constants.F_OK)
    res.sendFile(`${global.__basedir}/upload/items/${req.params.file}`)
  } catch (error) {
    next(new AppError(Errors.UPLOAD.GET_ITEM_IMAGE.NOT_FOUND, error))
  }
}

export async function uploadItemImage(req: Request, res: Response, next: NextFunction) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new AppError(Errors.UPLOAD.UPLOAD_ITEM_IMAGE.NO_FILES_UPLOADED))
  }

  const file = Object.values(req.files)[0]

  if (!Array.isArray(file)) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png') {
      return next(new AppError(Errors.UPLOAD.UPLOAD_ITEM_IMAGE.WRONG_FILE_TYPE))
    }

    const fileName = randomUUID()
    const fileType = file.mimetype.split('/')[1]
    const filePath = `${global.__basedir}/upload/items/${fileName}.${fileType}`
    file.mv(filePath, (err) => {
      if (err && Object.keys(err).length) {
        return next(new AppError(Errors.UPLOAD.UPLOAD_ITEM_IMAGE.FILE_MV, err))
      } else {
        redis.set(filePath, (Date.now() + ms('30m')).toString())
        return res.status(StatusCodes.OK).json({ images: [`/upload/items/${fileName}.${fileType}`] })
      }
    })
  } else {
    return next(new AppError(Errors.UPLOAD.UPLOAD_ITEM_IMAGE.NO_FILES_UPLOADED))
  }
}
