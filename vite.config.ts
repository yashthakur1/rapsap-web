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
        googleHtml: resolve(__dirname, 'google7694cf04bb5ce287.html'),
      }
    },
    // Copy public assets to dist
    copyPublicDir: true,
    assetsDir: 'assets'
  }
});
