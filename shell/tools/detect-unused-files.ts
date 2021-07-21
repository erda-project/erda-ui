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

/* eslint-disable no-console */
import findUnusedModule from './find-unused-module';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require(path.resolve(__dirname, '../package.json'));
const { devDependencies, dependencies } = pkg;
const nodeModules = Object.keys(dependencies)
  .concat(Object.keys(devDependencies))
  .concat(['path', 'prop-types', 'history']);

const resolve = (pathname: string) => path.resolve(__dirname, '..', pathname);

const aliasMap = {
  app: resolve('./app'),
  common: resolve('./app/common'),
  configForm: resolve('./app/configForm'),
  'yml-chart': resolve('./app/yml-chart'),
  'config-page': resolve('./app/config-page'),
  layout: resolve('./app/layout'),
  user: resolve('./app/user'),
  charts: resolve('./app/charts'),
  dcos: resolve('./app/modules/dcos'),
  project: resolve('./app/modules/project'),
  publisher: resolve('./app/modules/publisher'),
  cmp: resolve('./app/modules/cmp'),
  org: resolve('./app/modules/org'),
  application: resolve('./app/modules/application'),
  runtime: resolve('./app/modules/runtime'),
  dop: resolve('./app/modules/dop'),
  addonPlatform: resolve('./app/modules/addonPlatform'),
  msp: resolve('./app/modules/msp'),
  apiManagePlatform: resolve('./app/modules/apiManagePlatform'),
  agent: resolve('./app/agent.js'),
  i18n: resolve('./app/i18n.ts'),
  'dice-env': resolve('./app/external/env.ts'),
  'monitor-overview': resolve('./app/modules/msp/monitor/monitor-overview'),
  'application-insight': resolve('./app/modules/msp/monitor/application-insight'),
  'external-insight': resolve('./app/modules/msp/monitor/external-insight'),
  'service-insight': resolve('./app/modules/msp/monitor/service-insight'),
  'browser-insight': resolve('./app/modules/msp/monitor/browser-insight'),
  'gateway-ingress': resolve('./app/modules/msp/monitor/gateway-ingress'),
  'docker-container': resolve('./app/modules/msp/monitor/docker-container'),
  'mobile-insight': resolve('./app/modules/msp/monitor/mobile-insight'),
  'api-insight': resolve('./app/modules/msp/monitor/api-insight'),
  'trace-insight': resolve('./app/modules/msp/monitor/trace-insight'),
  'monitor-common': resolve('./app/modules/msp/monitor/monitor-common'),
  topology: resolve('./app/modules/msp/monitor/topology'),
  'status-insight': resolve('./app/modules/msp/monitor/status-insight'),
  'error-insight': resolve('./app/modules/msp/monitor/error-insight'),
  'monitor-alarm': resolve('./app/modules/msp/monitor/monitor-alarm'),
};

const aliasKeys = Object.keys(aliasMap);

const noneJs = ['zh-cn'];
const ignoreSuffix = ['.md', '.d.ts', 'mock.ts'];
const ignorePath = [
  '__tests__',
  'config-page',
  'app/static',
  'app/views',
  'bootstrap.js',
  'app/index.js',
  'app/styles',
];

const detect = () => {
  const result = findUnusedModule({
    cwd: `${path.resolve(__dirname, '../app')}`,
    entries: [`${path.resolve(__dirname, '../app/App.tsx')}`],
    includes: ['**/*', '!node_modules'],
    resolveRequirePath: (curDir: string, requirePath: string) => {
      const [prefix, ...rest] = requirePath.split('/');
      if (nodeModules.some((item) => requirePath.startsWith(item))) {
        return 'node_modules';
      } else if (aliasKeys.includes(prefix)) {
        const realPath = aliasMap[prefix];
        return path.resolve(realPath, rest.join('/'));
      } else if (requirePath.startsWith('core/')) {
        return 'node_modules';
      } else if (noneJs.some((item) => requirePath.endsWith(item))) {
        return 'node_modules';
      }
      return path.resolve(curDir, requirePath);
    },
    ignoreSuffix,
    ignorePath,
  });
  console.log(`unused files count: ${result.unused.length}`);
  (result.unused || []).forEach((item) => {
    console.log(item);
  });
};

detect();

export default detect;
