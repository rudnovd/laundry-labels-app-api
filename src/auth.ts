import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { verify } from 'hcaptcha'
import jwt from 'jsonwebtoken'
import ms from 'ms'
import validator from 'validator'
import { config } from './config.js'
import { AppError, Errors } from './error.js'
import { RefreshToken, RefreshTokenModel } from './models/refreshTokens.js'
import { UserModel } from './models/user.js'

async function createRefreshToken(userId: string): Promise<RefreshToken> {
  try {
    const expiresIn = new Date().getTime() + ms('60 days')
    const refreshToken = new RefreshTokenModel({
      userId,
      token: randomUUID(),
      expiresIn,
    })
    return await refreshToken.save()
  } catch (error) {
    throw error
  }
}

function createAccessToken(payload: { issuer: string; userId: string }) {
  return jwt.sign({ data: { _id: payload.userId } }, config.jwtSecret, {
    algorithm: 'HS512',
    expiresIn: '30m',
    issuer: payload.issuer,
    subject: payload.userId,
  })
}

async function verifyCaptcha(token: string): Promise<boolean> {
  if (!process.env.CAPTCHA_SECRET_KEY) throw new Error('process.env.CAPTCHA_SECRET_KEY not found')
  try {
    const verificationResult = await verify(process.env.CAPTCHA_SECRET_KEY, token)
    return verificationResult.success
  } catch {
    return false
  }
}

export async function registration(req: Request, res: Response, next: NextFunction) {
  const { email, password, token } = req.body

  if (!email || !password) {
    return next(new AppError(Errors.AUTH.REGISTRATION.EMAIL_AND_PASSWORD_ARE_REQUIRED))
  }
  if (!validator.default.isEmail(email)) {
    return next(new AppError(Errors.AUTH.REGISTRATION.WRONG_EMAIL_FORMAT))
  } else if (password.length < 6) {
    return next(new AppError(Errors.AUTH.REGISTRATION.WRONG_PASSWORD_LENGTH))
  }

  if (process.env.NODE_ENV !== 'development') {
    if (!token) {
      return next(new AppError(Errors.AUTH.REGISTRATION.CAPTCHA_TOKEN_NOT_FOUND))
    }
    if (!(await verifyCaptcha(token))) {
      return next(new AppError(Errors.AUTH.REGISTRATION.CAPTCHA_WRONG_VERIFY))
    }
  }

  const userWithEnteredEmail = await UserModel.findOne({ email }).lean()
  if (userWithEnteredEmail) {
    return next(new AppError(Errors.AUTH.REGISTRATION.EMAIL_ALREADY_REGISTERED))
  }

  const newUser = new UserModel({
    email,
    password: await bcrypt.hash(password, 10),
  })
  const user = await newUser.save()

  const newRefreshToken = await createRefreshToken(user._id)
  res.cookie('refreshToken', newRefreshToken.token, { httpOnly: true, expires: new Date(newRefreshToken.expiresIn) })
  res.send({
    user,
    accessToken: createAccessToken({ issuer: req.hostname, userId: user._id.toString() }),
    refreshToken,
  })
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password, token } = req.body

  if (!email) {
    return next(new AppError(Errors.AUTH.LOGIN.NO_EMAIL))
  } else if (!validator.default.isEmail(email)) {
    return next(new AppError(Errors.AUTH.LOGIN.WRONG_EMAIL_FORMAT))
  } else if (!password) {
    return next(new AppError(Errors.AUTH.LOGIN.PASSWORD_IS_REQUIRED))
  }

  const user = await UserModel.findOne({ email }, '+password').lean()
  if (!user) {
    return next(new AppError(Errors.AUTH.LOGIN.USER_NOT_FOUND))
  }

  if (process.env.NODE_ENV !== 'development') {
    if (!token) {
      return next(new AppError(Errors.AUTH.LOGIN.CAPTCHA_TOKEN_NOT_FOUND))
    }
    if (!(await verifyCaptcha(token))) {
      return next(new AppError(Errors.AUTH.LOGIN.CAPTCHA_WRONG_VERIFY))
    }
  }

  const isPasswordRight = await bcrypt.compare(password, user.password)
  if (isPasswordRight && !user.isDisabled) {
    const newRefreshToken = await createRefreshToken(user._id)
    res.cookie('refreshToken', newRefreshToken.token, {
      httpOnly: true,
      expires: new Date(newRefreshToken.expiresIn),
    })

    return res.send({
      user: {
        _id: user._id,
        isDisabled: user.isDisabled,
      },
      accessToken: createAccessToken({ issuer: req.hostname, userId: user._id.toString() }),
      refreshToken,
    })
  } else if (isPasswordRight && user.isDisabled) {
    return next(new AppError(Errors.AUTH.LOGIN.USER_IS_DISABLED))
  } else if (!isPasswordRight) {
    return next(new AppError(Errors.AUTH.LOGIN.WRONG_EMAIL_OR_PASSWORD))
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies) {
    return next(Errors.COMMON.COOKIES_NOT_FOUND)
  }
  const { refreshToken } = req.cookies
  if (!refreshToken) {
    return next(new AppError(Errors.AUTH.REFRESHTOKEN.REFRESHTOKEN_COOKIE_NOT_FOUND))
  }

  const token = await RefreshTokenModel.findOne({ token: refreshToken })
  if (!token) {
    return next(new AppError(Errors.AUTH.REFRESHTOKEN.REFRESHTOKEN_NOT_FOUND))
  }

  if (token.expiresIn < new Date().getTime()) {
    token.delete()
    return next(new AppError(Errors.AUTH.REFRESHTOKEN.TOKEN_EXPIRED))
  }

  const user = await UserModel.findOne({ _id: token.userId }).lean()
  if (!user) {
    return next(new AppError(Errors.AUTH.REFRESHTOKEN.USER_NOT_FOUND))
  } else if (user.isDisabled) {
    return next(Errors.AUTH.REFRESHTOKEN.USER_DISABLED)
  }

  const newRefreshToken = await createRefreshToken(user._id)
  res.cookie('refreshToken', newRefreshToken.token, {
    httpOnly: true,
    expires: new Date(newRefreshToken.expiresIn),
  })
  token.delete()

  return res.send({
    user: {
      _id: user._id,
      isDisabled: user.isDisabled,
    },
    accessToken: createAccessToken({ issuer: req.hostname, userId: user._id.toString() }),
    refreshToken: newRefreshToken.token,
  })
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies) {
    return next(new AppError(Errors.COMMON.COOKIES_NOT_FOUND))
  }
  const { refreshToken } = req.cookies
  if (!refreshToken) {
    return next(Errors.AUTH.LOGOUT.REFRESHTOKEN_COOKIE_NOT_FOUND)
  }

  await RefreshTokenModel.findOneAndDelete({ token: refreshToken }).lean()
  return res.send(true)
}
