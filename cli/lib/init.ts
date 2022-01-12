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
import { logInfo, logSuccess } from './util/log';
import dotenv from 'dotenv';
import execa from 'execa';
import { EOL } from 'os';
import { ALL_MODULES, isCwdInRoot } from './util/env';
import ora from 'ora';
import inquirer from 'inquirer';

export default async ({
  port,
  override,
  skipInstall,
}: {
  port?: string;
  override?: boolean;
  skipInstall?: boolean;
}) => {
  const currentDir = process.cwd();
  isCwdInRoot({ currentPath: currentDir, alert: true });

  logInfo('start local env initialization');
  if (!skipInstall) {
    let spinner = ora('installing lerna pnpm & commitizen...').start();
    const { stdout: msg } = await execa('npm', ['i', '-g', '--force', 'pnpm', 'commitizen', 'lerna']);
    logInfo(msg);
    logSuccess('installed pnpm, commitizen globally successfully😁');
    spinner.stop();

    spinner = ora('installing dependencies...').start();
    const { stdout: installMsg } = await execa('pnpm', ['i']);
    logInfo(installMsg);
    logSuccess('finish installing dependencies.');
    spinner.stop();
  }

  const envConfigPath = `${currentDir}/.env`;
  const { parsed: fullConfig } = dotenv.config({ path: envConfigPath });

  if (!fullConfig || override) {
    const newConfig: dotenv.DotenvParseOutput = {};
    const { backendUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'backendUrl',
        message: 'Backend Url(API server):',
        default: 'https://erda.dev.terminus.io',
      },
    ]);
    newConfig.BACKEND_URL = backendUrl;
    const { ucUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'ucUrl',
        message: 'UC url(User center service):',
        default: 'https://erda.dev.terminus.io',
      },
    ]);
    newConfig.UC_BACKEND_URL = ucUrl;
    newConfig.MODULES = ALL_MODULES.join(',');
    newConfig.SCHEDULER_PORT = port || '3000';
    const { hostUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'hostUrl',
        message: 'Scheduler Url(host name):',
        default: 'https://erda.dev.terminus.io',
      },
    ]);
    newConfig.SCHEDULER_URL = hostUrl;

    const newFullConfig: string[] = [];
    Object.keys(newConfig).forEach((k) => {
      newFullConfig.push(`${k}=${newConfig[k]}`);
    });
    fs.writeFileSync(envConfigPath, newFullConfig.join(EOL), 'utf8');
    logSuccess('update erda-ui/.env file');
    logSuccess('you can update .env file manually if you need');
  } else {
    logInfo('.env config is not empty, skip env config initialize step, or you can override with option --override');
  }
};
