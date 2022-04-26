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
import { isCwdInRoot } from './util/env';
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

  logInfo('Start local environment initialization');
  if (!skipInstall) {
    const spinner = ora('Installing commitizen globally...').start();
    const { stdout: msg } = await execa('npm', ['i', '-g', '--force', 'commitizen']);
    logInfo(msg);
    logSuccess('Successfully installed commitizen globally😁');
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
        message: 'Online ui url:',
        default: 'https://erda.io',
      },
    ]);
    newConfig.BACKEND_URL = backendUrl;
    const { ucUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'ucUrl',
        message: 'UC url(User center service):',
        default: 'https://uc.erda.io',
      },
    ]);
    newConfig.UC_BACKEND_URL = ucUrl;
    newConfig.SCHEDULER_PORT = port || '3000';
    const { hostUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'hostUrl',
        message: 'Scheduler Url(host name):',
        default: 'https://local.erda.io',
      },
    ]);
    newConfig.SCHEDULER_URL = hostUrl;

    const newFullConfig: string[] = [];
    Object.keys(newConfig).forEach((k) => {
      newFullConfig.push(`${k}=${newConfig[k]}`);
    });
    fs.writeFileSync(envConfigPath, newFullConfig.join(EOL), 'utf8');
    logSuccess('Successfully create or update erda-ui/.env file, you can edit .env file manually as you wish.');
    logSuccess('Now you can enter `shell` directory and run `npm run dev` to start project in development mode.');
  } else {
    logInfo('.env config is not empty, skip env config initialize step, or you can override with option --override');
  }
};
