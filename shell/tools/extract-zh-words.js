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
const { walker } = require('./file-walker');

// should match:
// i18n.d("中文")
const reg = /i18n\.d\(["'](.+?)["']\)/g;
const tempFilePath = path.resolve(__dirname, './temp-zh-words.json');


const zhMap = fs.existsSync(tempFilePath) ? require('./temp-zh-words.json') : {};

const dealFile = (content, filePath, isEnd) => {
  let match = reg.exec(content);
  let newContent = content;
  let changed = false;
  while (match) {
    if (match) {
      const [fullMatch, zhWord] = match;
      // 如果翻译了，替换原处为英文
      if (zhMap[zhWord]) {
        const replaceText = `i18n.t('${zhMap[zhWord]}')`;
        newContent = newContent.replace(fullMatch, replaceText);
        changed = true;
      } else {
        zhMap[zhWord] = '';
      }
    }
    match = reg.exec(content);
  }

  if (changed) {
    fs.writeFile(filePath, newContent, 'utf8', (writeErr) => {
      if (writeErr) return console.error(`写入文件：${filePath}错误`, writeErr);
    });
  }
  if (isEnd) {
    const fileContent = JSON.stringify(zhMap, null, 2);

    fs.writeFile(tempFilePath, fileContent, 'utf8', (writeErr) => {
      if (writeErr) return console.error('写入临时文件temp-zh-words错误', writeErr);
    });
  }
};


walker({
  root: path.resolve(__dirname, '../app'),
  dealFile,
});

