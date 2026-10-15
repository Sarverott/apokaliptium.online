// NOTE: this whole draft dir should be inspected, grab all that we do not have but can be used in project. after all remove this dir

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
