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
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { getLessTheme, getScssTheme } = require('./config/theme');
const initJs = require('./app/views/init.js');
const css = require('./app/views/css.js');
const pkg = require('./package.json');
const { ModuleFederationPlugin } = require('webpack').container;
const mfConfigs = require('./mf.config');

const packageJson = require('./package.json');

const mainVersion = packageJson.version.slice(0, -2);

const resolve = pathname => path.resolve(__dirname, pathname);

module.exports = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isSplitMode = process.env.SPLIT_MODULE;
  const isOnline = process.env.DICE_WORKSPACE; // 线上才有的环境变量
  const isProd = nodeEnv === 'production';
  const cpuNum = isProd && isOnline ? 1 : os.cpus().length;
  const themeColor = '#6A549E';

  console.log('isProd:', isProd, process.version);

  const lessVariables = getLessTheme(themeColor);
  const scssVariables = getScssTheme(false);

  // eslint-disable-next-line
  const targetConfig = require(`./webpack.${nodeEnv}.js`);

  const commonConfig = {
    parallelism: cpuNum,
    entry: {
      app: ['./app'],
      market: ['./market'],
    },
    target: isProd ? 'browserslist' : 'web',
    resolve: {
      symlinks: false,
      alias: {
        app: resolve('./app'),
        common: resolve('./app/common'),
        configForm: resolve('./app/configForm'),
        'yml-chart': resolve('./app/yml-chart'),
        'config-page': resolve('./app/config-page'),
        layout: resolve('./app/layout'),
        user: resolve('./app/user'),
        charts: resolve('./app/charts'),
        dcos: resolve('./app/modules/dcos'),
        project: resolve('./app/modules/project'),
        publisher: resolve('./app/modules/publisher'),
        // admin: resolve('./app/modules/admin'),
        dataCenter: resolve('./app/modules/dataCenter'),
        org: resolve('./app/modules/org'),
        application: resolve('./app/modules/application'),
        runtime: resolve('./app/modules/runtime'),
        workBench: resolve('./app/modules/workBench'),
        addonPlatform: resolve('./app/modules/addonPlatform'),
        microService: resolve('./app/modules/microService'),
        apiManagePlatform: resolve('./app/modules/apiManagePlatform'),
        agent: resolve('./app/agent.js'),
        i18n: resolve('./app/i18n.ts'),
        // nusi: resolve('./app/external/nusi.js'),
        // '@terminus/nusi': resolve('./node_modules/@terminus/nusi'),
        'dice-env': resolve('./app/external/env.ts'),

        'monitor-overview': resolve('./app/modules/microService/monitor/monitor-overview'),
        'application-insight': resolve('./app/modules/microService/monitor/application-insight'),
        'external-insight': resolve('./app/modules/microService/monitor/external-insight'),
        'service-insight': resolve('./app/modules/microService/monitor/service-insight'),
        'browser-insight': resolve('./app/modules/microService/monitor/browser-insight'),
        'gateway-ingress': resolve('./app/modules/microService/monitor/gateway-ingress'),
        'docker-container': resolve('./app/modules/microService/monitor/docker-container'),
        'mobile-insight': resolve('./app/modules/microService/monitor/mobile-insight'),
        'api-insight': resolve('./app/modules/microService/monitor/api-insight'),
        'trace-insight': resolve('./app/modules/microService/monitor/trace-insight'),
        'monitor-common': resolve('./app/modules/microService/monitor/monitor-common'),
        topology: resolve('./app/modules/microService/monitor/topology'),
        'status-insight': resolve('./app/modules/microService/monitor/status-insight'),
        'error-insight': resolve('./app/modules/microService/monitor/error-insight'),
        'monitor-alarm': resolve('./app/modules/microService/monitor/monitor-alarm'),
        '@terminus/dashboard-configurator': path.join(__dirname, 'node_modules/@terminus/dashboard-configurator'),
      },
      extensions: ['.js', '.jsx', '.tsx', '.ts', '.d.ts'],
      modules: ['node_modules'],
      fallback: {
        path: require.resolve('path-browserify'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
      },
    },
    cache: {
      type: 'filesystem',
    },
    module: {
      rules: [
        {
          test: /\.(scss)$/,
          include: [
            resolve('app'),
            resolve('market'),
            resolve('node_modules/@terminus/dashboard-configurator'),
            // resolve('node_modules/@terminus/nusi'),
          ],
          use: [
            ...(isProd ? [MiniCssExtractPlugin.loader] : []), // extract not support hmr, https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/222
            'thread-loader',
            ...(isProd ? [] : ['style-loader']),
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: false,
              },
            },
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                webpackImporter: false,
                additionalData: scssVariables,
              },
            },
            {
              loader: 'sass-resources-loader',
              options: {
                sourceMap: false,
                resources: [
                  resolve('./app/styles/_variable.scss'),
                  resolve('./app/styles/_color.scss'),
                  resolve('./app/styles/_mixin.scss'),
                ],
              },
            },
          ],
        },
        {
          test: /\.(less)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'thread-loader',
            'css-loader',
            'postcss-loader',
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
          include: [
            // resolve('node_modules/antd'),
            // resolve('node_modules/@terminus/nusi'),
          ],
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(tsx?|jsx?)$/,
          include: [
            resolve('app'),
            resolve('market'),
            resolve('node_modules/@terminus/dashboard-configurator'),
          ],
          use: [
            'thread-loader',
            {
              loader: 'ts-loader',
              options: {
                happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
                transpileOnly: true,
                getCustomTransformers: resolve('webpack_ts.loader.js'),
              },
            },
          ],
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.map$/,
          loader: 'ignore-loader',
        },
        // {
        //   test: /\.svg$/,
        //   type: 'asset',
        //   parser: {
        //     dataUrlCondition: {
        //       maxSize: 8 * 1024, // 8kb
        //     },
        //   },
        //   include: [
        //     resolve('app/images'),
        //     resolve('node_modules/@terminus/nusi'),
        //   ],
        // },
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
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          // { from: './app/images', to: 'shell/images' },
          // { from: './market/images', to: 'shell/images' },
          { from: './app/static', to: resolve('../public/static') },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './app/views/index.ejs',
        excludeChunks: ['market'],
        css,
        initJs,
        skeleton: {
          html: fs.readFileSync(
            resolve('./app/views/skeleton.html')
          ),
        },
        minify: isProd
          ? {
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            removeEmptyAttributes: true,
          }
          : false,
        diceVersion: JSON.stringify(pkg.version),
      }),
      new HtmlWebpackPlugin({
        filename: 'market.html',
        template: './market/views/market.ejs',
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
      new webpack.ContextReplacementPlugin(
        // eslint-disable-next-line
        /moment[\\\/]locale$/,
        /(zh-cn)\.js/
      ),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        'process.env.DICE_VER': JSON.stringify(pkg.version),
        'process.env.SPLIT_MODULE': JSON.stringify(process.env.SPLIT_MODULE),
        'process.env.mainVersion': JSON.stringify(mainVersion),
      }),
      ...mfConfigs.map(mfConfig => (
        new ModuleFederationPlugin(mfConfig)
      )),
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
        cacheGroups: { // 设置缓存组用来抽取满足不同规则的chunk
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            reuseExistingChunk: true,
            priority: -10,
          },
          eCharts: {
            test: /[\\/]node_modules[\\/]echarts\/lib/,
            reuseExistingChunk: true,
            name: 'eCharts',
            priority: -5,
          },
        },
      },
    },
  };

  return merge(commonConfig, targetConfig);
};
