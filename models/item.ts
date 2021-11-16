import { model, Schema } from 'mongoose'

export interface Item {
  _id: string
  icons: Array<string>
  images?: Array<string>
  tags?: Array<string>
  owner: string
}

const schema = new Schema(
  {
    icons: {
      type: Array,
      required: true,
      validate: {
        validator: (value: unknown) => Array.isArray(value) && value.length,
        message: 'field must be not empty type "Array"',
      },
    },
    images: Array,
    tags: Array,
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const ItemModel = model<Item>('Item', schema)
