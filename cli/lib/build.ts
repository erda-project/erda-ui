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
import { logInfo, logSuccess, logWarn, logError } from './util/log';
import { getPublicDir, getModuleList, checkIsRoot } from './util/env';
import { exit } from 'process';
import generateVersion from './util/gen-version';
import localIcon from './local-icon';
import { exec } from 'child_process';

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

const checkCodeUpToDate = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'updateCode',
      message:
        'Make sure code of erda-ui and dependent projects, like erda-ui-enterprise\nare up to date and then press Enter to continue.',
      default: true,
    },
  ]);

  if (!answer.updateCode) {
    process.exit(1);
  }
};

const checkReInstall = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'reInstall',
      message: 'Reinstall dependencies?',
      default: true,
    },
  ]);
  if (answer.reInstall) {
    logInfo('start installing');
    const { stdout } = await execa('pnpm', ['i']);
    logSuccess(`dependency successfully updated! [${stdout}]`);
  } else {
    logWarn("Skip update Dependencies, please make sure it's up to date!");
  }
};

const clearPublic = async () => {
  logInfo('clear public folder');
  await rimraf.sync(`${getPublicDir()}/*`);
};

const checkBuildScope = async () => {
  const moduleList = getModuleList();
  const outputModules = moduleList.join(',');

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'coveredAllModules',
      message: `Here are the MODULES to build【${outputModules}】which detected in .env file.\nIf any module missed or should exclude, please manually adjust .env MODULES config and then run again.`,
      default: true,
    },
  ]);
  if (!answer.coveredAllModules) {
    process.exit(1);
  }
};

const buildModules = async (enableSourceMap: boolean, rebuildList: string[]) => {
  const pList: ExecaChildProcess[] = [];
  const moduleList = getModuleList();
  const toBuildModules = rebuildList.length ? rebuildList : moduleList;
  toBuildModules.forEach((moduleName) => {
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

const stopDockerContainer = async () => {
  await execa('docker', ['container', 'stop', 'erda-ui-for-build'], { stdio: 'inherit' });
  await execa('docker', ['rm', 'erda-ui-for-build'], { stdio: 'inherit' });
};

/**
 * restore built content from an existing image
 */
const restoreFromDockerImage = async (image: string, requireBuildList: string[]) => {
  try {
    // check whether docker is running
    await execa('docker', ['ps']);
  } catch (error) {
    if (error.message.includes('Cannot connect to the Docker daemon')) {
      // if not start docker and exit program, because node can't know when docker would started completely
      logInfo('Starting Docker');
      try {
        await execa('open', ['--background', '-a', 'Docker']);
      } catch (e) {
        logError('Launch Docker failed! Please start Docker manually');
      }
      logWarn('Since partial build depends on docker, please rerun this command after Docker launch completed');
      exit(1);
    } else {
      logError('Docker maybe crashed', error);
      exit(1);
    }
  }
  // check whether erda-ui-for-build container exist
  const { stdout: containers } = await execa('docker', ['container', 'ls', '-al']);
  if (containers && containers.includes('erda-ui-for-build')) {
    // if exist stop & delete it first, otherwise it will cause docker conflict
    logInfo('erda-ui container already exist, stop & delete it before next step');
    await stopDockerContainer();
    logSuccess('stop & delete erda-ui container successfully');
  }

  // start docker container names erda-ui for image provided
  await execa('docker', ['run', '-d', '--name', 'erda-ui-for-build', `${image}`]);
  logSuccess('erda-ui docker container has been launched');

  const moduleList = getModuleList();
  // choose modules for this new build, the ones which not be chosen will reuse the image content
  const modulesNames = moduleList.filter((name) => !requireBuildList.includes(name));
  let rebuildList = [...requireBuildList];
  if (modulesNames.length) {
    const { selectRebuildList } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectRebuildList',
        message: 'Choose modules to build',
        choices: modulesNames,
      },
    ]);
    rebuildList = rebuildList.concat(selectRebuildList);
  }

  if (!rebuildList || !rebuildList.length) {
    logWarn('no module need to build, exit program');
    exit(1);
  }
  // copy built content from container
  const publicDir = getPublicDir();
  await execa('docker', ['cp', 'erda-ui-for-build:/usr/src/app/public/.', `${publicDir}/`]);
  logSuccess('finished copy image content to local');
  // delete rebuilt module folders
  rebuildList.forEach((module) => {
    if (module !== 'shell') {
      rimraf.sync(`${publicDir}/static/${module}`);
    } else {
      exec(`rm -rf ${publicDir}/static/${module} && find ${publicDir}/static -maxdepth 1 -type f | xargs rm -f`);
    }
  });
  await rimraf.sync(`${publicDir}/version.json`);
  // stop & delete container
  stopDockerContainer();

  return rebuildList;
};

/**
 * take advantage of git diff to find out which modules have to rebuild
 */
const getRequireBuildModules = async (image: string) => {
  const requireBuildList: string[] = [];
  try {
    let { stdout: headSha } = await execa('git', ['rev-parse', '--short', 'HEAD']);
    headSha = headSha.replace(/\n/, '');
    const imageSha = image.split('-')[2];
    const { stdout: diff } = await execa('git', ['diff', '--name-only', `${imageSha}`, `${headSha}`]);
    const rebuildList = getModuleList();
    if (new RegExp('^pnpm-lock.yaml', 'gm').test(diff)) {
      logWarn(
        'pnpm-lock.yaml changed since image commit, please remind to update this module dependency in next step.',
      );
    }
    rebuildList.forEach((module) => {
      if (new RegExp(`^${module}/`, 'gm').test(diff)) {
        logWarn(`module [${module}] code changed since image commit, will forcibly built it.`);
        requireBuildList.push(module);
      }
    });
    logWarn('some modules are maintained in separate git repository，please manually confirm whether require rebuild.');
    return requireBuildList;
  } catch (error) {
    logError(error);
    logWarn(
      "It seems the image commit sha is not parent commit of current HEAD, we can't detect file version change which is dangerous to have a partial build.",
    );
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Do you still want to continue? Enter Y to continue or press Enter to exit',
        default: false,
      },
    ]);
    if (!answer.continue) {
      process.exit(1);
    } else {
      return requireBuildList;
    }
  }
};

export default async (options: { image?: string; enableSourceMap?: boolean }) => {
  try {
    const { image, enableSourceMap = false } = options;

    // check if cwd erda ui root
    checkIsRoot();
    // check whether any module missed or redundant
    await checkBuildScope();

    let rebuildList = getModuleList();

    // prompt alert whether code is updated
    await checkCodeUpToDate();
    // clear public output
    await clearPublic();

    if (image) {
      const requireBuildList = await getRequireBuildModules(image);
      logInfo(`Will launch a partial build based on image ${image}`);
      rebuildList = await restoreFromDockerImage(image, requireBuildList);
    }
    await checkReInstall();

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
