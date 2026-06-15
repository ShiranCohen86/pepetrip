import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../');
// .env lives inside the backend package (backend/.env), loaded regardless of cwd.
const backendRoot = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(backendRoot, '.env') });

/** Parse "true"/"1" style strings into booleans (z.coerce.boolean treats "false" as true). */
const booleanString = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  // Comma-separated list of allowed dev origins. Empty in prod (same-origin).
  CORS_ORIGINS: z.string().default(''),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECURE: booleanString.default(false),

  // Dev-only "demo login" (seeds + signs in a test user). Hard-disabled in production.
  ALLOW_DEV_LOGIN: booleanString.default(false),

  // Optional at boot so the API can run before these are configured; the
  // relevant feature throws a clear error if used while empty.
  GOOGLE_CLIENT_ID: z.string().default(''),
  AI_PROVIDER: z.enum(['gemini']).default('gemini'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),

  // Phase 3 — media/document storage. 'local' = ephemeral disk (dev / Render free
  // tier resets on redeploy); 'cloudinary' needs a free CLOUDINARY_URL.
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
  CLOUDINARY_URL: z.string().default(''),
  UPLOAD_DIR: z.string().default('uploads'),

  // Phase 4 — gated integrations. Off by default: each requires paid API access
  // and/or Google OAuth verification before it can do anything real.
  FEATURE_GMAIL: booleanString.default(false),
  FEATURE_GOOGLE_PHOTOS: booleanString.default(false),
  FEATURE_PRICE_TRACKING: booleanString.default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

const env = parsed.data;

export const config = Object.freeze({
  ...env,
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  isDev: env.NODE_ENV === 'development',
  corsOrigins: env.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  refreshTtlMs: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  repoRoot,
});
