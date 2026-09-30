import jwt from 'jsonwebtoken';
import ms from 'ms';
import { CookieOptions } from 'express';
import {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
  JWT_SECRET,
} from '../config';

const accessSecret = AUTH_ACCESS_TOKEN_SECRET || JWT_SECRET;
const refreshSecret = AUTH_REFRESH_TOKEN_SECRET || JWT_SECRET;

export interface TokenPayload {
  _id: string;
}

export const generateAccessToken = (payload: TokenPayload): string => jwt.sign(
  payload,
  accessSecret,
  { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] },
);

export const generateRefreshToken = (payload: TokenPayload): string => jwt.sign(
  payload,
  refreshSecret,
  { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] },
);

export const verifyAccessToken = (token: string): TokenPayload => jwt.verify(
  token,
  accessSecret,
) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload => jwt.verify(
  token,
  refreshSecret,
) as TokenPayload;

export const isTokenExpiredError = (err: unknown): boolean => err instanceof jwt.TokenExpiredError;

export const refreshCookie = {
  name: 'refreshToken',
  options: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as Parameters<typeof ms>[0]),
    path: '/',
  } as CookieOptions,
};

export const clearedRefreshCookieOptions: CookieOptions = {
  ...refreshCookie.options,
  maxAge: 0,
};
