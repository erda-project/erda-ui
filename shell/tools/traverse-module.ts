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

/* eslint-disable no-console */
/* eslint-disable no-bitwise */
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import fs from 'fs';
import { resolve, dirname, join, extname } from 'path';
import chalk from 'chalk';
// import postcss from 'postcss';
// const postcssScss = require('postcss-scss');

const JS_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.d.ts'];
const CSS_EXTS = ['.css', '.scss'];
const JSON_EXTS = ['.json'];

let requirePathResolver: (curDir: string, requirePath: string) => string;

const MODULE_TYPES = {
  JS: 1 << 0,
  CSS: 1 << 1,
  JSON: 1 << 2,
};

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (e) {
    return false;
  }
}

const visitedModules = new Set<string>();

function moduleResolver(curModulePath: string, requirePath: string) {
  let checkingFile = requirePath;
  if (typeof requirePathResolver === 'function') {
    const res = requirePathResolver(dirname(curModulePath), checkingFile);
    if (typeof res === 'string') {
      checkingFile = res;
    }
  }

  // 过滤掉第三方模块
  if (checkingFile.includes('node_modules')) {
    return '';
  }

  checkingFile = resolve(dirname(curModulePath), checkingFile);
  checkingFile = completeModulePath(checkingFile);

  if (visitedModules.has(checkingFile)) {
    return '';
  } else {
    visitedModules.add(checkingFile);
  }
  return checkingFile;
}

function completeModulePath(modulePath) {
  const EXTS = [...JSON_EXTS, ...JS_EXTS];
  if (modulePath.match(/\.[a-zA-Z]+$/)) {
    return modulePath;
  }

  function tryCompletePath(resolvePath) {
    for (let i = 0; i < EXTS.length; i++) {
      const tryPath = resolvePath(EXTS[i]);
      if (fs.existsSync(tryPath)) {
        return tryPath;
      }
    }
  }

  function reportModuleNotFoundError(errorPath: string) {
    console.log(chalk.red(`module not found: ${errorPath}`));
  }

  if (isDirectory(modulePath)) {
    const tryModulePath = tryCompletePath((ext: string) => join(modulePath, `index${ext}`));
    if (!tryModulePath) {
      reportModuleNotFoundError(modulePath);
    } else {
      return tryModulePath;
    }
  } else if (!EXTS.some((ext) => modulePath.endsWith(ext))) {
    const tryModulePath = tryCompletePath((ext: string) => `${modulePath}${ext}`);
    if (!tryModulePath) {
      reportModuleNotFoundError(modulePath);
    } else {
      return tryModulePath;
    }
  }
  return modulePath;
}

const resolveBabelSyntaxPlugins = (modulePath: string) => {
  const plugins = [];
  if (['.tsx', '.jsx'].some((ext) => modulePath.endsWith(ext))) {
    plugins.push('jsx');
  }
  if (['.ts', '.tsx'].some((ext) => modulePath.endsWith(ext))) {
    plugins.push('typescript');
  }
  return plugins;
};

// const resolvePostcssSyntaxPlugin = (modulePath: string) => {
//   if (modulePath.endsWith('.scss')) {
//     return postcssScss;
//   }
// }

function getModuleType(modulePath: string) {
  const moduleExt = extname(modulePath);
  if (JS_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.JS;
  } else if (CSS_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.CSS;
  } else if (JSON_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.JSON;
  }
}

// function traverseCssModule(curModulePath, callback) {
//   const moduleFileContent = fs.readFileSync(curModulePath, {
//     encoding: 'utf-8',
//   });

//   const ast = postcss.parse(moduleFileContent, {
//     Syntax: resolvePostcssSyntaxPlugin(curModulePath),
//   });
//   ast.walkAtRules('import', (rule) => {
//     const subModulePath = moduleResolver(curModulePath, rule.params.replace(/['"]/g, ''));
//     if (!subModulePath) {
//       return;
//     }
//     callback(subModulePath);
//     traverseModule(subModulePath, callback);
//   });
//   ast.walkDecls((decl) => {
//     if (decl.value.includes('url(')) {
//       const url = /.*url\((.+)\).*/.exec(decl.value)[1].replace(/['"]/g, '');
//       const subModulePath = moduleResolver(curModulePath, url);
//       if (!subModulePath) {
//         return;
//       }
//       callback(subModulePath);
//     }
//   });
// }

function traverseJsModule(curModulePath: string, callback: (str: string) => void) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  });

  const ast = parser.parse(moduleFileContent, {
    sourceType: 'unambiguous',
    plugins: resolveBabelSyntaxPlugins(curModulePath),
  });

  traverse(ast, {
    ImportDeclaration(path) {
      const node = path.get('source.value');
      const subModulePath = moduleResolver(curModulePath, Array.isArray(node) ? '' : node.node.toString());
      if (!subModulePath) {
        return;
      }
      callback(subModulePath);
      traverseModule(subModulePath, callback);
    },
    CallExpression(path) {
      if (path.get('callee').toString() === 'require') {
        const subModulePath = moduleResolver(curModulePath, path.get('arguments.0').toString().replace(/['"]/g, ''));
        if (!subModulePath) {
          return;
        }
        callback(subModulePath);
        traverseModule(subModulePath, callback);
      }
      if (path.get('callee').type === 'Import') {
        try {
          const importItem = path.get('arguments.0').toString().replace(/['"]/g, '');
          if (importItem && !importItem.includes('`')) {
            const subModulePath = moduleResolver(curModulePath, importItem);
            if (!subModulePath) {
              return;
            }
            callback(subModulePath);
            traverseModule(subModulePath, callback);
          }
        } catch (error) {
          console.log('parse import error', error);
        }
      }
    },
    ExportNamedDeclaration(path) {
      if (path.get('source')) {
        try {
          const node = path.get('source.value');
          const subModulePath = moduleResolver(
            curModulePath,
            Array.isArray(node) ? '' : node.node.toString().replace(/['"]/g, ''),
          );
          if (!subModulePath) {
            return;
          }
          callback(subModulePath);
          traverseModule(subModulePath, callback);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }
    },
  });
}

export const traverseModule = (curModulePath: string, callback: (str: string) => void) => {
  const modulePath = completeModulePath(curModulePath);
  const moduleType = getModuleType(modulePath);

  if (moduleType & MODULE_TYPES.JS) {
    traverseJsModule(modulePath, callback);
  }
};

export const setRequirePathResolver = (resolver: (curDir: string, requirePath: string) => string) => {
  requirePathResolver = resolver;
};
