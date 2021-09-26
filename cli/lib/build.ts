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
import execa, { ExecaChildProcess } from 'execa';
import rimraf from 'rimraf';
import { logInfo, logSuccess, logError } from './util/log';
import { getPublicDir, getModuleList, checkIsRoot } from './util/env';
import chalk from 'chalk';
import generateVersion from './util/gen-version';
import localIcon from './local-icon';

const currentDir = process.cwd();

const dirCollection: { [k: string]: string } = {
  core: `${currentDir}/core`,
  shell: `${currentDir}/shell`,
  market: `${currentDir}/modules/market`,
  uc: `${currentDir}/modules/uc`,
  fdp: '../erda-ui-enterprise/fdp',
  admin: '../erda-ui-enterprise/admin',
};

const dirMap = new Map(Object.entries(dirCollection));

const clearPublic = async () => {
  logInfo('clear public folder');
  await rimraf.sync(`${getPublicDir()}/*`);
};

const alertMessage = (outputModules: string) => `
/***************************${chalk.red('Alert Before Build')}*************************************/
Here are the MODULES【${chalk.bgBlue(outputModules)}】which detected in .env file.
If any module missed or should exclude, please manually adjust MODULES config in .env and run again.

${chalk.yellow('Please make sure:')}
1. your code is updated ${chalk.red('both')} erda-ui & enterprise repository
2. switch to target branch ${chalk.red('both')} erda-ui & enterprise repository
3. all ${chalk.bgRed('node_modules')} dependencies are updated

Press Enter to continue build.
/**********************************************************************************/
`;

const localBuildAlert = async () => {
  const moduleList = getModuleList();
  const outputModules = moduleList.join(',');

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'coveredAllModules',
      message: alertMessage(outputModules),
      default: true,
    },
  ]);
  if (!answer.coveredAllModules) {
    process.exit(1);
  }
};

const buildModules = async (enableSourceMap: boolean, rebuildList: string[]) => {
  const pList: ExecaChildProcess[] = [];
  rebuildList.forEach((moduleName) => {
    const moduleDir = dirMap.get(moduleName);
    const buildPromise = execa('npm', ['run', 'build'], {
      cwd: moduleDir,
      env: {
        ...process.env,
        enableSourceMap: enableSourceMap.toString(),
      },
      stdio: 'inherit',
    });
    pList.push(buildPromise);
  });

  await Promise.all(pList);
  logSuccess('build successfully 😁!');
};

export default async (options: { enableSourceMap?: boolean }) => {
  try {
    const { enableSourceMap = false } = options;

    // check if cwd erda ui root
    checkIsRoot();
    // prompt alert before build
    await localBuildAlert();

    let rebuildList = getModuleList();
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'buildModules',
        message: 'please choose modules to build',
        default: ['all'],
        choices: [{ value: 'all' }, ...rebuildList],
      },
    ]);

    if (!answer.buildModules.length) {
      logError('no module selected to build, exit program');
      process.exit(1);
    }
    if (!answer.buildModules.includes('all')) {
      rebuildList = answer.buildModules;
    } else {
      // clear public output
      await clearPublic();
    }

    await buildModules(enableSourceMap, rebuildList);

    generateVersion();

    if (rebuildList.includes('shell')) {
      localIcon();
    }
  } catch (error) {
    logError('build exit with error:', error.message);
    process.exit(1);
  }
};
