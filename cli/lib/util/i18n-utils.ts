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
import { logError, logInfo, logSuccess, logWarn } from './log';
import writeLocale from './i18n-extract';
import ora from 'ora';
import { remove, unset } from 'lodash';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { walker } from './file-walker';

/**
 * find folder which name matches folderName under workDir
 * @param {*} folderName
 * @returns
 */
export const findMatchFolder = (folderName: string, workDir: string): string | null => {
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

export const tempFilePath = path.resolve(process.cwd(), './temp-zh-words.json');
export const tempTranslatedWordPath = path.resolve(process.cwd(), './temp-translated-words.json');

/**
 * create temp files and check whether exists locale files
 */
export const prepareEnv = (localePath: string | null, switchNs: boolean) => {
  let zhResource: { [k: string]: { [k: string]: string } } = {};
  let enResource: { [k: string]: { [k: string]: string } } = {};
  if (!localePath) {
    logError('Please make sure that the [locales] folder exists in the running directory (can be nested)');
    throw Error('no locales folder');
  }
  if (!switchNs && !fs.existsSync(tempFilePath)) {
    fs.writeFileSync(tempFilePath, JSON.stringify({}, null, 2), 'utf8');
  }
  if (!switchNs && !fs.existsSync(tempTranslatedWordPath)) {
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
  if (fs.existsSync(enJsonPath)) {
    const content = fs.readFileSync(enJsonPath, 'utf8');
    enResource = JSON.parse(content);
  } else {
    fs.writeFileSync(enJsonPath, JSON.stringify({}, null, 2), 'utf8');
  }
  return [zhResource, enResource];
};

/**
 * write locale files
 * @param localePath locale path to translate
 * @param workDir work directory
 */
export const writeLocaleFiles = async (localePath: string, workDir: string, switchNs?: boolean) => {
  const localePromise = new Promise<void>((resolve) => {
    if (fs.existsSync(path.resolve(`${workDir}/src`))) {
      writeLocale(resolve, path.resolve(`${workDir}/src`), localePath, switchNs);
    } else {
      writeLocale(resolve, workDir, localePath, switchNs);
    }
  });
  const loading = ora('Writing locale file...').start();
  await localePromise;
  loading.stop();
  logSuccess('write locale file completed');
};

/**
 * filter the pending translation list to translated list & un-translated list
 * @param toTranslateEnWords string array that need to translate which extract from raw source code
 */
export const filterTranslationGroup = (
  toTranslateEnWords: string[],
  zhResource: { [k: string]: { [k: string]: string } },
  untranslatedWords: Set<string>,
  translatedWords: { [k: string]: string },
) => {
  const notTranslatedWords = [...toTranslateEnWords]; // The English collection of the current document that needs to be translated
  // Traverse namespaces of zh.json to see if there is any English that has been translated
  Object.keys(zhResource).forEach((namespaceKey) => {
    // All translations in the current namespace
    const namespaceWords = zhResource[namespaceKey];
    toTranslateEnWords.forEach((enWord) => {
      // When there is an existing translation and translatedWords does not contains it, add it to the translated list and remove it from the untranslated list
      if (namespaceWords[enWord] && !translatedWords[enWord]) {
        // eslint-disable-next-line no-param-reassign
        translatedWords[enWord] =
          namespaceKey === 'default' ? namespaceWords[enWord] : `${namespaceKey}:${namespaceWords[enWord]}`;
        remove(notTranslatedWords, (w) => w === enWord);
      }
    });
  });
  notTranslatedWords.forEach(untranslatedWords.add, untranslatedWords);
};

const i18nDRegex = /i18n\.d\(["'](.+?)["']\)/g;

/**
 * extract i18n.d and write filtered content to two temp files
 * @param content raw file content
 * @param filePath file path
 * @param isEnd is traverse done
 * @param zhResource origin zh.json content
 * @param translatedWords translated collection
 * @param untranslatedWords untranslated collection
 * @param resolve promise resolver
 */
export const extractUntranslatedWords = (
  content: string,
  filePath: string,
  isEnd: boolean,
  zhResource: { [k: string]: { [k: string]: string } },
  translatedWords: { [k: string]: string },
  untranslatedWords: Set<string>,
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
  filterTranslationGroup(
    toTransEnglishWords.filter((enWord) => !untranslatedWords.has(enWord) && !translatedWords[enWord]),
    zhResource,
    untranslatedWords,
    translatedWords,
  );
  if (isEnd) {
    // After all files are traversed, notTranslatedWords is written to temp-zh-words in its original format
    if (untranslatedWords.size > 0) {
      const enMap: { [k: string]: string } = {};
      untranslatedWords.forEach((word) => {
        enMap[word] = '';
      });
      fs.writeFileSync(tempFilePath, JSON.stringify(enMap, null, 2), 'utf8');
      logSuccess(`Finish writing to the temporary file ${chalk.green('[temp-zh-words.json]')}`);
    }
    // translatedWords write to [temp-translated-words.json]
    if (Object.keys(translatedWords).length > 0) {
      fs.writeFileSync(tempTranslatedWordPath, JSON.stringify(translatedWords, null, 2), 'utf8');
      logSuccess(`Finish writing to the temporary file ${chalk.green('[temp-translated-words.json]')}`);
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
export const restoreSourceFile = (
  content: string,
  filePath: string,
  isEnd: boolean,
  ns: string,
  translatedMap: { [k: string]: string },
  reviewedZhMap: { [k: string]: string },
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
      if (reviewedZhMap?.[enWord]) {
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

const i18nRRegex = /i18n\.r\(["'](.+?)["']\)/g;

/**
 * extract i18n.r content
 * @param content raw file content
 * @param filePath file path
 * @param isEnd is traverse done
 * @param ns is target namespace
 * @param resolve promise resolver
 */
export const extractPendingSwitchContent = (
  content: string,
  filePath: string,
  isEnd: boolean,
  ns: string,
  toSwitchWords: Set<string>,
  resolve: (value: void | PromiseLike<void>) => void,
) => {
  // Only process code files
  if (!['.tsx', '.ts', '.js', '.jsx'].includes(path.extname(filePath)) && !isEnd) {
    return;
  }
  let match = i18nRRegex.exec(content);
  let replacedText = content;
  let changed = false;
  while (match) {
    if (match) {
      const matchedText = match[1];
      toSwitchWords.add(matchedText);
      const wordArr = matchedText.split(':');
      const enWord = wordArr.length === 2 ? wordArr[1] : matchedText;
      const newWordText = ns === 'default' ? enWord : `${ns}:${enWord}`;
      replacedText = replacedText.replace(match[0], `i18n.t('${newWordText}')`);
      changed = true;
    }
    match = i18nRRegex.exec(content);
  }
  if (changed) {
    fs.writeFileSync(filePath, replacedText, 'utf8');
  }
  if (!isEnd && toSwitchWords.size === 0) {
    return;
  }

  if (isEnd) {
    resolve();
  }
};

/**
 * restore raw file i18n.d => i18n.t with namespace
 * @param content raw file content
 * @param filePath file path with extension
 * @param isEnd is traverse done
 * @param ns target namespace
 * @param toSwitchWords pending switch words
 * @param resolve resolver of promise
 */
export const switchSourceFileNs = (
  content: string,
  filePath: string,
  isEnd: boolean,
  ns: string,
  toSwitchWords: Set<string>,
  resolve: (value: void | PromiseLike<void>) => void,
) => {
  if (!['.tsx', '.ts', '.js', '.jsx'].includes(path.extname(filePath)) && !isEnd) {
    return;
  }
  let newContent = content;
  let changed = false;
  toSwitchWords.forEach((wordWithNs) => {
    const matchText = `i18n.t('${wordWithNs}')`;
    const matchTextRegex = new RegExp(`i18n\\.t\\('${wordWithNs}'\\)`, 'g');
    if (newContent.includes(matchText)) {
      changed = true;
      const wordArr = wordWithNs.split(':');
      const enWord = wordArr.length === 2 ? wordArr[1] : wordWithNs;
      const newWordText = ns === 'default' ? enWord : `${ns}:${enWord}`;
      newContent = newContent.replace(matchTextRegex, `i18n.t('${newWordText}')`);
    }
  });
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
  if (isEnd) {
    resolve();
  }
};

/**
 * batch switch namespace
 * @param workDir work directory
 * @param localePath locale path
 * @param zhResource original zh.json content
 * @param enResource original en.json content
 */
export const batchSwitchNamespace = async (
  workDir: string,
  localePath: string,
  zhResource: { [k: string]: { [k: string]: string } },
  enResource: { [k: string]: { [k: string]: string } },
) => {
  const toSwitchWords = new Set<string>();
  const nsList = Object.keys(zhResource);
  const { targetNs } = await inquirer.prompt({
    name: 'targetNs',
    type: 'list',
    message: 'Please select the new namespace name',
    choices: nsList.map((ns) => ({ value: ns, name: ns })),
  });
  if (!targetNs) {
    logWarn('no input namespace found. program exit');
    return;
  }
  // extract all i18n.r
  const extractPromise = new Promise<void>((resolve) => {
    walker({
      root: workDir,
      dealFile: (...args) => {
        extractPendingSwitchContent.apply(null, [...args, targetNs, toSwitchWords, resolve]);
      },
    });
  });
  await extractPromise;
  if (toSwitchWords.size) {
    const restorePromise = new Promise<void>((resolve) => {
      walker({
        root: workDir,
        dealFile: (...args) => {
          switchSourceFileNs.apply(null, [...args, targetNs, toSwitchWords, resolve]);
        },
      });
    });
    await restorePromise;
    for (const wordWithNs of toSwitchWords) {
      const wordArr = wordWithNs.split(':');
      const [currentNs, enWord] = wordArr.length === 2 ? wordArr : ['default', wordWithNs];
      // replace zh.json content
      const targetNsContent = zhResource[targetNs];
      const currentNsContent = zhResource[currentNs];
      if (!targetNsContent[enWord] || targetNsContent[enWord] === currentNsContent[enWord]) {
        targetNsContent[enWord] = currentNsContent[enWord];
      } else {
        // eslint-disable-next-line no-await-in-loop
        const confirm = await inquirer.prompt({
          name: 'confirm',
          type: 'confirm',
          message: `${chalk.red(enWord)} has translation in target namespace ${targetNs} with value ${chalk.yellow(
            targetNsContent[enWord],
          )}, Do you want to override it with ${chalk.yellow(currentNsContent[enWord])}?`,
        });
        if (confirm) {
          targetNsContent[enWord] = currentNsContent[enWord];
        }
      }
      unset(currentNsContent, enWord);

      // replace zh.json content
      const targetNsEnContent = enResource[targetNs];
      const currentNsEnContent = enResource[currentNs];
      if (!targetNsEnContent[enWord]) {
        targetNsEnContent[enWord] = currentNsEnContent[enWord];
      }
      unset(currentNsEnContent, enWord);
    }
    fs.writeFileSync(`${localePath}/zh.json`, JSON.stringify(zhResource, null, 2), 'utf8');
    fs.writeFileSync(`${localePath}/en.json`, JSON.stringify(enResource, null, 2), 'utf8');
    logInfo('sort current locale files & remove unused translation');
    await writeLocaleFiles(localePath, workDir, true);
    logSuccess('switch namespace done.');
  } else {
    logWarn(`no ${chalk.red('i18n.r')} found in source code. program exit`);
  }
};
