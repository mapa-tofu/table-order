import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import sequelize from './shared/database';
import { logger } from './shared/utils/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start() {
  try {
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    // 개발 환경에서 테이블 자동 동기화 (프로덕션에서는 마이그레이션 사용)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('데이터베이스 동기화 완료');
    }

    // 서버 시작
    const server = app.listen(PORT, () => {
      logger.info(`서버 시작: http://localhost:${PORT}`);
      logger.info(`API 문서: http://localhost:${PORT}/api-docs`);
      logger.info(`헬스체크: http://localhost:${PORT}/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} 수신 — 서버 종료 시작`);
      server.close(async () => {
        await sequelize.close();
        logger.info('서버 종료 완료');
        process.exit(0);
      });

      // 10초 후 강제 종료
      setTimeout(() => {
        logger.error('강제 종료');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('서버 시작 실패', { error });
    process.exit(1);
  }
}

start();
