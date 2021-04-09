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
const agent = require('superagent');
const path = require('path');
const {
  publicDir,
} = require('./util/env');

const downloadFile = (url, savePath) => {
  return agent.get(`https:${url}`).then(res => {
    let data = '';
    if (res.request.url.match(/\.js$/)) {
      // 请求iconfont js 返回的对象中text为undefined，取body;
      data = res.body.toString('utf8');
    } else {
      data = res.text
    }
    if (res.status === 200 && (data.startsWith('@font-face') || data.includes('<symbol'))) {
      fs.writeFile(savePath, data, (e) => {
        if (e) {
          console.log('写入iconfont文件失败！', e);
        }
      });
    } else {
      throw new Error(`Got error when downloading ${url}`);
    }
  });
};

module.exports = () => {
  const htmlPath = path.resolve(publicDir, `./static/shell/index.html`);
  fs.readFile(htmlPath, 'utf8', (err, content) => {
    if (err) console.error('read index.html failed');
    const iconfontRegex = /\/\/at.alicdn.com\/t\/(([^.]+)\.(css|js))/g;
    let matchedIconfontFile = iconfontRegex.exec(content);
    let replacedContent = content;
    while (matchedIconfontFile) {
      const iconfontFilePath = matchedIconfontFile[0];
      console.log('匹配到iconfont文件', iconfontFilePath);
      downloadFile(iconfontFilePath, path.resolve(publicDir, `./static/${matchedIconfontFile[1]}`));
      replacedContent = replacedContent.replace(iconfontFilePath, `/static/${matchedIconfontFile[1]}`);
      matchedIconfontFile = iconfontRegex.exec(replacedContent);
    }

    fs.writeFile(htmlPath, replacedContent, (e) => {
      if (e) {
        console.log('覆盖index.html失败！', e);
      } else {
        console.log('覆盖index.html完成');
      }
    });
  });
};
