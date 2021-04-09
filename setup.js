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

const log = msg => {
  console.log(`============================ ${msg} ============================\n`);
}

const installDependencies = () => {
  [
    coreDir,
    schedulerDir,
    shellDir,
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

const buildCore = () => {
  if (fs.existsSync(join(root, 'public/core'))) {
    log('core build exist 😁');
    return;
  };
  log('Building the core');
  cp.spawn(npmCmd, ['run', 'build'], { env: process.env, cwd: coreDir, stdio: 'inherit' });
}

const startShell = () => {
  log('Starting ths shell');
  cp.spawn(npmCmd, ['run', 'dev'], { env: process.env, cwd: shellDir, stdio: 'inherit' });
}

const startScheduler = () => {
  log('Starting the scheduler');
  cp.spawn(npmCmd, ['start'], { env: process.env, cwd: schedulerDir, stdio: 'inherit' });
}

// start
installDependencies();
buildCore();
// startShell();
// startScheduler();
