import { Schema, model } from 'mongoose'

export interface RefreshToken {
  userId: string
  token: string
  expiresIn: number
  createdAt: string
  updatedIn: string
}

const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresIn: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export const RefreshTokenModel = model<RefreshToken>('RefreshToken', schema)
