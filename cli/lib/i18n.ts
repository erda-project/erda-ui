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

import fs from 'fs';
import path from 'path';
import { remove } from 'lodash';
import inquirer from 'inquirer';
import ora from 'ora';
import { walker } from './util/file-walker';
import { doTranslate } from './util/google-translate';
import { logError, logInfo, logSuccess, logWarn } from './util/log';
import writeLocale from './util/i18n-extract';
import { exit } from 'process';
import { getCwdModuleName } from './util/env';

const i18nDRegex = /i18n\.d\(["'](.+?)["']\)/g;
const tempFilePath = path.resolve(process.cwd(), './temp-zh-words.json');
const tempTranslatedWordPath = path.resolve(process.cwd(), './temp-translated-words.json');

let workDir = '.';
let ns = 'default';
let translatedMap: null | { [k: string]: string } = null;
let tempZhMap: null | { [k: string]: string } = null;

const translatedWords: { [k: string]: string } = {};
let untranslatedWords: string[] = []; // Untranslated collection
let zhResource: { [k: string]: { [k: string]: string } } = {};

/**
 * filter the pending translation list to translated list & un-translated list
 * @param toTranslateEnWords string array that need to translate which extract from raw source code
 */
const findExistWords = (toTranslateEnWords: string[]) => {
  const _notTranslatedWords = [...toTranslateEnWords]; // The English collection of the current document that needs to be translated
  // Traverse namespaces of zh.json to see if there is any English that has been translated
  Object.keys(zhResource).forEach((namespaceKey) => {
    // All translations in the current namespace
    const namespaceWords = zhResource[namespaceKey];
    toTranslateEnWords.forEach((enWord) => {
      // When there is an existing translation and translatedWords does not contains it, add it to the translated list and remove it from the untranslated list
      if (namespaceWords[enWord] && !translatedWords[enWord]) {
        translatedWords[enWord] =
          namespaceKey === 'default' ? namespaceWords[enWord] : `${namespaceKey}:${namespaceWords[enWord]}`;
        remove(_notTranslatedWords, (w) => w === enWord);
      }
    });
  });
  untranslatedWords = untranslatedWords.concat(_notTranslatedWords);
};

const extractI18nFromFile = (
  content: string,
  filePath: string,
  isEnd: boolean,
  resolve: (value: void | PromiseLike<void>) => void,
) => {
  // Only process code files
  if (!['.tsx', '.ts', '.js', '.jsx'].includes(path.extname(filePath)) && !isEnd) {
    return;
  }
  let match = i18nDRegex.exec(content);
  const toTransEnglishWords = []; // Cut out all the English that are packaged by i18n.d in the current file
  while (match) {
    if (match) {
      toTransEnglishWords.push(match[1]);
    }
    match = i18nDRegex.exec(content);
  }
  if (!isEnd && toTransEnglishWords.length === 0) {
    return;
  }

  // English list that needs to be translated, mark sure it does not appear in notTranslatedWords and translatedWords
  findExistWords(
    toTransEnglishWords.filter((enWord) => !untranslatedWords.includes(enWord) && !translatedWords[enWord]),
  );
  if (isEnd) {
    // After all files are traversed, notTranslatedWords is written to temp-zh-words in its original format
    if (untranslatedWords.length > 0) {
      const enMap: { [k: string]: string } = {};
      untranslatedWords.forEach((word) => {
        enMap[word] = '';
      });
      fs.writeFileSync(tempFilePath, JSON.stringify(enMap, null, 2), 'utf8');
      logSuccess('Finish writing to the temporary file [temp-zh-words.json]');
    }
    // translatedWords write to [temp-translated-words.json]
    if (Object.keys(translatedWords).length > 0) {
      fs.writeFileSync(tempTranslatedWordPath, JSON.stringify(translatedWords, null, 2), 'utf8');
      logSuccess('Finish writing to the temporary file [temp-translated-words.json]');
    }
    resolve();
  }
};

/**
 * restore raw file i18n.d => i18n.t with namespace
 * @param content raw file content
 * @param filePath file path with extension
 * @param isEnd is traverse done
 * @param resolve resolver of promise
 */
const restoreSourceFile = (
  content: string,
  filePath: string,
  isEnd: boolean,
  resolve: (value: void | PromiseLike<void>) => void,
) => {
  if (!['.tsx', '.ts', '.js', '.jsx'].includes(path.extname(filePath)) && !isEnd) {
    return;
  }
  let match = i18nDRegex.exec(content);
  let newContent = content;
  let changed = false;
  while (match) {
    if (match) {
      const [fullMatch, enWord] = match;
      let replaceText;
      if (tempZhMap?.[enWord]) {
        // Replace if found the translation in [temp-zh-words.json]
        const i18nContent = ns === 'default' ? `i18n.t('${enWord}')` : `i18n.t('${ns}:${enWord}')`;
        replaceText = i18nContent;
      } else if (translatedMap?.[enWord]) {
        // Replace if find the translation in [temp-translated-words.json]
        const nsArray = translatedMap?.[enWord].split(':');
        replaceText = nsArray.length === 2 ? `i18n.t('${nsArray[0]}:${enWord}')` : `i18n.t('${enWord}')`;
      } else {
        logWarn(enWord, 'not yet translated');
      }
      if (replaceText) {
        newContent = newContent.replace(fullMatch, replaceText);
        changed = true;
      }
    }
    match = i18nDRegex.exec(content);
  }
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
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
const findMatchFolder = (folderName: string): string | null => {
  let targetPath: null | string = null;
  const loopFolder = (rootPath: string) => {
    const children = fs.readdirSync(rootPath, { withFileTypes: true });
    if (children.length > 0) {
      children.some((child) => {
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

/**
 * create temp files and check whether exists locale files
 */
const prepareEnv = (localePath?: string) => {
  if (!localePath) {
    logError('Please make sure that the [locales] folder exists in the running directory (can be nested)');
    exit(1);
  }
  if (!fs.existsSync(tempFilePath)) {
    fs.writeFileSync(tempFilePath, JSON.stringify({}, null, 2), 'utf8');
  }
  if (!fs.existsSync(tempTranslatedWordPath)) {
    fs.writeFileSync(tempTranslatedWordPath, JSON.stringify({}, null, 2), 'utf8');
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
};

export default async ({ workDir: _workDir }: { workDir: string }) => {
  try {
    workDir = _workDir || process.cwd();
    ns = getCwdModuleName({ currentPath: workDir });
    const localePath = findMatchFolder('locales');

    prepareEnv();
    // extract all i18n.d
    const extractPromise = new Promise<void>((resolve) => {
      // first step is to find out the content that needs to be translated, and assign the content to two parts: untranslated and translated
      walker({
        root: workDir,
        dealFile: (...args) => {
          extractI18nFromFile.apply(null, [...args, resolve]);
        },
      });
    });
    await extractPromise;

    if (untranslatedWords.length === 0 && Object.keys(translatedWords).length === 0) {
      logInfo('No content needs to be translated is found, program exits'); // TODO sort
      process.exit(0);
    }

    if (Object.keys(translatedWords).length > 0) {
      await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message:
          'Please carefully check whether the existing translation of [temp-translated-words.json] is suitable, if you are not satisfied, please move the content into [temp-zh-words.json], no problem or after manual modification press enter to continue',
      });
    }

    const tempWords = JSON.parse(fs.readFileSync(tempFilePath, { encoding: 'utf-8' }));
    const _untranslatedWords = Object.keys(tempWords);
    // The second step is to call Google Translate to automatically translate
    if (_untranslatedWords.length > 0) {
      const spinner = ora('Google automatic translating...').start();
      await doTranslate();
      spinner.stop();
      logSuccess('Google automatic translation completed');
      // The third step, manually checks whether there is a problem with the translation
      await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message:
          'Please double check whether the automatic translation of [temp-zh-words.json} is suitable, no problem or after manual modification then press enter to continue',
      });
    }

    tempZhMap = JSON.parse(fs.readFileSync(tempFilePath, { encoding: 'utf-8' }));
    if (Object.keys(translatedWords).length > 0) {
      translatedMap = JSON.parse(fs.readFileSync(tempTranslatedWordPath, { encoding: 'utf-8' }));
    }
    let _ns = ns;
    // The fourth step is to specify the namespace
    if (tempZhMap && Object.keys(tempZhMap).length > 0) {
      const { inputNs } = await inquirer.prompt({
        name: 'inputNs',
        type: 'input',
        message: `The default namespace of the current module is ${ns}, If you need special designation, please type in and press enter, otherwise press enter directly`,
      });
      if (inputNs) {
        _ns = inputNs;
      }
      logInfo('Specify the namespace as', _ns);
    }
    // The fifth step, i18n.t writes back the source file
    const generatePromise = new Promise((resolve) => {
      walker({
        root: workDir,
        dealFile: (...args) => {
          restoreSourceFile.apply(null, [...args, resolve]);
        },
      });
    });
    const spinner = ora('Replacing source file...').start();
    await generatePromise;
    spinner.stop();
    logSuccess('replacing source file completed');
    // The sixth step, write the locale file
    if (tempZhMap && Object.keys(tempZhMap).length > 0) {
      const localePromise = new Promise<void>((resolve) => {
        if (fs.existsSync(path.resolve(`${workDir}/src`))) {
          writeLocale(resolve, _ns, path.resolve(`${workDir}/src`), localePath!);
        } else {
          writeLocale(resolve, _ns, workDir, localePath!);
        }
      });
      const loading = ora('Writing locale file...').start();
      await localePromise;
      loading.stop();
      logSuccess('Write locale file completed');
    }
  } finally {
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempTranslatedWordPath);
    logSuccess('Clearing of temporary files completed');
  }
  logInfo('i18n process is completed, see you👋');
};
