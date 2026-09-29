import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request';
import ConflictError from '../errors/conflict';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    res.send({ items: products, total: products.length });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create(req.body);
    res.send(product);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      next(new BadRequestError('Ошибка валидации данных при создании товара'));
      return;
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError('Товар с таким заголовком уже существует'));
      return;
    }
    next(err);
  }
};
