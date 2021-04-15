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
const { logInfo, logError } = require('./cli/lib/util/log');
// get library path

const root = resolve(__dirname, '.');

const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const coreDir = join(root, 'core');
const schedulerDir = join(root, 'scheduler');
const shellDir = join(root, 'shell');
const cliDir = join(root, 'cli');

const log = msg => {
  logInfo(`============================ ${msg} ============================\n`);
}

const isSetupAlready = () => {
  [ coreDir, schedulerDir, shellDir, cliDir ].every((dir) => {
    return fs.existsSync(join(dir, 'node_modules'));
  });
}

if (!isSetupAlready) {
  logError(`Please run 'node setup.js' first to init this project for basic config and dependencies`);
  process.exit(1);
}

const buildCore = () => {
  if (fs.existsSync(join(root, 'public/core'))) {
    log('core build exist 😁');
    return;
  };
  log('Building the core');
  cp.spawn(npmCmd, ['run', 'build'], { env: process.env, cwd: coreDir, stdio: 'inherit' });
}

const startCore = () => {
  log('Starting the core');
  cp.spawn(npmCmd, ['run', 'start'], { env: process.env, cwd: coreDir, stdio: 'inherit' });
}

const startShell = () => {
  log('Starting the shell');
  cp.spawn(npmCmd, ['run', 'dev'], { env: process.env, cwd: shellDir, stdio: 'inherit' });
}

const startScheduler = () => {
  log('Starting the scheduler');
  cp.spawn(npmCmd, ['run', 'start'], { env: process.env, cwd: schedulerDir, stdio: 'inherit' });
}


// start
const start = async ()=> {
  buildCore();
  startCore();
  startShell();
  startScheduler();
}

try {
  start();
} catch (error) {
  logError('project start exit with error:', error.message);
  process.exit(1);
}
