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
const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const swaggerParserMock = require('swagger-parser-mock');
const pathToRegexp = require('path-to-regexp');
const Mock = require('mockjs');

const backendUrl = config.DEV_URL;
let mockpath = [];
if (fs.existsSync('./swagger.json')) swaggerParserMock({ spec: require('./swagger.json') }).then((docs) => { mockpath = docs.paths; });

const redirectPaths = [
  "/microService",
  "/workBench",
  "/dataCenter",
  "/orgCenter",
  "/edge",
  "/sysAdmin",
  "/org-list",
  "/noAuth",
  "/freshMan",
  "/inviteToOrg",
  "/perm"
]

module.exports = config.wrapWebpack({
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  watchOptions: {
    aggregateTimeout: 500,
    ignored: [
      'node_modules', 'public', 'test', 'docs', 'tmp',
    ],
    poll: 5000,
  },
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, 'public'),
    index: 'index.html',
    open: true,
    noInfo: false,
    progress: false,
    historyApiFallback: true,
    watchContentBase: false,
    liveReload: false,
    hot: true,
    watchOptions: {
      // @@@ 独立模块列表
      ignored: [
        'node_modules', 'public', 'test', 'docs', 'tmp', 'tools', 'cypress', 'interface',
        'app/external',
      ],
    },
    https: {
      key: fs.readFileSync('../cert/dev/server.key'),
      cert: fs.readFileSync('../cert/dev/server.crt'),
    },
    proxy: [
      {
        context: ['/api/websocket'],
        target: backendUrl,
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      {
        context: ['/api/websocket'],
        target: backendUrl,
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      {
        context: redirectPaths,
        bypass: function(req, res, proxyOptions) {
          let firstPath = (req.url || '').split('/')[1];
          if(redirectPaths.includes(`/${firstPath}`)){
              res.redirect(`/-${req.url}`);
              return true;
          }
        }
      },
      {
        context: ['/api/websocket'],
        target: backendUrl,
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      {
        context: ['/fdp-app/'],
        target: backendUrl, // incase need local debug
        secure: false,
        changeOrigin: true,
        // pathRewrite: { '^/fdp-app': '' },
      },
      {
        context: ['/api', '/ta'],
        target: backendUrl,
        secure: false,
        changeOrigin: true,
        // ignorePath: false,
        onProxyRes(proxyRes, req, res) {
          if (proxyRes.statusCode === 404 || proxyRes.statusCode === 503) {
            Object.keys(mockpath).forEach((mockurl) => {
              mockpath[mockurl].mockUrl = mockurl.replace(/{/g, ':').replace(/}/g, '');
              if (pathToRegexp(mockpath[mockurl].mockUrl).exec(req.path)) {
                const responses = mockpath[mockurl][req.method.toLowerCase()].responses[200].example && JSON.parse(mockpath[mockurl][req.method.toLowerCase()].responses[200].example);
                res.json(Mock.mock(responses));
                console.log(`mockto: ${req.method} ${mockurl}`);
              }
            });
          }
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[id].chunk.js',
  },
  stats: { children: false },
  plugins: [
    new WebpackBuildNotifierPlugin({
      title: 'Erda UI Development',
      // suppressSuccess: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'style/[name].css',
      ignoreOrder: true,
    }),
  ],
  optimization: {
    minimize: false,
  },
});
