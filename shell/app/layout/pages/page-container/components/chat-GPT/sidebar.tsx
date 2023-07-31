import React, { useEffect, useState } from 'react';
import { Menu, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { ErdaIcon } from 'common';
import userStore from 'app/user/stores';
import { getSessions, addSessions } from 'layout/services/ai-chat';

const Sidebar = ({ onChange }: { onChange: (current: string) => void }) => {
  const [form] = Form.useForm();
  const { id: userId, name, phone, email } = userStore.getState((s) => s.loginUser);
  const [items, setItems] = useState<Array<{ key: string; label: string }>>([]);
  const [current, setCurrent] = useState<string>();
  const [visible, setVisible] = useState(false);

  const newChat = async () => {
    const params = form.getFieldsValue();
    const res = await addSessions({ userId, userName: name, phone, email, ...params });

    if (res.success) {
      message.success('新增成功！');
      setVisible(false);
      loadSessions();
    }
  };

  useEffect(() => {
    current && onChange(current);
  }, [current]);

  useEffect(() => {
    userId && loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    const res = await getSessions({ userId, name, phone, email });
    if (res.success) {
      setItems(res.data?.list?.map((item) => ({ key: item.id, label: item.name })));
      res.data?.list?.[0] && setCurrent(res.data.list[0].id);
    }
  };

  return (
    <div className="w-[256px] flex flex-col border-right">
      <div className="flex items-center pl-6 pr-2">
        <div className="flex-1 text-xl font-medium">Erda Assistant</div>
        <Button size="small" className="m-2 flex items-center" type="primary" onClick={() => setVisible(true)}>
          <ErdaIcon type="plus" />
        </Button>
      </div>
      <Menu
        selectedKeys={(current && [`${current}`]) || []}
        mode="inline"
        className="flex-1"
        onSelect={({ key }) => {
          setCurrent(key);
        }}
      >
        {items.map((item) => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
      <Modal
        title="新增会话"
        visible={visible}
        onCancel={() => {
          form.resetFields();
          setVisible(false);
        }}
        onOk={newChat}
      >
        <Form form={form}>
          <Form.Item label={<span className="w-[80px]">会话名称</span>} name="name">
            <Input />
          </Form.Item>
          <Form.Item label={<span className="w-[80px]">会话主题</span>} name="topic">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label={<span className="w-[80px]">上下文长度</span>} name="contextLength" initialValue={10}>
            <InputNumber />
          </Form.Item>
          <Form.Item label={<span className="w-[80px]">温度</span>} name="temperature" initialValue={0.7}>
            <InputNumber min={0} max={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sidebar;
