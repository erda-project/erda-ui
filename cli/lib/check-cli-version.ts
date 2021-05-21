
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

import inquirer from 'inquirer';
import { logInfo, logSuccess, logError } from './util/log';
import { npmCmd } from './util/env';
import cp from 'child_process';

const { exec, spawnSync } = cp;

export default async (options: { skip?: boolean }) => {
  const { skip } = options;
  if (skip) return;

  return new Promise<void>((resolve) => {
    logInfo('check @erda-ui/cli version');

    exec('ncu -g @erda-ui/cli', async (error: unknown, stdout: string) => {
      if (error) {
        logError(`install error: ${error}`);
        process.exit(1);
      } else {
        const isUpToDate = stdout.indexOf('All global packages are up-to-date');

        if (isUpToDate >= 0) {
          logInfo('the version of @erda-ui/cli is up to date');
          resolve();
        } else {
          const { answer } = await inquirer.prompt([
            {
              type: 'list',
              name: 'answer',
              message: 'Current version of @erda-ui/cli is out of date, check to upgrade?',
              default: 'Yes',
              choices: ['Yes', 'No'],
            },
          ]);
          if (answer === 'No') {
            resolve();
          } else {
            logInfo(`performing [${npmCmd} i -g @erda-ui/cli] to upgrade!`);

            spawnSync(npmCmd, ['i', '-g', '@erda-ui/cli'], { env: process.env, stdio: 'inherit' });

            logSuccess('@erda-ui/cli is up to date, and you can run erda-ui command again');
            process.exit(1);
          }
        }
      }
    });
  });
};
