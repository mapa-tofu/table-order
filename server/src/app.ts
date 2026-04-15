import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { requestIdMiddleware } from './shared/utils/requestId';
import { logger } from './shared/utils/logger';
import { AppError } from './shared/utils/errors';
import customerRouter from './customer-api';
import adminRouter from './admin-api';
import sequelize from './shared/database';

// 모델 관계 설정 로드
import './shared/models';

const app = express();

// ===== 미들웨어 =====
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 최대 1000 요청
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 요청 로깅
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.requestId,
    ip: req.ip,
  });
  next();
});

// ===== Swagger 설정 =====
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Table Order API',
      version: '1.0.0',
      description: '테이블오더 서비스 API 문서',
    },
    servers: [{ url: '/', description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/customer-api/routes/*.ts', './src/admin-api/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== API 라우터 =====
app.use('/api/customer', customerRouter);
app.use('/api/admin', adminRouter);

// ===== 헬스체크 =====
app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// ===== 정적 파일 서빙 (프론트엔드 빌드) =====
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA 폴백 — API가 아닌 모든 요청을 index.html로
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/api-docs') || req.path === '/health') {
    next();
    return;
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // 프론트엔드 빌드가 없는 경우
      res.status(200).json({ message: 'Table Order API Server', docs: '/api-docs' });
    }
  });
});

// ===== 글로벌 에러 핸들러 =====
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: { code: err.code, message: err.message, details: err.details },
        requestId: req.requestId,
      });
    } else {
      logger.error('처리되지 않은 에러', {
        error: err.message,
        stack: err.stack,
        requestId: req.requestId,
      });
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' },
        requestId: req.requestId,
      });
    }
  },
);

export default app;
