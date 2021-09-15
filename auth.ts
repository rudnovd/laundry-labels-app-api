import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import ms from 'ms'
import { jwtSecret } from './config'
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
    issuer: req.hostname,
    subject: payload.user._id.toString(),
    expiresIn: '30m',
  })
}

export async function registration(req: Request, res: Response) {
  let { email, password } = req.body

  try {
    if (!email || !password)
      return res.status(400).send({ error: `expected an object with username, password but got: ${req.body}` })

    password = await bcrypt.hash(password, 10)
    const currentUser = await UserModel.find({ email })
    if (!currentUser.length) {
      const newUser = new UserModel({
        email,
        password,
      })
      const user = await newUser.save()
      return res.status(200).send(user)
    } else {
      return res.status(406).send({ error: 'user name already exists' })
    }
  } catch (error) {
    res.status(500).send({ error })
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  try {
    const user = await UserModel.findOne({ email }).select('+password').exec()

    if (!user) return res.status(401).send({ error: 'User not found' })

    if (await bcrypt.compare(password, user.password)) {
      const { token, expiresIn } = await createRefreshToken({ user })
      res.cookie('refreshToken', token, { httpOnly: true, expires: new Date(expiresIn) })
      res.status(200).send({
        user: await UserModel.findOne({ email }),
        accessToken: createAccessToken(req, { user }),
        refreshToken,
      })
    } else {
      res.status(401).send({ error: 'Wrong email or password' })
    }
  } catch (error) {
    res.status(500).send({ error })
  }
}

export async function refreshToken(req: Request, res: Response) {
  if (!req.cookies) return res.status(500).send('No refreshToken cookie')
  const { refreshToken } = req.cookies

  if (!refreshToken) return res.status(401).send({ error: 'Refresh token is not found!' })

  try {
    const token = await RefreshTokenModel.findOne({ token: refreshToken })
    if (!token) return res.status(401).send({ error: 'Refresh Token not found!' })

    await RefreshTokenModel.deleteOne({ token: token.token })
    if (token.expiresIn < new Date().getTime()) return res.status(500).send({ error: 'Token expired' })

    const user = await UserModel.findOne({ _id: token.userId })
    if (!user) return res.status(500).send({ error: 'User not found' })

    const newRefreshToken = await createRefreshToken({ user })

    res.cookie('refreshToken', newRefreshToken.token, {
      httpOnly: true,
      expires: new Date(newRefreshToken.expiresIn),
    })
    return res.status(200).send({
      user,
      accessToken: createAccessToken(req, { user }),
      refreshToken: newRefreshToken.token,
    })
  } catch (error) {
    res.status(500).send({ error })
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body

  if (!refreshToken) return res.status(500).send({ error: 'Refresh token is not found!' })

  try {
    const token = await RefreshTokenModel.findOne({ token: refreshToken })
    if (!token) {
      res.status(401).send({ error: 'Refresh token is not found!' })
      return
    }

    await RefreshTokenModel.deleteOne({ token: token.token })

    return res.status(200).send('true')
  } catch (error) {
    res.status(500).send({ error })
  }
}
