import React from 'react';
import store from '../../store';
import { splitKey, getTransFromLocalStorage } from '../../utils';
import { ErdaIcon } from 'common';
import './css/index.less';

const I18nWrapper = (props) => {
  const [ns, key] = splitKey(props.combinedKey);
  const [text, setText] = React.useState(props.text);
  const isEditable = store.useStore((s) => s.isEditable);
  const openModel = (ns: string, key: string) => {
    // click the text, pass the its own ns key to store
    store.reducers.initState(ns, key);
    store.reducers.setCurrentTextCb((value: string) => setText(value));
  };

  return (
    <span className="i18n-wrapper relative">
      <span data-key={props.combinedKey} className={isEditable ? 'i18n-wrapper-hover' : ''}>
        {text}
        <ErdaIcon
          type="edit"
          size="14"
          className="edit-icon cursor-pointer absolute pl-1"
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
