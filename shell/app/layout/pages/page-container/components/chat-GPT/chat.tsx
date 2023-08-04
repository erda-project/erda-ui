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

import React, { useState, useRef, useEffect } from 'react';
import { Input, Spin, message, Popconfirm, Divider } from 'antd';
import { encode } from 'js-base64';
import i18n from 'i18n';
import { ErdaIcon as CustomIcon } from 'common';
import userStore from 'app/user/stores';
import orgStore from 'app/org-home/stores/org';
import UserItem from './user-item';
import GPTItem from './gpt-item';
import { getLogs, resetSession, SSE } from 'layout/services/ai-chat';
import { erdaEnv } from 'common/constants';

const AI_BACKEND_URL = erdaEnv.AI_BACKEND_URL;

const Chat = ({ id }: { id?: number }) => {
  const { id: userId, nick: name, phone, email } = userStore.getState((s) => s.loginUser);
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const [list, setList] = useState<Array<{ type: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef('');
  const isShowingRef = useRef(false);
  const [messageContent, setMessageContent] = useState<{ message?: string; isNew?: string }>({});

  useEffect(() => {
    if (id) {
      loadLogs();
    }
  }, [id]);

  useEffect(() => {
    if (messageContent.message && !isShowingRef.current) {
      isShowingRef.current = true;
      const interval = setInterval(() => {
        if (list[list.length - 1].type === 'user') {
          list.push({ type: 'gpt', message: messageRef.current.slice(0, 1) });
        } else {
          list[list.length - 1].message += messageRef.current.slice(0, 1);
        }
        setList(list);

        messageRef.current = messageRef.current.slice(1);
        setMessageContent({ message: messageRef.current });

        if (listRef.current) {
          listRef.current.scrollTop = listRef.current?.scrollHeight;
        }

        if (!messageRef.current) {
          clearInterval(interval);
          isShowingRef.current = false;
        }
      }, 5);
    }
  }, [messageContent]);

  const loadLogs = async () => {
    const res = await getLogs({ userId, name, phone, email, id });
    if (res.success) {
      const {
        data: { list: _list },
      } = res;
      const messages = [] as Array<{ type: string; message: string }>;
      _list.reverse().forEach((item) => {
        messages.push({ type: 'user', message: item.prompt });
        messages.push({ type: 'gpt', message: item.completion });
      });
      setList(messages);
    }
  };

  const enter = async (value: string) => {
    setLoading(true);
    setInputVal('');
    setList([...list, { type: 'user', message: value }]);
    setLoading(false);
  };

  useEffect(() => {
    if (list.length && listRef.current) {
      listRef.current.scrollTop = listRef.current?.scrollHeight;
    }

    if (list[list.length - 1]?.type === 'user') {
      try {
        completions(list[list.length - 1].message);
      } catch (error) {
        console.warn(error);
      }
    }
  }, [list]);

  const reset = async () => {
    if (!id) {
      return;
    }
    const res = await resetSession({ userId, name, phone, email, id });

    if (res.success) {
      setList([...list, { type: 'split', message: '' }]);
      message.success(i18n.t('{action} successfully', { action: i18n.t('reset') }));
    }
  };

  const completions = (content: string) => {
    const url = `${AI_BACKEND_URL}/v1/chat/completions`;
    var source = new SSE(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Ai-Proxy-User-Id': encode(userId),
        'X-Ai-Proxy-Username': encode(name),
        'X-Ai-Proxy-Phone': encode(phone),
        'X-AI-Proxy-Email': encode(email),
        'X-Ai-Proxy-Source': 'erda.cloud',
        'X-Ai-Proxy-Org-Id': encode(`${orgId}`),
        'X-AI-Proxy-SessionId': encode(`${id}`),
      },
      payload: JSON.stringify({
        model: 'gpt-35-turbo-16k',
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        // "max_tokens": 16384,
        stream: true,
      }),
    });
    source.onmessage = function (customEvent: any) {
      const { data } = customEvent;
      if (data !== '[DONE]') {
        const dataObj = JSON.parse(data);
        const { choices } = dataObj;
        const { delta } = choices[0];
        const { content } = delta;

        if (content && messageRef.current === '') {
          messageRef.current += content;
          setMessageContent({ message: messageRef.current });
        } else if (content) {
          messageRef.current += content;
          setMessageContent({ message: messageRef.current });
        }
      } else {
        source.close();
      }
    };
    source.onerror = function (err: string) {
      console.log('onerror', err);
    };
    source.stream();
  };

  return (
    <div className="flex w-[calc(100%-256px)] flex-col h-full items-cente p-4">
      <div className="flex-1 w-full text-center ml-auto mr-auto mb-10 overflow-y-auto" ref={listRef}>
        {list.length ? (
          list.map((item) => {
            const { type, message } = item;

            switch (type) {
              case 'user':
                return <UserItem message={message} />;
              case 'gpt':
                return <GPTItem message={message} />;
              case 'split':
                return <Divider>{i18n.t('charts:context cleared')}</Divider>;
              default:
                return '';
            }
          })
        ) : (
          <EmptyList />
        )}
        {loading && <GPTItem message={<Spin />} />}
      </div>
      <div className="flex items-center w-full pb-6 relative">
        <Popconfirm title={i18n.t('cmp:are you sure you want to reset?')} onConfirm={reset}>
          <CustomIcon type="zhongzhi" className="text-xl mr-2 cursor-pointer" />
        </Popconfirm>
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

export default Chat;
