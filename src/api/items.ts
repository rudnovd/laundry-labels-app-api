import { AppError } from '##/error'
import { ItemModel } from '##/models/item'
import { redis } from '##/redis'
import { NextFunction, Request, Response } from 'express'
import { constants } from 'fs'
import fs from 'fs/promises'
import { StatusCodes } from 'http-status-codes'

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
    const item = await ItemModel.findOne({ _id: req.params._id, owner: req.user?.data._id }).select('-owner').exec()

    res.status(StatusCodes.OK).send(item)
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
      await newItem.validate()
    } catch (error) {
      if (error instanceof Error)
        return next(new AppError('ERR_POST_ITEM_VALIDATION', StatusCodes.INTERNAL_SERVER_ERROR, error.message))
    }

    const item = await newItem.save()

    images.map((image: Array<string>) => redis.del(image))

    return res.status(StatusCodes.OK).send(item)
  } catch (error) {
    next(new AppError('ERR_POST_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot create new item', error))
  }
}

export async function editItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  const { icons, tags } = req.body

  try {
    const item = await ItemModel.findOne({ _id })

    if (!item)
      return next(
        new AppError('ERR_EDIT_ITEM_ITEM_NOT_FOUND', StatusCodes.INTERNAL_SERVER_ERROR, `Item with id ${_id} not found`)
      )
    if (item.owner.toString() !== req.user?.data._id)
      return next(
        new AppError(
          'ERR_EDIT_ITEM_WRONG_OWNER',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Users can edit only their own items'
        )
      )

    await item.updateOne({ icons, tags })

    const newItem = await ItemModel.findOne({ _id })

    return res.status(StatusCodes.OK).send(newItem)
  } catch (error) {
    next(new AppError('ERR_EDIT_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot edit current item', error))
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params

  try {
    const item = await ItemModel.findOne({ _id, owner: req.user?.data._id })

    if (!item) {
      return next(
        new AppError('ERR_DELETE_ITEM_NOT_FOUND', StatusCodes.INTERNAL_SERVER_ERROR, `Item with id ${_id} not found`)
      )
    }

    if (item.images && item.images.length) {
      item.images.map((image: string) => {
        fs.access(`${global.__basedir}/${image}`, constants.F_OK).then(() => fs.rm(`${global.__basedir}/${image}`))
      })
    }

    await ItemModel.deleteOne({ _id, owner: req.user?.data._id })

    return res.status(StatusCodes.OK).send(true)
  } catch (error) {
    next(new AppError('ERR_DELETE_ITEM', StatusCodes.INTERNAL_SERVER_ERROR, 'Server cannot delete current item', error))
  }
}
