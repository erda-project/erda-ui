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
const process = require('process')
// get library path
const root = resolve(__dirname, '.');
// runCmd binary based on OS
const { promisify } = require('util');
const asyncExec = promisify(require('child_process').exec);

const runCmd = 'pnpm'
console.log(`==============${runCmd} mode=============`)

const coreDir = join(root, 'core');
const schedulerDir = join(root, 'scheduler');
const shellDir = join(root, 'shell');

const log = msg => {
  console.log(`============================ ${msg} ============================\n`);
}

const registerErdaCmd = async () => {
  log('register erda-ui command globally 😁');
  await cp.spawnSync('npm', ['i', '-g', '@erda-ui/cli'], { env: process.env, stdio: 'inherit' });

  log('register npm-check-updates globally to check npm version😁');
  await cp.spawnSync('npm', ['i', '-g', 'npm-check-updates'], { env: process.env, stdio: 'inherit' });
}

const setupCore = async (port) => {
  log('create .erda/config in module core 😁');
  await cp.spawnSync('erda-ui', ['setup', 'core', port, '-s'], { env: process.env, cwd: coreDir, stdio: 'inherit' }) ;
}

const setupShell = async (port) => {
  log('create .erda/config in module shell');
  await cp.spawnSync('erda-ui', ['setup', 'shell', port, '-s'], { env: process.env, cwd: shellDir, stdio: 'inherit' }) ;
}

const initEnvFile = async () => {
  const envContent = `
DEV_HOST=https://terminus-org.dev.terminus.io
TEST_HOST=https://terminus-org.test.terminus.io
SCHEDULER_HOST=http://localhost
SCHEDULER_PORT=3000
DEV_MODULES=core,shell
PROD_MODULES=core,shell
SCHEDULER_DIR=${schedulerDir}
`
  await fs.writeFileSync(join(root, '.env'), envContent, 'utf8', '0777');
  log(`create .env file in ${root}`)
}

const setupModules = async () => {  
  await initEnvFile();
  await registerErdaCmd();
  await setupCore(5000);
  await setupShell(8080);
}

// start
(async () => {
  log('Please ensure you have installed pnpm globally. ');
  await asyncExec('pnpm i');
  setupModules();
})();
