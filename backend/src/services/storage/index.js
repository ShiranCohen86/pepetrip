import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/env.js';
import { serviceUnavailable } from '../../errors/AppError.js';
import { logger } from '../../config/logger.js';

/**
 * Pluggable file storage with two drivers:
 *  - 'local'      → writes to UPLOAD_DIR, served at /uploads. Fine for dev, but
 *                   EPHEMERAL on Render's free tier (uploads vanish on redeploy).
 *  - 'cloudinary' → uploads to Cloudinary (durable, free tier); returns absolute URLs.
 * Selected by STORAGE_DRIVER. Both expose the same save()/remove() contract.
 */
const uploadsDir = path.isAbsolute(config.UPLOAD_DIR)
  ? config.UPLOAD_DIR
  : path.join(config.repoRoot, config.UPLOAD_DIR);

function safeExt(name = '') {
  const ext = path.extname(name).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : '';
}

/* ── local driver ── */
const localDriver = {
  async save(buffer, originalName) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt(originalName)}`;
    fs.writeFileSync(path.join(uploadsDir, key), buffer);
    return { url: `/uploads/${key}`, key };
  },
  async remove(key) {
    if (!key) return;
    try {
      fs.unlinkSync(path.join(uploadsDir, key));
    } catch {
      /* already gone — ignore */
    }
  },
};

/* ── cloudinary driver ── */
let cloudinaryReady = false;
function initCloudinary() {
  if (cloudinaryReady) return;
  if (!config.CLOUDINARY_URL) {
    throw serviceUnavailable('Cloudinary is not configured (missing CLOUDINARY_URL)');
  }
  // The SDK reads CLOUDINARY_URL from process.env automatically.
  cloudinary.config({ secure: true });
  cloudinaryReady = true;
}

const cloudinaryDriver = {
  async save(buffer, originalName, mime) {
    initCloudinary();
    const resourceType = (mime || '').startsWith('image/') ? 'image' : 'raw';
    const dataUri = `data:${mime || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: 'pepetrip',
      resource_type: resourceType,
    });
    // Encode resource type into the key so remove() can target the right asset.
    return { url: res.secure_url, key: `${res.resource_type}:${res.public_id}` };
  },
  async remove(key) {
    if (!key) return;
    initCloudinary();
    const idx = key.indexOf(':');
    const resourceType = idx > 0 ? key.slice(0, idx) : 'image';
    const publicId = idx > 0 ? key.slice(idx + 1) : key;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      logger.warn({ err: err.message, key }, 'cloudinary destroy failed');
    }
  },
};

const driver = config.STORAGE_DRIVER === 'cloudinary' ? cloudinaryDriver : localDriver;

export const storage = {
  driver: config.STORAGE_DRIVER,
  uploadsDir,
  /** Persist a buffer → { url, key }. */
  save: (buffer, originalName, mime) => driver.save(buffer, originalName, mime),
  /** Delete a previously-saved asset by its key. */
  remove: (key) => driver.remove(key),
};
