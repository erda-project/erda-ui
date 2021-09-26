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

import path from 'path';
import { Command } from 'commander';
import inquirer from 'inquirer';
import build from '../lib/build';
import buildOnline from '../lib/build-online';
import release from '../lib/release';
import addLicense from '../lib/add-license';
import checkLicense from '../lib/check-license';
import init from '../lib/init';
import initOnline from '../lib/init-online';
import i18n from '../lib/i18n';
import generateService from '../lib/service-generator';
import checkBuildStatus from '../lib/check-build-status';

const program = new Command();

inquirer.registerPrompt('directory', require('inquirer-select-directory'));

program.version(`erda-ui/cli ${require('../../package').version}`).usage('<command> [options]');

program
  .command('init')
  .description('install dependency & initialize .env config')
  .option('-p, --port <port>', 'set scheduler port')
  .option('-b, --backendUrl <backendUrl>', 'set backend(api) url')
  .option('-o, --override', 'ignore current .env file and override')
  .option('--online', 'is online execution')
  .option('--skipInstall', 'whether to skip the installation step')
  .action(async (options) => {
    const { online, ...restOptions } = options;
    if (online) {
      initOnline();
    } else {
      init(restOptions);
    }
  });

program
  .command('build')
  .description(
    'bundle files to public directory, pass true to launch a local full compilation build, pass image sha to launch a local partial compilation build based on image',
  )
  .option('-i, --image <image>', 'image sha as build base, e.g. 1.0-20210506-48bd74')
  .option('-m, --enableSourceMap', 'generate source map')
  .option('-o, --online', 'whether is online build')
  .action(async (options) => {
    const { online } = options;
    if (online) {
      buildOnline();
    } else {
      build(options);
    }
  });

program
  .command('release')
  .description('build & push docker image')
  .option('-i, --image <image>', 'image sha as build base, e.g. 1.0-20210506-48bd74')
  .option('-l, --local', 'enable local mode, if image arg is given, then local mode is forcibly')
  .option('-m, --enableSourceMap', 'generate source map')
  .action((options) => {
    release(options);
  });

program
  .command('i18n [workDir]')
  .description('translate words in work dir')
  .action(async (_workDir) => {
    const workDir = _workDir ? path.resolve(process.cwd(), _workDir) : process.cwd();
    i18n({ workDir });
  });

program
  .command('generate-service [workDir]')
  .description('generate service by API swagger')
  .action(async (_workDir) => {
    const workDir = _workDir ? path.resolve(process.cwd(), _workDir) : process.cwd();
    generateService({ workDir });
  });

program
  .command('add-license')
  .option('-t, --fileType <file_type>', 'File type', 'js,ts,jsx,tsx')
  .description('add license header in files if not exist')
  .action(({ fileType }) => {
    addLicense({ fileType });
  });

program
  .command('check-license')
  .option('-t, --fileType <file_type>', 'File type', 'js,ts,jsx,tsx')
  .option('-d, --directory <directory>', 'work directory')
  .option('-f, --filter <filter>', 'filter log', 'warn')
  .description('check license header in files')
  .action(({ fileType, directory, filter }) => {
    checkLicense({ fileType, directory, filter });
  });

program
  .command('check-build-status')
  .description(
    'compare git commit sha with previous build, if match it will skip build and reuse last built files. Only used in pipeline build',
  )
  .option('-m, --module', 'module name to build')
  .action(async () => {
    checkBuildStatus();
  });

program.parse(process.argv);
