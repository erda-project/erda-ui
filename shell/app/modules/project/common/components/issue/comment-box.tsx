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

import { Button } from 'antd';
import { getBrowserInfo } from 'app/common/utils';
import { MarkdownEditor, UserInfo } from 'common';
import { useUpdate } from 'common/use-hooks';
import i18n from 'i18n';
import { useEscScope } from 'layout/stores/layout';
import { on } from 'core/event-hub';
import React from 'react';
import { useKey } from 'react-use';
import userStore from 'user/stores';
import './comment-box.scss';

const { isWin } = getBrowserInfo();

interface IProps {
  editAuth?: boolean;
  onSave?: (v: string) => void;
}

export const IssueCommentBox = (props: IProps) => {
  const ESC_TARGET = 'issue-comment-box';
  const { onSave = () => {}, editAuth } = props;
  const loginUser = userStore.useStore((s) => s.loginUser);

  const [state, updater] = useUpdate({
    visible: false,
    disableSave: true,
    show: false,
  });

  const valueRef = React.useRef('');
  const focusRef = React.useRef(true);

  React.useEffect(() => {
    on('issue-drawer:scroll', (direction: 'up' | 'down') => {
      updater.show(direction === 'down');
    });
  }, [updater]);

  const submit = () => {
    const saveVal = valueRef.current.trim();
    if (saveVal.length) {
      onSave(saveVal);
      valueRef.current = '';
      focusRef.current = false;
      updater.visible(false);
    }
  };

  const enterEsc = useEscScope(ESC_TARGET, () => {
    updater.visible(false);
  });

  // fn in useKey will not get newest state, so we need to use ref
  useKey('Enter', (e) => {
    if (focusRef.current && (isWin ? e.shiftKey : e.metaKey)) {
      submit();
    }
  });

  return (
    <div
      className={`issue-comment-box absolute flex items-start z-10 rounded-sm p-4 shadow-card-lg bg-white bottom-0 ${
        state.show ? '' : state.visible ? '' : 'slide-down'
      }`}
      style={{ left: 'calc(12% - 16px)', right: 'calc(12% - 16px)' }}
    >
      <UserInfo.RenderWithAvatar avatarSize="default" id={loginUser.id} showName={false} className="mr-3" />
      {state.visible ? (
        <div className="flex-1">
          <MarkdownEditor
            value={valueRef.current}
            placeholder={i18n.t('dop:Comment ({meta} + Enter to send, Esc to collapse)', {
              meta: isWin ? 'Shift' : 'Cmd',
            })}
            onFocus={() => {
              focusRef.current = true;
            }}
            onBlur={() => {
              focusRef.current = false;
            }}
            autoFocus
            className="w-full issue-md-arrow"
            onChange={(val: string) => {
              valueRef.current = val;
              updater.disableSave(!val.trim().length);
            }}
            style={{ height: '200px' }}
            maxLength={3000}
          />

          <div className="mt-2">
            <Button className="mr-3" type="primary" disabled={state.disableSave} onClick={() => submit()}>
              {i18n.t('dop:Post')}
            </Button>
            <Button onClick={() => close()}>{i18n.t('dop:Collapse')}</Button>
          </div>
        </div>
      ) : (
        <div
          className="issue-comment-arrow h-8 leading-8 bg-default-04 rounded-sm cursor-pointer px-3 flex-1 hover:text-purple-deep"
          onClick={() => {
            updater.visible(true);
            enterEsc();
          }}
        >
          {i18n.t('dop:Click here to comment')}
        </div>
      )}
    </div>
  );
};
