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
const webpack = require('webpack');

const vendors = [
  'react',
  'react-dom',
  'moment',
  'lodash',
  // 'antd',
  'echarts',
  'react-router-dom',
  'react-router',
  'js-yaml',
  'react-ace',
  'path-to-regexp',
  'marked',
  'highlight.js',
  'xterm',
  'superagent',
  'clipboard',
  'holderjs',
  'snapsvg-cjs',
  'json-to-pretty-yaml',
];

module.exports = {
  mode: 'development',
  entry: { vendor: vendors },
  output: {
    path: path.join(__dirname, 'public/static'),
    filename: 'dll.js',
    library: '[name]_[hash]',
  },
  // resolve: {
  //   extensions: ['.js', '.jsx', '.tsx', '.ts', '.d.ts'],
  // },
  // module: {
  //   rules: [
  //     {
  //       test: /\.(tsx?|jsx?)$/,
  //       use: [
  //         {
  //           loader: 'ts-loader',
  //           options: {
  //             transpileOnly: true,
  //             allowTsInNodeModules: true,
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'public/static/manifest.json'),
      name: '[name]_[hash]',
      context: __dirname,
    }),
  ],
};
