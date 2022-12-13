import type { NextFunction, Request, Response } from 'express'
import validator from 'validator'
import { logout } from '../auth.js'
import { AppError, Errors } from '../error.js'
import { ItemModel } from '../models/item.js'
import { UserModel } from '../models/user.js'

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  const profile = await UserModel.findOne({ _id: req.auth?.data._id }).lean()
  if (!profile) {
    return next(new AppError(Errors.PROFILE.GET_PROFILE.PROFILE_NOT_FOUND))
  }
  res.send(profile)
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body

  if (!validator.default.isEmail(email)) {
    return next(new AppError(Errors.PROFILE.UPDATE_PROFILE.WRONG_EMAIL_FORMAT))
  }

  const isEmailAlreadyRegistered = await UserModel.findOne({ email }).lean()
  if (isEmailAlreadyRegistered) {
    return next(new AppError(Errors.PROFILE.UPDATE_PROFILE.EMAIL_ALREADY_REGISTERED))
  }

  const profile = await UserModel.findOneAndUpdate({ _id: req.auth?.data._id }, { email }).lean()
  res.send(profile)
}

export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  const profile = await UserModel.findOne({ _id: req.auth?.data._id })
  if (!profile) {
    return next(new AppError(Errors.PROFILE.DELETE_PROFILE.PROFILE_NOT_FOUND))
  }

  const items = await ItemModel.find({ owner: req.auth?.data._id }, '-owner')
  for (const item of items) {
    item.remove()
  }

  await profile?.remove()
  await logout(req, res, next)
}
