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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const cssnano = require('cssnano');
const moment = require('moment');

const gitRevisionPlugin = new GitRevisionPlugin();
const banner = `commit: ${gitRevisionPlugin.commithash().slice(0, 6)}
branch: ${gitRevisionPlugin.branch()}
buildTime: ${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}`;

module.exports = {
  mode: 'production',
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../../../public'),
    filename: 'static/microService/scripts/[name].js',
    chunkFilename: 'static/microService/scripts/[chunkhash].chunk.js',
    publicPath: '/',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/microService/style/[name].[contenthash].css',
    }),
  ],
  optimization: {
    namedChunks: true,
    minimize: true,
    minimizer: [
      new webpack.BannerPlugin(banner),
      new TerserPlugin({
        parallel: true,
        cache: path.join(__dirname, '/.terser-cache'),
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: cssnano,
        cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
        canPrint: true,
      }),
    ],
  },
};
