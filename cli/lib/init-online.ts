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

// init step ONLY for pipeline CI
export default async () => {
  const currentDir = process.cwd();
  isCwdInRoot({ currentPath: currentDir, alert: true });

  let spinner = ora('[1/2] Installing pnpm globally...').start();
  const { stdout: msg } = await execa('npm', ['i', '-g', '--force', 'pnpm']);
  logInfo(msg);
  logSuccess('Successfully Installed pnpm globally😁');
  spinner.stop();

  spinner = ora('[2/2] Installing dependencies...').start();
  const { stdout: installMsg } = await execa('pnpm', [
    'i',
    '--frozen-lockfile',
    '--no-optional',
    '--filter=!./scheduler',
    '--filter=!./cli',
  ]);
  logInfo(installMsg);
  logSuccess('Installing dependencies finished.');
  spinner.stop();

  const envConfigPath = `${currentDir}/.env`;

  const newConfig: dotenv.DotenvParseOutput = {
    MODULES: ALL_MODULES.join(','),
  };

  const newFullConfig: string[] = [];
  Object.keys(newConfig).forEach((k) => {
    newFullConfig.push(`${k}=${newConfig[k]}`);
  });
  fs.writeFileSync(envConfigPath, newFullConfig.join(EOL), 'utf8');
  logSuccess('Successfully created erda-ui/.env file');
};
