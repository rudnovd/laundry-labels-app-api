import { randomUUID } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

export const config = {
  jwtSecret: process.env.JWT_SECRET || randomUUID(),
  databaseURI: process.env.DATABASE_URI || '',
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
}
