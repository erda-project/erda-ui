#! /usr/bin/env/ node
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
const { promisify } = require('util');
const path = require('path');
const { invert, remove, words, get } = require('lodash');
const inquirer = require('inquirer');
const ora = require('ora');
const { walker } = require('./util/file-walker');
const { doTranslate } = require('./util/google-translate');
const { logError, logInfo, logSuccess, logWarn } = require('./util/log');

// i18n.d("中文")
const reg = /i18n\.d\(["'](.+?)["']\)/g;
const tempFilePath = path.resolve(process.cwd(), './temp-zh-words.json');
const tempTranslatedWordPath = path.resolve(process.cwd(), './temp-translated-words.json');
if (!fs.existsSync(tempFilePath)) {
  fs.writeFileSync(tempFilePath, JSON.stringify({}, null, 2), 'utf8');
}
if (!fs.existsSync(tempTranslatedWordPath)) {
  fs.writeFileSync(tempTranslatedWordPath, JSON.stringify({}, null, 2), 'utf8');
}

const backupNamespace = 'backup'; // 备用namespace
const specialWords = []; // 保存有重复namespace+翻译组合的词
let workDir = '.';
let ns = null;
let translatedMap = null;
let tempZhMap = null;

/**
 * 已经翻译过的集合
 * {
 *  '中文': 'dpCommon:Chinese'
 * }
 */
const translatedWords = {};
let notTranslatedWords = []; // 未翻译的集合
let zhResource = {};

const findExistWords = (toTransChineseWords) => {
  const _notTranslatedWords = [...toTransChineseWords]; // 当前文件需要被翻译的中文集合
  // 遍历zh.json的各个namespace，查看是否有已经翻译过的中文
  Object.keys(zhResource).forEach(namespaceKey => {
    // 当前namespace下所有翻译
    const namespaceWords = zhResource[namespaceKey];
    // key-value 位置对换 变成 { '中文': 'Chinese' }的形式，如果有重复，后面会覆盖前面
    const invertTranslatedWords = invert(namespaceWords);
    toTransChineseWords.forEach((zhWord) => {
      // 当存在现有翻译且translatedWords还没包含它时，加入已被翻译列表，并从未翻译列表中移除
      if (invertTranslatedWords[zhWord] && !translatedWords[zhWord]) {
        translatedWords[zhWord] = namespaceKey === 'default' ? invertTranslatedWords[zhWord] : `${namespaceKey}:${invertTranslatedWords[zhWord]}`;
        remove(_notTranslatedWords, w => w === zhWord);
      }
    });
  });
  notTranslatedWords = notTranslatedWords.concat(_notTranslatedWords);
};

const extractI18nFromFile = (content, filePath, isEnd, resolve) => {
  // 只处理代码文件
  if (!['.tsx', '.ts', '.js', '.jsx'].includes(path.extname(filePath)) && !isEnd) {
    return;
  }
  let match = reg.exec(content);
  const toTransChineseWords = []; // 扣出当前文件所有被i18n.d包装的中文
  while (match) {
    if (match) {
      const [, zhWord] = match;
      toTransChineseWords.push(zhWord);
    }
    match = reg.exec(content);
  }
  if (!isEnd && toTransChineseWords.length === 0) {
    return;
  }

  // 传入需要被翻译的中文列表，前提是不在notTranslatedWords和translatedWords中出现
  findExistWords(toTransChineseWords.filter(zhWord => !notTranslatedWords.includes(zhWord) && !translatedWords[zhWord]));
  if (isEnd) {
    // 所有文件遍历完毕 notTranslatedWords 按原来的形式写入temp-zh-words
    if (notTranslatedWords.length > 0) {
      const zhMap = {};
      notTranslatedWords.forEach(word => {
        zhMap[word] = '';
      });
      fs.writeFileSync(tempFilePath, JSON.stringify(zhMap, null, 2), 'utf8', (writeErr) => {
        if (writeErr) return logError('写入临时文件temp-zh-words错误', writeErr);
      });
      logSuccess('完成写入临时文件temp-zh-words.json');
    }
    // translatedWords写入temp-translated-words
    if (Object.keys(translatedWords).length > 0) {
      fs.writeFileSync(tempTranslatedWordPath, JSON.stringify(translatedWords, null, 2), 'utf8', (writeErr) => {
        if (writeErr) return logError('写入临时文件temp-translated-words错误', writeErr);
      });
      logSuccess('完成写入临时文件temp-translated-words.json');
    }
    resolve();
  }
};

const restoreSourceFile = (content, filePath, isEnd, resolve) => {
  if (!['.tsx', '.ts', '.js', '.jsx'].includes(path.extname(filePath)) && !isEnd) {
    return;
  }
  let match = reg.exec(content);
  let newContent = content;
  let changed = false;
  while (match) {
    if (match) {
      const [fullMatch, zhWord] = match;
      let replaceText;
      if (tempZhMap[zhWord]) {
        // 如果已经在temp-zh-words.json中找到翻译就替换
        const enWord = tempZhMap[zhWord];
        let i18nContent = ns === 'default' ? `i18n.t('${enWord}')` : `i18n.t('${ns}:${enWord}')`;
        if (specialWords.includes(zhWord)) {
          i18nContent = `i18n.t('${backupNamespace}:${enWord}')`;
        }
        replaceText = i18nContent;
      } else if (translatedMap[zhWord]) {
        // 如果在temp-translated-words.json中找到翻译就替换
        const translatedEnWord = translatedMap[zhWord];
        replaceText = `i18n.t('${translatedEnWord}')`;
      } else {
        logWarn(zhWord, '还没被翻译');
      }
      if (replaceText) {
        newContent = newContent.replace(fullMatch, replaceText);
        changed = true;
      }
    }
    match = reg.exec(content);
  }
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8', (writeErr) => {
      if (writeErr) return logError(`写入文件：${filePath}错误`, writeErr);
    });
  }
  if (isEnd) {
    resolve();
  }
};

/**
 * find folder which name matches folderName under workDir
 * @param {*} folderName
 * @returns
 */
const findMatchFolder = (folderName) => {
  let targetPath = null;
  const loopFolder = (rootPath) => {
    const children = fs.readdirSync(rootPath, { withFileTypes: true });
    if (children.length > 0) {
      children.some(child => {
        const itemName = child.name;
        if (child.isDirectory() && !itemName.includes('node_modules') && !itemName.startsWith('.')) {
          const childPath = path.resolve(rootPath, itemName);
          if (itemName === folderName) {
            targetPath = childPath;
            return true;
          }
          return loopFolder(childPath);
        }
        return false;
      });
    }
  };
  loopFolder(workDir);
  return targetPath;
};

module.exports = async ({ workDir: _workDir }) => {
  try {
    workDir = _workDir;
    if (fs.existsSync(path.resolve(workDir, './.erda/config.js'))) {
      const config = require(path.resolve(workDir, './.erda/config.js'));
      if (!config.MODULE_NAME) {
        logError('请指定.erda/config.js中的MODULE_NAME');
        return;
      }
      ns = config.MODULE_NAME;
    } else {
      logError('请在模块根目录运行（确保.erda/config.js文件存在）或手动传入模块路径');
      return;
    }
    const localePath = findMatchFolder('locales');
    if (!localePath) {
      logError('请确保运行目录下存在locales文件夹（可嵌套）');
      return;
    }
    const zhJsonPath = `${localePath}/zh.json`;
    const enJsonPath = `${localePath}/en.json`;
    if (fs.existsSync(zhJsonPath)) {
      const content = fs.readFileSync(zhJsonPath, 'utf8');
      zhResource = JSON.parse(content);
    } else {
      fs.writeFileSync(zhJsonPath, JSON.stringify({}, null, 2), 'utf8');
    }
    if (!fs.existsSync(enJsonPath)) {
      fs.writeFileSync(enJsonPath, JSON.stringify({}, null, 2), 'utf8');
    }
  
    const extractPromise = new Promise((resolve) => {
      // 第一步，找出需要被翻译的内容， 将内容分配为未翻译和已翻译两部分
      walker({
        root: workDir,
        dealFile: (...args) => {
          extractI18nFromFile.apply(null, [...args, resolve]);
        },
      });
    });
    await extractPromise;
    if (notTranslatedWords.length === 0 && Object.keys(translatedWords).length === 0) {
      logInfo('未发现需要国际化的内容，程序退出');
      process.exit(0);
    }
    if (Object.keys(translatedWords).length > 0) {
      await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: '请仔细检查temp-translated-words.json的已存在翻译是否合适，如果不满意请将内容移入temp-zh-words.json中，没问题或人工修改后按回车继续',
      });
    }
    const tempWords = JSON.parse(fs.readFileSync(tempFilePath, { encoding: 'utf-8' }));
    notTranslatedWords = Object.keys(tempWords);
    // 第二步，调用Google Translate自动翻译
    if (notTranslatedWords.length > 0) {
      const spinner = ora('谷歌自动翻译ing...').start();
      await doTranslate();
      spinner.stop();
      logSuccess('完成谷歌自动翻译');
      // 第三步，人肉检查翻译是否有问题
      await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        // 除了要检查翻译是否正确，还要检查'运行中'和'进行中'两个翻译相同的词不能同时被处理，此问题在之前的方案中也存在
        message: '请仔细检查temp-zh-words.json的自动翻译是否合适且保证翻译没有重复，没问题或人工修改后按回车继续',
      });
    }
    tempZhMap = JSON.parse(fs.readFileSync(tempFilePath, { encoding: 'utf-8' }));
    if (Object.keys(translatedWords).length > 0) {
      translatedMap = JSON.parse(fs.readFileSync(tempTranslatedWordPath, { encoding: 'utf-8' }));
    }
    // 第四步，指定namespace
    if (Object.keys(tempZhMap).length > 0) {
      const { inputNs } = await inquirer.prompt({
        name: 'inputNs',
        type: 'input',
        message: `当前模块默认namespace为${ns}, 如需特殊指定请输入后回车，否则直接回车`,
      });
      if (inputNs) {
        ns = inputNs;
      }
      logInfo('指定namespace为', ns);
      // 第五步，检查自动或人工翻译后，是否有namespace冲突
      // 比如原先在cdp的namespace下有一个中文`进行中`翻译为`running`, 这次也需要加一个词在cdp下叫`运行中`，翻译结果也是`running`
      // 此时就必须将这个running安排到一个单独的空间，否则这个词就会丢失
      Object.keys(tempZhMap).forEach(key => {
        if (get(zhResource, `${ns}.${tempZhMap[key]}`)) {
          if (get(zhResource, `${backupNamespace}.${tempZhMap[key]}`)) {
            // 如果此时又来一个`奔跑中`，那就无法自动处理了，属于极小概率事件，由使用者自行处理
            logError(key, '在目标namespace和备用namespace两个命名空间都有相同翻译了，请手动解决这个问题');
            throw (new Error('duplicate translation'));
          } else {
            logWarn('<', key, '> 有相同的namespace和翻译已存在，自动转入备用namespace');
            specialWords.push(key);
          }
        }
      });
    }
    // 第六步，i18n.t回写源文件
    const generatePromise = new Promise((resolve) => {
      walker({
        root: workDir,
        dealFile: (...args) => {
          restoreSourceFile.apply(null, [...args, resolve]);
        },
      });
    });
    const spinner = ora('替换原文件ing...').start();
    await generatePromise;
    spinner.stop();
    logSuccess('完成替换源文件');
    // 第七步，写入locale文件
    if (Object.keys(tempZhMap).length > 0) {
      const { writeLocale } = require('./util/i18n-extract');
      const localePromise = new Promise((resolve) => {
        if (fs.existsSync(path.resolve(`${workDir}/src`))) {
          writeLocale(resolve, ns, path.resolve(`${workDir}/src`), localePath);
        } else {
          writeLocale(resolve, ns, workDir, localePath);
        }
      });
      const loading = ora('写入local文件ing...').start();
      await localePromise;
      loading.stop();
      logSuccess('完成写入locale文件');
    }
  } finally {
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempTranslatedWordPath);
    logSuccess('完成清除临时文件');
  }
  logInfo('国际化已完成，再见👋');
};
