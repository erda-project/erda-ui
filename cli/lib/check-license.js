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
