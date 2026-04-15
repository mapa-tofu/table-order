import { Router } from 'express';
import authRouter from './routes/authRouter';
import menuRouter from './routes/menuRouter';
import orderRouter from './routes/orderRouter';
import sseRouter from './routes/sseRouter';

const customerRouter = Router();

customerRouter.use('/auth', authRouter);
customerRouter.use('/menus', menuRouter);
customerRouter.use('/orders', orderRouter);
customerRouter.use('/sse', sseRouter);

export default customerRouter;
