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
import notifier from 'node-notifier';
import { logInfo, logSuccess, logError } from './util/log';
import { defaultEnterpriseRegistry, clearPublic, killPidTree, isCwdInRoot } from './util/env';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { getGitShortSha, getBranch } from './util/git-commands';

const currentDir = process.cwd();

const dirCollection: { [k: string]: string } = {
  fdp: `${currentDir}/fdp`,
  admin: `${currentDir}/admin`,
};

const dirMap = new Map(Object.entries(dirCollection));

const alertMessage = (branch: string, release?: boolean) => `
/**************************${chalk.red('Warning Before Build')}************************************/

${chalk.yellow('Current Branch')}:
erda-ui-enterprise: ${chalk.yellow(branch)}

${chalk.yellow('Please make sure:')}
1. your code is updated
2. switched to target branch
3. all ${chalk.bgRed('node_modules')} dependencies are updated
${release ? `4. since ${chalk.red('--release')} is passed, Docker should keep running & docker logged in` : ''}

Press Enter to continue.
/**********************************************************************************/
`;

const localBuildAlert = async (requireRelease?: boolean) => {
  const branch = await getBranch(currentDir);

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'coveredAllModules',
      message: alertMessage(branch, requireRelease),
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

  try {
    await Promise.all(pList);
  } catch (_error) {
    logError('build failed, will cancel all building processes');
    await killPidTree();
    process.exit(1);
  }
  logSuccess('build successfully 😁!');
};

const releaseImage = async (registry?: string) => {
  const date = dayjs().format('YYYYMMDD');
  const sha = await getGitShortSha();
  const pJson = require(`${process.cwd()}/package.json`);
  const version = pJson.version.slice(0, -2);
  const tag = `${version}-${date}-${sha}`; // 3.20-2020520-182737976

  const image = `${registry ?? defaultEnterpriseRegistry}:${tag}`;
  await execa('docker', ['build', '-f', 'Dockerfile', '--platform', 'linux/arm64/v8', '-t', image, '.'], {
    stdio: 'inherit',
    cwd: currentDir,
  });
  logSuccess('build image successfully');

  logInfo(`start pushing image to registry:【${registry ?? defaultEnterpriseRegistry}】`);
  await execa('docker', ['push', image], { stdio: 'inherit' });

  notifier.notify({
    title: 'Success',
    message: `🎉 Image 【${tag}】 pushed to registry success 🎉`,
  });
  logSuccess(`push success: 【${image}】`);
};

const getBuildList = async () => {
  let rebuildList = ['fdp', 'admin'];
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
  return rebuildList;
};

export default async (options: {
  enableSourceMap?: boolean;
  release?: boolean;
  registry?: string;
  skipBuild?: boolean;
}) => {
  try {
    const { enableSourceMap = false, release, registry, skipBuild } = options;

    // check if cwd erda enterprise ui root
    isCwdInRoot({ alert: true, isEnterprise: true });
    // prompt alert before build
    await localBuildAlert(!!release);

    if (skipBuild && release) {
      await releaseImage(registry);
      return;
    }

    // get required build list
    const rebuildList = await getBuildList();

    await buildModules(enableSourceMap, rebuildList);

    logSuccess('build process is done!');

    if (release) {
      await releaseImage(registry);
    }
  } catch (error) {
    logError('build exit with error:', error.message);
    process.exit(1);
  }
};
