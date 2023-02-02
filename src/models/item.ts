import { model, Schema } from 'mongoose'
import { itemsIcons } from '../constants.js'

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
      validate: [
        {
          validator: (icons: Array<unknown>) => icons.length,
          message: 'Icons must be not empty array',
        },
        {
          validator: (icons: Array<unknown>) => {
            for (const icon of icons) {
              if (typeof icon !== 'string') {
                return false
              }
            }
          },
          message: 'Icons elements must be strings',
        },
        {
          validator: (value: Array<string>) => {
            const icons: Array<string> = Object.keys(itemsIcons)
              .map((group) => itemsIcons[group])
              .flat()
            for (const icon of value) {
              if (!icons.includes(icon)) {
                return false
              }
            }
          },
          message: 'Icons array contains not existing icon',
        },
      ],
    },
    images: {
      type: Array,
      default: [],
      validate: [
        {
          validator: (images: Array<unknown>) => {
            for (const image of images) {
              if (typeof image !== 'string') {
                return false
              }
            }
          },
          message: 'Images elements must be strings',
        },
        {
          validator: (images: Array<string>) => {
            for (const url of images) {
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
          message: `Images array must starts with ${
            process.env.IS_CLOUD_SERVER ? 'res.cloudinary.com' : '/upload/items'
          } urls`,
        },
      ],
    },
    tags: {
      type: Array,
      default: [],
      validate: {
        validator: (tags: Array<unknown>) => {
          for (const tag of tags) {
            if (typeof tag !== 'string') {
              return false
            }
          }
        },
        message: 'Tags elements must be strings',
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
