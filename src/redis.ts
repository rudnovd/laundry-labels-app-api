import { CronJob } from 'cron'
import { constants } from 'fs'
import fs from 'fs/promises'
import { createClient } from 'redis'
import { logger } from './logger.js'

export const redis = createClient({
  url: process.env.REDIS_URI,
  socket: {
    tls: !!process.env.REDIS_SOCKET_TLS,
    rejectUnauthorized: false,
  },
})

redis.connect().then(() => logger.info('Server: connected to Redis'))

redis.on('error', async (err) => {
  logger.error('Server: Redis Client error:', err)
})

redis.clientId().then((clientId) => {
  if (!clientId) return

  const redisCleanImagesJob = new CronJob(
    '*/31 * * * *',
    async () => {
      logger.info('Redis: cron function "redisCleanImagesJob" is running now!')
      let count = 0
      const keys = await redis.keys('*')
      const values = keys.map((key) => redis.get(key))
      Promise.all(values).then((values) => {
        values.forEach((value, index) => {
          if (value && Date.now() > parseInt(value)) {
            const filePath = `${keys[index]}`
            redis.del(keys[index])
            fs.access(filePath, constants.F_OK)
              .then(() => fs.rm(filePath))
              .catch(() => `Failed to delete ${filePath}, file not found`)
            fs.access(`${filePath}.webp`, constants.F_OK)
              .then(() => fs.rm(`${filePath}.webp`))
              .catch(() => `Failed to delete ${filePath}.webp, file not found`)
            count++
          }
        })
      })
      logger.info(`Redis: cron function "redisCleanImagesJob" is successfully completed. Deleted count: ${count}`)
    },
    null,
    true,
    undefined,
    undefined,
    process.env.NODE_ENV === 'development'
  )
  redisCleanImagesJob.start()
  logger.info('Redis: active cron functions: redisCleanImagesJob')
})
