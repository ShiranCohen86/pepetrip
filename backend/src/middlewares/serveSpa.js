import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * In production, serve the built React app (copied into backend/public) and fall back to
 * index.html for any non-API GET so client-side routes deep-link correctly.
 * In dev this is a no-op (Vite serves the frontend on its own port).
 */
export function mountSpa(app) {
  const publicDir = path.join(config.repoRoot, 'backend', 'public');

  if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
    logger.warn(
      { publicDir },
      'SPA build not found — not serving static frontend (expected in dev).',
    );
    return;
  }

  app.use(
    express.static(publicDir, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );

  // SPA fallback: every non-/api GET returns the app shell.
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  logger.info({ publicDir }, 'Serving SPA build');
}
