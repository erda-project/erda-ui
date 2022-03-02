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

import { ErdaIcon, MarkdownEditor } from 'common';
import { useUpdate } from 'common/use-hooks';
import { Button, Input } from 'antd';
import React from 'react';
import { WithAuth } from 'user/common';
import i18n from 'i18n';
import { getBrowserInfo } from 'app/common/utils';

const { isWin } = getBrowserInfo();

interface IProps {
  editAuth?: boolean;
  onSave?: (v: string) => void;
}

export const IssueCommentBox = (props: IProps) => {
  const { onSave = () => {}, editAuth } = props;

  const [stateMap, updater] = useUpdate({
    visible: false,
    content: '',
  });

  const submit = () => {
    onSave(stateMap.content);
    updater.content('');
    updater.visible(false);
  };

  const disableSubmit = !stateMap.content.trim();

  return stateMap.visible ? (
    <div
      className="fixed z-10 shadow-card-lg bg-white bottom-0"
      style={{
        width: '80vw',
        left: '20vw',
      }}
    >
      <div className="comment-box-markdown">
        <MarkdownEditor
          value={stateMap.content}
          onChange={(val: any) => {
            updater.content(val);
          }}
          style={{ height: '300px' }}
          maxLength={3000}
        />
      </div>
      <div className="mt-3 btn-line-rtl">
        <Button type="primary" className="ml-3" disabled={disableSubmit} onClick={() => submit()}>
          {i18n.t('ok')}
        </Button>
        <Button type="link" onClick={() => updater.visible(false)}>
          {i18n.t('cancel')}
        </Button>
      </div>
    </div>
  ) : (
    <WithAuth pass={editAuth}>
      <div className="absolute bottom-0 w-full flex px-4 py-3" style={{ background: '#f7f7f7' }}>
        <Input.TextArea
          value={stateMap.content}
          onChange={(e) => updater.content(e.target.value)}
          placeholder={i18n.t('dop:Comment ({meta} + Enter to send)', { meta: isWin ? 'Shift' : 'Cmd' })}
          autoSize={{ maxRows: 8 }}
          onPressEnter={(e) => {
            if (isWin ? e.shiftKey : e.metaKey) {
              submit();
            }
          }}
          className="bg-default-06 border-none"
        />
        <div className="flex items-center absolute right-4 bottom-3 mb-0.5 mr-0.5">
          <ErdaIcon
            className="text-desc hover-active"
            onClick={() => updater.visible(true)}
            type="expand-text-input"
            size={16}
          />
          {disableSubmit ? (
            <ErdaIcon className="ml-3 cursor-not-allowed rounded-sm bg-desc p-1" type="fasong" fill="white" size={20} />
          ) : (
            <ErdaIcon
              className="ml-3 cursor-pointer rounded-sm bg-default p-1"
              type="fasong"
              fill="white"
              size={20}
              onClick={() => submit()}
            />
          )}
        </div>
      </div>
    </WithAuth>
  );
};
