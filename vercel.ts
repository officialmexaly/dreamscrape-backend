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
  routes: [
    {
      src: '/(.*)',
      dest: '/main.go',
    },
  ],
} as Config;