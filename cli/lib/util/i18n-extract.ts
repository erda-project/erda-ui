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

import vfs from 'vinyl-fs';
import path from 'path';
import fs from 'fs';
import { merge, differenceWith, isEqual, unset } from 'lodash';
import { logError } from './log';

interface Resource {
  [k: string]: { [k: string]: string };
}

const scanner = require('i18next-scanner');
const flattenObjectKeys = require('i18next-scanner/lib/flatten-object-keys').default;
const omitEmptyObject = require('i18next-scanner/lib/omit-empty-object').default;

let zhWordMap = {};
let localePath: null | string = null;
let ns: string[] = [];
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

function sortObject(unordered: Resource | { [k: string]: string }) {
  const ordered: Resource | { [k: string]: string } = {};
  Object.keys(unordered)
    .sort()
    .forEach((key) => {
      if (typeof unordered[key] === 'object') {
        (ordered as Resource)[key] = sortObject(unordered[key] as { [k: string]: string }) as { [k: string]: string };
      } else {
        ordered[key] = unordered[key];
      }
    });
  return ordered;
}

function customFlush(done: () => void) {
  const enToZhWords: { [k: string]: string } = zhWordMap;
  // @ts-ignore api
  const { resStore } = this.parser;
  // @ts-ignore api
  const { resource, removeUnusedKeys, sort, defaultValue } = this.parser.options;

  Object.keys(resStore).forEach((lng) => {
    const namespaces = resStore[lng];
    // The untranslated English value and key are consistent
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

    // Remove obsolete keys
    if (removeUnusedKeys) {
      const namespaceKeys = flattenObjectKeys(namespaces);
      const oldContentKeys = flattenObjectKeys(oldContent);
      const unusedKeys = differenceWith(oldContentKeys, namespaceKeys, isEqual);

      for (let i = 0; i < unusedKeys.length; ++i) {
        unset(oldContent, unusedKeys[i]);
      }

      oldContent = omitEmptyObject(oldContent);
    }

    // combine old content
    let output = merge(namespaces, oldContent);
    if (sort) {
      output = sortObject(output);
    }

    // substitution zh locale
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

export default (
  resolve: (value: void | PromiseLike<void>) => void,
  srcDir: string,
  _localePath: string,
  switchNs?: boolean,
) => {
  const paths = [`${srcDir}/**/*.{js,jsx,ts,tsx}`, '!**/node_modules/**'];
  if (srcDir.endsWith('shell')) {
    paths.push(`!${srcDir}/snippets/*.{js,jsx,ts,tsx}`);
  }
  localePath = _localePath;
  if (!switchNs) {
    zhWordMap = require(path.resolve(process.cwd(), './temp-zh-words.json'));
  }
  const zhJsonPath = `${localePath}/zh.json`;
  const enJsonPath = `${localePath}/en.json`;
  let content = fs.readFileSync(zhJsonPath, 'utf8');
  originalZhJson = JSON.parse(content);
  content = fs.readFileSync(enJsonPath, 'utf8');
  originalEnJson = JSON.parse(content);

  ns = Object.keys(originalZhJson);

  vfs
    .src(paths)
    .pipe(scanner(options(), undefined, customFlush))
    .pipe(vfs.dest('./'))
    .on('end', () => {
      resolve && resolve();
    });
};
