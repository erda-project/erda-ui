import React from 'react';
import i18n from 'core/i18n';

const originT = i18n.t;
i18n.t = (...args) => {
  const key = args[0];
  const clickHandler = (key: string) => {
    console.log(key, 1234);
  };
  const _ret = (
    <span
      data-key={key}
      onClick={() => {
        clickHandler(key);
      }}
    >
      {originT(...args)}
    </span>
  );
  // 添加 String.prototype 所有属性
  let ret = {};
  Object.getOwnPropertyNames(String.prototype).forEach((key) => {
    if (typeof String.prototype[key] === 'function') {
      ret[key] = String.prototype[key].bind(originT(...args));
    } else {
      ret[key] = String.prototype[key];
    }
  });
  // 删除 _store 属性，防止报错
  ret = { ...ret, ..._ret, _store: undefined };
  return ret;
};

export default i18n;
