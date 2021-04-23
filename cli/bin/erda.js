#!/usr/bin/env node
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

const path = require('path');
const { Command } = require('commander');
const program = new Command();
const inquirer = require('inquirer');

inquirer.registerPrompt('directory', require('inquirer-select-directory'));

program
  .version(`erda-ui/cli ${require('../package').version}`)
  .usage('<command> [options]');

// program
//   .command('setup [env]')
//   .description('run setup commands for all envs')
//   .option('-s, --setup_mode <mode>', 'Which setup mode to use', 'normal')
//   .action((env, options) => {
//     env = env || 'all';
//     console.log('read config from %s', program.opts().config);
//     console.log('setup for %s env(s) with %s mode', env, options.setup_mode);
//   });

program
  .command('setup <module> <port>')
  .description('setup env and tsconfig for module')
  .action((moduleName, port) => {
    require('../lib/setup')(moduleName, port)
  });

program
  .command('build [execPath]')
  .description('bundle files to public directory')
  .action((execPath='local') => {
    require('../lib/build')(execPath)
  });

program
  .command('copy <module>')
  .option('-p, --dist_path <dist>', 'Dist directory path', './dist')
  .description('copy module build files to erda-ui public directory')
  .action((module, options) => {
    require('../lib/copy')(module, options)
  });

program
  .command('release')
  .description('build & push docker image')
  .action(() => {
    require('../lib/release')()
  });

program
  .command('i18n [workDir]')
  .description('translate words in work dir')
  .action((_workDir) => {
    const workDir = _workDir
      ? path.resolve(process.cwd(), _workDir)
      : process.cwd()
    require('../lib/i18n')({ workDir })
  });

program
  .command('add-license')
  .option('-t, --fileType <file_type>', 'File type', 'js,ts,jsx,tsx')
  .description('add license header in files if not exist')
  .action(({ fileType }) => {
    require('../lib/add-license')({ fileType })
  });

program
  .command('check-license')
  .option('-t, --fileType <file_type>', 'File type', 'js,ts,jsx,tsx')
  .option('-d, --directory <directory>', 'work directory')
  .description('check license header in files')
  .action(({ fileType, directory }) => {
    require('../lib/check-license')({ fileType, directory })
  });

program
  .command('launch')
  .description('launch erda ui in development mode')
  .action(() => {
    require('../lib/launcher')()
  });


program.parse(process.argv);
