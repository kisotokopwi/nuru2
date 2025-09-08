import fs from 'fs';
import path from 'path';

const STORAGE_ROOT = process.env.STORAGE_ROOT || path.join(process.cwd(), 'storage');

export function ensureStorage() {
  if (!fs.existsSync(STORAGE_ROOT)) fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

export function storeBuffer(relativePath, buffer) {
  ensureStorage();
  const dest = path.join(STORAGE_ROOT, relativePath);
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dest, buffer);
  return dest;
}

export function getFileStream(relativePath) {
  const full = path.join(STORAGE_ROOT, relativePath);
  if (!fs.existsSync(full)) return null;
  return fs.createReadStream(full);
}

