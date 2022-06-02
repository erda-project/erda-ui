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

import React from 'react';
import i18n from 'core/i18n';
import I18nWrapper from './pages/i18n-wrapper';
import { getTransFromLocalStorage, splitKey } from './utils';

interface Ret {
  _format: (f: () => string) => Ret;
  _store: undefined;
}

// overwrite i18n.t
const originT = i18n.t;
const overwriteT = (...args: [string, Obj?]) => {
  const originText = originT.call(i18n, ...args);
  const formatText = args[1]?._formatter && args[1]._formatter(originText);
  const text = formatText || originText;
  const [ns, key] = splitKey(args[0]);
  const _ret = (
    <I18nWrapper
      combinedKey={args[0]}
      paramObj={args[1]}
      key={args[0]}
      text={getTransFromLocalStorage(ns, key) || text}
    />
  );
  let ret = {} as Ret;
  // add String.prototype all properties
  Object.getOwnPropertyNames(String.prototype).forEach((key) => {
    if (typeof String.prototype[key] === 'function') {
      ret[key] = String.prototype[key].bind(text);
    } else {
      ret[key] = String.prototype[key];
    }
  });
  // overwrite toString
  // in case of react dom object is not allowed (template string or echarts, etc.)
  ret.toString = () => text + '*';
  // custom format
  ret._format = (f) => {
    if (!args[1]) {
      args[1] = {};
    }
    args[1]._formatter = f;
    return overwriteT(args[0], args[1]);
  };
  // delete _store to prevent throwing error
  ret = { ...ret, ..._ret, _store: undefined };
  return ret;
};

export default overwriteT;
