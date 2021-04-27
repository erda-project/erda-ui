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

const { resolve, join } = require('path');
const path = require('path');
const { forEach } = require('lodash');

// project root
const rootDir = resolve(process.cwd(), '..');

const projectEnvPath = path.resolve(process.cwd(), '../.env');
const { parsed: moduleEnv } = require('dotenv').config({ path: projectEnvPath });

const cliDir = join(rootDir, 'cli');
const coreDir = join(rootDir, 'core');
const shellDir = join(rootDir, 'shell');
const publicDir = join(rootDir, 'public');
const schedulerDir = join(rootDir, 'scheduler');
const registryDir = 'registry.cn-hangzhou.aliyuncs.com/terminus/erda-ui';

const moduleList = [];
const modules = moduleEnv.PROD_MODULES.split(',');

forEach(modules, m=> {
  if (m) {
    const modulePath = moduleEnv[`${m.toUpperCase()}_DIR`];
    moduleList.push({
      moduleName: m,
      moduleDir: modulePath
    });
  }
});

const isWindows = process.platform === 'win32'
const isMacintosh = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
// yarn binary based on OS
const yarnCmd = isWindows ? 'yarn.cmd' : 'yarn';

module.exports = {
  isWindows,
  isMacintosh,
  isLinux,
  yarnCmd,
  cliDir,
  rootDir,
  coreDir,
  shellDir,
  publicDir,
  schedulerDir,
  registryDir,
  moduleList
}
