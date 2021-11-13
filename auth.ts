import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { verify } from 'hcaptcha'
import { StatusCodes } from 'http-status-codes'
import { sign } from 'jsonwebtoken'
import ms from 'ms'
import { jwtSecret } from './config'
import { AppError } from './error'
import { RefreshTokenModel } from './models/refreshTokens'
import { User, UserModel } from './models/user'

async function createRefreshToken(payload: { user: User }) {
  try {
    const expiresDate = new Date().getTime() + ms('60 days')

    const newRefreshToken = new RefreshTokenModel({
      userId: payload.user._id,
      token: randomUUID(),
      expiresIn: parseInt(expiresDate.toString()),
    })

    const { token, expiresIn } = await newRefreshToken.save()

    return {
      token,
      expiresIn,
    }
  } catch (error) {
    throw error
  }
}

function createAccessToken(req: Request, payload: { user: User }) {
  return sign({ data: { _id: payload.user._id, email: payload.user.email } }, jwtSecret, {
    algorithm: 'HS512',
    expiresIn: '30m',
    issuer: req.hostname,
    subject: payload.user._id.toString(),
  })
}

async function verifyCaptcha(token: string): Promise<Boolean> {
  if (!process.env.CAPTCHA_SECRET_KEY) throw new Error('process.env.CAPTCHA_SECRET_KEY not found')
  try {
    const verificationResult = await verify(process.env.CAPTCHA_SECRET_KEY, token)
    return verificationResult.success
  } catch {
    return false
  }
}

export async function registration(req: Request, res: Response, next: NextFunction) {
  let { email, password, token } = req.body

  try {
    if (!email || !password) {
      return next(
        new AppError('ERR_AUTH_REGISTARTION_NO_EMAIL_OR_PASSWORD', StatusCodes.BAD_REQUEST, `No email or password`)
      )
    }
    if (!token)
      return next(
        new AppError('ERR_AUTH_LOGIN_CAPTCHA_TOKEN_NOT_FOUND', StatusCodes.BAD_REQUEST, 'Captcha token not found')
      )
    if (!(await verifyCaptcha(token)))
      return next(new AppError('ERR_AUTH_LOGIN_CAPTCHA_WRONG_VERIFY', StatusCodes.BAD_REQUEST, 'Wrong captcha result'))

    const currentUser = await UserModel.find({ email })
    if (!currentUser.length) {
      password = await bcrypt.hash(password, 10)
      const newUser = new UserModel({
        email,
        password,
      })
      const user = await newUser.save()
      return res.status(StatusCodes.OK).send(user)
    } else {
      return next(
        new AppError('ERR_AUTH_REGISTARTION_EMAIL_ALREADY_EXIST', StatusCodes.NOT_ACCEPTABLE, 'Email already exist')
      )
    }
  } catch (error) {
    next(new AppError('ERR_AUTH_REGISTARTION', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on registation', error))
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password, token } = req.body

  try {
    const user = await UserModel.findOne({ email }).select('+password').exec()

    if (!user)
      return next(new AppError('ERR_AUTH_LOGIN_USER_NOT_FOUND', StatusCodes.INTERNAL_SERVER_ERROR, 'User not found'))
    if (!token)
      return next(
        new AppError(
          'ERR_AUTH_LOGIN_CAPTCHA_TOKEN_NOT_FOUND',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Captcha token not found'
        )
      )
    if (!(await verifyCaptcha(token)))
      return next(
        new AppError('ERR_AUTH_LOGIN_CAPTCHA_WRONG_VERIFY', StatusCodes.INTERNAL_SERVER_ERROR, 'Wrong captcha result')
      )

    if (await bcrypt.compare(password, user.password)) {
      const { token, expiresIn } = await createRefreshToken({ user })
      res.cookie('refreshToken', token, { httpOnly: true, expires: new Date(expiresIn) })
      res.status(StatusCodes.OK).send({
        user: await UserModel.findOne({ email }),
        accessToken: createAccessToken(req, { user }),
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
    if (!token)
      return next(
        new AppError(
          'ERR_AUTH_REFRESHTOKEN_REFRESHTOKEN_NOT_FOUND',
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Refresh token not found'
        )
      )

    await RefreshTokenModel.deleteOne({ token: token.token })
    if (token.expiresIn < new Date().getTime())
      return next(
        new AppError('ERR_AUTH_REFRESHTOKEN_TOKEN_EXPIRED', StatusCodes.INTERNAL_SERVER_ERROR, 'Token expired')
      )

    const user = await UserModel.findOne({ _id: token.userId })
    if (!user)
      return next(
        new AppError('ERR_AUTH_REFRESHTOKEN_USER_NOT_FOUND', StatusCodes.INTERNAL_SERVER_ERROR, 'User not found')
      )

    const newRefreshToken = await createRefreshToken({ user })

    res.cookie('refreshToken', newRefreshToken.token, {
      httpOnly: true,
      expires: new Date(newRefreshToken.expiresIn),
    })
    return res.status(StatusCodes.OK).send({
      user,
      accessToken: createAccessToken(req, { user }),
      refreshToken: newRefreshToken.token,
    })
  } catch (error) {
    next(new AppError('ERR_AUTH_REFRESHTOKEN', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on refreshtoken', error))
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies)
    return next(new AppError('ERR_AUTH_LOGOUT', StatusCodes.INTERNAL_SERVER_ERROR, '"refreshToken" cookie required'))
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

    await RefreshTokenModel.deleteOne({ token: token.token })

    return res.status(StatusCodes.OK).send(true)
  } catch (error) {
    next(new AppError('ERR_AUTH_LOGOUT', StatusCodes.INTERNAL_SERVER_ERROR, 'Error on logout', error))
  }
}
