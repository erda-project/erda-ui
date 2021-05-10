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

import { join } from 'path';
import fs from 'fs';
import { forEach } from 'lodash';
import { exit } from 'process';
import { logError } from './log';

// erda-ui root
export const rootDir = process.cwd();
if (!fs.existsSync(`${rootDir}/.env`)) {
  logError('Please run this command under erda-ui root directory');
  exit(1);
}

const { parsed: moduleEnv } = require('dotenv').config({ path: `${rootDir}/.env` });

export const cliDir = join(rootDir, 'cli');
export const coreDir = join(rootDir, 'core');
export const shellDir = join(rootDir, 'shell');
export const publicDir = join(rootDir, 'public');
export const schedulerDir = join(rootDir, 'scheduler');
export const registryDir = 'registry.cn-hangzhou.aliyuncs.com/terminus/erda-ui';

export const moduleList: Array<{ moduleName: string; moduleDir: string }> = [];
const modules: string[] = moduleEnv.PROD_MODULES.split(',');

forEach(modules, (m) => {
  if (m) {
    const modulePath = moduleEnv[`${m.toUpperCase()}_DIR`];
    moduleList.push({
      moduleName: m,
      moduleDir: modulePath,
    });
  }
});

export const isWindows = process.platform === 'win32';
export const isMacintosh = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
// yarn binary based on OS
export const yarnCmd = isWindows ? 'yarn.cmd' : 'yarn';
export const npmCmd = isWindows ? 'npm.cmd' : 'npm';
