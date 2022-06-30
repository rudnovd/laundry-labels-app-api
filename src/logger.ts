import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

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

if (process.env.SAVE_LOGS) {
  logger.add(
    new DailyRotateFile({
      datePattern: 'DD-MM-YYYY',
      filename: '%DATE%.log',
      dirname: './logs',
      maxSize: '50mb',
      maxFiles: '100d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    })
  )
}
