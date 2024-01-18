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

import React, { useState, useEffect } from 'react';
import { encode } from 'js-base64';
import moment from 'moment';
import { ChatProvider, Chat as TChart } from '@terminus/ai-components';
import { erdaEnv } from 'common/constants';
import userStore from 'app/user/stores';
import orgStore from 'app/org-home/stores/org';
import Sidebar from './sidebar';
import { getLogs } from 'layout/services/ai-chat';

const AI_BACKEND_URL = erdaEnv.AI_BACKEND_URL;
const AI_PROXY_CLIENT_AK = erdaEnv.AI_PROXY_CLIENT_AK;
const DICE_CLUSTER_NAME = erdaEnv.DICE_CLUSTER_NAME;

const Chat = () => {
  const [currentChat, setCurrentChat] = useState<string>();
  const { id: userId, nick: name, phone, email } = userStore.getState((s) => s.loginUser);
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const [list, setList] = useState<Array<{ time: string; content: string; role: string }>>([]);

  useEffect(() => {
    if (currentChat) {
      setList([]);
      loadLogs(currentChat);
    }
  }, [currentChat]);

  const loadLogs = async (chatId: string) => {
    const res = await getLogs({ userId, name, phone, email, id: chatId });
    if (res.success) {
      const {
        data: { list: _list },
      } = res;
      const messages = [] as Array<{ time: string; content: string; role: string }>;
      _list.reverse().forEach((item) => {
        messages.push({ role: 'user', content: item.prompt, time: moment(item.requestAt).format('YYYY-MM-DD') });
        messages.push({
          role: 'assistant',
          content: item.completion,
          time: moment(item.responseAt).format('YYYY-MM-DD'),
        });
      });
      setList(messages);
    }
  };

  const reset = (id: string) => {
    if (id === currentChat) {
      setList([]);
    }
  };

  return (
    <div className="flex h-full">
      <div className="mr-2 bg-white rounded-[5px]">
        <Sidebar onChange={setCurrentChat} resetMessage={reset} />
      </div>

      <div className="flex-1 rounded-[5px]">
        <ChatProvider>
          <TChart
            getMsgfetchConfig={{
              path: `${AI_BACKEND_URL}/v1/chat/completions`,
              getBody: (messages) => ({
                // model: 'gpt-35-turbo-16k',
                messages: [
                  {
                    role: 'user',
                    content: messages[messages?.length - 1].content,
                  },
                ],
                stream: true,
              }),
              headers: {
                'X-Ai-Proxy-User-Id': encode(userId),
                'X-Ai-Proxy-Username': encode(name),
                'X-Ai-Proxy-Phone': encode(phone),
                'X-AI-Proxy-Email': encode(email),
                'X-Ai-Proxy-Org-Id': encode(`${orgId}`),
                'X-AI-Proxy-Session-Id': `${currentChat}`,
                'X-AI-Proxy-Prompt-Id': '',
                Authorization: AI_PROXY_CLIENT_AK,
                ...(DICE_CLUSTER_NAME ? { 'X-Ai-Proxy-Source': `web_chat___${DICE_CLUSTER_NAME}` } : {}),
              },
              formatResult: (msgData) => {
                const { data } = msgData;
                if (data !== '[DONE]') {
                  const dataObj = JSON.parse(data);
                  const { choices } = dataObj;
                  const { delta } = choices[0] || {};
                  const { content } = delta || {};
                  return { data: content || '' };
                }
                return { data: '' };
              },
            }}
            toolbarConfig={{
              historyConfig: { show: false },
              promptConfig: { show: false },
              chatConfig: { show: false },
            }}
            messages={list}
          />
        </ChatProvider>
      </div>
    </div>
  );
};

export default Chat;
