import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { mkdirSync } from 'fs';
import { TEMP_DIR } from '../utils/files';
import BadRequestError from '../errors/bad-request';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(TEMP_DIR, { recursive: true });
    cb(null, TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new BadRequestError('Недопустимый тип файла. Разрешены только изображения'));
};

export default multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
