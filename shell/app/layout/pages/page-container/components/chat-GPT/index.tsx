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

import React, { useState } from 'react';
import { encode } from 'js-base64';
import { Modal } from 'antd';
import { ErdaIcon as CustomIcon } from 'common';
import userStore from 'app/user/stores';
import orgStore from 'app/org-home/stores/org';
import Sidebar from './sidebar';
import { ChatProvider, Chat as TChart } from '@terminus/ai-components';
import { erdaEnv } from 'common/constants';

const AI_BACKEND_URL = erdaEnv.AI_BACKEND_URL || 'https://ai-proxy.daily.terminus.io';

const ChatGPT = () => {
  const [visible, setVisible] = useState(false);
  const [currentChat, setCurrentChat] = useState<number>();
  const { id: userId, nick: name, phone, email } = userStore.getState((s) => s.loginUser);
  const orgId = orgStore.useStore((s) => s.currentOrg.id);

  return (
    <>
      <div
        className="fixed bottom-16 right-[8px] shadow-card p-2 rounded-[10px] bg-white cursor-pointer w-[40px] text-center"
        onClick={() => setVisible(true)}
      >
        <CustomIcon type="ai" className="text-xl mr-0" />
      </div>
      <Modal visible={visible} width="60%" onCancel={() => setVisible(false)} footer={false} bodyStyle={{ padding: 0 }}>
        <div className="flex" style={{ height: '80vh' }}>
          <Sidebar onChange={setCurrentChat} />

          <div className="flex-1">
            <ChatProvider>
              <TChart
                getMsgfetchConfig={{
                  path: `${AI_BACKEND_URL}/v1/chat/completions`,
                  getBody: (messages) => ({
                    model: 'gpt-35-turbo-16k',
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
                    'X-Ai-Proxy-Source': 'erda.cloud',
                    'X-Ai-Proxy-Org-Id': encode(`${orgId}`),
                    'X-AI-Proxy-SessionId': `${currentChat}`,
                  },
                  formatResult: (msgData) => {
                    const { data } = msgData;
                    if (data !== '[DONE]') {
                      const dataObj = JSON.parse(data);
                      const { choices } = dataObj;
                      const { delta } = choices[0];
                      const { content } = delta;
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
              />
            </ChatProvider>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChatGPT;
