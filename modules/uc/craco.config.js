const path = require('path');

const outputPath = path.resolve(__dirname, '../../public/static/uc');

module.exports = {
  webpack: {
    alias: {
      src: path.join(__dirname, 'src'),
    },
    configure: (webpackConfig, { paths }) => {
      paths.appBuild = outputPath;
      webpackConfig.output = {
        ...webpackConfig.output,
        path: outputPath,
        publicPath: '/static/uc/',
      };
      return webpackConfig;
    },
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  devServer: {
    port: 3030,
    proxy: {
      '/self-service': {
        target: 'http://127.0.0.1:4433',
        source: false,
        changeOrigin: true,
      },
      '/sessions/whoami': {
        target: 'http://127.0.0.1:4433',
        source: false,
        changeOrigin: true,
      },
    },
  },
};
