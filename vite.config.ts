import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patternSourcesPlugin } from './scripts/pattern-sources.mjs';
export default defineConfig({
  plugins: [react(), patternSourcesPlugin()],
  server: { host: '0.0.0.0', port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion'))
            return 'motion';
          if (
            id.includes('node_modules/@base-ui') ||
            id.includes('node_modules/cmdk') ||
            id.includes('node_modules/sonner')
          )
            return 'primitives';
        },
      },
    },
  },
});
