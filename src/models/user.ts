import { model, Schema } from 'mongoose'

export interface User {
  _id: string
  email: string
  password: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      options: {
        trim: true,
        max: 320,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      options: {
        max: 64,
      },
    },
    isDisabled: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

export const UserModel = model<User>('User', schema)
