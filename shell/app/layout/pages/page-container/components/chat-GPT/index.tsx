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
import { Modal, Tabs } from 'antd';
import i18n from 'i18n';
import { ErdaIcon as CustomIcon } from 'common';
import routeInfoStore from 'core/stores/route';
import Chat from './chat';
import FunctionalTestCases from './functional-test-cases';

import './index.scss';

const ChatGPT = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-16 right-[8px] shadow-card p-2 rounded-[10px] bg-white cursor-pointer w-[40px] text-center z-[2050]"
        onClick={() => setVisible(true)}
      >
        <CustomIcon type="ai" className="text-xl mr-0" />
      </div>
      <Modal
        title={
          <div className="flex-1 font-medium flex items-center">
            <CustomIcon type="ErdaAI" className="text-xl mr-2" />
            Erda Assistant
          </div>
        }
        visible={visible}
        width="80%"
        onCancel={() => setVisible(false)}
        footer={false}
        bodyStyle={{ padding: 0 }}
        className="ai-chat-modal"
        destroyOnClose
      >
        <div className="p-2" style={{ height: '80vh' }}>
          <Tabs className="h-full">
            <Tabs.TabPane tab={i18n.t('common:chat')} key="chat">
              <Chat />
            </Tabs.TabPane>
            {(projectId && (
              <Tabs.TabPane tab={i18n.t('common:functional test cases')} key="functional test">
                <FunctionalTestCases />
              </Tabs.TabPane>
            )) ||
              ''}
          </Tabs>
        </div>
      </Modal>
    </>
  );
};

export default ChatGPT;
