import { randomUUID } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

export const config = {
  jwtSecret: process.env.JWT_SECRET || randomUUID(),
  databaseURI: process.env.DATABASE_URI || '',
}
