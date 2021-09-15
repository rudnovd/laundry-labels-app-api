import { Request, Response } from 'express'
import { ItemModel } from '../models/item'

export async function getItems(req: Request, res: Response) {
  try {
    let items = await ItemModel.find({ owner: req.user?.data._id }).select('-owner').exec()

    res.status(200).send(items)
  } catch (error) {
    res.status(500).send({ error })
  }
}

export async function getItemById(req: Request, res: Response) {
  try {
    let item = await ItemModel.findOne({ _id: req.params._id, owner: req.user?.data._id }).select('-owner').exec()

    res.status(200).send(item)
  } catch (error) {
    res.status(500).send({ error })
  }
}

export async function postItem(req: Request, res: Response) {
  const { icons, images, tags } = req.body

  try {
    const newItem = new ItemModel({
      icons,
      images,
      tags,
      owner: req.user?.data._id,
    })

    const item = await newItem.save()

    return res.status(200).send(item)
  } catch (error) {
    res.status(500).send({ error: error })
  }
}

export async function deleteItem(req: Request, res: Response) {
  const { _id } = req.params

  try {
    await ItemModel.deleteOne({ _id, owner: req.user?.data._id })

    return res.status(200).send(true)
  } catch (error) {
    res.status(500).send({ error })
  }
}
