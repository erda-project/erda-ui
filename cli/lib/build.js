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
const child_process = require('child_process');
const { logInfo, logSuccess, logWarn, logError } = require('./util/log');
const {
  rootDir,
  publicDir,
  yarnCmd,
  moduleList
} = require('./util/env');
const { execSync, exec } = child_process;

const GET_BRANCH_CMD = "git branch | awk '/\\*/ { print $2; }'";
const UPDATE_SUB_MODULES = "git pull --recurse-submodules";


const getCurrentBranch = async () => {
  execSync(UPDATE_SUB_MODULES);
  const branch = await execSync(GET_BRANCH_CMD);
  return branch.toString();
};

const checkBranch = async () => {
  const branch = await getCurrentBranch();
  logInfo('Current Branch: ', branch);
  if (!branch.startsWith('release')) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueBuild',
        message: 'Current branch is not release/*, continue?',
        default: false,
      },
    ]);
    if (!answer.continueBuild) {
      process.exit(1);
    }
  }
};

const checkCodeUpToDate = async () => {
  logInfo('update code');

  let answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'updateCode',
      message: 'Make sure codes of erda-ui and erda-ui-enterprise are up to date, and then select "Y" to continue.',
      default: false,
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
    logInfo('start yarn');
    await installDependencies();
  } else {
    logWarn('Skip update Dependencies, please make sure it\'s up to date!');
  }
}


const installDependencies = async () => {
  const pList = [];
  moduleList.forEach(({moduleDir: dir, moduleName: name}) => {
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
  });

  await Promise.all(pList);
  logSuccess(`install successfully 😁!`);
}

const clearPublic = async () => {
  logInfo('clear Public');
  await execSync(`rm -rf ${publicDir}/*`, { cwd: rootDir });
}

const checkModuleValid = async (execPath)=> {
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
  } else if (execPath === 'local') {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'coveredAllModules',
        message: `Are all modules covered in【${outputModules}】`,
      },
    ]);
    if (!answer.coveredAllModules) {
      process.exit(1);
    }
  }
}

const buildAll =  async (enableSourceMap) => {  
  const pList = [];

  moduleList.forEach(item => {
    const { moduleName, moduleDir } = item;
    logInfo(`Building ${moduleName}`);

    let buildPromise = new Promise((resolve)=> {
      exec('npm run build', { env: { ...process.env, enableSourceMap }, cwd: moduleDir, stdio: 'inherit' }, (error, stdout, stderr)=>{
        if (error) {
          logError(`build error: ${error}`);
          process.exit(1);
        } else {
          logInfo(stderr);
          logSuccess(`【${moduleName}】build successfully! [${stdout}]`);
          resolve();
        }
      });
    })

    pList.push(buildPromise);
  });

  await Promise.all(pList);
  logSuccess(`build successfully 😁!`);
}

module.exports = async (execPath) => {
  try {   
    await checkModuleValid(execPath);

    let enableSourceMap = false;
    
    if (execPath === 'local') {
      await checkBranch();
      await checkCodeUpToDate();
      enableSourceMap = await whetherGenerateSourceMap();
      await checkReInstall();
    }
    
    await clearPublic();

    await buildAll(enableSourceMap);

    require('./gen-version')();
    require('./local-icon')();
  } catch (error) {
    logError('build exit with error:', error.message);
    process.exit(1);
  }
};
