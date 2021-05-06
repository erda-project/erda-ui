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
const process = require('process')
// get library path
const root = resolve(__dirname, '.');
// runCmd binary based on OS

const yarnCmd = os.platform().startsWith('win') ? 'yarn.cmd' : 'yarn';
const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const runCmd = process.argv[2] === 'online' ? npmCmd : yarnCmd
const installArg = process.argv[2] === 'online' ? ['i'] : []
console.log(`==============${runCmd} mode=============`)

const coreDir = join(root, 'core');
const schedulerDir = join(root, 'scheduler');
const shellDir = join(root, 'shell');
const cliDir = join(root, 'cli');

const log = msg => {
  console.log(`============================ ${msg} ============================\n`);
}

const installDependencies = () => {
  if (!fs.existsSync(join(root, 'node_modules')) && process.argv[2] !== 'online') {
    cp.spawnSync(runCmd, installArg, { env: process.env, cwd: root, stdio: 'inherit' });
    return;
  };
  [
    cliDir,
    coreDir,
    schedulerDir,
    shellDir
  ].forEach((dir) => {
    if (fs.existsSync(join(dir, 'node_modules'))) {
      log(`${dir.split('/').pop()} dependencies have installed 😁`);
      return;
    };
    log(`Performing "${runCmd}" inside ${dir} folder`);
    // install dependencies
    cp.spawnSync(runCmd, ['config', 'set', 'registry', 'https://registry.npm.terminus.io/'], { env: process.env, cwd: dir, stdio: 'inherit' });
    cp.spawnSync(runCmd, installArg, { env: process.env, cwd: dir, stdio: 'inherit' });
  });
}

const registerErdaCmd = async () => {
  log('register erda-ui command globally 😁');
  await cp.spawnSync(npmCmd, ['i', '-g', '@erda-ui/cli'], { env: process.env, cwd: cliDir, stdio: 'inherit' });
}

const setupCore = async (port) => {
  log('create .erda/config in module core 😁');
  await cp.spawnSync('erda-ui', ['setup', 'core', port], { env: process.env, cwd: coreDir, stdio: 'inherit' }) ;
}

const setupShell = async (port) => {
  log('create .erda/config in module shell');
  await cp.spawnSync('erda-ui', ['setup', 'shell', port], { env: process.env, cwd: shellDir, stdio: 'inherit' }) ;
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
installDependencies();
setupModules();
