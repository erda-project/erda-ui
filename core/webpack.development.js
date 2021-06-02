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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  watchOptions: {
    // aggregateTimeout: 500,
    ignored: ['node_modules', 'test'],
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[id].[contenthash].js',
    publicPath: 'https://local-core.terminus-org.dev.terminus.io:5000/',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style/[name].css',
      ignoreOrder: true,
    }),
  ],
};
