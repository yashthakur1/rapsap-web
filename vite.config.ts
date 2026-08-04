import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        franchise: resolve(__dirname, 'franchise.html'),
        stores: resolve(__dirname, 'stores.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms-conditions.html'),
        shipping: resolve(__dirname, 'shipping-policy.html'),
        refund: resolve(__dirname, 'refund-policy.html'),
        contact: resolve(__dirname, 'contact-us-policy.html'),

        // Hero explorations — noindex, remove these three once a direction is picked
        heroV1: resolve(__dirname, 'hero-v1/index.html'),
        heroV2: resolve(__dirname, 'hero-v2/index.html'),
        heroV3: resolve(__dirname, 'hero-v3/index.html'),

        // Built strictly to the Website Brief (Bricolage/Jakarta, black-led) — noindex
        docVer: resolve(__dirname, 'doc-ver/index.html')
      }
    },
    // Copy public assets to dist
    copyPublicDir: true,
    assetsDir: 'assets'
  }
});
