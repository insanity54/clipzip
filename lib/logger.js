
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'clipzip' },
  transports: [
    new winston.transports.File({ filename: 'clipzip.error.log', level: 'error' }),
    new winston.transports.File({ filename: 'clipzip.info.log', level: 'info' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
})


module.exports = logger;