import React from 'react';
import i18n, { getCurrentLocale } from 'core/i18n';
import store from './store';
import { splitKey, getTranslation } from './utils';
import { ErdaIcon } from 'common';
import './css/index.less';

const originT = i18n.t;

// 无状态函数
function overwriteT(...args: string[]) {
  let text = originT.apply(i18n, [...args]);
  const _ret = <I18nWrapper firstArg={args[0]} secondArg={args[1]} key={args[0]} />;
  // 添加 String.prototype 所有属性
  let ret = {};
  // 删除 _store 属性，防止报错
  ret = { ...ret, ..._ret, _store: undefined };
  // ret._format = (f) => {
  //   const str = f(text)
  //   return ret;
  // };
  Object.getOwnPropertyNames(String.prototype).forEach((key) => {
    if (typeof String.prototype[key] === 'function') {
      ret[key] = String.prototype[key].bind(text);
    } else {
      ret[key] = String.prototype[key];
    }
  });
  return ret;
}

const I18nWrapper = (props) => {
  const combinedKey = props.firstArg;
  const [ns, key] = splitKey(combinedKey);
  const [text, setText] = React.useState(getTranslation(ns, key, getCurrentLocale().key));
  const isEditable = store.useStore((s) => s.isEditable);
  const openModel = (ns: string, key: string) => {
    // 点击文本后，传递当前 ns key
    store.reducers.initState(ns, key);
    store.reducers.setTextCb((value: string) => setText(value));
  };

  return (
    <span className="i18n-wrapper relative">
      <span data-key={combinedKey} className={isEditable ? 'i18n-wrapper-hover' : ''}>
        {text}
        <ErdaIcon
          type="edit"
          size="14"
          className="edit-icon cursor-pointer absolute"
          onClick={(e) => {
            // console.log(e.nativeEvent);
            e.preventDefault();
            e.stopPropagation();
            openModel(ns, key);
          }}
        />
      </span>
    </span>
  );
};

export default overwriteT;
