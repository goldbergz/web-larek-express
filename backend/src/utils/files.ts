import fs from 'fs/promises';
import { mkdirSync } from 'fs';
import path from 'path';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

export const PUBLIC_DIR = path.join(__dirname, '..', 'public');
export const IMAGES_DIR = path.join(PUBLIC_DIR, UPLOAD_PATH);
export const TEMP_DIR = path.join(PUBLIC_DIR, UPLOAD_PATH_TEMP);

interface FsError extends Error {
  code?: string;
}

export const isEnoentError = (err: unknown): boolean => (err as FsError).code === 'ENOENT';

export const ensureUploadDirs = () => {
  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(IMAGES_DIR, { recursive: true });
};

export const moveFromTemp = async (fileName: string): Promise<void> => {
  const base = path.basename(fileName);
  try {
    await fs.rename(path.join(TEMP_DIR, base), path.join(IMAGES_DIR, base));
  } catch (err) {
    if (!isEnoentError(err)) {
      throw err;
    }
  }
};

export const removeImageFile = async (fileName: string): Promise<void> => {
  try {
    await fs.unlink(path.join(IMAGES_DIR, path.basename(fileName)));
  } catch (err) {
    if (!isEnoentError(err)) {
      throw err;
    }
  }
};
