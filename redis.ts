import { CronJob } from 'cron'
import { createClient } from 'redis'
import { logger } from './logger'

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
      const keys = await redis.keys('*')
      const values = keys.map((key) => redis.get(key))
      Promise.all(values).then((values) => {
        values.forEach((value, index) => {
          if (value && Date.now() > parseInt(value)) {
            redis.del(keys[index])
          }
        })
      })
      logger.info('Redis: cron function "redisCleanImagesJob" is successfully completed.')
    },
    null,
    true
  )
  redisCleanImagesJob.start()
  logger.info('Redis: active cron functions: redisCleanImagesJob')
})
