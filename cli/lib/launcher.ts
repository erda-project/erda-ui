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

import pm2 from 'pm2';
import fs from 'fs';
import inquirer from 'inquirer';
import { logError, logInfo, logSuccess, logWarn } from './util/log';
import { exit } from 'process';
import chalk from 'chalk';
import Table from 'cli-table';
import dotenv from 'dotenv';
import checkCliVersion from './check-cli-version';

/**
 * launch means run a PM2 process, doesn't mean this module in running, it also could be stopped state, use pm2 restart xxx to run it.
 */
export default async () => {
  await checkCliVersion();
  const currentPath = process.cwd();
  if (fs.existsSync(`${currentPath}/.env`)) {
    const { parsed: envConfig } = dotenv.config({ path: `${currentPath}/.env` });
    if (!envConfig || !Object.keys(envConfig).length) {
      logError('Empty .env config');
      exit(0);
    }
    const envModules: {[k: string]: string} = {}; // collect modules in .env
    Object.keys(envConfig).forEach((item) => {
      if (item.endsWith('_DIR') && item !== 'ERDA_DIR') {
        envModules[item.slice(0, item.indexOf('_DIR')).toLowerCase()] = envConfig[item];
      }
    });

    if (!Object.keys(envModules).length) {
      logError('No module found in .env config');
      exit(0);
    }

    pm2.connect((err) => { // connect to pm2 deamon
      if (err) {
        logError(err);
        process.exit(2);
      }

      pm2.list(async (listErr, list) => { // find all launched modules
        if (listErr) throw listErr;
        let launchedList: string[] = [];
        if (list.length) {
          launchedList = list.map(({ name }) => (name!));
          logInfo(`Module [${chalk.yellowBright(launchedList.join(', '))}] launched already`);
        }

        const unLaunchedModules = Object.keys(envModules).filter((module) => !launchedList.includes(module));
        if (!unLaunchedModules.length) {
          logInfo('All modules have been launched');
          showCommands(launchedList);
          exit(0);
        }

        const { selectedList } = await inquirer.prompt<{selectedList: string[]}>([
          {
            type: 'checkbox',
            name: 'selectedList',
            message: 'Choose modules to launch',
            choices: unLaunchedModules,
          },
        ]);

        if (!selectedList.length) {
          logInfo('No module been selected, launcher exit');
          exit(0);
        }

        const maintainModules = launchedList.concat(selectedList);
        const ecosystem = selectedList.map((moduleName) => {
          return {
            name: moduleName,
            script: 'npm',
            args: 'start',
            cwd: envModules[moduleName],
            watch: moduleName === 'scheduler', // only scheduler required watch mode
            logDateFormat: 'HH:mm',
          };
        });

        // @ts-ignore api mistake
        pm2.start(ecosystem, (startErr) => { // start pm2 process
          if (startErr) throw startErr;
          logSuccess(`Module [${selectedList.join(',')}] has been launched, view log to check module status`);
          pm2.disconnect();
          showCommands(maintainModules);
        });
      });
    });
  } else {
    logError('Please ensure run this command in erda-ui root directory and setup command been executed');
  }
};

/**
 * display useful commands to maintain pm2 processes
 * @param {*} maintainModules
 */
const showCommands = (maintainModules: string[]) => {
  logWarn('Please ensure PM2 installed globally, then you can run commands below to manage your PM2 processes anywhere in your OS');
  const commandTable = new Table({ head: [''].concat(maintainModules) });
  const logCommands: string[] = [];
  const restartCommands: string[] = [];
  const stopCommands: string[] = [];

  maintainModules.forEach((module) => {
    logCommands.push(`pm2 logs ${module}`);
    restartCommands.push(`pm2 restart ${module}`);
    stopCommands.push(`pm2 stop ${module}`);
  });

  commandTable.push(
    { 'view logs': logCommands },
    { 'restart module': restartCommands },
    { 'stop module': stopCommands },
  );

  logInfo(commandTable.toString());
  const globalCommandTable = new Table({ head: ['desc', 'command'] });
  globalCommandTable.push(
    ['view all modules status', 'pm2 ls'],
    ['stop all running modules', 'pm2 stop all'],
    ['restart all running modules', 'pm2 restart all'],
    ['kill all running modules', 'pm2 kill'],
  );
  logInfo(globalCommandTable.toString());
  logInfo('Additionally you can use pm2 monitor to view detail info for each process');
};
