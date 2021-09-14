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

/* eslint-disable no-await-in-loop */
import { promisify } from 'util';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import { EOL } from 'os';
import { logInfo, logSuccess, logWarn, logError } from './util/log';

const asyncExec = promisify(child_process.exec);

const externalModules = ['fdp', 'admin'];
const subModules = ['market', 'uc'];
const allModules = ['shell', 'core', 'admin', 'fdp', 'market', 'uc'];

const checkBuildStatus = async () => {
  const cwd = process.cwd();
  const enterprisePath = path.resolve(cwd, 'erda-ui-enterprise');
  const requireBuildMap = allModules.reduce<{ [k: string]: string }>((acc, module) => {
    acc[`skip-${module}-build`] = 'true';
    return acc;
  }, {});

  for (const moduleName of allModules) {
    const staticPath = path.join(cwd, `public/static/${moduleName}`);
    logInfo('-----------------------------------------');
    logInfo('Looking for build cache at:', staticPath);
    logInfo(`Start compare diff for ${moduleName}`);
    const gitCwd = externalModules.includes(moduleName) ? enterprisePath : cwd;
    let { stdout: headSha } = await asyncExec('git rev-parse --short HEAD', { cwd: gitCwd });
    headSha = headSha.replace(/\n/, '');
    let { stdout: externalHeadSha } = await asyncExec('git rev-parse --short HEAD', {
      cwd: enterprisePath,
    });
    externalHeadSha = externalHeadSha.replace(/\n/, '');
    const skipKey = `skip-${moduleName}-build`;

    try {
      const gitVersionPath = path.resolve(staticPath, '.git-version');
      let prevGitSha = null;
      let skipBuild = true;
      let nextSha = headSha;
      if (fs.existsSync(gitVersionPath)) {
        prevGitSha = fs.readFileSync(gitVersionPath, { encoding: 'utf8' });
        logInfo('Found previous git sha:', prevGitSha);
        const [prevSha, prevExternalSha] = prevGitSha.split('/');
        const { stdout: diff } = await asyncExec(`git diff --name-only ${prevSha} ${headSha}`, { cwd: gitCwd });
        logInfo('File diff:', EOL, diff);

        if (
          new RegExp(`^${subModules.includes(moduleName) ? `modules/${moduleName}` : moduleName}/`, 'gm').test(diff)
        ) {
          skipBuild = false;
        }

        if (moduleName === 'shell') {
          logWarn('In case shell has part of code maintained under enterprise, need to check enterprise code base');
          nextSha = `${headSha}/${externalHeadSha}`;
          const { stdout: externalDiff } = await asyncExec(
            `git diff --name-only ${prevExternalSha} ${externalHeadSha}`,
            { cwd: enterprisePath },
          );
          if (new RegExp('^cmp/', 'gm').test(externalDiff) || new RegExp('^msp/', 'gm').test(externalDiff)) {
            logWarn(
              `Diff detected in enterprise for shell between ${prevExternalSha} and ${externalHeadSha}`,
              externalDiff,
            );
            skipBuild = false;
          } else {
            logInfo('No diff found for enterprise part of shell');
          }
        }
      }

      if (skipBuild) {
        logInfo(`no change detected between ${prevGitSha} and ${headSha}. will skip build ${moduleName}`);
      } else {
        logWarn(`Diff detected between ${prevGitSha} and ${headSha}, will start new built for ${moduleName}`);
        requireBuildMap[skipKey] = nextSha;
      }
    } catch (error) {
      logError(`Compare diff failed for ${moduleName}`, error.toString());
      requireBuildMap[skipKey] = moduleName === 'shell' ? `${headSha}/${externalHeadSha}` : headSha;
    }
  }

  const metaPath = process.env.METAFILE;
  Object.keys(requireBuildMap).forEach((moduleKey) => {
    fs.appendFile(metaPath!, `${moduleKey}=${requireBuildMap[moduleKey]}${EOL}`, (err) => {
      if (err) {
        logError('err', err);
      }
      logSuccess(`emit ${moduleKey} value ${requireBuildMap[moduleKey]} to METAFILE`);
    });
  });
};

export default checkBuildStatus;
