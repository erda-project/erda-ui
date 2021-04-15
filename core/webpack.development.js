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

const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd(), '..');
const { parsed: config } = require('dotenv').config({ path: `${root}/.env` })

const backendUrl = config.DEV_HOST;
const frontUrl = `local-core.${backendUrl.replace(/http(s?):\/\//, '')}`; // local与对应环境根域名一致

console.log(`
add config in host file:\n
127.0.0.1  ${frontUrl}
`);

module.exports = {
  mode: 'development',
  watchOptions: {
    // aggregateTimeout: 500,
    ignored: ['node_modules', 'test'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    host: frontUrl,
    port: 5000,
    historyApiFallback: true,
    https: {
      key: fs.readFileSync('../cert/dev/server.key'),
      cert: fs.readFileSync('../cert/dev/server.crt'),
    },
    publicPath: '/'
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[id].[contenthash].js',
    publicPath: 'http://localhost:3000/core/',
  },
};
