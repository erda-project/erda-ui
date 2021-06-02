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

import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import { logInfo, logSuccess, logWarn } from './util/log';
import dotenv from 'dotenv';

export default async (moduleName: string) => {
  const moduleDir = process.cwd();
  const packagePath = path.join(moduleDir, 'package.json');

  if (!fs.existsSync(packagePath) || path.resolve(moduleDir, `../${moduleName}`) !== moduleDir) {
    logWarn(`the current path: '${moduleDir}' is not the root path of the project ${moduleName}`);
    process.exit(1);
  }

  let erdaUiPath = path.resolve(moduleDir, '..');

  if (!['core', 'shell'].includes(moduleName)) {
    erdaUiPath = path.resolve(moduleDir, '../..');
    let envPath = path.resolve(erdaUiPath, '.env');

    if (!fs.existsSync(envPath)) {
      erdaUiPath = path.resolve(moduleDir, '../../erda-ui');
      envPath = path.resolve(erdaUiPath, '.env');

      if (!fs.existsSync(envPath)) {
        const answer = await inquirer.prompt([
          {
            type: 'directory',
            name: 'targetPath',
            message: 'Select root path of project erda-ui',
            basePath: process.cwd(),
          },
        ]);
        erdaUiPath = answer.targetPath;
      }
    }
  }

  const fullConfigPath = `${erdaUiPath}/.env`;
  const { parsed: fullConfig } = dotenv.config({ path: fullConfigPath });

  const relativePath = path.relative(moduleDir, erdaUiPath);
  if (!fullConfig) {
    logWarn('erda-ui/.env file not exist, please execute `node setup.js` in erda-ui directory first');
    process.exit(1);
  }

  fullConfig.PROD_MODULES = Array.from(new Set(fullConfig.PROD_MODULES.split(',').concat(moduleName))).join(',');
  fullConfig[`${moduleName.toUpperCase()}_DIR`] = path.resolve(moduleDir);
  fullConfig.ERDA_DIR = path.resolve(erdaUiPath);

  const newFullConfig: string[] = [];
  Object.keys(fullConfig).forEach((k) => {
    newFullConfig.push(`${k}=${fullConfig[k]}`);
  });
  fs.writeFileSync(fullConfigPath, newFullConfig.join('\n'), 'utf8');
  logSuccess('update erda-ui/.env file');

  const includeContent = moduleName === 'core'
    ? [
      './node_modules/@types/*',
      '../node_modules/@types/*',
      `${relativePath}/shell/app/**/types/*`,
    ]
    : moduleName === 'shell'
      ? [
        './node_modules/@types/*',
        '../node_modules/@types/*',
        `${relativePath}/core/app/**/types/*`,
      ]
      : [
        './node_modules/@types/*',
        `${relativePath}/core/app/**/types/*`,
        `${relativePath}/shell/app/**/types/*`,
      ];

  const commonPathContent = {
    'common/*': [`${relativePath}/shell/app/common/*`],
    'common/all': [`${relativePath}/shell/app/common/index`],
    'nusi/all': [`${relativePath}/shell/app/external/nusi`],
  };

  const corePathContent = {
    'core/main': [`${relativePath}/core/src/index`],
    'core/cube': [`${relativePath}/core/src/cube`],
    'core/i18n': [`${relativePath}/core/src/i18n`],
    'core/agent': [`${relativePath}/core/src/agent`],
    'core/config': [`${relativePath}/core/src/config.ts`],
    'core/stores/route': [`${relativePath}/core/src/stores/route.ts`],
    'core/stores/loading': [`${relativePath}/core/src/stores/loading.ts`],
  };

  const pathContent = moduleName === 'core' ? commonPathContent : { ...commonPathContent, ...corePathContent };


  const tsConfigPath = path.join(fullConfig[`${moduleName.toUpperCase()}_DIR`], 'tsconfig.json');
  let tsConfig: any = {};
  try {
    tsConfig = require(tsConfigPath);
  } catch (e) {
    logWarn('tsconfig.json may have syntax error, please check');
    process.exit(0);
  }
  if (!tsConfig.compilerOptions) {
    tsConfig.compilerOptions = {};
  }
  tsConfig.compilerOptions.paths = {
    ...tsConfig.compilerOptions.paths,
    ...pathContent,
  };
  tsConfig.include = Array.from(new Set([
    ...tsConfig.include,
    ...includeContent,
  ]));
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2), 'utf8');
  logSuccess('update tsconfig.json');
};
