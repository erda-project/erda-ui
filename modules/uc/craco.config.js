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

const outputPath = path.resolve(__dirname, '../../public/static/uc');

module.exports = {
  webpack: {
    alias: {
      src: path.join(__dirname, 'src'),
    },
    configure: (webpackConfig, { paths }) => {
      paths.appBuild = outputPath;
      webpackConfig.output = {
        ...webpackConfig.output,
        path: outputPath,
        publicPath: '/static/uc/',
      };
      return webpackConfig;
    },
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  devServer: {
    port: 3030,
    proxy: {
      '/self-service': {
        target: 'http://127.0.0.1:4433',
        source: false,
        changeOrigin: true,
      },
      '/sessions/whoami': {
        target: 'http://127.0.0.1:4433',
        source: false,
        changeOrigin: true,
      },
    },
  },
};
