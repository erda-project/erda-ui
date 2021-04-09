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
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { walker } = require('./util/file-walker');
const { logInfo, logSuccess, logWarn, logError } = require('./util/log');
const licenseTpl = require('../templates/license');


module.exports = async ({ fileType, directory }) => {

  let targetPath = directory;
  if (!targetPath) {
     const answer = await inquirer.prompt([
      {
        type: 'directory',
        name: 'targetPath',
        message: 'Select work directory',
        basePath: process.cwd(),
        default: directory,
      }
    ]);
    targetPath = answer.targetPath;
  }

  let suffixList = fileType.split(',');
  if (!fileType) {
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'suffixList',
        message: 'Which file type do you want to operate?',
        choices: ['js', 'ts', 'jsx', 'tsx', 'scss', 'sass'],
        default: ['js', 'ts', 'jsx', 'tsx'],
      }
    ]);
    suffixList = answer.suffixList;
  }

  const suffixMap = {};
  suffixList.forEach(a => { suffixMap[a.startsWith('.') ? a : `.${a}`] = true; });

  let failCount = 0;
  walker({
    root: targetPath,
    dealFile(content, filePath, isEnd) {
      if (isEnd && failCount > 0) {
        logWarn('Failed count:', failCount);
        process.exit(1);
      }
      if (!suffixMap[path.extname(filePath)] || isEnd) {
        return;
      }
      if (!content.includes('// Copyright (c) 2021 Terminus, Inc.')) {
        logWarn('License not exist:', filePath);
        failCount++;
      } else {
        logSuccess('License check ok:', filePath);
      }
    }
  });

}
