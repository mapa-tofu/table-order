import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

// 개발 환경: 컬러 + 심플 포맷
const devFormat = combine(colorize(), simple());

// 프로덕션 환경: JSON 구조화 로깅
const prodFormat = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json());

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 7,
          }),
        ]
      : []),
  ],
});
