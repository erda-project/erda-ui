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
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const outputPath = path.resolve(__dirname, '../../public/static/uc');

const isProd = process?.env?.NODE_ENV === 'production';
// ory cloud server
// const devUrlDomain = 'optimistic-goodall-4xvjx814sc.projects.oryapis.com';
// const devProxyUrl = `https://${devUrlDomain}`;

// local server
// const devUrlDomain = '127.0.0.1:4455';
// const devProxyUrl = `http://${devUrlDomain}`;

// dev server
const devUrlDomain = 'erda.dev.terminus.io';
const devProxyUrl = `https://${devUrlDomain}`;

module.exports = {
  webpack: {
    alias: {
      src: path.join(__dirname, 'src'),
    },
    configure: !isProd
      ? undefined
      : (webpackConfig, { paths }) => {
          paths.appBuild = outputPath;
          webpackConfig.output = {
            ...webpackConfig.output,
            path: outputPath,
            publicPath: '/static/uc/',
          };
          webpackConfig.plugins = [...webpackConfig.plugins, new CleanWebpackPlugin()];
          return webpackConfig;
        },
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  devServer: {
    port: 3032,
    proxy: {
      '/api/files': {
        target: devProxyUrl,
        source: false,
        changeOrigin: true,
        secure: false,
      },
      '/api/uc': {
        target: devProxyUrl,
        source: false,
        changeOrigin: true,
        secure: false,
        // pathRewrite: {
        //   '/api/uc': '',
        // },
        onProxyRes: function (proxyRes, req, res) {
          const cookies = proxyRes.headers['set-cookie'];

          const cookiePathRegex = /(p|P)ath=\/\w*;/;
          let newCookie;
          if (cookies) {
            newCookie = cookies.map((cookie) => {
              if (cookiePathRegex.test(cookie)) {
                return cookie.replace(cookiePathRegex, 'path=/;').replace(`Domain=${devUrlDomain};`, '');
              }
              return cookie;
            });
            proxyRes.headers['set-cookie'] = newCookie;
          }
        },
      },
    },
  },
};
