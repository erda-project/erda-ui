import React from 'react';
import { getCurrentLocale } from 'core/i18n';
import store from '../../store';
import { splitKey, getTranslation } from '../../utils';
import { ErdaIcon } from 'common';
import './css/index.less';

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
            e.preventDefault();
            e.stopPropagation();
            openModel(ns, key);
          }}
        />
      </span>
    </span>
  );
};

export default I18nWrapper;
