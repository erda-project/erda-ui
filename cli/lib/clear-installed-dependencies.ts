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

import path from 'path';
import inquirer from 'inquirer';
import rimraf from 'rimraf';
import { isCwdInRoot } from './util/env';
import { logSuccess } from './util/log';

export default async () => {
  isCwdInRoot({ alert: true });
  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure you want to clear all installed dependencies?',
  });
  if (!confirm) {
    process.exit(1);
  }
  const cwd = process.cwd();
  const pkgRoots = [
    cwd,
    path.resolve(cwd, 'shell'),
    path.resolve(cwd, 'core'),
    path.resolve(cwd, 'scheduler'),
    path.resolve(cwd, 'cli'),
    path.resolve(cwd, 'modules', 'uc'),
    path.resolve(cwd, 'modules', 'components'),
    path.resolve(cwd, 'modules', 'market'),
  ];
  for (let i = 0; i < pkgRoots.length; i++) {
    const pkgRoot = pkgRoots[i];
    // eslint-disable-next-line no-await-in-loop
    await clearNodeModules(pkgRoot);
  }
  logSuccess('All installed dependencies have been cleared.');
};

async function clearNodeModules(pkgRoot: string) {
  const nodeModulesPath = path.resolve(pkgRoot, 'node_modules');
  await rimraf.sync(nodeModulesPath);
  logSuccess(`${nodeModulesPath} has been cleared.`);
}
