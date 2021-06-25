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
import path from 'path';
import { promisify } from 'util';
import child_process from 'child_process';
import { logInfo, logSuccess, logWarn, logError } from './util/log';
import { getPublicDir, getModuleList, registryDir, checkIsRoot, getModules, ERDA_BUILD_CONFIG } from './util/env';
import { exit } from 'process';
import generateVersion from './gen-version';
import localIcon from './local-icon';
import { EOL } from 'os';
import YAML from 'yaml';
import { set, head } from 'lodash';

const asyncExec = promisify(child_process.exec);

const { execSync, exec } = child_process;

const GET_BRANCH_CMD = "git branch | awk '/\\*/ { print $2; }'";

const currentDir = process.cwd();

const dirCollection: { [k: string]: string } = {
  core: `${currentDir}/core`,
  shell: `${currentDir}/shell`,
  market: `${currentDir}/modules/market`,
};
const dirMap = new Map(Object.entries(dirCollection));
const noneCurrentRepoModules: string[] = [];

const getCurrentBranch = (dir: string) => {
  return new Promise<string>((resolve) => {
    exec(GET_BRANCH_CMD, { cwd: dir }, (error: unknown, stdout: string) => {
      if (error) {
        logError(`error: ${error}`);
        process.exit(1);
      } else {
        resolve(stdout.replace(/\n/, ''));
      }
    });
  });
};

const checkBranch = async () => {
  const pList: Array<Promise<string>> = [getCurrentBranch(process.cwd())];
  const moduleList = getModuleList();

  moduleList.forEach((moduleName) => {
    if (noneCurrentRepoModules.includes(moduleName)) {
      pList.push(getCurrentBranch(dirMap.get(moduleName)!));
    }
  });

  const moduleBranches = await Promise.all(pList);

  logInfo(`Current Branch of erda-ui:【${moduleBranches[0]}】`);

  if (moduleBranches.length > 1) {
    logInfo('Current Branch of dependent modules:');
    moduleList
      .filter((moduleName) => noneCurrentRepoModules.includes(moduleName))
      .forEach((moduleName, index) => {
        logInfo(`${moduleName}:【${moduleBranches[index + 1]}】`);
      });
  }

  const isAllReleaseBranch = moduleBranches.every((branch) => {
    return branch.startsWith('release');
  });

  if (!isAllReleaseBranch) {
    const { answer } = await inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: 'Current branches of some modules are not release/*, continue?',
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
      message:
        'Make sure codes of erda-ui and dependent projects, like erda-ui-enterprise\nare up to date and then press Enter to continue.',
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
    const { stdout } = await asyncExec('pnpm i');
    logSuccess(`dependency successfully updated! [${stdout}]`);
  } else {
    logWarn("Skip update Dependencies, please make sure it's up to date!");
  }
};

const clearPublic = async () => {
  logInfo('clear public folder');
  await execSync(`rm -rf ${getPublicDir()}/*`, { cwd: process.cwd() });
};

const checkModuleValid = async (isLocal: boolean) => {
  const moduleList = getModuleList();
  const outputModules = moduleList.join(',');

  if (isLocal) {
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
  } else {
    logWarn(`Will start to build MODULES【${outputModules}】which detected in .env file.`);
  }
};

const buildModules = async (
  enableSourceMap: boolean,
  rebuildList: string[],
  isOnline: string,
  dataEngineerInfo?: ERDA_BUILD_CONFIG,
) => {
  const pList: Array<Promise<void>> = [];
  const moduleList = getModuleList();
  const toBuildModules = rebuildList.length ? rebuildList : moduleList;
  toBuildModules.forEach((moduleName) => {
    const moduleDir = dirMap.get(moduleName);
    const buildPromise = new Promise<void>((resolve) => {
      const execProcess = exec(
        'npm run build',
        {
          env: {
            ...process.env,
            isOnline,
            enableSourceMap: enableSourceMap.toString(),
            dataEngineerInfo: JSON.stringify(dataEngineerInfo),
          },
          cwd: moduleDir,
        },
        (error) => {
          if (error) {
            logError(`build error: ${error}`);
            process.exit(1);
          } else {
            logSuccess(`【${moduleName}】build successfully!`);
            resolve();
          }
        },
      );
      // eslint-disable-next-line no-console
      execProcess.stdout?.on('data', (data) => console.log(data));
      // eslint-disable-next-line no-console
      execProcess.stderr?.on('data', (data) => console.error(data));
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
const restoreFromDockerImage = async (
  image: string,
  requireBuildList: string[],
  dataEngineerInfo?: ERDA_BUILD_CONFIG,
) => {
  try {
    // check whether docker is running
    await asyncExec('docker ps');
  } catch (error) {
    if (error.message.includes('Cannot connect to the Docker daemon')) {
      // if not start docker and exit program, because node can't know when docker would started completely
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
  if (containers && containers.includes('erda-ui-for-build')) {
    // if exist stop & delete it first, otherwise it will cause docker conflict
    logInfo('erda-ui container already exist, stop & delete it before next step');
    await stopDockerContainer();
    logSuccess('stop & delete erda-ui container successfully');
  }
  const dataEngineerEnv = head(Object.keys(dataEngineerInfo?.env || {}));

  // start docker container names erda-ui for image provided
  await asyncExec(`docker run -d --name erda-ui-for-build \
    -e OPENAPI_ADDR=127.0.0.1 \
    -e TA_ENABLE=false \
    -e TERMINUS_KEY=xxx \
    -e COLLECTOR_PUBLIC_ADDR=127.0.0.1 \
    -e ENABLE_BIGDATA=false \
    -e UC_PUBLIC_URL=127.0.0.1 \
    -e ${dataEngineerEnv}=127.0.0.1 \
    -e GITTAR_ADDR=127.0.0.1 \
    -e KRATOS_ADDR=127.0.0.1 \
    -e KRATOS_PRIVATE_ADDR=127.0.0.1 \
    ${registryDir}:${image}`);
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

export default async (options: { local?: boolean; image?: string; enableSourceMap?: boolean; online?: boolean }) => {
  try {
    const { image, online = false, enableSourceMap = false } = options;
    const externalModules = await getModules(online);

    let { local } = options;
    if (image) {
      local = true;
    }
    externalModules.forEach(({ name }) => {
      if (online) {
        dirMap.set(name, path.resolve(currentDir, `modules/${name}`));
      } else {
        dirMap.set(name, path.resolve(currentDir, `../erda-ui-enterprise/${name}`));
      }
      noneCurrentRepoModules.push(name);
    });

    checkIsRoot();
    await checkModuleValid(!!local);

    let rebuildList = getModuleList();

    await clearPublic();

    const dataEngineerInfo = externalModules.find(({ role }) => role === 'DataEngineer');

    if (local) {
      await checkBranch();
      await checkCodeUpToDate();

      if (image) {
        if (!/\d\.\d-\d{8}-.+/.test(image)) {
          logError('invalid image sha, correct format example: 1.0-20210508-afc4a4a');
          exit(1);
        }
        const requireBuildList = await getRequireBuildModules(image);
        logInfo(`Will launch a partial build based on image ${image}`);
        rebuildList = await restoreFromDockerImage(image, requireBuildList, dataEngineerInfo);
      }
      await checkReInstall();
    }

    await buildModules(enableSourceMap, rebuildList, `${online}`, dataEngineerInfo);

    generateVersion();

    if (rebuildList.includes('shell')) {
      localIcon();
    }

    externalModules.forEach(({ nginx, env }) => {
      if (nginx) {
        const nginxPath = path.resolve(process.cwd(), 'nginx.conf.template');
        const nginxContent = fs.readFileSync(nginxPath).toString('utf8').split(EOL);
        nginxContent.splice(-1, 0, nginx);
        fs.writeFileSync(nginxPath, nginxContent.join(EOL));
      }
      if (env && online) {
        const erdaYmlPath = path.resolve(process.cwd(), 'erda.yml');
        const ymlContent = YAML.parse(fs.readFileSync(erdaYmlPath).toString('utf8'));
        Object.keys(env).forEach((key) => {
          set(ymlContent, ['services', 'ui', 'envs', key], env[key]);
        });
        fs.writeFileSync(erdaYmlPath, YAML.stringify(ymlContent));
      }
    });
  } catch (error) {
    logError('build exit with error:', error.message);
    process.exit(1);
  }
};
