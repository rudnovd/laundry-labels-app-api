import { randomUUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import type { UploadedFile } from 'express-fileupload'
import { constants } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { uploadToCloudinary } from '../cloudinary.js'
import { config } from '../config.js'
import { AppError, Errors } from '../error.js'

export async function getItemImage(req: Request, res: Response, next: NextFunction) {
  try {
    await fs.access(`${config.uploadPath}/${req.params.file}`, constants.F_OK)
    res.sendFile(`${config.uploadPath}/${req.params.file}`, { root: path.dirname(__basedir) })
  } catch (error) {
    next(new AppError(Errors.UPLOAD.GET_ITEM_IMAGE.NOT_FOUND, error))
  }
}

export async function uploadItemImage(req: Request, res: Response, next: NextFunction) {
  if (!req.files || !Object.keys(req.files)) {
    return next(new AppError(Errors.UPLOAD.UPLOAD_ITEM_IMAGE.NO_FILES_UPLOADED))
  }

  let file: UploadedFile
  if (Array.isArray(req.files)) {
    const firstFile = req.files[0]
    file = req.files[Object.keys(firstFile)[0]] as UploadedFile
  } else {
    file = req.files[Object.keys(req.files)[0]] as UploadedFile
  }

  const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/avif']

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return next(new AppError(Errors.UPLOAD.UPLOAD_ITEM_IMAGE.WRONG_FILE_TYPE))
  }

  const fileBuffer = await sharp(file.data).webp({ quality: 15 }).toBuffer()

  if (process.env.IS_CLOUD_SERVER) {
    const uploadedFile = await uploadToCloudinary(fileBuffer)
    res.json({ url: uploadedFile?.url ?? '' })
  } else {
    const fileName = randomUUID()
    const filePath = `${config.uploadPath}/${fileName}.webp`
    fs.writeFile(filePath, fileBuffer)
    return res.json({ url: `/upload/items/${fileName}.webp` })
  }
}
