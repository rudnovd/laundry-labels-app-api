import { AppError } from '@/error'
import { redis } from '@/redis'
import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'

export async function getItemImage(req: Request, res: Response, next: NextFunction) {
  try {
    res.sendFile(`${global.__basedir}/public/upload/items/${req.params.file}`)
  } catch (error) {
    next(
      new AppError(
        'ERR_UPLOAD_GET_ITEM_IMAGE',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Server cannot send this image',
        error
      )
    )
  }
}

export async function uploadItemImage(req: Request, res: Response, next: NextFunction) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new AppError('ERR_UPLOAD_POST_IMAGE', StatusCodes.BAD_REQUEST, 'No files were uploaded'))
  }

  const file = Object.values(req.files)[0]

  if (!Array.isArray(file)) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png') {
      return next(
        new AppError('ERR_UPLOAD_POST_ITEM_IMAGE_WRONG_FILE_TYPE', StatusCodes.INTERNAL_SERVER_ERROR, 'Wrong file type')
      )
    } else if (file.size > 3 * 8 * 1024 * 1024) {
      return next(
        new AppError(
          'ERR_UPLOAD_POST_ITEM_IMAGE_WRONG_FILE_SIZE',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Max file size is 3mb'
        )
      )
    }

    const fileName = randomUUID()
    const fileType = file.mimetype.split('/')[1]
    const filePath = `${global.__basedir}/public/upload/items/${fileName}.${fileType}`
    file.mv(filePath, (err) => {
      if (err && Object.keys(err).length) {
        return next(
          new AppError('ERR_UPLOAD_POST_ITEM_FILE_MV', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on upload file', err)
        )
      } else {
        redis.set(filePath, (Date.now() + ms('30m')).toString())
        return res.status(StatusCodes.OK).json({ images: [`/upload/items/${fileName}.${fileType}`] })
      }
    })
  } else {
    return next(new AppError('ERR_UPLOAD_POST_ITEM_IMAGE_IS_ARRAY', StatusCodes.BAD_REQUEST, 'No files were uploaded'))
  }
}
