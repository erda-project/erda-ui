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
import fs from 'fs';
import inquirer from 'inquirer';
import { isCwdInRoot } from './util/env';
import { logSuccess, logError } from './util/log';
import semver from 'semver';

export default async () => {
  isCwdInRoot({ alert: true });
  const { version } = await inquirer.prompt({
    type: 'input',
    name: 'version',
    message: 'type in the version to set',
  });
  if (!version) {
    process.exit(1);
  }
  const cwd = process.cwd();
  const pkgRoots = [
    cwd,
    path.resolve(cwd, 'shell'),
    path.resolve(cwd, 'core'),
    path.resolve(cwd, 'scheduler'),
    path.resolve(cwd, 'modules', 'uc'),
    path.resolve(cwd, 'modules', 'market'),
  ];
  if (!semver.valid(version)) {
    logError(`version ${version} is not valid`);
    process.exit(1);
  }
  pkgRoots.forEach((pkgRoot) => updatePackage(pkgRoot, version));
  logSuccess(`version ${version} has been set`);
};

function updatePackage(pkgRoot: string, version: string) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
