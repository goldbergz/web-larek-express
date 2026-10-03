import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import path from 'path';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request';
import ConflictError from '../errors/conflict';
import NotFoundError from '../errors/not-found';
import { moveFromTemp } from '../utils/files';
import { UPLOAD_PATH } from '../config';

const finalizeImagePath = async (image?: { fileName?: string }) => {
  if (!image?.fileName) {
    return;
  }
  const base = path.basename(image.fileName);
  await moveFromTemp(base);
  // eslint-disable-next-line no-param-reassign
  image.fileName = `/${UPLOAD_PATH}/${base}`;
};

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
    await finalizeImagePath(req.body?.image);
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

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    await finalizeImagePath(req.body?.image);
    const product = await Product.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }
    res.send(product);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      next(new BadRequestError('Ошибка валидации данных при обновлении товара'));
      return;
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError('Товар с таким заголовком уже существует'));
      return;
    }
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }
    res.send(product);
  } catch (err) {
    next(err);
  }
};
