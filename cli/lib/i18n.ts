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
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { walker } from './util/file-walker';
import { doTranslate as googleTranslate } from './util/google-translate';
import { doTranslate as yuodaoTranslate } from './util/youdao-translate';
import { logInfo, logSuccess } from './util/log';
import { getCwdModuleName } from './util/env';
import {
  batchSwitchNamespace,
  extractUntranslatedWords,
  findMatchFolder,
  prepareEnv,
  restoreSourceFile,
  tempFilePath,
  tempTranslatedWordPath,
  writeLocaleFiles,
} from './util/i18n-utils';
import path from 'path';

const configFilePath = path.resolve(process.cwd(), '.translaterc');

export default async ({ workDir: _workDir, switchNs }: { workDir: string; switchNs?: boolean }) => {
  try {
    const workDir = _workDir || process.cwd();
    let ns = getCwdModuleName({ currentPath: workDir });
    const localePath = findMatchFolder('locales', workDir)!;

    const [originalZhResource, originalEnResource] = prepareEnv(localePath, !!switchNs);
    // switch namespace
    if (switchNs) {
      await batchSwitchNamespace(workDir, localePath, originalZhResource, originalEnResource);
      return;
    }

    const untranslatedWords = new Set<string>(); // Untranslated collection
    const translatedWords: { [k: string]: string } = {};

    // extract all i18n.d
    const extractPromise = new Promise<void>((resolve) => {
      // first step is to find out the content that needs to be translated, and assign the content to two parts: untranslated and translated
      walker({
        root: workDir,
        dealFile: (...args) => {
          extractUntranslatedWords.apply(null, [
            ...args,
            originalZhResource,
            translatedWords,
            untranslatedWords,
            resolve,
          ]);
        },
      });
    });
    await extractPromise;

    if (untranslatedWords.size === 0 && Object.keys(translatedWords).length === 0) {
      logInfo('sort current locale files & remove unused translation');
      await writeLocaleFiles(localePath, workDir);
      logInfo('No content needs to be translated is found, program exits');
      return;
    }

    if (Object.keys(translatedWords).length > 0) {
      await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: `Please carefully check whether the existing translation of ${chalk.green(
          '[temp-translated-words.json]',
        )} is suitable, if you are not satisfied, please move the content into ${chalk.green(
          '[temp-zh-words.json]',
        )}, no problem or after manual modification press enter to continue`,
      });
    }

    const tempWords = JSON.parse(fs.readFileSync(tempFilePath, { encoding: 'utf-8' }));
    const _untranslatedWords = Object.keys(tempWords);
    // The second step is to call google/youdao Translate to automatically translate
    if (_untranslatedWords.length > 0) {
      const isUsingYoudao = fs.existsSync(configFilePath);
      const spinner = ora(`${isUsingYoudao ? 'youdao' : 'google'} automatic translating...`).start();
      const translateMethod = isUsingYoudao ? yuodaoTranslate : googleTranslate;
      await translateMethod();
      spinner.stop();
      logSuccess('automatic translation completed');
      // The third step, manually checks whether there is a problem with the translation
      await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: `Please double check whether the automatic translation of ${chalk.green(
          '[temp-zh-words.json]',
        )} is suitable, no problem or after manual modification then press enter to continue`,
      });
    }

    const reviewedZhMap = JSON.parse(fs.readFileSync(tempFilePath, { encoding: 'utf-8' }));
    let translatedMap: null | { [k: string]: string } = null;

    if (Object.keys(translatedWords).length > 0) {
      translatedMap = JSON.parse(fs.readFileSync(tempTranslatedWordPath, { encoding: 'utf-8' }));
    }
    // The fourth step is to specify the namespace
    if (reviewedZhMap && Object.keys(reviewedZhMap).length > 0) {
      const { inputNs } = await inquirer.prompt({
        name: 'inputNs',
        type: 'input',
        message: `the default namespace of the current module is ${chalk.red(
          ns,
        )}, If you need special designation, please type in and press enter, otherwise press enter directly`,
      });
      if (inputNs) {
        // eslint-disable-next-line require-atomic-updates
        ns = inputNs;
      }
      logInfo('Specify the namespace as', ns);
    }
    // The fifth step, i18n.t writes back the source file
    const generatePromise = new Promise((resolve) => {
      walker({
        root: workDir,
        dealFile: (...args) => {
          restoreSourceFile.apply(null, [...args, ns, translatedMap, reviewedZhMap, resolve]);
        },
      });
    });
    const spinner = ora('replacing source file...').start();
    await generatePromise;
    spinner.stop();
    logSuccess('replacing source file completed');
    // The sixth step, write the locale file
    if (reviewedZhMap && Object.keys(reviewedZhMap).length > 0) {
      await writeLocaleFiles(localePath, workDir);
    }
  } finally {
    if (!switchNs) {
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(tempTranslatedWordPath);
      logSuccess('clearing of temporary files completed');
    }
  }
  logInfo('i18n process is completed, see you👋');
};
