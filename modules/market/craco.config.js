const path = require('path');
const CracoAntDesignPlugin = require("craco-antd")

const resolve = pathname => path.resolve(__dirname, pathname);
const themeColor = '#6A549E';
module.exports = {
  webpack: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => { 
      paths.appBuild = 'build/market'
      webpackConfig.output = {
        ...webpackConfig.output,
          path: path.resolve(__dirname, 'build/market'), // 修改输出文件目录
          publicPath: '/'
      }
      return webpackConfig; 
    },
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
