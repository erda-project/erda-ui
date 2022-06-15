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
import I18nWrapper from '../pages/i18n-wrapper';
import { getTransFromLocalStorage, splitKey } from '.';
import config from '../config';
interface Ret {
  _format: (f: () => string) => Ret;
  _store: undefined;
}

// overwrite i18n.t
const originT = i18n.originT || i18n.t;
const overwriteT = (combinedKey: string, paramObj?: Obj) => {
  const originText = originT.call(i18n, combinedKey, paramObj);
  const formatText = paramObj?._formatter && paramObj._formatter(originText);
  const text = formatText || originText;
  const [ns, key] = splitKey(combinedKey);
  const _ret = (
    <I18nWrapper key={combinedKey} combinedKey={combinedKey} text={getTransFromLocalStorage(ns, key) || text} />
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
  ret.toString = () => text + config.noEditSuffix;
  ret.valueOf = () => text + config.noEditSuffix;
  // custom format
  ret._format = (f) => {
    if (!paramObj) {
      paramObj = {};
    }
    paramObj._formatter = f;
    return overwriteT(combinedKey, paramObj);
  };
  // delete _store to prevent throwing error
  ret = { ...ret, ..._ret, _store: undefined };
  return ret;
};

export default overwriteT;
