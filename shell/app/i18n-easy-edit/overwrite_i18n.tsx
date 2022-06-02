import React from 'react';
import i18n from 'core/i18n';
import I18nWrapper from './pages/i18n-wrapper';
import { getTransFromLocalStorage, splitKey } from './utils';

// overwrite i18n.t
const originT = i18n.t;
const overwriteT = (...args: [string, Object?]) => {
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
  let ret = {};
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
