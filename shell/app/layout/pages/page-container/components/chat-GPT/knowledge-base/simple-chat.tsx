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
import i18n from 'i18n';
import { Input } from 'antd';
import userStore from 'app/user/stores';
import UserItem from '../user-item';
import GPTItem from '../gpt-item';
import { queryKnowledge } from 'layout/services/ai-knowledge';

interface Item {
  type: 'user' | 'gpt';
  message: string;
  links?: string[];
}

const SimpleChat = ({}, ref) => {
  const { id: userId } = userStore.getState((s) => s.loginUser);
  const [list, setList] = React.useState<Item[]>([]);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [inputVal, setInputVal] = React.useState('');

  const enter = async (val: string, extension?: boolean) => {
    if (loading) {
      return;
    }
    setLoading(true);
    setList((prev) => [...prev, { type: 'user', message: val }]);
    setInputVal('');
    const res = await queryKnowledge(val, userId, extension);

    if (res.success && res.data) {
      const { answer, references } = res.data;
      setList((prev) => [...prev, { type: 'gpt', message: answer, links: references }]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current?.scrollHeight;
    }
  }, [list]);

  React.useImperativeHandle(ref, () => ({
    enter,
  }));

  return (
    <div className="flex flex-col h-full items-cente p-4">
      <div className="flex-1 w-full text-center ml-auto mr-auto mb-10 overflow-y-auto" ref={listRef}>
        {list.length ? (
          list.map((item, index) => {
            const { type, message, links } = item;

            switch (type) {
              case 'user':
                return <UserItem message={message} />;
              case 'gpt':
                return (
                  <GPTItem
                    message={message}
                    links={links}
                    onExtension={list[index - 1].message ? () => enter(list[index - 1].message, true) : undefined}
                  />
                );
              default:
                return '';
            }
          })
        ) : (
          <EmptyList />
        )}
        {loading && <GPTItem />}
      </div>
      <div className="flex items-center w-full pb-6 relative">
        <Input.TextArea
          size="large"
          placeholder={i18n.t('charts:Send a message')}
          className="max-h-[200px] pr-[30px] flex-1"
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={inputVal}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              enter(e.currentTarget?.value);
            }
          }}
          onChange={(e) => setInputVal(e.target.value)}
        />
      </div>
    </div>
  );
};

const EmptyList = () => {
  return (
    <div className="mt-6 m-auto">
      <div className="text-label text-left bg-brightgray rounded-lg p-4 opacity-60">
        {i18n.t('charts:To use this feature, please specify')}:
        <br />
        {i18n.t(
          'charts:1. This function relies on AI services such as ChatGPT (which may include foreign suppliers), and the messages you send will be processed by its large model.',
        )}
        <br />
        {i18n.t(
          'charts:2. Erda will audit all conversations and keep them for a period of time, but will not actively review your conversations.',
        )}
        <br />
        {i18n.t('charts:3. do not send trade secrets, sensitive data, private information and other illegal content.')}
        <br />
        {i18n.t('charts:4. need help, please contact')}{' '}
        <a className="text-blue" href="dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=3bq_wjexdf5th">
          {i18n.t('charts:Erda service support')}
        </a>
        。
      </div>
    </div>
  );
};

export default React.forwardRef(SimpleChat);
