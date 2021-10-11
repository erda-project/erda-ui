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

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { getLessTheme, getScssTheme, themeColor } = require('./src/config/theme');
const { ModuleFederationPlugin } = require('webpack').container;
const AutomaticVendorFederation = require('@module-federation/automatic-vendor-federation');
const packageJson = require('./package.json');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

// const smp = new SpeedMeasurePlugin();
const resolve = (pathname) => path.resolve(__dirname, pathname);

const nusiRealPath = fs.realpathSync(resolve('./node_modules/@terminus/nusi'));
const antdRealPath = fs.realpathSync(resolve('./node_modules/antd'));

module.exports = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  console.log('isProd:', isProd);

  const lessVariables = getLessTheme(themeColor);
  const scssVariables = getScssTheme(false);

  const targetConfig = require(`./webpack.${nodeEnv}.js`);

  const commonConfig = {
    entry: {
      main: './src/index.tsx',
      cube: './src/cube.ts',
      i18n: './src/i18n.ts',
      agent: './src/agent.ts',
      config: './src/config.ts',
      'stores/route': './src/stores/route.ts',
      'stores/loading': './src/stores/loading.ts',
    },
    cache: {
      type: 'filesystem',
    },
    resolve: {
      alias: {
        nusi: resolve('./src/nusi'),
        cube: resolve('./src/cube'),
        common: resolve('./src/common'),
        i18n: resolve('./src/i18n'),
      },
      extensions: ['.js', '.jsx', '.tsx', '.ts', '.d.ts'],
    },
    module: {
      rules: [
        {
          test: /\.(scss)$/,
          include: [resolve('./src'), nusiRealPath],
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: false,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                webpackImporter: false,
                additionalData: scssVariables,
              },
            },
          ],
        },
        {
          test: /\.(less)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                lessOptions: {
                  modifyVars: lessVariables,
                  javascriptEnabled: true,
                },
              },
            },
          ],
          include: [resolve('./src'), antdRealPath, nusiRealPath],
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(tsx?|jsx?)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage', // enable polyfill on demand
                      corejs: 3,
                    },
                  ],
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  [
                    'import',
                    {
                      libraryName: 'lodash',
                      libraryDirectory: '',
                      camel2DashComponentName: false, // default: true
                    },
                    'lodash',
                  ],
                  '@babel/transform-runtime', // inject runtime helpers on demand
                ],
              },
            },
          ],
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      }),
      new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /(zh-cn)\.js/),
      new CleanWebpackPlugin(),
      new ModuleFederationPlugin({
        name: 'mf_core',
        exposes: {
          './index': './src/index.tsx',
          './cube': './src/cube.ts',
          './i18n': './src/i18n.ts',
          './agent': './src/agent.ts',
          './config': './src/config.ts',
          './stores/route': './src/stores/route.ts',
          './stores/loading': './src/stores/loading.ts',
          './stores/userMap': './src/stores/user-map.ts',
          './utils/ws': './src/utils/ws.ts',
          './nusi': './src/nusi/index.tsx',
          './service': './src/service/index.ts',
        },
        shared: {
          ...AutomaticVendorFederation({
            exclude: ['babel', 'plugin', 'preset', 'webpack', 'loader', 'serve'],
            ignoreVersion: ['react-router-dom', 'react-router-config', 'history'],
            packageJson,
            shareFrom: ['dependencies', 'peerDependencies'],
            ignorePatchVersion: true,
          }),
          react: {
            singleton: true,
            requiredVersion: packageJson.dependencies.react,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: packageJson.dependencies['react-dom'],
          },
        },
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all', // 默认作用于异步chunk，值为all/initial/async， all=initial+async
        minSize: 30000, // 默认值是30kb,代码块的最小尺寸
        // maxSize: 500000, // 500kb
        minChunks: 1, // 被多少模块共享,在分割之前模块的被引用次数
        maxAsyncRequests: 5, // 限制异步模块内部的并行最大请求数的，说白了你可以理解为是每个import()它里面的最大并行请求数量
        maxInitialRequests: 5, // 限制入口的拆分数量
        name: false,
        cacheGroups: {
          // 设置缓存组用来抽取满足不同规则的chunk
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            reuseExistingChunk: true,
            priority: -10,
          },
        },
      },
    },
  };

  return merge(commonConfig, targetConfig);
};
