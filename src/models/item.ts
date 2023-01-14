import { model, Schema } from 'mongoose'

export interface Item {
  _id: string
  name: string
  icons: Array<string>
  images: Array<string>
  tags: Array<string>
  owner: string
}

const schema = new Schema(
  {
    name: {
      type: String,
      index: true,
      options: {
        trim: true,
        maxLength: 128,
      },
    },
    icons: {
      type: Array,
      required: true,
      validate: {
        validator: (value: unknown) => Array.isArray(value) && value.length,
        message: 'Icons must be not empty array',
      },
    },
    images: {
      type: Array,
      default: [],
      validate: {
        validator: (value: unknown) => {
          if (!Array.isArray(value)) {
            return false
          }
          for (const url of value) {
            if (process.env.IS_CLOUD_SERVER) {
              if (url.indexOf('http://res.cloudinary.com/') !== 0) {
                return false
              }
            } else {
              if (url.indexOf('/upload/items/') !== 0) {
                return false
              }
            }
          }
        },
        message: 'Images must be array',
      },
    },
    tags: {
      type: Array,
      default: [],
      validate: {
        validator: (value: unknown) => Array.isArray(value),
        message: 'Tags must be array',
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const ItemModel = model<Item>('Item', schema)
