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

import { join, resolve } from 'path';
import fs from 'fs';
import { exit } from 'process';
import { logError } from './log';
import dotenv from 'dotenv';

export const checkIsRoot = () => {
  if (!fs.existsSync(`${process.cwd()}/.env`)) {
    logError('Please run this command under erda-ui root directory');
    exit(1);
  }
};

export const isCwdInRoot = (params?: { currentPath?: string; alert?: boolean }) => {
  const currentDir = params?.currentPath || process.cwd();
  let isInRoot = true;
  if (!fs.existsSync(join(currentDir, 'package.json'))) {
    isInRoot = false;
  } else {
    const pkg = fs.readFileSync(join(currentDir, 'package.json'), 'utf8');
    const { name } = JSON.parse(pkg);
    if (name !== 'erda-ui') {
      isInRoot = false;
    }
  }

  if (!isInRoot && params?.alert) {
    logError('please run this command under erda-ui root directory');
    process.exit(1);
  }
  return isInRoot;
};

export const getCwdModuleName = (params?: { currentPath?: string }) => {
  const currentDir = params?.currentPath || process.cwd();
  let moduleName = null;
  let isInRoot = true;
  if (!fs.existsSync(join(currentDir, 'package.json'))) {
    isInRoot = false;
  } else {
    const pkg = fs.readFileSync(join(currentDir, 'package.json'), 'utf8');
    const { name } = JSON.parse(pkg);
    if (!name.startsWith('@erda-ui/')) {
      isInRoot = false;
    } else {
      moduleName = name.slice('@erda-ui/'.length);
    }
  }

  if (!isInRoot || !moduleName) {
    logError('please run this command under an erda-ui module root directory');
    process.exit(1);
  }
  return moduleName;
};

export const getEnvConfig = (currentDir?: string) => {
  const { parsed } = dotenv.config({ path: `${currentDir || process.cwd()}/.env` });
  if (!parsed) {
    throw Error(`.env file not exist in ${process.cwd()}`);
  }
  return parsed;
};

export const getModuleList = () => {
  const envConfig = getEnvConfig();
  return envConfig.MODULES.split(',').map((m) => m.trim());
};

export interface ERDA_BUILD_CONFIG {
  name: string;
  env?: { [k: string]: string | number | boolean };
  nginx?: string;
  indexUrl?: string;
  role?: string;
}

export const getModules = async (online: boolean, currentDir?: string) => {
  const modulePath = resolve(currentDir || process.cwd(), online ? 'modules' : '../erda-ui-enterprise');
  const children = fs.readdirSync(modulePath, { withFileTypes: true });
  const modules: ERDA_BUILD_CONFIG[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.isDirectory()) {
      const configPath = resolve(modulePath, child.name, 'erda-build-config.js');
      if (fs.existsSync(configPath)) {
        // eslint-disable-next-line no-await-in-loop
        const moduleConfig: ERDA_BUILD_CONFIG = await import(configPath);
        modules.push(moduleConfig);
      }
    }
  }
  return modules;
};

export const getCliDir = () => {
  return join(process.cwd(), 'cli');
};

export const getCoreDir = () => {
  return join(process.cwd(), 'core');
};

export const getShellDir = () => {
  return join(process.cwd(), 'shell');
};

export const getPublicDir = () => {
  return join(process.cwd(), 'public');
};

export const getSchedulerDir = () => {
  return join(process.cwd(), 'scheduler');
};

export const registryDir = 'registry.erda.cloud/erda/ui';

export const isWindows = process.platform === 'win32';
export const isMacintosh = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
// yarn binary based on OS
export const npmCmd = isWindows ? 'npm.cmd' : 'npm';
