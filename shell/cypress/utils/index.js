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

/**
 * @description 中文随机字符串
 * @param len {number}
 * @returns {string}
 */
export const genRandomCnText = (len = 10) => {
  let str = '';
  for (let i = 0; i < len; i++) {
    const word = '';
    const _randomUniCode = Math.floor(Math.random() * (40870 - 19968) + 19968).toString(16);
    // eslint-disable-next-line no-eval
    eval(`${'word="\\u'}${_randomUniCode}"`);
    str += word;
  }
  return str;
};

/**
 * @description 英文
 * @param len {number}
 * @returns {string}
 */
export const genRandomEnText = (len = 10) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = len; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
