// Vercel configuration for Dreamscape Backend
import type { Config } from '@vercel/go';

// Vercel configuration
export default {
  builds: [
    {
      src: 'main.go',
      use: '@vercel/go',
    },
  ],
  include: [
    'config/**/*',
    'pkg/**/*',
    'backend/**/*',
  ],
  routes: [
    {
      src: '/(.*)',
      dest: '/main.go',
    },
  ],
  env: {
    // Set default environment variables for Vercel
    GIN_MODE: 'production',
  },
} as Config;