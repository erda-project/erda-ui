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

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const nodePath = require('path');
const fs = require('fs');

const isProdEnv = process.env.NODE_ENV === 'production';
const EMPTY = 'EMPTY';
const LOCALE_DIR = './locales';
const TMP_DIR = './tmp';
let prefixPath = [];
let changedMap = {};
let noPrefixMap = {};
let hasChanged = false;

const changeValue = (target, props) => {
  const prefix = prefixPath.join('.');

  /* eslint-disable-next-line */
  props.forEach((p) => {
    const key = target[p].slice(1);
    changedMap[key] = EMPTY;
    target[p] = prefix + key;
  });
};

/* eslint-disable-next-line */
exports.default = function ({ types }) {
  const plugin = {
    name: 'locale-babel',
    pre(file) {
      const { sourceFileName } = file.opts;
      const currentFile = sourceFileName.slice(4); // 'app/'.length === 4
      const { dir, name } = nodePath.parse(currentFile);

      const [module, subDir, compontent] = dir.split(nodePath.sep);
      prefixPath = [];
      changedMap = {};
      noPrefixMap = {};

      if (module) {
        prefixPath.push(module);
        switch (subDir) {
          case 'common':
            prefixPath.push('common');
            break;
          case 'pages':
            if (compontent) {
              prefixPath.push(compontent);
            }
            break;
          case undefined:
            if (name === 'index') {
              prefixPath.push('route');
            }
            break;
          default:
            prefixPath.push(name);
            break;
        }
        prefixPath.push('');
      }
    },

    visitor: {
      CallExpression(path) {
        const { callee, arguments: args } = path.node;
        if (callee.name === '$get') {
          if (path.node._visited) {
            return;
          }
          path.node._visited = true;
          hasChanged = true;
          const firstArg = args[0];
          let targetObj = null;
          let value = '';
          const preChangedAttrs = [];
          if (types.isIdentifier(firstArg)) {
            const variable = path.scope.getBinding(firstArg.name);
            if (variable) {
              targetObj = variable.path.node.init;
              if (types.isStringLiteral(targetObj)) {
                value = targetObj.value;
                preChangedAttrs.push('value');
              } else {
                console.log(
                  `???????????????????????????????????????????????????????????????locale?????????????????????${this.file.opts.sourceFileName} ??????????????? ${firstArg.name}`,
                );
              }
            }
          } else if (types.isTemplateLiteral(firstArg)) {
            targetObj = firstArg.quasis[0].value;
            value = targetObj.cooked;
            preChangedAttrs.push('raw', 'cooked');
          } else if (types.isStringLiteral(firstArg)) {
            targetObj = firstArg;
            value = targetObj.value;
            preChangedAttrs.push('value');
            // if (value[0] === '@') {
            //   changeValue(targetObj.extra, ['raw', 'rawValue']);
            // }
          }
          if (value[0] === '@') {
            changeValue(targetObj, preChangedAttrs);
          } else {
            noPrefixMap[types.isIdentifier(firstArg) ? firstArg.name : value] = EMPTY;
          }
        }
      },
    },
  };

  // TODO:
  // ???????????????????????????locale??????????????????????????????????????????????????????key??????????????????????????????????????????
  // ?????????tmp????????????????????????key??????????????????????????????????????????????????????
  // if (!isProdEnv) {
  //   if (!fs.existsSync(TMP_DIR)) {
  //     fs.mkdirSync(TMP_DIR);
  //   }
  //   plugin.post = function post() {
  //     if (hasChanged) {
  //       fs.readdir(LOCALE_DIR, (err, files) => {
  //         if (err) return console.error('read dir error: ', err);
  //         files.forEach((file) => {
  //           if (file.match(/\.json$/)) {
  //             const fileName = `${LOCALE_DIR}/${file}`;
  //             fs.readFile(fileName, (error, data) => {
  //               if (err) return console.error('read file error: ', error);
  //               let fullMap = {};
  //               try {
  //                 fullMap = JSON.parse(data);
  //               } catch (parseError) {
  //                 return console.error('parse json error: ', parseError);
  //               }
  //               const [module, subDir] = prefixPath;
  //               const subMap = fullMap[module][subDir] || {};
  //               fullMap[module][subDir] = Object.keys(changedMap).reduce((map, k) => { map[k] = subMap[k] || EMPTY; return map; }, {});
  //               const newFullMap = { ...noPrefixMap, ...fullMap };
  //               const saveFileName = `${TMP_DIR}/${file}`;
  //               fs.writeFile(saveFileName, JSON.stringify(newFullMap, null, 2), (writeErr) => {
  //                 if (err) return console.error('write file error: ', writeErr);
  //                 console.log(`file '${saveFileName}' has been saved!`);
  //               });
  //             });
  //           }
  //         });
  //       });
  //       hasChanged = false;
  //     }
  //   };
  // }

  return plugin;
};
