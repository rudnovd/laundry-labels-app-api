import { UploadApiResponse, v2 } from 'cloudinary'
import { Readable } from 'stream'
import { config } from './config.js'

if (process.env.IS_CLOUD_SERVER && process.env.CLOUDINARY_API_SECRET) {
  v2.config(config.cloudinary)
} else if (process.env.IS_CLOUD_SERVER && process.env.NODE_ENV === 'production' && !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET in .env not found')
}

export async function uploadToCloudinary(file: Buffer): Promise<UploadApiResponse | undefined> {
  return new Promise((resolve, reject) => {
    const stream = v2.uploader.upload_stream({}, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
    const readable = Readable.from(file)
    readable.pipe(stream)
  })
}

export const deleteFromCloudinary = async (ids: Array<string>) => {
  return Promise.all(ids.map((id) => v2.uploader.destroy(id)))
}
