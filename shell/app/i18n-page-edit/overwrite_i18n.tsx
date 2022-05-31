import React from 'react';
import i18n, { getCurrentLocale } from 'core/i18n';
import I18nWrapper from './pages/i18n-wrapper';
import { getTransFromLocalStorage } from './utils';

// 重写 i18n.t
// 在 erda-ui/shell/app/i18n.ts 中引入
const originT = i18n.t;
const overwriteT = (...args: string[]) => {
  const text = originT.call(i18n, ...args);
  const _ret = (
    <I18nWrapper
      firstArg={args[0]}
      secondArg={args[1]}
      key={args[0]}
      text={getTransFromLocalStorage(args[0], args[1], getCurrentLocale().key) || text}
    />
  );

  let ret = {};
  // ret._format = (f) => {
  //   const str = f(text)
  //   return ret;
  // };
  // 添加 String.prototype 所有属性
  Object.getOwnPropertyNames(String.prototype).forEach((key) => {
    if (typeof String.prototype[key] === 'function') {
      ret[key] = String.prototype[key].bind(text);
    } else {
      ret[key] = String.prototype[key];
    }
  });
  // 删除 _store 属性，防止报错
  ret = { ...ret, ..._ret, _store: undefined };
  return ret;
};

export default overwriteT;
