import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src', 'components'),
      '@helpers': path.resolve(__dirname, 'src', 'helpers'),
      '@hooks': path.resolve(__dirname, 'src', 'hooks'),
      '@constants': path.resolve(__dirname, 'src', 'constants.ts'),
      '@utils': path.resolve(__dirname, 'src', 'utils.ts'),
    },
  },
});
