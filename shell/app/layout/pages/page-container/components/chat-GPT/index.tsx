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
        className="fixed bottom-4 right-4 shadow-card p-2 rounded-full bg-white cursor-pointer w-[44px]"
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
