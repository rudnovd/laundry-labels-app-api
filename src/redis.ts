import { logger } from '##/logger'
import { CronJob } from 'cron'
import fs from 'fs/promises'
import { createClient } from 'redis'

export const redis = createClient()
redis.on('error', async (err) => {
  logger.log('Server: Redis Client - ', err)
  await redis.quit()
})
redis.connect().then(() => logger.info('Server: connected to Redis'))

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
            fs.access(filePath).then(() => fs.rm(filePath))
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
