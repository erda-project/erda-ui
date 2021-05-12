// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

const config = require('./.erda/config');
const path = require('path');
const CracoAntDesignPlugin = require("craco-antd")

const resolve = pathname => path.resolve(__dirname, pathname);
const themeColor = '#6A549E';
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = config.wrapWebpack({
  webpack: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
    configure: (webpackConfig, { paths }) => { 
      paths.appBuild = 'dist';
      webpackConfig.output = {
        ...webpackConfig.output,
          path: path.resolve(__dirname, 'dist'), // 修改输出文件目录
          publicPath: isProd ? '/static/' : '/', //prod时打包到dist/static目录下
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
  output: {},
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
    proxy: {
      '/api': {
        target: 'https://terminus-org.dev.terminus.io',
        changeOrigin: true,
        secure: false,
      },
    },
  }
});
