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

// 进程间是不能拷贝 方法的, 导致了 getCustomTransformers的在happypack中不能被执行
// https://github.com/Igorbek/typescript-plugin-styled-components

const tsImportPluginFactory = require('ts-import-plugin');
const statements = require('tsx-control-statements').default;

const getCustomTransformers = () => ({
  before: [
    statements(),
    tsImportPluginFactory([
      // {
      //   libraryName: 'antd',
      //   libraryDirectory: 'lib',
      //   style: true,
      // },
      // {
      //   libraryName: '@terminus/nusi',
      //   libraryDirectory: 'es',
      //   style: true,
      // },
      {
        style: false,
        libraryName: 'lodash',
        libraryDirectory: null,
        camel2DashComponentName: false,
      },
      {
        libraryName: '@icon-park/react',
        libraryDirectory: 'es/icons',
        camel2DashComponentName: false,
      },
    ]),
  ],
});

module.exports = getCustomTransformers;
