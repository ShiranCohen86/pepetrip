/**
 * Copy the built frontend (frontend/dist) into backend/public, which the Express
 * server serves in production. Run automatically by the root `build` script after
 * the Vite build. Cross-platform, no dependencies (Node 16.7+ fs.cpSync).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(repoRoot, 'frontend', 'dist');
const dest = path.join(repoRoot, 'backend', 'public');

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error(`❌ Frontend build not found at ${src}. Run the web build first.`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

console.log(`✅ Copied frontend build → ${path.relative(repoRoot, dest)}`);
