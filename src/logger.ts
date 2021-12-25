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
    new DailyRotateFile({
      datePattern: 'DD-MM-YYYY',
      filename: '%DATE%.log',
      dirname: process.env.NODE_ENV === 'development' ? './logs' : '/var/log/laundry-labels-app/api',
      maxSize: '50mb',
      maxFiles: '100d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
  ],
})
