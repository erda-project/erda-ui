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
import store from '../../store';
import { splitKey } from '../../utils';
import { ErdaIcon } from 'common';
import './index.less';

interface IProps {
  text: string;
  combinedKey: string;
  paramObj?: Obj;
}
const I18nWrapper = (props: IProps) => {
  const [ns, key] = splitKey(props.combinedKey);
  const [text, setText] = React.useState(props.text);
  const isEditable = store.useStore((s) => s.isEditable);
  const openModel = (ns: string, key: string) => {
    // click the text, pass the its own ns key to store
    store.reducers.resetState(ns, key);
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
