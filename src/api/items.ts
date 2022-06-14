import type { NextFunction, Request, Response } from 'express'
import { accessSync, constants, rmSync } from 'fs'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../error'
import { ItemModel } from '../models/item'
import { redis } from '../redis'

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await ItemModel.find({ owner: req.user?.data._id }, '-owner').lean()
    res.send(items)
  } catch (error) {
    next(new AppError('ERR_GET_ITEMS', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot receive items', error))
  }
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await ItemModel.findOne({ _id: req.params._id, owner: req.user?.data._id }, '-owner').lean()
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
  const { icons, images, tags } = req.body

  try {
    const newItem = new ItemModel({
      icons,
      images,
      tags,
      owner: req.user?.data._id,
    })

    try {
      const item = await newItem.save()
      images.map((image: Array<string>) => redis.del(image))

      return res.send(item)
    } catch (error: any) {
      return next(new AppError('ERR_POST_ITEM_VALIDATION', StatusCodes.INTERNAL_SERVER_ERROR, error.message))
    }
  } catch (error) {
    next(new AppError('ERR_POST_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot create new item', error))
  }
}

export async function editItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  const { icons, tags } = req.body

  try {
    const updatedItem = await ItemModel.findOneAndUpdate({ _id, owner: req.user?.data._id }, { icons, tags })

    return res.send(updatedItem)
  } catch (error) {
    next(new AppError('ERR_EDIT_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot edit current item', error))
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params

  try {
    const deletedItem = await ItemModel.findOneAndRemove({ _id, owner: req.user?.data._id })
    if (deletedItem) {
      for (const image of deletedItem.images) {
        try {
          accessSync(`${global.__basedir}${image}`, constants.F_OK)
          rmSync(`${global.__basedir}${image}`)
        } catch (error) {
          console.error(error)
        }
      }
    }

    return res.send(true)
  } catch (error) {
    next(new AppError('ERR_DELETE_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot delete current item', error))
  }
}
