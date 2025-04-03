import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html', 
        about: 'about.html', 
        franchise: 'franchise.html', 
        stores: 'stores.html', 
       
      }
    }
  }
});
