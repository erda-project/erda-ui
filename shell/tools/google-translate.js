#!/usr/bin/env node

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
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { translate } = require('@paiva/translation-google');
const fs = require('fs');

// 过滤替换会造成i118next翻译出错的单词，比如点和冒号
const filterInvalidWord = (enWord) => {
  return enWord.replace(/:/g, '&#58;');
};

// 注意：翻译完的英文首字母会强制小写，如果需要大写开头的需要手动调整
const doTranslate = async () => {
  const rawFile = fs.readFileSync('tools/temp-zh-words.json');
  const wordList = JSON.parse(rawFile);

  const toTransList = Object.keys(wordList);
  if (toTransList.length === 0) {
    return;
  }

  const promises = toTransList.map(async (word) => {
    const result = await translate(word, {
      tld: 'zh-cn',
      to: 'en',
    });
    return { zh: word, en: result.text };
  });
  const translatedList = await Promise.allSettled(promises);

  translatedList.filter(item => item.status === 'fulfilled').forEach(({ value }) => {
    const { zh, en } = value;
    const [first, ...rest] = en;
    wordList[zh] = filterInvalidWord(first.toLowerCase() + rest.join(''));
  });
  fs.writeFileSync('tools/temp-zh-words.json', JSON.stringify(wordList, null, '  '));
};

module.exports = {
  doTranslate,
};

