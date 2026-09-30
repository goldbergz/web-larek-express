import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import mongoose, { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import BadRequestError from '../errors/bad-request';
import ConflictError from '../errors/conflict';
import NotFoundError from '../errors/not-found';
import UnauthorizedError from '../errors/unauthorized';
import { AuthRequest } from '../middlewares/auth';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  refreshCookie,
  clearedRefreshCookieOptions,
} from '../utils/tokens';

const buildUserResponse = (user: { _id: unknown; email: string; name: string }) => ({
  email: user.email,
  name: user.name,
  id: String(user._id),
});

const issueTokenPair = async (userId: string) => {
  const accessToken = generateAccessToken({ _id: userId });
  const refreshToken = generateRefreshToken({ _id: userId });
  await User.findByIdAndUpdate(userId, { $push: { tokens: { token: refreshToken } } });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email: string;
      password: string;
    };
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = await issueTokenPair(String(user._id));
    res
      .status(201)
      .cookie(refreshCookie.name, refreshToken, refreshCookie.options)
      .send({ user: buildUserResponse(user), success: true, accessToken });
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      next(new BadRequestError(err.message));
      return;
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError('Пользователь с таким email уже существует'));
      return;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const { accessToken, refreshToken } = await issueTokenPair(String(user._id));
    res
      .cookie(refreshCookie.name, refreshToken, refreshCookie.options)
      .send({ user: buildUserResponse(user), success: true, accessToken });
  } catch (err) {
    next(err);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken as string | undefined;
    if (!oldRefreshToken) {
      throw new UnauthorizedError('Не валидный токен');
    }
    let userId: string;
    try {
      userId = verifyRefreshToken(oldRefreshToken)._id;
    } catch (_err) {
      throw new UnauthorizedError('Не валидный токен');
    }
    const user = await User.findById(userId).select('+tokens');
    if (!user || !user.tokens.some((item) => item.token === oldRefreshToken)) {
      throw new UnauthorizedError('Не валидный токен');
    }
    user.tokens = user.tokens.filter(
      (item) => item.token !== oldRefreshToken,
    ) as typeof user.tokens;
    const accessToken = generateAccessToken({ _id: String(user._id) });
    const refreshToken = generateRefreshToken({ _id: String(user._id) });
    user.tokens.push({ token: refreshToken });
    await user.save();
    res
      .cookie(refreshCookie.name, refreshToken, refreshCookie.options)
      .send({ user: buildUserResponse(user), success: true, accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken as string | undefined;
    if (!oldRefreshToken) {
      throw new UnauthorizedError('Не валидный токен');
    }
    let userId: string;
    try {
      userId = verifyRefreshToken(oldRefreshToken)._id;
    } catch (_err) {
      throw new UnauthorizedError('Не валидный токен');
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new BadRequestError('Невалидный id пользователя');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    }
    await User.findByIdAndUpdate(userId, { $pull: { tokens: { token: oldRefreshToken } } });
    res
      .cookie(refreshCookie.name, '', clearedRefreshCookieOptions)
      .send({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    }
    res.send({ user: buildUserResponse(user), success: true });
  } catch (err) {
    next(err);
  }
};
