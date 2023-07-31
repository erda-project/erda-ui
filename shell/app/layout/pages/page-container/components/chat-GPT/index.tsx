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
import { Modal } from 'antd';
import { Icon as CustomIcon } from 'common';
import Sidebar from './sidebar';
import Chat from './chat';

const ChatGPT = () => {
  const [visible, setVisible] = useState(false);
  const [currentChat, setCurrentChat] = useState<number>();

  return (
    <>
      <div
        className="fixed bottom-16 right-[8px] shadow-card p-2 rounded-[10px] bg-white cursor-pointer w-[44px] text-center"
        onClick={() => setVisible(true)}
      >
        <CustomIcon type="android" className="text-xl mr-0" />
      </div>
      <Modal visible={visible} width="60%" onCancel={() => setVisible(false)} footer={false} bodyStyle={{ padding: 0 }}>
        <div className="flex" style={{ height: '80vh' }}>
          <Sidebar onChange={setCurrentChat} />
          <Chat id={currentChat} />
        </div>
      </Modal>
    </>
  );
};

export default ChatGPT;
