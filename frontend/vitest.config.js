import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Standalone test config (no PWA plugin) so unit tests run fast and isolated.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
  },
});
