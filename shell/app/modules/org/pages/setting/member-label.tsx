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

import * as React from 'react';
import i18n from 'i18n';
import { filter } from 'lodash';
import memberLabelStore from 'common/stores/member-label';
import { useMount } from 'react-use';
import { useUpdate } from 'common';
import './member-label.scss';

export const MemberLabels = () => {
  const list = memberLabelStore.useStore((s) => s.memberLabels);
  const { getMemberLabels, updateMemberLabels } = memberLabelStore.effects;

  const inputRef = React.useRef(null);
  const [{ showAdd, inputVal, errorTip }, updater, update] = useUpdate({
    showAdd: false,
    inputVal: undefined as undefined | string,
    errorTip: '',
  });

  const changeVal = (val: string) => {
    updater.inputVal(val);
    if (list.includes(val)) {
      updater.errorTip(i18n.t('label already existed'));
    } else {
      updater.errorTip('');
    }
  };

  useMount(() => {
    getMemberLabels();
  });

  const deleteLabel = (item: string) => {
    updateMemberLabels(filter(list, (l) => l !== item));
  };

  const onAdd = () => {
    updater.showAdd(true);
    const curInput = inputRef && (inputRef.current as any);
    if (curInput) curInput.focus();
  };

  const addItem = () => {
    if (!errorTip && inputVal) {
      updateMemberLabels([...list, inputVal]);
      updater.errorTip('');
      update({
        errorTip: '',
        showAdd: false,
        inputVal: undefined,
      });
    }
  };

  return (
    <div className="member-label-list">
      {/* <div>
        <span className="label-item create" onClick={() => onAdd()}>
          <Icon type="plus" />
          {i18n.t('project:add label')}
        </span>
        <div className='add-input-container'>
          <Input
            className={`add-item ${showAdd ? '' : 'hide'} ${errorTip ? 'has-error' : ''}`}
            ref={inputRef}
            value={inputVal}
            onChange={(e) => changeVal(e.target.value)}
            onPressEnter={addItem}
            placeholder={i18n.t('press entry to add')}
          />
          <div className={`error-tip ${errorTip} ? '': 'hide'`}>
            {errorTip}
          </div>
        </div> */}
      {list.map(({ label, name }) => (
        <span key={label} className="label-item">
          {name}
          {/* <Icon type="close" onClick={(e) => { e.stopPropagation(); deleteLabel(label); }} /> */}
        </span>
      ))}
    </div>
  );
};
