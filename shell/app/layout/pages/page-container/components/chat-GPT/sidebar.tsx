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

import React, { useEffect, useState } from 'react';
import { Menu, Button, Modal, Form, Input, InputNumber, message, Tooltip, Radio } from 'antd';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import userStore from 'app/user/stores';
import { getSessions, addSessions } from 'layout/services/ai-chat';

const Sidebar = ({ onChange }: { onChange: (current: string) => void }) => {
  const [form] = Form.useForm();
  const { id: userId, nick: name, phone, email } = userStore.getState((s) => s.loginUser);
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
    <div className="w-[256px] flex-none flex flex-col border-right">
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
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item rules={[{ required: true }]} label={i18n.t('dop:session name')} name="name">
            <Input />
          </Form.Item>
          <Form.Item rules={[{ required: true }]} label={i18n.t('dop:session topic')} name="topic">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label={i18n.t('dop:context length')}
            name="contextLength"
            initialValue={10}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label={i18n.t('dop:answer content')}
            name="temperature"
            initialValue={1}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={2}>{i18n.t('dop:more creative')}</Radio>
              <Radio value={1}>{i18n.t('dop:more balanced')}</Radio>
              <Radio value={0}>{i18n.t('dop:more accurate')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sidebar;
