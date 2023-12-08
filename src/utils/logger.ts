import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss A',
    }),
    winston.format.cli(),
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.stack || info.message}`),
  ),
  defaultMeta: { service: 'jkt48sr-discord-notif' },
  transports: [
    new winston.transports.Console({
      level: 'info',
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
