import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vitest/config';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
  plugins: [
    // The Laravel plugin only matters for dev/build; unit tests need just the Vue compiler.
    ...(isTest ? [] : [laravel({ input: ['resources/js/main.ts'], refresh: true })]),
    vue(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./resources/js', import.meta.url)) },
  },
  server: {
    watch: { ignored: ['**/storage/framework/views/**', '**/vendor/**'] },
  },
  test: {
    environment: 'jsdom',
    include: ['resources/js/**/*.test.ts'],
  },
});
