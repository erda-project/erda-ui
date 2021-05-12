
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
import fs from 'fs';
import { promisify } from 'util';
import child_process from 'child_process';
import { logInfo, logSuccess, logWarn, logError } from './util/log';
import {
  getPublicDir,
  yarnCmd,
  getModuleList,
  registryDir,
  checkIsRoot,
} from './util/env';
import { exit } from 'process';
import ora from 'ora';
import generateVersion from './gen-version';
import localIcon from './local-icon';

const asyncExec = promisify(require('child_process').exec);

const { execSync, exec } = child_process;

const GET_BRANCH_CMD = "git branch | awk '/\\*/ { print $2; }'";

const getCurrentBranch = async () => {
  const branch = await execSync(GET_BRANCH_CMD);
  return branch.toString();
};

const checkBranch = async () => {
  const branch = await getCurrentBranch();
  logInfo('Current Branch: ', branch.replace(/\n/, ''));
  if (!branch.startsWith('release')) {
    const { answer } = await inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: 'Current branch is not release/*, continue?',
        default: 'No',
        choices: ['Yes', 'No'],
      },
    ]);
    if (answer === 'No') {
      process.exit(1);
    }
  }
};

const checkCodeUpToDate = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'updateCode',
      message: 'Make sure codes of erda-ui and erda-ui-enterprise are up to date and then press Enter to continue.',
      default: true,
    },
  ]);

  if (!answer.updateCode) {
    process.exit(1);
  }
};

const whetherGenerateSourceMap = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enableSourceMap',
      message: 'Generate source map files?',
      default: false,
    },
  ]);
  return answer.enableSourceMap;
};

const checkReInstall = async (rebuildList: string[]) => {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'reInstall',
      message: 'Reinstall dependencies?',
      default: true,
    },
  ]);
  if (answer.reInstall) {
    logInfo('start yarn');
    await installDependencies(rebuildList);
  } else {
    logWarn('Skip update Dependencies, please make sure it\'s up to date!');
  }
};

const installDependencies = async (rebuildList: string[]) => {
  const pList: Array<Promise<void>> = [];
  const { selectUpdateList } = await inquirer.prompt<{ selectUpdateList: string[] }>([
    {
      type: 'checkbox',
      name: 'selectUpdateList',
      message: 'Choose modules to update dependency',
      choices: rebuildList,
    },
  ]);

  const moduleList = getModuleList();
  moduleList.filter(({ moduleName: name }) => selectUpdateList.includes(name)).forEach(({ moduleDir: dir, moduleName: name }) => {
    if (rebuildList.includes(name)) {
      logInfo(`Performing "${yarnCmd}" inside ${dir} folder`);
      const installPromise = new Promise<void>((resolve) => {
        exec(yarnCmd, { env: process.env, cwd: dir }, (error: unknown, stdout: string) => {
          if (error) {
            logError(`install error: ${error}`);
            process.exit(1);
          } else {
            logSuccess(`【${name}】 successfully installed! [${stdout}]`);
            resolve();
          }
        });
      });

      pList.push(installPromise);
    }
  });

  await Promise.all(pList);
  pList.length && logSuccess('update dependency successfully 😁!');
};

const clearPublic = async () => {
  logInfo('clear public folder');
  await execSync(`rm -rf ${getPublicDir()}/*`, { cwd: process.cwd() });
};

const checkModuleValid = async (isLocal: boolean) => {
  let isAllValid = true;
  const moduleList = getModuleList();
  moduleList.forEach((item) => {
    if (!item.moduleDir) {
      isAllValid = false;
      logError(`${item.moduleName.toUpperCase()}_DIR is not exist in .env, you can run "erda setup <module> <port>" to auto generate moduleDir`);
    } else if (!fs.existsSync(item.moduleDir)) {
      isAllValid = false;
      logError(`${item.moduleName.toUpperCase()}_DIR is wrong, please check in .env, or you can run "erda setup <module> <port>" to update moduleDir`);
    }
  });

  const outputModules = moduleList.map((item) => item.moduleName).join(',');

  logInfo(`Output modules:【${outputModules}】`);

  if (!isAllValid) {
    process.exit(1);
  } else if (isLocal) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'coveredAllModules',
        message: `Here are the modules【${outputModules}】detected in .env file. If missing module requires to build please update env config by registering module with command "erda-ui setup ", and then run again.`,
        default: true,
      },
    ]);
    if (!answer.coveredAllModules) {
      process.exit(1);
    }
  }
};

const buildModules = async (enableSourceMap: boolean, rebuildList: ReturnType<typeof getModuleList>) => {
  const pList: Array<Promise<void>> = [];
  const moduleList = getModuleList();
  const toBuildModules = rebuildList.length ? rebuildList : moduleList;
  toBuildModules.forEach((item) => {
    const { moduleName, moduleDir } = item;

    const buildPromise = new Promise<void>((resolve) => {
      const spinner = ora(`building ${moduleName}`).start();
      exec('npm run build', { env: { ...process.env, enableSourceMap: enableSourceMap.toString() }, cwd: moduleDir }, (error, stdout, stderr) => {
        if (error) {
          logError(`build error: ${error}`);
          process.exit(1);
        } else {
          logInfo(stderr);
          logSuccess(`【${moduleName}】build successfully! [${stdout}]`);
          resolve();
          spinner.stop();
        }
      });
    });

    pList.push(buildPromise);
  });

  await Promise.all(pList);
  logSuccess('build successfully 😁!');
};

const stopDockerContainer = async () => {
  await asyncExec('docker container stop erda-ui-for-build');
  await asyncExec('docker rm erda-ui-for-build');
};

/**
 * restore built content from an existing image
 */
const restoreFromDockerImage = async (image: string, requireBuildList: string[]) => {
  try {
    // check whether docker is running
    await asyncExec('docker ps');
  } catch (error) {
    if (error.message.includes('Cannot connect to the Docker daemon')) { // if not start docker and exit program, because node can't know when docker would started completely
      logInfo('Starting Docker');
      try {
        await asyncExec('open --background -a Docker');
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
  const { stdout: containers } = await asyncExec('docker container ls -al');
  if (containers && containers.includes('erda-ui-for-build')) { // if exist stop & delete it first, otherwise it will cause docker conflict
    logInfo('erda-ui container already exist, stop & delete it before next step');
    await stopDockerContainer();
    logSuccess('stop & delete erda-ui container successfully');
  }

  // start docker container names erda-ui for image provided
  await asyncExec(`docker run -d --name erda-ui-for-build \
    -e OPENAPI_ADDR=127.0.0.1 \
    -e TA_ENABLE=false \
    -e TERMINUS_KEY=xxx \
    -e COLLECTOR_PUBLIC_ADDR=127.0.0.1 \
    -e ENABLE_MPAAS=false \
    -e ENABLE_BIGDATA=false \
    -e ONLY_FDP=false \
    -e UC_PUBLIC_URL=127.0.0.1 \
    -e FDP_UI_ADDR=127.0.0.1 \
    -e GITTAR_ADDR=127.0.0.1 \
    -e KRATOS_ADDR=127.0.0.1 \
    -e KRATOS_PRIVATE_ADDR=127.0.0.1 \
    ${registryDir}:${image}`);
  logSuccess('erda-ui docker container has been launched');

  const moduleList = getModuleList();
  // choose modules for this new build, the ones which not be chosen will reuse the image content
  const modulesNames = moduleList.map((module) => module.moduleName).filter((name) => !requireBuildList.includes(name));
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
  await asyncExec(`docker cp erda-ui-for-build:/usr/share/nginx/html/. ${publicDir}/`);
  logSuccess('finished copy image content to local');
  // delete rebuilt module folders
  rebuildList.forEach((module) => {
    if (module !== 'shell') {
      exec(`rm -rf ${publicDir}/static/${module}`);
    } else {
      exec(`rm -rf ${publicDir}/static/${module} && find ${publicDir}/static -maxdepth 1 -type f | xargs rm -f`);
    }
  });
  await execSync(`rm -rf ${publicDir}/version.json`, { cwd: process.cwd() });
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
    let { stdout: headSha } = await asyncExec('git rev-parse --short HEAD');
    headSha = headSha.replace(/\n/, '');
    const imageSha = image.split('-')[2];
    const { stdout: diff } = await asyncExec(`git diff --name-only ${imageSha} ${headSha}`);
    const moduleList = getModuleList();
    const rebuildList = moduleList.map((item) => item.moduleName);
    rebuildList.forEach((module) => {
      if (new RegExp(`^${module}/`, 'gm').test(diff)) {
        logWarn(`module [${module}] code changed since image commit, will forcibly built it.`);
        requireBuildList.push(module);
        if (new RegExp(`^${module}/package-lock.json`, 'gm').test(diff)) {
          logWarn(`module [${module}] package-lock changed since image commit, please remind to update this module dependency in next step.`);
        }
      }
    });
    logWarn('fdp & admin module are maintained in separate git repository，please manually confirm whether require rebuild.');
    return requireBuildList;
  } catch (error) {
    logError(error);
    logWarn('It seems the image commit sha is not parent commit of current HEAD, we can\'t detect file version change which is dangerous to have a partial build.');
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Do you still want to continue? enter Y to continue or press Enter to exit',
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

export default async (options: { local?: boolean; image?: string }) => {
  try {
    const { image } = options;
    let { local } = options;
    if (image) {
      local = true;
    }
    checkIsRoot();
    await checkModuleValid(!!local);

    let enableSourceMap = false;
    const moduleList = getModuleList();
    let rebuildList = moduleList.map((item) => item.moduleName);

    await clearPublic();

    if (local) {
      await checkBranch();
      await checkCodeUpToDate();
      enableSourceMap = await whetherGenerateSourceMap();
      if (image) {
        if (!/\d\.\d-\d{8}-.+/.test(image)) {
          logError('invalid image sha, correct format example: 1.0-20210508-afc4a4a');
          exit(1);
        }
        const requireBuildList = await getRequireBuildModules(image);
        logInfo(`Will launch a partial build based on image ${image}`);
        rebuildList = await restoreFromDockerImage(image, requireBuildList);
      }
      await checkReInstall(rebuildList);
    }

    await buildModules(enableSourceMap,
      moduleList.filter((module) => rebuildList.includes(module.moduleName)));

    generateVersion();

    if (rebuildList.includes('shell')) {
      localIcon();
    }
  } catch (error) {
    logError('build exit with error:', error.message);
    process.exit(1);
  }
};
