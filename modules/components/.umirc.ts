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

import { defineConfig } from 'dumi';
import { resolve } from 'path';

const title = 'Erda UI Components';

export default defineConfig({
  title,
  favicon: '/favicon.ico',
  logo: '/favicon.ico',
  outputPath: 'docs-dist',
  mode: 'site',
  hash: true,
  resolve: {
    includes: ['docs', 'src'],
  },
  base: `/`,
  publicPath: `/`,
  alias: {
    src: resolve(__dirname, 'src'),
  },
  navs: [
    null,
    {
      title: 'GitHub',
      path: 'https://github.com/erda-project/erda-ui/tree/master/modules/components',
    },
  ],
  extraBabelPlugins: [
    ['babel-plugin-import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
    ['babel-plugin-import', { libraryName: '@formily/antd', libraryDirectory: 'esm', style: true }, '@formily/antd'],
  ],
  lessLoader: {
    javascriptEnabled: true,
    modifyVars: { '@primary-color': '#302647' },
  },
  // more config: https://d.umijs.org/config
});
