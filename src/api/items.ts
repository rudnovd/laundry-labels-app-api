import type { NextFunction, Request, Response } from 'express'
import { constants } from 'fs'
import fs from 'fs/promises'
import { StatusCodes } from 'http-status-codes'
import { deleteImage, uploadImage } from '../cloudinary.js'
import { AppError } from '../error.js'
import { ItemModel } from '../models/item.js'
import { redis } from '../redis.js'

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await ItemModel.find({ owner: req.auth?.data._id }, '-owner').lean()
    res.send(items)
  } catch (error) {
    next(new AppError('ERR_GET_ITEMS', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot receive items', error))
  }
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await ItemModel.findOne({ _id: req.params._id, owner: req.auth?.data._id }, '-owner').lean()
    if (!item) {
      return next(
        new AppError('ERR_GET_ITEM_BY_ID_NOT_FOUND', StatusCodes.NOT_FOUND, `Item with id ${req.params._id} not found`)
      )
    }

    res.send(item)
  } catch (error) {
    next(new AppError('ERR_GET_ITEM_BY_ID', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot current item', error))
  }
}

export async function postItem(req: Request, res: Response, next: NextFunction) {
  const { name, icons, images, tags } = req.body

  const items = await ItemModel.find({ owner: req.auth?.data._id }, '-owner').lean().count()
  if (items >= 20) {
    return next(new AppError('ERR_POST_ITEM_MAX_ITEMS', StatusCodes.BAD_REQUEST, 'Items limit reached'))
  }

  let uploadedImages = []

  // upload images to Cloudinary
  try {
    uploadedImages = await uploadImage(images)
  } catch (error) {
    return next(
      new AppError(
        'ERR_POST_ITEM_UPLOAD_IMAGES',
        StatusCodes.BAD_REQUEST,
        'Server cannot create item with current images',
        error
      )
    )
  }

  try {
    const newItem = new ItemModel({
      name,
      icons,
      images: uploadedImages.map((image) => image.url),
      tags,
      owner: req.auth?.data._id,
    })

    try {
      const item = await newItem.save()
      // delete images from disk
      images.map((image: string) => {
        redis.del(image)
        fs.access(`${global.__basedir}${image}`, constants.F_OK)
          .then(() => fs.rm(`${global.__basedir}${image}`))
          .catch(() => `Failed to delete ${global.__basedir}${image}, file not found`)
        fs.access(`${global.__basedir}${image}.webp`, constants.F_OK)
          .then(() => fs.rm(`${global.__basedir}${image}.webp`))
          .catch(() => `Failed to delete ${global.__basedir}${image}.webp, file not found`)
      })

      return res.send(item)
    } catch (error: any) {
      return next(new AppError('ERR_POST_ITEM_VALIDATION', StatusCodes.BAD_REQUEST, error.message))
    }
  } catch (error) {
    next(new AppError('ERR_POST_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot create new item', error))
  }
}

export async function editItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  const { name, icons, tags } = req.body

  try {
    const updatedItem = await ItemModel.findOneAndUpdate({ _id, name, owner: req.auth?.data._id }, { icons, tags })

    return res.send(updatedItem)
  } catch (error) {
    next(new AppError('ERR_EDIT_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot edit current item', error))
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params

  try {
    const deletedItem = await ItemModel.findOneAndRemove({ _id, owner: req.auth?.data._id })
    if (deletedItem) {
      try {
        const ids = deletedItem.images.map((image) => {
          const imageName = image.split('/').pop()
          if (!imageName) return ''
          const imageId = imageName.split('.')[0]
          return imageId
        })

        deleteImage(ids)
      } catch (error) {
        console.error(error)
      }
    }

    return res.send(true)
  } catch (error) {
    next(new AppError('ERR_DELETE_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot delete current item', error))
  }
}
