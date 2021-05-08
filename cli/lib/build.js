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

const fs = require('fs');
const inquirer = require('inquirer');
const { promisify } = require('util');
const child_process = require('child_process');
const { logInfo, logSuccess, logWarn, logError } = require('./util/log');
const asyncExec = promisify(require('child_process').exec)
const {
  rootDir,
  publicDir,
  yarnCmd,
  moduleList,
  registryDir,
} = require('./util/env');
const { exit } = require('process');
const { execSync, exec } = child_process;
const ora = require('ora');

const GET_BRANCH_CMD = "git branch | awk '/\\*/ { print $2; }'";
// const UPDATE_SUB_MODULES = "git pull --recurse-submodules";  // this pull only pull the forked repository, mostly doesn't make any sense

const getCurrentBranch = async () => {
  const branch = await execSync(GET_BRANCH_CMD);
  return branch.toString();
};

const checkBranch = async () => {
  const branch = await getCurrentBranch();
  logInfo('Current Branch: ', branch);
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
  let answer = await inquirer.prompt([
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
  return answer.enableSourceMap
}

const checkReInstall = async (rebuildList) => {
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
}


const installDependencies = async (rebuildList) => {
  const pList = [];
  moduleList.forEach(({moduleDir: dir, moduleName: name}) => {
    if (rebuildList.includes(name)) {
      logInfo(`Performing "${yarnCmd}" inside ${dir} folder`);
      let installPromise = new Promise((resolve)=> {
        exec(yarnCmd, { env: process.env, cwd: dir, stdio: 'inherit' }, (error, stdout)=>{
          if (error) {
            logError(`install error: ${error}`);
            process.exit(1);
          } else {
            logSuccess(`【${name}】 successfully installed! [${stdout}]`)
            resolve();
          }
        });
      })
  
      pList.push(installPromise);
    }
  });

  await Promise.all(pList);
  logSuccess(`install successfully 😁!`);
}

const clearPublic = async () => {
  logInfo('clear public folder');
  await execSync(`rm -rf ${publicDir}/*`, { cwd: rootDir });
}

const checkModuleValid = async (isLocal)=> {
  let isAllValid = true;
  
  moduleList.forEach(item => {
    if (!item.moduleDir) {
      isAllValid = false;
      logError(`${item.moduleName.toUpperCase()}_DIR is not exist in .env, you can run "erda setup <module> <port>" to auto generate moduleDir`);
    } else if (!fs.existsSync(item.moduleDir)) {
      isAllValid = false
      logError(`${item.moduleName.toUpperCase()}_DIR is wrong, please check in .env, or you can run "erda setup <module> <port>" to update moduleDir`);
    }
  });
  
  const outputModules = moduleList.map(item => item.moduleName).join(',');

  logInfo(`Output modules:【${outputModules}】`);

  if (!isAllValid) {
    process.exit(1);
  } else if (isLocal) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'coveredAllModules',
        message: `Here are the modules【${outputModules}】detected in .env file. If missing module requires to build please update env config and run again. Otherwise press Enter to continue.`,
        default: true,
      },
    ]);
    if (!answer.coveredAllModules) {
      process.exit(1);
    }
  }
}

const buildModules = async (enableSourceMap, rebuildList) => {  
  const pList = [];

  const toBuildModules = rebuildList.length ? rebuildList : moduleList;
  toBuildModules.forEach(item => {
    const { moduleName, moduleDir } = item;
    // logInfo(`Building ${moduleName}`);
    
    let buildPromise = new Promise((resolve)=> {
      const spinner = ora(`building ${moduleName}`).start();
      exec('npm run build', { env: { ...process.env, enableSourceMap }, cwd: moduleDir, stdio: 'inherit' }, (error, stdout, stderr)=>{
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
    })

    pList.push(buildPromise);
  });

  await Promise.all(pList);
  logSuccess(`build successfully 😁!`);
}

const stopDockerContainer = async () => {
  await asyncExec('docker container stop erda-ui-for-build');
  await asyncExec('docker rm erda-ui-for-build');
}

/**
 * restore built content from an existing image
 */
const restoreFromDockerImage = async (image) => {
  try {
    // check whether docker is running
    await asyncExec('docker ps');
  } catch (error) {
    if (error.message.includes('Cannot connect to the Docker daemon')) { // if not start docker and exit program, because node can't know when docker would started completely
      logInfo('starting Docker');
      try {
        await asyncExec('open --background -a Docker');
      } catch (e) {
        logError('Launch Docker failed! Please start Docker manually')
      }
      logWarn('Since partial build depends on docker, please rerun this command after Docker launch completed');
      exit(0);
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
    ${registryDir}:${image}`);
  logSuccess('erda-ui docker container has been launched');

  // choose modules for this new build, the ones which not be chosen will reuse the image content
  const modulesNames = moduleList.map(module => module.moduleName);
  const { rebuildList } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'rebuildList',
      message: 'Choose modules to build',
      choices: modulesNames,
    }
  ]);
  if (!rebuildList || !rebuildList.length) {
    logWarn('no module chosen to build, exit program');
    exit(0);
  }

  // copy built content from container
  await asyncExec(`docker cp erda-ui-for-build:/usr/share/nginx/html/. ${publicDir}/`);
  logSuccess('finished copy image content to local');
  // delete rebuilt module folders
  rebuildList.forEach(module => {
    if (module !== 'shell') {
      exec(`rm -rf ${publicDir}/static/${module}`);
    } else {
      exec(`rm -rf ${publicDir}/static/${module} && find ${publicDir}/static -maxdepth 1 -type f | xargs rm -f`);
    }
  });
  await execSync(`rm -rf ${publicDir}/version.json`, { cwd: rootDir });
  // stop & delete container
  stopDockerContainer();

  return rebuildList;
}

module.exports = async (options) => {
  try {
    let { local, image } = options;
    if (!!image) {
      local = true;
    }
    await checkModuleValid(local);

    let enableSourceMap = false;
    
    let rebuildList = moduleList.map(item => item.moduleName);

    await clearPublic();

    if (local) {
      await checkBranch();
      await checkCodeUpToDate();
      enableSourceMap = await whetherGenerateSourceMap();
      if (!!image) {
        logInfo(`Will launch a partial build based on image ${image}`)
        rebuildList = await restoreFromDockerImage(image);
      }
      await checkReInstall(rebuildList);
    }
    
    await buildModules(enableSourceMap, moduleList.filter(module => rebuildList.includes(module.moduleName)));

    require('./gen-version')();

    if (rebuildList.includes('shell')) {
      require('./local-icon')();
    }

  } catch (error) {
    logError('build exit with error:', error.message);
    process.exit(1);
  }
};
