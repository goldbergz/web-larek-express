import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errors } from 'celebrate';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './config';
import productRouter from './routes/products';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import NotFoundError from './errors/not-found';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import { startTempCleanup } from './utils/cron';
import { ensureUploadDirs } from './utils/files';

const app = express();

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(DB_ADDRESS as string);

ensureUploadDirs();
startTempCleanup();

app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});

export default app;
