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
const fs = require('fs');
const child_process = require('child_process');
const mkdirp = require('mkdirp');
const { logInfo, logSuccess, logWarn, logError } = require('./util/log');

const { execSync } = child_process;

module.exports = async (moduleName, options) => {
  const moduleDir = process.cwd();
  
  const configPath = path.resolve(moduleDir, '.erda/config.js');
  
  if (!configPath) {
    logError(`.erda/config.js file not exist, please execute "erda setup ${moduleName} <port> to generate this file`);
    process.exit(1);
  }

  const moduleConfig = require(configPath);

  const distPath = path.resolve(moduleDir, options.dist_path);

  if (!fs.existsSync(distPath)) {
    logError(`Dist directory not exist:`, distPath);
    process.exit(1);
  }

  const erda_ui_path = moduleConfig.ERDA_UI_DIR;
  if (!fs.existsSync(erda_ui_path)) {
    logError(`Erda UI root path not exist:`, erda_ui_path);
    process.exit(1);
  }

  const targetPath = `${erda_ui_path}/public/static/${moduleName}/`;

  if (!fs.existsSync(targetPath)) {
    await mkdirp(targetPath);
  }
  const copyCommand = `rm -rf ${targetPath} && cp -rf ${distPath} ${targetPath}`;
  logInfo(`execute: ${copyCommand}`)
  execSync(copyCommand)
  logSuccess(`copy dist files to: ${targetPath}`);
}