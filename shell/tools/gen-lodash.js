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

// match:
// import { aa, bb } from 'lodash'
// import aa from 'lodash/aa';
const reg = /.*import {?([a-z, A-Z]+)}? from ['"]lodash(\/\w+)?['"].*/g;

let fileContent = `
import stringToPath from 'lodash/_stringToPath';
`;

const keys = new Set(['stringToPath']);

const dealFile = (content, filePath, isEnd) => {
  let match = reg.exec(content);
  let matchCount = 0;
  const keysInOneFile = new Set();
  let matchInput = null;
  let newContent = content;
  while (match) {
    if (match) {
      // 跳过注释掉的
      if (match[0].indexOf('//') >= 0 && match[0].indexOf('//') < match[0].indexOf('import')) {
        match = reg.exec(content);
        // eslint-disable-next-line no-continue
        continue;
      }
      // import { importPart } from 'lodash/fromPart';
      const [full, importPart, fromPart] = match;
      // lodash/aa 形式的, 跳过fp
      if (fromPart && fromPart !== '/fp') {
        matchCount += 1;
        const name = fromPart.slice(1);
        if (name.startsWith('_')) {
          console.warn(`发现私有前缀 ${name} 于文件：`, filePath);
          match = reg.exec(content);
          // eslint-disable-next-line no-continue
          continue;
        }
        keysInOneFile.add(name);
        // 第一个保留，作为替换标记，后面的直接移除该行
        if (matchCount < 2) {
          matchInput = full;
        } else {
          newContent = newContent.replace(`\n${full}`, '');
        }
      }
      keys.add(...importPart.split(',').map((item) => item.trim()));
    }
    match = reg.exec(content);
  }
  // 合并多行的import为单行的
  if (keysInOneFile.size) {
    let str = '';
    keysInOneFile.forEach((k) => {
      str += `${k}, `;
    });
    const result = newContent.replace(matchInput, `import { ${str.slice(0, -2)} } from 'lodash';`);
    fs.writeFile(filePath, result, 'utf8', (writeErr) => {
      if (writeErr) return console.error(`写入文件：${filePath}错误`, writeErr);
    });
  }
  if (isEnd) {
    let str = '';
    keys.forEach((k) => {
      str += `
  ${k},`;
    });
    fileContent += `
export {${str}
} from 'lodash';
`;
    fs.writeFile(path.resolve(__dirname, '../app/external/custom-lodash.js'), fileContent, 'utf8', (writeErr) => {
      if (writeErr) return console.error('写入lodash文件错误', writeErr);
    });
  }
};

walker({
  root: path.resolve(__dirname, '../app'),
  dealFile,
});
