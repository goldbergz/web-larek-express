import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request';

// eslint-disable-next-line import/prefer-default-export
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body as { total: number; items: string[] };

    items.forEach((id: string) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestError(`Товар с id ${id} не найден`);
      }
    });

    const products = await Product.find({ _id: { $in: items } });

    items.forEach((id: string) => {
      const product = products.find((item) => item._id.toString() === id);
      if (!product) {
        throw new BadRequestError(`Товар с id ${id} не найден`);
      }
      if (product.price === null || product.price === undefined) {
        throw new BadRequestError(`Товар с id ${id} не продается`);
      }
    });

    const sum = items.reduce((acc: number, id: string) => {
      const product = products.find((item) => item._id.toString() === id);
      return acc + (product?.price ?? 0);
    }, 0);

    if (sum !== total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    res.send({ id: faker.string.uuid(), total });
  } catch (err) {
    next(err);
  }
};
