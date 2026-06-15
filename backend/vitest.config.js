import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/pepetrip_test',
      JWT_ACCESS_SECRET: 'test_access_secret_test_access_secret',
      JWT_REFRESH_SECRET: 'test_refresh_secret_test_refresh_secret',
      JWT_ACCESS_TTL: '15m',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GEMINI_API_KEY: 'test-gemini-key',
      GEMINI_MODEL: 'gemini-2.0-flash',
      COOKIE_SECURE: 'false',
      ALLOW_DEV_LOGIN: 'true',
      // Force local storage in tests so they never touch a real Cloudinary account.
      STORAGE_DRIVER: 'local',
      // Write uploads to the OS temp dir during tests, not into the repo.
      UPLOAD_DIR: path.join(os.tmpdir(), 'pepetrip-test-uploads'),
    },
  },
});
