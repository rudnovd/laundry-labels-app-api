import type { NextFunction, Request, Response } from 'express'
import { access, constants, rm } from 'fs/promises'
import { isValidObjectId } from 'mongoose'
import { deleteFromCloudinary } from '../cloudinary.js'
import { AppError, Errors } from '../error.js'
import { ItemModel } from '../models/item.js'

export async function getItems(req: Request, res: Response, _next: NextFunction) {
  const items = await ItemModel.find({ owner: req.auth?.data._id }).lean()
  res.send(items)
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  if (!isValidObjectId(_id)) {
    return next(new AppError(Errors.ITEMS.COMMON.INVALID_ID))
  }

  const item = await ItemModel.findOne({ _id, owner: req.auth?.data._id }, '-owner').lean()
  if (!item) {
    return next(new AppError(Errors.ITEMS.COMMON.ITEM_NOT_FOUND))
  }

  res.send(item)
}

export async function postItem(req: Request, res: Response, next: NextFunction) {
  const { name, icons, images, tags } = req.body

  const items = await ItemModel.find({ owner: req.auth?.data._id }, '-owner').lean().count()
  if (items >= 20) {
    return next(new AppError(Errors.ITEMS.POST_ITEM.LIMIT_REACHED))
  }

  const newItem = new ItemModel({
    name,
    icons,
    images,
    tags,
    owner: req.auth?.data._id,
  })

  await newItem.validate()

  try {
    const item = await newItem.save()

    return res.send(item)
  } catch (error: unknown) {
    return next(new AppError(Errors.ITEMS.POST_ITEM.ITEM_VALIDATION_ERROR, error))
  }
}

export async function editItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  const { name, icons, tags } = req.body

  if (!isValidObjectId(_id)) {
    return next(new AppError(Errors.ITEMS.COMMON.INVALID_ID))
  }

  const updatedItem = await ItemModel.findOneAndUpdate({ _id, owner: req.auth?.data._id }, { name, icons, tags })
  if (!updatedItem) {
    return next(new AppError(Errors.ITEMS.COMMON.ITEM_NOT_FOUND))
  }

  return res.send(updatedItem)
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  if (!isValidObjectId(_id)) {
    return next(new AppError(Errors.ITEMS.COMMON.INVALID_ID))
  }

  const deletedItem = await ItemModel.findOneAndRemove({ _id, owner: req.auth?.data._id })
  if (!deletedItem) {
    return next(new AppError(Errors.ITEMS.COMMON.ITEM_NOT_FOUND))
  }

  const isCloudImages = deletedItem.images.some((image) => image.indexOf('cloudinary') !== -1)

  if (isCloudImages) {
    const idsForDelete: Array<string> = []
    deletedItem.images.forEach((url) => {
      const pathname = new URL(url).pathname
      const image = pathname.split('/').pop()
      const id = image?.split('.')[0]

      if (id) {
        idsForDelete.push(id)
      }
    })

    try {
      deleteFromCloudinary(idsForDelete)
    } catch (error) {
      console.error(error)
    }
  } else {
    deletedItem.images.forEach((path) => {
      access(`${global.__basedir}${path}`, constants.F_OK).then(() => rm(`${global.__basedir}${path}`))
    })
  }

  return res.send(true)
}
