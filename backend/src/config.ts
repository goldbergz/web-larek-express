import dotenv from 'dotenv';

dotenv.config();

export const {
  PORT = 3000,
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  ORIGIN_ALLOW = 'http://localhost:5173',
  JWT_SECRET = 'dev-secret',
  AUTH_ACCESS_TOKEN_SECRET = '',
  AUTH_REFRESH_TOKEN_SECRET = '',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
} = process.env;
