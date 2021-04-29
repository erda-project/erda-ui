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

const scanner = require('i18next-scanner');
const vfs = require('vinyl-fs');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const flattenObjectKeys = require('i18next-scanner/lib/flatten-object-keys')
  .default;
const omitEmptyObject = require('i18next-scanner/lib/omit-empty-object')
  .default;
const { logError } = require('./log');

let zhWordMap = {};
let localePath = null;
let ns = [];
let originalZhJson = {};
let originalEnJson = {};

// See options at https://github.com/i18next/i18next-scanner#options
const options = () => ({
  removeUnusedKeys: true,
  sort: true,
  func: {
    list: ['i18n.t'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  lngs: ['en', 'zh'],
  defaultLng: 'en',
  defaultNs: ns.includes('default') ? 'default' : ns[0] || 'default',
  defaultValue: '__NOT_TRANSLATED__',
  resource: {
    // loadPath: 'i18n/{{lng}}.json', // 合并模式下不要设置，否则文件内容会嵌套
    savePath: `${localePath}/{{lng}}.json`,
    jsonIndent: 2,
    lineEnding: '\n',
  },
  ns,
  nsSeparator: ':', // namespace separator
  keySeparator: false, // if working with a flat json, it's recommended to set keySeparator to false
  interpolation: {
    prefix: '{{',
    suffix: '}}',
  },
});

function revertObjectKV(obj) {
  const result = {};
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((k) => {
      if (typeof obj[k] === 'string') {
        result[obj[k]] = k;
      }
    });
  }
  return result;
}

function sortObject(unordered) {
  const ordered = {};
  Object.keys(unordered).sort().forEach((key) => {
    ordered[key] = typeof unordered[key] === 'object' ? sortObject(unordered[key]) : unordered[key];
  });
  return ordered;
}

function customFlush(done) {
  const enToZhWords = revertObjectKV(zhWordMap);
  const { resStore } = this.parser;
  const { resource, removeUnusedKeys, sort, defaultValue } = this.parser.options;

  Object.keys(resStore).forEach((lng) => {
    const namespaces = resStore[lng];
    // 未翻译的英文的value和key保持一致
    if (lng === 'en') {
      Object.keys(namespaces).forEach((_ns) => {
        const obj = namespaces[_ns];
        Object.keys(obj).forEach((k) => {
          if (obj[k] === defaultValue) {
            obj[k] = k.replace('&#58;', ':');
          }
        });
      });
    }

    const filePath = resource.savePath.replace('{{lng}}', lng);
    let oldContent = lng === 'zh' ? originalZhJson : originalEnJson;

    // 移除废弃的key
    if (removeUnusedKeys) {
      const namespaceKeys = flattenObjectKeys(namespaces);
      const oldContentKeys = flattenObjectKeys(oldContent);
      const unusedKeys = _.differenceWith(
        oldContentKeys,
        namespaceKeys,
        _.isEqual,
      );

      for (let i = 0; i < unusedKeys.length; ++i) {
        _.unset(oldContent, unusedKeys[i]);
      }

      oldContent = omitEmptyObject(oldContent);
    }

    // 合并旧的内容
    let output = _.merge(namespaces, oldContent);
    if (sort) {
      output = sortObject(output);
    }

    // 已有翻译就替换
    if (lng === 'zh') {
      Object.keys(output).forEach((_ns) => {
        const obj = output[_ns];
        Object.keys(obj).forEach((k) => {
          if (obj[k] === defaultValue) {
            const zh = enToZhWords[k] || enToZhWords[`${_ns}:${k}`];
            if (zh) {
              obj[k] = zh;
            } else {
              logError(`zh.json中存在未被翻译的内容${k}，请手动处理`);
            }
          }
        });
      });
    }

    fs.writeFile(filePath, JSON.stringify(output, null, resource.jsonIndent), 'utf8', (writeErr) => {
      if (writeErr) return logError(`写入locale:${lng} 文件错误`, writeErr);
    });
  });

  done();
}

module.exports = {
  writeLocale: (resolve, _ns, srcDir, _localePath) => {
    const paths = [`${srcDir}/**/*.{js,jsx,ts,tsx}`, '!node_modules/**/*', '!**/node_modules/**', '!**/node_modules'];
    localePath = _localePath;
    zhWordMap = require(path.resolve(process.cwd(), './temp-zh-words.json'));
    const zhJsonPath = `${localePath}/zh.json`;
    const enJsonPath = `${localePath}/en.json`;
    let content = fs.readFileSync(zhJsonPath, 'utf8');
    originalZhJson = JSON.parse(content);
    content = fs.readFileSync(enJsonPath, 'utf8');
    originalEnJson = JSON.parse(content);

    const namespaces = Object.keys(originalZhJson);
    if (!namespaces.includes(_ns)) {
      namespaces.push(_ns);
    }
    ns = namespaces;

    vfs.src(paths)
      .pipe(scanner(options(), undefined, customFlush))
      .pipe(vfs.dest('./')).on('end', () => {
        resolve && resolve();
      });
  },
};

