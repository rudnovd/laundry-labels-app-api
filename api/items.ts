import { AppError } from '@/error'
import { ItemModel } from '@/models/item'
import { redis } from '@/redis'
import { NextFunction, Request, Response } from 'express'

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    let items = await ItemModel.find({ owner: req.user?.data._id }).select('-owner').exec()

    res.status(200).send(items)
  } catch (error) {
    next(new AppError('ERR_GET_ITEMS', 500, 'Server cannot receive items', error))
  }
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  try {
    let item = await ItemModel.findOne({ _id: req.params._id, owner: req.user?.data._id }).select('-owner').exec()

    res.status(200).send(item)
  } catch (error) {
    next(new AppError('ERR_GET_ITEM_BY_ID', 500, 'Server cannot current item', error))
  }
}

export async function postItem(req: Request, res: Response, next: NextFunction) {
  const { icons, images, tags } = req.body

  try {
    if (images.length) images.map((image: Array<string>) => redis.del(image))

    const newItem = new ItemModel({
      icons,
      images,
      tags,
      owner: req.user?.data._id,
    })

    await newItem.validate()

    const item = await newItem.save()

    return res.status(200).send(item)
  } catch (error) {
    next(new AppError('ERR_POST_ITEM', 500, 'Server cannot create new item', error))
  }
}

export async function editItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params
  const { icons, images, tags } = req.body

  try {
    const item = await ItemModel.findOne({ _id })

    if (!item) return next(new AppError('ERR_EDIT_ITEM_ITEM_NOT_FOUND', 500, `Item with id ${_id} not found`))
    if (item.owner !== req.user?.data._id)
      return next(new AppError('ERR_EDIT_ITEM_WRONG_OWNER', 500, 'Users can edit only their own items'))

    const newItem = item.update({
      icons,
      images,
      tags,
    })

    return res.status(200).send(newItem)
  } catch (error) {
    next(new AppError('ERR_EDIT_ITEM', 500, 'Server cannot edit current item', error))
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const { _id } = req.params

  try {
    await ItemModel.deleteOne({ _id, owner: req.user?.data._id })

    return res.status(200).send(true)
  } catch (error) {
    next(new AppError('ERR_DELETE_ITEM', 500, 'Server cannot delete current item', error))
  }
}
