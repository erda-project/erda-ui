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
const dotenv = require('dotenv');
const chalk = require('chalk');

const log = (...msg) => console.log(chalk.blue(`[Scheduler] ${msg}`));
const logWarn = (...msg) => console.log(chalk.yellow(`[Scheduler] ${msg}`));

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const getEnv = () => {
  const erdaRoot = path.resolve(__dirname, '../..');
  const publicDir = `${erdaRoot}/public`;
  const staticDir = `${erdaRoot}/public/static`;
  [publicDir, staticDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
  const { parsed: envConfig } = dotenv.config({ path: `${erdaRoot}/.env` });
  if (!envConfig) {
    throw Error('cannot find .env file in erda-ui root directory');
  }
  return {
    erdaRoot,
    staticDir,
    envConfig,
  };
};

module.exports = {
  log,
  logWarn,
  getDirectories,
  getEnv,
};
