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
import child_process from 'child_process';
import mkdirp from 'mkdirp';
import { logInfo, logSuccess, logError } from './util/log';
import { getEnvConfig } from './util/env';

const { execSync } = child_process;

export default async (moduleName: string, options: { distPath: string }) => {
  const moduleDir = process.cwd();

  const distPath = path.resolve(moduleDir, options.distPath);

  if (!fs.existsSync(distPath)) {
    logError('Dist directory not exist:', distPath);
    process.exit(1);
  }

  const erdaUiPath = getEnvConfig().ERDA_DIR;
  if (!fs.existsSync(erdaUiPath)) {
    logError('Erda UI root path not exist:', erdaUiPath);
    process.exit(1);
  }

  const targetPath = `${erdaUiPath}/public/static/${moduleName}/`;

  if (!fs.existsSync(targetPath)) {
    await mkdirp(targetPath);
  }
  const copyCommand = `rm -rf ${targetPath} && cp -rf ${distPath} ${targetPath}`;
  logInfo(`execute: ${copyCommand}`);
  execSync(copyCommand);
  logSuccess(`copy dist files to: ${targetPath}`);
};
