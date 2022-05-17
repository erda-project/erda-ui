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

/* eslint-disable */
import legacyPlugin from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import * as path from 'path';
import postcss from './postcss.config.mjs';
import { getLessTheme } from './app/theme-color.mjs';

const babelConfig = require('./babel.config.js')();

const packageJson = require('./package.json');

const mainVersion = packageJson.version.slice(0, -2);
const dotenv = require('dotenv');

const { parsed: envConfig } = dotenv.config({ path: path.resolve(__dirname, '../.env') });

// @see https://cn.vitejs.dev/config/
export default ({ command, mode }) => {
  let alias = [
    { find: 'core/index', replacement: path.resolve(__dirname, '../core/src/index') },
    { find: 'core/config', replacement: path.resolve(__dirname, '../core/src/config') },
    { find: 'core/i18n', replacement: path.resolve(__dirname, '../core/src/i18n') },
    { find: 'core/cube', replacement: path.resolve(__dirname, '../core/src/cube') },
    { find: 'core/service', replacement: path.resolve(__dirname, '../core/src/service') },
    { find: 'admin/entry', replacement: path.resolve(__dirname, '../../erda-ui-enterprise/admin/src') },
    { find: 'core/agent', replacement: path.resolve(__dirname, '../core/src/agent') },
    { find: 'core/stores/route', replacement: path.resolve(__dirname, '../core/src/stores/route') },
    { find: 'core/stores/userMap', replacement: path.resolve(__dirname, '../core/src/stores/user-map') },
    { find: 'core/utils/ws', replacement: path.resolve(__dirname, '../core/src/utils/ws.ts') },
    { find: 'core/global-space', replacement: path.resolve(__dirname, '../core/src/utils/global-space.ts') },
    { find: 'core/event-hub', replacement: path.resolve(__dirname, '../core/src/utils/event-hub.ts') },
    { find: 'core/stores/loading', replacement: path.resolve(__dirname, '../core/src/stores/loading.ts') },
    { find: '__mocks__', replacement: path.resolve(__dirname, './__mocks__') },
    { find: 'app', replacement: path.resolve(__dirname, './app') },
    { find: 'auto_test', replacement: path.resolve(__dirname, './auto_test') },
    { find: 'bash', replacement: path.resolve(__dirname, './bash') },
    { find: 'config', replacement: path.resolve(__dirname, './config') },
    { find: 'node_modules', replacement: path.resolve(__dirname, './node_modules') },
    { find: 'snippets', replacement: path.resolve(__dirname, './snippets') },
    { find: 'test', replacement: path.resolve(__dirname, './test') },
    { find: 'tools', replacement: path.resolve(__dirname, './tools') },
    { find: 'common', replacement: path.resolve(__dirname, './app/common') },
    { find: 'configForm', replacement: path.resolve(__dirname, './app/configForm') },
    { find: 'yml-chart', replacement: path.resolve(__dirname, './app/yml-chart') },
    { find: 'config-page', replacement: path.resolve(__dirname, './app/config-page') },
    { find: 'layout', replacement: path.resolve(__dirname, './app/layout') },
    { find: 'user', replacement: path.resolve(__dirname, './app/user') },
    { find: 'charts', replacement: path.resolve(__dirname, './app/charts') },
    { find: 'dcos', replacement: path.resolve(__dirname, './app/modules/dcos') },
    { find: 'project', replacement: path.resolve(__dirname, './app/modules/project') },
    { find: 'publisher', replacement: path.resolve(__dirname, './app/modules/publisher') },
    { find: 'cmp', replacement: path.resolve(__dirname, './app/modules/cmp') },
    { find: 'org', replacement: path.resolve(__dirname, './app/modules/org') },
    { find: 'application', replacement: path.resolve(__dirname, './app/modules/application') },
    { find: 'runtime', replacement: path.resolve(__dirname, './app/modules/runtime') },
    { find: 'dop', replacement: path.resolve(__dirname, './app/modules/dop') },
    { find: 'addonPlatform', replacement: path.resolve(__dirname, './app/modules/addonPlatform') },
    { find: 'msp', replacement: path.resolve(__dirname, './app/modules/msp') },
    { find: 'apiManagePlatform', replacement: path.resolve(__dirname, './app/modules/apiManagePlatform') },
    { find: 'agent', replacement: path.resolve(__dirname, './app/agent.js') },
    { find: 'i18n', replacement: path.resolve(__dirname, './app/i18n.ts') },
    { find: 'monitor-overview', replacement: path.resolve(__dirname, './app/modules/msp/monitor/monitor-overview') },
    { find: 'external-insight', replacement: path.resolve(__dirname, './app/modules/msp/monitor/external-insight') },
    { find: 'browser-insight', replacement: path.resolve(__dirname, './app/modules/msp/monitor/browser-insight') },
    { find: 'gateway-ingress', replacement: path.resolve(__dirname, './app/modules/msp/monitor/gateway-ingress') },
    { find: 'docker-container', replacement: path.resolve(__dirname, './app/modules/msp/monitor/docker-container') },
    { find: 'api-insight', replacement: path.resolve(__dirname, './app/modules/msp/monitor/api-insight') },
    { find: 'trace-insight', replacement: path.resolve(__dirname, './app/modules/msp/monitor/trace-insight') },
    { find: 'monitor-common', replacement: path.resolve(__dirname, './app/modules/msp/monitor/monitor-common') },
    { find: 'topology', replacement: path.resolve(__dirname, './app/modules/msp/monitor/topology') },
    { find: 'status-insight', replacement: path.resolve(__dirname, './app/modules/msp/monitor/status-insight') },
    { find: 'error-insight', replacement: path.resolve(__dirname, './app/modules/msp/monitor/error-insight') },
    { find: 'monitor-alarm', replacement: path.resolve(__dirname, './app/modules/msp/monitor/monitor-alarm') },
    { find: /^~/, replacement: '' },
  ];

  const wsPathRegex = [
    /^\/api\/[^/]*\/websocket/,
    /^\/api\/[^/]*\/fdp-websocket/, // http-proxy-middleware can't handle multiple ws proxy https://github.com/chimurai/http-proxy-middleware/issues/463
    /^\/api\/[^/]*\/terminal/,
    /^\/api\/[^/]*\/apim-ws\/api-docs\/filetree/,
  ];

  return {
    base: './', // index.html文件所在位置
    root: './', // js导入的资源路径，src
    resolve: {
      alias,
    },
    publicDir: 'app/static',
    define: {
      'process.env.VITE': '"true"',
      'process.env.UI_ENV': JSON.stringify(process.env.ERDA_UI_ENV),
      'process.env.FOR_COMMUNITY': JSON.stringify(process.env.FOR_COMMUNITY),
      'process.env.mainVersion': JSON.stringify(mainVersion),
    },
    server: {
      host: envConfig.SCHEDULER_URL.replace('https://', ''),
      watch: {
        ignored: ['**/__tests__/**'],
      },
      proxy: {
        // string shorthand
        // '/foo': 'http://localhost:4567',
        // with options
        '/api/': {
          target: envConfig.BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
      },
      https: {
        key: fs.readFileSync('../cert/dev/server.key'),
        cert: fs.readFileSync('../cert/dev/server.crt'),
      },
    },
    plugins: [
      legacyPlugin({
        targets: ['Chrome >= 80', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15'],
      }),
      react({
        babel: {
          plugins: babelConfig.plugins.slice(0, 2),
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          // 支持内联 JavaScript
          javascriptEnabled: true,
          modifyVars: getLessTheme(),
        },
        scss: {
          additionalData:
            '@import "app/styles/_color.scss";@import "app/styles/_variable.scss";@import "app/styles/_mixin.scss";',
        },
      },
      postcss,
    },
  };
};
