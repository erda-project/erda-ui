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


module.exports = async ({ fileType }) => {

  const { isClean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isClean',
      message: 'Before this action, Please ensure your workspace is clean',
      default: false,
    },
  ]);
  if (!isClean) {
    logInfo('Nothing changed, exit');
    process.exit();
  }

  const { targetPath } = await inquirer.prompt([
    {
      type: 'directory',
      name: 'targetPath',
      message: 'Select work directory',
      basePath: process.cwd(),
    }
  ]);

  const { licenseType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'licenseType',
      message: 'Which license type do you want to add?',
      choices: ['GPLV3', 'Apache2'],
      default: 'GPLV3',
    }
  ]);

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

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Confirm your choices?
License: ${chalk.greenBright(licenseType)}
FileType: ${chalk.greenBright(suffixList)}
Directory: ${chalk.greenBright(targetPath)}
`,
      default: true,
    },
  ]);
  if (!confirm) {
    logInfo('Nothing changed, exit');
    process.exit();
  }

  walker({
    root: targetPath,
    dealFile(content, filePath, isEnd) {
      if (!suffixMap[path.extname(filePath)] || isEnd) {
        return;
      }
      if (!content.includes('// Copyright (c) 2021 Terminus, Inc.')) {
        const header = licenseTpl[licenseType];
        content = header + content;
        fs.writeFile(filePath, content, { encoding: 'utf8' }, (err) => {
          if (err) {
            logError('Write license to file failed:', filePath)
          } else {
          }
        })
        logSuccess('Write license to file:', filePath);
      } else {
        logSuccess('File license check ok:', filePath);
      }
    },
  })
}
