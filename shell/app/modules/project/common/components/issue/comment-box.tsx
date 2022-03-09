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

import { ErdaIcon, MarkdownEditor, UserInfo } from 'common';
import { useUpdate } from 'common/use-hooks';
import { Button, Input } from 'antd';
import React from 'react';
import { WithAuth } from 'user/common';
import i18n from 'i18n';
import { getBrowserInfo } from 'app/common/utils';
import { useKey } from 'react-use';
import layoutStore from 'layout/stores/layout';
import userStore from 'user/stores';
import './comment-box.scss';

const { isWin } = getBrowserInfo();

interface IProps {
  editAuth?: boolean;
  onSave?: (v: string) => void;
}

export const IssueCommentBox = (props: IProps) => {
  const { onSave = () => {}, editAuth } = props;
  const loginUser = userStore.useStore((s) => s.loginUser);

  const [stateMap, updater] = useUpdate({
    visible: false,
    content: '',
    focus: true,
  });

  const close = () => {
    updater.visible(false);
    layoutStore.reducers.setIssueCommentBoxVisible(false);
  };

  const submit = () => {
    if (stateMap.content.trim().length) {
      onSave(stateMap.content);
      updater.content('');
      updater.focus(false);
      close();
    }
  };

  useKey('Escape', close);

  useKey('Enter', (e) => {
    if (stateMap.focus && (isWin ? e.shiftKey : e.metaKey)) {
      submit();
    }
  });

  const disableSubmit = !stateMap.content.trim();

  return (
    <div
      className="absolute flex items-start z-10 rounded-sm p-3 shadow-card-lg bg-white bottom-0"
      style={{ left: '16px', width: `calc(100% - 32px)` }}
    >
      <UserInfo.RenderWithAvatar avatarSize="default" id={loginUser.id} showName={false} className="mr-3" />
      {stateMap.visible ? (
        <div className="flex-1">
          <MarkdownEditor
            value={stateMap.content}
            placeholder={i18n.t('dop:Comment ({meta} + Enter to send, Esc to collapse)', {
              meta: isWin ? 'Shift' : 'Cmd',
            })}
            onFocus={() => updater.focus(true)}
            onBlur={() => updater.focus(false)}
            autoFocus
            className="w-full issue-md-arrow"
            onChange={(val: any) => {
              updater.content(val);
            }}
            style={{ height: '200px' }}
            maxLength={3000}
          />

          <div className="mt-2">
            <Button className="mr-3" type="primary" disabled={disableSubmit} onClick={() => submit()}>
              {i18n.t('dop:Post')}
            </Button>
            <Button onClick={() => close()}>{i18n.t('dop:Collapse')}</Button>
          </div>
        </div>
      ) : (
        <div
          className="issue-comment-arrow h-8 leading-8 bg-default-06 rounded-sm cursor-pointer px-3 flex-1 hover:text-purple-deep"
          onClick={() => {
            updater.visible(true);
            layoutStore.reducers.setIssueCommentBoxVisible(true);
          }}
        >
          {i18n.t('dop:Click here to comment')}
        </div>
      )}
    </div>
  );
};
