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
 * 独立构建模式
 */
const isSplitMode = process.env.SPLIT_MODULE;

/**
 * 独立构建模块列表
 */
const depModules = ['admin', 'microService'];

/**
 * 如果是独立构建模式，则返回（或执行）第一个参数, 否则返回空对象或空数组
 */
const ifSplitMode = (data) => {
  if (Array.isArray(data)) {
    return isSplitMode ? data : [];
  } else if (typeof data === 'function') {
    isSplitMode && data();
  }
  return isSplitMode ? data : {};
};

/**
 * 如果非独立构建模式，则返回（或执行）参数对象，否则返回空对象或空数组
 */
const ifNotSplitMode = (data) => {
  if (Array.isArray(data)) {
    return isSplitMode ? [] : data;
  } else if (typeof data === 'function') {
    !isSplitMode && data();
  }
  return isSplitMode ? {} : data;
};

const exportObj = {
  isSplitMode,
  ifSplitMode,
  ifNotSplitMode,
  depModules,
};

module.exports = exportObj;
