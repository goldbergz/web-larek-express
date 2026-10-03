import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { TEMP_DIR, isEnoentError } from './files';

const TEMP_FILE_MAX_AGE = 60 * 60 * 1000;

const cleanTempDir = async () => {
  let files: string[];
  try {
    files = await fs.readdir(TEMP_DIR);
  } catch (err) {
    if (!isEnoentError(err)) {
      throw err;
    }
    return;
  }
  const now = Date.now();
  await Promise.all(files.map(async (file) => {
    const filePath = path.join(TEMP_DIR, file);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile() && now - stat.mtimeMs > TEMP_FILE_MAX_AGE) {
        await fs.unlink(filePath);
      }
    } catch (err) {
      if (!isEnoentError(err)) {
        throw err;
      }
    }
  }));
};

// eslint-disable-next-line import/prefer-default-export
export const startTempCleanup = () => {
  cron.schedule('0 * * * *', cleanTempDir);
};
