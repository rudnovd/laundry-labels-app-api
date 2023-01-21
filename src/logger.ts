import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { config } from './config.js'

export const logger = winston.createLogger({
  level: 'http',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
  ],
})

if (!process.env.IS_CLOUD_SERVER) {
  logger.add(
    new DailyRotateFile({
      datePattern: 'DD-MM-YYYY',
      filename: '%DATE%.log',
      dirname: config.logsPath,
      maxSize: '50mb',
      maxFiles: '100d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    })
  )
}
