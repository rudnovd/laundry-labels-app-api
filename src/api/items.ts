import type { NextFunction, Request, Response } from 'express'
import { constants } from 'fs'
import fs from 'fs/promises'
import { deleteImage, uploadImage } from '../cloudinary.js'
import { AppError, Errors } from '../error.js'
import { ItemModel } from '../models/item.js'
import { redis } from '../redis.js'

export async function getItems(req: Request, res: Response, next: NextFunction) {
  const items = await ItemModel.find({ owner: req.auth?.data._id }, '-owner').lean()
  res.send(items)
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  const item = await ItemModel.findOne({ _id: req.params._id, owner: req.auth?.data._id }, '-owner').lean()
  console.log(item)
  if (!item) {
    return next(new AppError(Errors.ITEMS.GET_BY_ID.ITEM_NOT_FOUND))
  }

  res.send(item)
}

export async function postItem(req: Request, res: Response, next: NextFunction) {
  const { name, icons, images, tags } = req.body

  const items = await ItemModel.find({ owner: req.auth?.data._id }, '-owner').lean().count()
  if (items >= 20) {
    return next(new AppError(Errors.ITEMS.POST_ITEM.LIMIT_REACHED))
  }

  let uploadedImages = []

  // upload images to Cloudinary
  try {
    uploadedImages = await uploadImage(images)
  } catch (error) {
    return next(new AppError(Errors.ITEMS.POST_ITEM.UPLOAD_IMAGES, error))
  }

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
    return next(new AppError(Errors.ITEMS.POST_ITEM.ITEM_VALIDATION_ERROR, error.message))
  }
}

export async function editItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  const { name, icons, tags } = req.body

  const updatedItem = await ItemModel.findOneAndUpdate({ _id, name, owner: req.auth?.data._id }, { icons, tags })

  return res.send(updatedItem)
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params

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
}
