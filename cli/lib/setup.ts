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
import child_process from 'child_process';
import { logInfo, logSuccess, logWarn } from './util/log';
import dotenv from 'dotenv';
import checkCliVersion from './check-cli-version';

export default async (moduleName: string, modulePort: string) => {
  await checkCliVersion();

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
    logWarn('erda-ui/.env file not exist, please execute `erda init` in erda-ui directory first');
    process.exit(1);
  }

  fullConfig.DEV_MODULES = Array.from(new Set(fullConfig.DEV_MODULES.split(',').concat(moduleName))).join(',');
  fullConfig.PROD_MODULES = Array.from(new Set(fullConfig.PROD_MODULES.split(',').concat(moduleName))).join(',');
  fullConfig[`${moduleName.toUpperCase()}_URL`] = moduleName === 'shell'
    ? `https://dice.dev.terminus.io:${modulePort}`
    : `https://local-${moduleName}.terminus-org.dev.terminus.io:${modulePort}`;

  fullConfig[`${moduleName.toUpperCase()}_DIR`] = path.resolve(moduleDir);
  fullConfig.ERDA_DIR = path.resolve(erdaUiPath);

  const newFullConfig: string[] = [];
  Object.keys(fullConfig).forEach((k) => {
    newFullConfig.push(`${k}=${fullConfig[k]}`);
  });
  fs.writeFileSync(fullConfigPath, newFullConfig.join('\n'), 'utf8');
  logSuccess('update erda-ui/.env file');

  const configDir = path.join(moduleDir, '.erda');

  if (!fs.existsSync(configDir)) {
    logInfo('.erda directory not exist, create');
    fs.mkdirSync(configDir, '0777');
  }

  const configFilePath = path.join(configDir, 'config.js');

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


  const extraContent = '';

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

  const shellContent = moduleName === 'shell' ? `
  DEV_MODULES: ${JSON.stringify(fullConfig.DEV_MODULES.split(','))},
  PROD_MODULES: ${JSON.stringify(fullConfig.PROD_MODULES.split(','))},
  ` : '';

  const shellConfigPath = path.resolve(`${erdaUiPath}/shell/.erda/config.js`);

  if (moduleName !== 'shell' && fs.existsSync(shellConfigPath)) {
    const { MODULE_PORT } = require(shellConfigPath);
    logInfo('update shell/.erda/config.js');
    child_process.spawnSync('erda-ui', ['setup', 'shell', MODULE_PORT], { env: process.env, cwd: fullConfig.SHELL_DIR, stdio: 'inherit' });
  }

  const module_host = moduleName === 'shell'
    ? 'dice.dev.terminus.io'
    : `local-${moduleName}.terminus-org.dev.terminus.io`;

  const configContent = `
module.exports = {
  DEV_URL: "https://terminus-org.dev.terminus.io",
  TEST_URL: "https://terminus-org.test.terminus.io",
  SCHEDULER_URL: "http://localhost:3000",
  ERDA_UI_DIR: "${erdaUiPath}",
  MODULE_NAME: "${moduleName}",
  MODULE_HOST: "${module_host}",
  MODULE_PORT: "${modulePort}",${shellContent}
  wrapWebpack(webpackConfig) {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig.output.publicPath = '/static/${moduleName}/';
    } else {
      webpackConfig.output.publicPath = 'https://${module_host}:${modulePort}/';
      if (webpackConfig.devServer) {
        console.log(\`
add config in host file：
127.0.0.1  ${module_host}
        \`);

        webpackConfig.devServer.host = "${module_host}";
        webpackConfig.devServer.port = ${modulePort};
      }
    }
    return webpackConfig;
  }
}
${extraContent}
`;
  fs.writeFileSync(configFilePath, configContent, 'utf8');

  logSuccess(`write config file to ${path.join(moduleDir, '.erda/config.js')}`);

  const ignoreFilePath = path.join(moduleDir, '.gitignore');
  const parentIgnoreFilePath = path.resolve(moduleDir, '../.gitignore');
  const targetIgnoreFilePath = fs.existsSync(ignoreFilePath)
    ? ignoreFilePath
    : fs.existsSync(parentIgnoreFilePath)
      ? parentIgnoreFilePath
      : null;
  if (targetIgnoreFilePath) {
    const ignoreFile = fs.readFileSync(targetIgnoreFilePath, { encoding: 'utf8' });
    if (!ignoreFile.includes('/.erda')) {
      fs.writeFileSync(targetIgnoreFilePath, `${ignoreFile }\n/.erda\n*/.erda`, 'utf8');
    }
  } else {
    fs.writeFileSync(ignoreFilePath, '/.erda\n*/.erda', 'utf8');
  }
  logSuccess('add .erda to gitignore');
  logSuccess('now you can use this code:');
  logInfo(`
const config = require('./.erda/config');

module.exports = config.wrapWebpack(yourWebpackConfig);
`);
};
