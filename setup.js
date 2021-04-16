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
const { resolve } = require('path');
const { join } = require('path');
const cp = require('child_process');
const os = require('os');
// get library path

const root = resolve(__dirname, '.');

// npm binary based on OS

const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const coreDir = join(root, 'core');
const schedulerDir = join(root, 'scheduler');
const shellDir = join(root, 'shell');
const cliDir = join(root, 'cli');

const log = msg => {
  console.log(`============================ ${msg} ============================\n`);
}

const installDependencies = () => {
  [
    coreDir,
    schedulerDir,
    shellDir,
    cliDir
  ].forEach((dir) => {
    if (fs.existsSync(join(dir, 'node_modules'))) {
      log(`${dir.split('/').pop()} dependencies have installed 😁`);
      return;
    };
    log(`Performing "npm i" inside ${dir} folder`);
    // install dependencies
    cp.spawnSync(npmCmd, ['i'], { env: process.env, cwd: dir, stdio: 'inherit' });
  });
}

const registerErdaCmd = async () => {
  log('register erda command');
  await cp.spawnSync(npmCmd, ['run', 'local'], { env: process.env, cwd: cliDir, stdio: 'inherit' });
}

const setupCore = async (port) => {
  log('create .erda/config in module core');
  await cp.spawnSync('erda', ['setup', 'core', port], { env: process.env, cwd: coreDir, stdio: 'inherit' }) ;
}

const setupShell = async (port) => {
  log('create .erda/config in module shell');
  await cp.spawnSync('erda', ['setup', 'shell', port], { env: process.env, cwd: shellDir, stdio: 'inherit' }) ;
}

const buildCore = () => {
  if (fs.existsSync(join(root, 'public/core'))) {
    log('core build exist 😁');
    return;
  };
  log('Building the core');
  cp.spawnSync('npm run build', { env: process.env, cwd: coreDir, stdio: 'inherit' });
}

const setupModules = async () => {  
  await registerErdaCmd();
  await setupCore(5000);
  await setupShell(8080);
  buildCore();
}

// start
installDependencies();
setupModules();
