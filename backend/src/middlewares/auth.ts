import { Request, Response, NextFunction } from 'express';
import UnauthorizedError from '../errors/unauthorized';
import { verifyAccessToken, isTokenExpiredError } from '../utils/tokens';

export interface AuthRequest extends Request {
  user?: { _id: string };
}

export default (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : authorization;

  if (!token) {
    next(new UnauthorizedError('Необходима авторизация'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { _id: payload._id };
    next();
  } catch (err) {
    if (isTokenExpiredError(err)) {
      next(new UnauthorizedError('Истек срок действия токена'));
      return;
    }
    next(new UnauthorizedError('Необходима авторизация'));
  }
};
