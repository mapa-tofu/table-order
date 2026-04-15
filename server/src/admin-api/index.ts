import { Router } from 'express';
import authRouter from './routes/authRouter';
import orderRouter from './routes/orderRouter';
import tableRouter from './routes/tableRouter';
import menuRouter from './routes/menuRouter';
import sseRouter from './routes/sseRouter';

const adminRouter = Router();

adminRouter.use('/auth', authRouter);
adminRouter.use('/orders', orderRouter);
adminRouter.use('/tables', tableRouter);
adminRouter.use('/menus', menuRouter);
adminRouter.use('/sse', sseRouter);

export default adminRouter;
