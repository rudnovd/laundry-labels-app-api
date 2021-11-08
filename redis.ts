import { CronJob } from 'cron'
import { createClient } from 'redis'

export const redis = createClient()
redis.on('error', async (err) => {
  console.log('Redis Client - ', err)
  await redis.quit()
})
redis.connect().then(() => console.log('connected to Redis'))

redis.clientId().then((clientId) => {
  if (!clientId) return

  const redisCleanImagesJob = new CronJob(
    '* 30 * * * *',
    async () => {
      console.log('job redisCleanImagesJob is running')
      const keys = await redis.keys('*')
      const values = keys.map((key) => redis.get(key))
      Promise.all(values).then((values) => {
        values.forEach((value, index) => {
          if (value && Date.now() > parseInt(value)) {
            redis.del(keys[index])
          }
        })
      })
    },
    null,
    true
  )
  redisCleanImagesJob.start()
  console.log('active jobs: redisCleanImagesJob')
})
