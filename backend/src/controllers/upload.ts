import { Request, Response, NextFunction } from 'express';
import { UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request';

// eslint-disable-next-line import/prefer-default-export
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    next(new BadRequestError('Файл не загружен'));
    return;
  }
  res.send({
    fileName: `/${UPLOAD_PATH_TEMP}/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};
