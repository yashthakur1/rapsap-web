import { defineConfig } from 'vite';
import { resolve } from 'path';

// Multi-page static site. Every page is a directory index so the URLs are
// clean (/stores/, /about/, …); vercel.json redirects the old .html paths.
export default defineConfig({
  base: '/',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        stores: resolve(__dirname, 'stores/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        partners: resolve(__dirname, 'partners/index.html'),
        privacy: resolve(__dirname, 'privacy-policy/index.html'),
        terms: resolve(__dirname, 'terms-conditions/index.html'),
        shipping: resolve(__dirname, 'shipping-policy/index.html'),
        refund: resolve(__dirname, 'refund-policy/index.html'),
        contact: resolve(__dirname, 'contact/index.html')
      }
    },
    copyPublicDir: true,
    assetsDir: 'assets'
  }
});
