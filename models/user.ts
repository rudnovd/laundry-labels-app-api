import { Schema, model } from 'mongoose'

export interface User {
  _id: string
  email: string
  password: string
  created?: Date
}

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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
