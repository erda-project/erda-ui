/*
 * Copyright (c) 2021 Terminus, Inc.
 *
 * This program is free software: you can use, redistribute, and/or modify
 * it under the terms of the GNU Affero General Public License, version 3
 * or later ("AGPL"), as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { promisify } from 'util';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import { logInfo, logSuccess, logError } from './util/log';
import { ERDA_BUILD_CONFIG, getModules } from './util/env';

const { exec } = child_process;
const asyncExec = promisify(exec);

const buildWithComparingGitSha = async ({ module }: { module: string }) => {
  const moduleName = module;
  const cwd = process.cwd();
  const externalModules = await getModules(true);
  const dataEngineerInfo = externalModules.find(({ role }) => role === 'DataEngineer');
  const staticPath = path.join(
    cwd,
    !['shell', 'core'].includes(moduleName) ? `../../public/static/${moduleName}` : `../public/static/${moduleName}`,
  );
  logInfo('Looking for build cache at:', staticPath);
  logInfo(`Start compare diff for ${moduleName}`);
  let { stdout: headSha } = await asyncExec('git rev-parse --short HEAD', { cwd });
  headSha = headSha.replace(/\n/, '');
  try {
    const gitVersionPath = path.resolve(staticPath, '.git-version');
    let prevGitSha = '';
    if (fs.existsSync(gitVersionPath)) {
      prevGitSha = fs.readFileSync(gitVersionPath, { encoding: 'utf8' });
      logInfo('Found previous git sha:', prevGitSha);
      const { stdout: diff } = await asyncExec(`git diff --name-only ${prevGitSha} ${headSha}`);
      logInfo('File diff:', diff);
      if (new RegExp(`^${moduleName}/`, 'gm').test(diff)) {
        logInfo(`Changes detected between ${prevGitSha} and ${headSha}. will start build ${moduleName}`);
        build(moduleName, headSha, staticPath, dataEngineerInfo);
      } else {
        logInfo(`No change detected between ${prevGitSha} and ${headSha}. will skip build ${moduleName}`);
      }
    } else {
      logInfo('No version file found, starting new build...');
      build(moduleName, headSha, staticPath, dataEngineerInfo);
    }
  } catch (error) {
    logError('Compare diff failed', error.toString());
    logInfo('Will start build');
    build(moduleName, headSha, staticPath, dataEngineerInfo);
  }
};

const build = async (moduleName: string, sha: string, staticPath: string, dataEngineerInfo?: ERDA_BUILD_CONFIG) => {
  await asyncExec(['fdp', 'admin'].includes(moduleName) ? 'npm i' : 'echo skip install', { cwd: process.cwd() });
  const execProcess = exec(
    'npm run build',
    {
      env: {
        ...process.env,
        isOnline: 'true',
        dataEngineerInfo: JSON.stringify(dataEngineerInfo || {}),
      },
      cwd: process.cwd(),
    },
    (error: unknown) => {
      if (error) {
        process.exit(1);
      } else {
        logSuccess('build successfully!');
        fs.writeFileSync(`${staticPath}/.git-version`, sha, 'utf8');
        logSuccess('generated new .git-version:', sha);
      }
    },
  );
  execProcess.stdout?.on('data', (data) => logInfo(data));
  execProcess.stderr?.on('data', (data) => logError(data));
};

export default buildWithComparingGitSha;
