// Vercel configuration for Dreamscape Backend
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
};