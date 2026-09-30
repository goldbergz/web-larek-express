import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { errors } from 'celebrate';
import { PORT, DB_ADDRESS } from './config';
import productRouter from './routes/products';
import orderRouter from './routes/order';
import NotFoundError from './errors/not-found';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(DB_ADDRESS as string);

app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);

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
