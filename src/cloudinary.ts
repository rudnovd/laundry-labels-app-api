import { v2 } from 'cloudinary'
import sharp from 'sharp'

if (process.env.CLOUDINARY_API_SECRET) {
  v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
} else {
  throw new Error('CLOUDINARY_API_SECRET in .env not found')
}

export const uploadImage = async (files: Array<string>) => {
  const uploads = files.map(async (file) => {
    try {
      await sharp(`${global.__basedir}${file}`).webp({ quality: 20 }).toFile(`${global.__basedir}${file}.webp`)
    } catch (err) {
      throw new Error(err as string)
    }
    return v2.uploader.upload(`${global.__basedir}${file}.webp`)
  })
  return Promise.all(uploads)
}

export const deleteImage = async (ids: Array<string>) => {
  const deletes = ids.map((id) => v2.uploader.destroy(id))
  return Promise.all(deletes)
}
