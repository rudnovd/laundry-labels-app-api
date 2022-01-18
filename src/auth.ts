import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { verify } from 'hcaptcha'
import { StatusCodes } from 'http-status-codes'
import { sign } from 'jsonwebtoken'
import ms from 'ms'
import validator from 'validator'
import { jwtSecret } from './config'
import { AppError } from './error'
import { RefreshToken, RefreshTokenModel } from './models/refreshTokens'
import { UserModel } from './models/user'

async function createRefreshToken(userId: string): Promise<RefreshToken> {
  try {
    const expiresDate = new Date().getTime() + ms('60 days')
    const refreshToken = new RefreshTokenModel({
      userId,
      token: randomUUID(),
      expiresIn: parseInt(expiresDate.toString()),
    })
    return await refreshToken.save()
  } catch (error) {
    throw error
  }
}

function createAccessToken(payload: { issuer: string; userId: string }) {
  return sign({ data: { _id: payload.userId } }, jwtSecret, {
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
    return next(new AppError('ERR_AUTH_REGISTARTION_VALIDATION', StatusCodes.BAD_REQUEST, `No email or password`))
  }
  if (!validator.isEmail(email)) {
    return next(new AppError('ERR_AUTH_REGISTARTION_VALIDATION', StatusCodes.BAD_REQUEST, `Wrong email format`))
  } else if (password.length < 5) {
    return next(
      new AppError('ERR_AUTH_REGISTARTION_VALIDATION', StatusCodes.BAD_REQUEST, `Password must be more than 5 symbols`)
    )
  }

  try {
    if (process.env.NODE_ENV !== 'development') {
      if (!token) {
        return next(
          new AppError('ERR_AUTH_LOGIN_CAPTCHA_TOKEN_NOT_FOUND', StatusCodes.BAD_REQUEST, 'Captcha token not found')
        )
      }
      if (!(await verifyCaptcha(token))) {
        return next(
          new AppError('ERR_AUTH_LOGIN_CAPTCHA_WRONG_VERIFY', StatusCodes.BAD_REQUEST, 'Wrong captcha result')
        )
      }
    }

    const currentUser = await UserModel.findOne({ email }).lean()
    if (currentUser) {
      return next(
        new AppError('ERR_AUTH_REGISTARTION_EMAIL_ALREADY_EXIST', StatusCodes.NOT_ACCEPTABLE, 'Email already exist')
      )
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
  } catch (error) {
    next(new AppError('ERR_AUTH_REGISTARTION', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on registation', error))
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password, token } = req.body

  if (!email || !validator.isEmail(email)) {
    return next(new AppError('ERR_AUTH_REGISTARTION_VALIDATION', StatusCodes.BAD_REQUEST, `Wrong email format`))
  } else if (!password) {
    return next(new AppError('ERR_AUTH_REGISTARTION_VALIDATION', StatusCodes.BAD_REQUEST, `Password is required`))
  }

  try {
    const user = await UserModel.findOne({ email }, '+password').lean()
    if (!user) return next(new AppError('ERR_AUTH_LOGIN_USER_NOT_FOUND', StatusCodes.NOT_FOUND, 'User not found'))

    if (process.env.NODE_ENV !== 'development') {
      if (!token) {
        return next(
          new AppError(
            'ERR_AUTH_LOGIN_CAPTCHA_TOKEN_NOT_FOUND',
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Captcha token not found'
          )
        )
      }
      if (!(await verifyCaptcha(token))) {
        return next(
          new AppError('ERR_AUTH_LOGIN_CAPTCHA_WRONG_VERIFY', StatusCodes.INTERNAL_SERVER_ERROR, 'Wrong captcha result')
        )
      }
    }

    if (await bcrypt.compare(password, user.password)) {
      const newRefreshToken = await createRefreshToken(user._id)
      res.cookie('refreshToken', newRefreshToken.token, {
        httpOnly: true,
        expires: new Date(newRefreshToken.expiresIn),
      })

      res.send({
        user: {
          _id: user._id,
          isDisabled: user.isDisabled,
        },
        accessToken: createAccessToken({ issuer: req.hostname, userId: user._id.toString() }),
        refreshToken,
      })
    } else {
      return next(
        new AppError(
          'ERR_AUTH_LOGIN_WRONG_EMAIL_OR_PASSWORD',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Wrong email or password'
        )
      )
    }
  } catch (error) {
    next(new AppError('ERR_AUTH_LOGIN', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on login', error))
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies)
    return next(
      new AppError(
        'ERR_AUTH_REFRESHTOKEN_COOKIE_REQUIRED',
        StatusCodes.INTERNAL_SERVER_ERROR,
        '"refreshToken" cookie required'
      )
    )
  const { refreshToken } = req.cookies

  if (!refreshToken)
    return next(
      new AppError(
        'ERR_AUTH_REFRESHTOKEN_REFRESHTOKEN_NOT_FOUND',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Refresh token not found'
      )
    )

  try {
    const token = await RefreshTokenModel.findOne({ token: refreshToken })
    if (!token) {
      return next(
        new AppError(
          'ERR_AUTH_REFRESHTOKEN_REFRESHTOKEN_NOT_FOUND',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Refresh token not found'
        )
      )
    }

    if (token.expiresIn < new Date().getTime()) {
      token.delete()
      return next(
        new AppError('ERR_AUTH_REFRESHTOKEN_TOKEN_EXPIRED', StatusCodes.INTERNAL_SERVER_ERROR, 'Token expired')
      )
    }

    const user = await UserModel.findOne({ _id: token.userId }).lean()
    if (!user) {
      return next(
        new AppError('ERR_AUTH_REFRESHTOKEN_USER_NOT_FOUND', StatusCodes.INTERNAL_SERVER_ERROR, 'User not found')
      )
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
  } catch (error) {
    next(new AppError('ERR_AUTH_REFRESHTOKEN', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on refreshtoken', error))
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies) {
    return next(new AppError('ERR_AUTH_LOGOUT', StatusCodes.INTERNAL_SERVER_ERROR, '"refreshToken" cookie required'))
  }
  const { refreshToken } = req.cookies

  try {
    const token = await RefreshTokenModel.findOne({ token: refreshToken })
    if (!token) {
      return next(
        new AppError(
          'ERR_AUTH_LOGOUT_REFRESHTOKEN_NOT_FOUND',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Refresh token not found'
        )
      )
    }
    await token.delete()

    return res.send(true)
  } catch (error) {
    next(new AppError('ERR_AUTH_LOGOUT', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on logout', error))
  }
}
