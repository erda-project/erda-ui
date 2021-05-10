const path = require('path');
const CracoAntDesignPlugin = require("craco-antd")
const HtmlWebpackPlugin = require('html-webpack-plugin');

const resolve = pathname => path.resolve(__dirname, pathname);
const themeColor = '#6A549E';
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
module.exports = {
  webpack: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
    plugins: [
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: './src/views/market.ejs',
          chunks: ['vendors~app~market', 'vendors~market', 'market'],
          isProd,
          minify: isProd
            ? {
              collapseWhitespace: true,
              minifyJS: true,
              minifyCSS: true,
              removeEmptyAttributes: true,
            }
            : false,
        }),
      ],
    module: {
      rules: [
        {
          test: /\.(tsx?|jsx?)$/,
          include: [
            resolve('./src'),
          ],
          use: [
            'thread-loader',
            'babel-loader',
            'ts-loader',
          ],
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash].[ext]',
                outputPath: 'images',
              },
            },
          ],
        },
      ],
    },
  },
  style: {
    postcss: {
      plugins: [
        require('autoprefixer'),
      ],
    },
    sass: {
      loaderOptions: {
        additionalData: `@import "./src/styles/_resources.scss";`
      }
    },
  },
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          "@primary-color": themeColor,
          "@link-color": themeColor,
        },
      },
    },
  ],
  devServer: {
    host: '127.0.0.1',
    port: 4001,
    proxy: {
      '/api': {
        target: 'https://terminus-org.dev.terminus.io',
        changeOrigin: true,
        secure: false,
      },
    },
  }
}
