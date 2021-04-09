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
const os = require('os');
const webpack = require('webpack');
const HappyPack = require('happypack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');

const resolve = pathname => path.resolve(__dirname, pathname);

module.exports = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  // const isProd = nodeEnv === 'production';
  const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

  const targetConfig = require(`./webpack.${nodeEnv}.js`);

  const commonConfig = {
    parallelism: os.cpus().length,
    entry: {
      microService: __dirname,
    },
    externals: [
      {
        // 这几个在external里挂到了全局对象上
        react: 'React',
        classnames: ['_modules', 'classnames'],
        moment: ['_modules', 'moment'],
        nusi: ['_modules', 'nusi'],
        lodash: ['_modules', 'lodash'],
        agent: ['_modules', 'agent'],
        common: ['_modules', 'common'],
        'common/utils': ['_modules', 'commonUtils'],
        'layout/common': ['_modules', 'layoutCommon'],
        charts: ['_modules', 'charts'],
      },
    ],
    resolve: {
      symlinks: false,
      alias: {
        '~': resolve('../../../'),
        app: resolve('../../'),
        layout: resolve('../../layout'),
        common: resolve('../../common'),
        charts: resolve('../charts'),
        microService: resolve('./'),
        'application-insight': resolve('./monitor/application-insight'),
        'api-insight': resolve('./monitor/api-insight'),
        'monitor-overview': resolve('./monitor/monitor-overview'),
        'browser-insight': resolve('./monitor/browser-insight'),
        'gateway-ingress': resolve('./monitor/gateway-ingress'),
        'docker-container': resolve('./monitor/docker-container'),
        'mobile-insight': resolve('./monitor/mobile-insight'),
        'trace-insight': resolve('./monitor/trace-insight'),
        'monitor-common': resolve('./monitor/monitor-common'),
        'service-insight': resolve('./monitor/service-insight'),
        'external-insight': resolve('./monitor/external-insight'),
        topology: resolve('./monitor/topology'),
        'status-insight': resolve('./monitor/status-insight'),
        'error-insight': resolve('./monitor/error-insight'),
        'monitor-alarm': resolve('./monitor/monitor-alarm'),
        project: resolve('../../../app/modules/project'),
        application: resolve('../../../app/modules/application'),
        runtime: resolve('../../../app/modules/runtime'),
        dcos: resolve('../../../app/modules/dcos'),
      },
      extensions: ['.js', '.jsx', '.tsx', '.ts', '.d.ts'],
      modules: [__dirname, 'node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.(scss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: false,
                localIdentName: '[name]_[local]-[hash:base64:7]',
              },
            },
            'postcss-loader',
            {
              loader: 'sass-loader',
            },
            {
              loader: 'sass-resources-loader',
              options: {
                sourceMap: false,
                resources: [
                  resolve('../../styles/_variable.scss'),
                  resolve('../../styles/_color.scss'),
                  resolve('../../styles/_mixin.scss'),
                ],
              },
            },
          ],
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css'],
        },
        {
          test: /\.(tsx?|jsx?)$/,
          include: [
            resolve('../../'),
          ],
          use: ['happypack/loader?id=ts'],
        },
        {
          test: /\.map$/,
          loader: 'ignore-loader',
        },
      ],
    },
    plugins: [
      new HappyPack({
        id: 'ts',
        threadPool: happyThreadPool,
        loaders: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
              // getCustomTransformers: resolve(
              //   '../../../webpack_ts.loader.js'
              // ),
            },
          },
        ],
      }),
      new HappyPack({
        id: 'css',
        threadPool: happyThreadPool,
        loaders: ['css-loader'],
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      }),
    ],
  };

  return merge(commonConfig, targetConfig);
};
