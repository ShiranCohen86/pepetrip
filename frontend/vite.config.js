import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Disable the SW in dev so it doesn't interfere with HMR.
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'PepeTrip — AI Travel Planner',
        short_name: 'PepeTrip',
        description: 'Plan trips with AI: editable day-by-day itineraries with costs.',
        theme_color: '#0ea5e9',
        background_color: '#0b1020',
        display: 'standalone',
        // Prefer the desktop window-controls-overlay when available; fall back to
        // standalone. 'any' orientation so tablet/desktop/foldable installs aren't
        // locked to portrait.
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icons/maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Don't let the SPA fallback hijack API calls when offline.
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // The 3D globe chunk (three-globe + country data) is large and only needed
        // on the /world route — load it on demand instead of precaching it.
        globIgnores: ['**/Globe-*.js'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/trips'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'trips-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    // Ensure a single zod instance across web + the shared workspace package.
    dedupe: ['zod', 'react', 'react-dom'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // The 3D globe (three.js) and map (maplibre) vendor bundles are legitimately
    // large; raise the warning threshold so the build log isn't noisy. They load
    // only on their own routes, so initial-page payload is unaffected.
    chunkSizeWarningLimit: 1000,
  },
});
