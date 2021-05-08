const path = require('path');


module.exports = {
  webpack: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: {
    host: '127.0.0.1',
    port: 3001,
    proxy: {
      '/4433': {
        target: 'http://127.0.0.1:4433/',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/4433': '' },
      },
      '/4434': {
        target: 'http://127.0.0.1:4434/',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/4434': '' },
      },
    }
  }
}
