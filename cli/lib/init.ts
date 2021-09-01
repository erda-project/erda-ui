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

import fs from 'fs';
import child_process from 'child_process';
import { logInfo, logSuccess } from './util/log';
import dotenv from 'dotenv';
import { promisify } from 'util';
import { EOL } from 'os';
import { getModules, isCwdInRoot } from './util/env';
import ora from 'ora';

const asyncExec = promisify(child_process.exec);

const ALL_MODULES = ['core', 'shell', 'market'];

// precondition
// pnpm & @erda-ui/cli & npm-check-updates installed globally
export default async ({
  hostName,
  port,
  override,
  backendUrl,
  online = false,
}: {
  hostName?: string;
  port?: string;
  override?: boolean;
  backendUrl?: string;
  online?: boolean;
}) => {
  const currentDir = process.cwd();
  isCwdInRoot({ currentPath: currentDir, alert: true });
  const externalModules = await getModules(online);

  if (!override) {
    let spinner = ora('installing commitizen & npm-check-updates...').start();
    const { stdout: msg } = await asyncExec('npm i -g npm-check-updates commitizen pnpm');
    logInfo(msg);
    logSuccess('installed pnpm, commitizen & npm-check-updates globally successfully😁');
    spinner.stop();

    spinner = ora('installing dependencies...').start();
    const { stdout: installMsg } = await asyncExec('pnpm i');
    logInfo(installMsg);
    logSuccess('finish installing dependencies.');
    spinner.stop();
  }

  const envConfigPath = `${currentDir}/.env`;
  const { parsed: fullConfig } = dotenv.config({ path: envConfigPath });

  if (!fullConfig || override) {
    const newConfig: dotenv.DotenvParseOutput = {};
    newConfig.BACKEND_URL = backendUrl || 'https://terminus-org.dev.terminus.io';
    newConfig.MODULES = ALL_MODULES.concat(externalModules.map(({ name }) => name)).join(',');
    newConfig.SCHEDULER_PORT = port || '3000';
    newConfig.SCHEDULER_URL = hostName || 'https://dice.dev.terminus.io';

    const newFullConfig: string[] = [];
    Object.keys(newConfig).forEach((k) => {
      newFullConfig.push(`${k}=${newConfig[k]}`);
    });
    fs.writeFileSync(envConfigPath, newFullConfig.join(EOL), 'utf8');
    logSuccess('update erda-ui/.env file');
  } else {
    logInfo('.env config is not empty, skip env config initialize step, or you can override with option --override');
  }
};
