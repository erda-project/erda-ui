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
import { Menu, Button, Modal, Form, Input, InputNumber, message, Radio, Tooltip, Popover } from 'antd';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import userStore from 'app/user/stores';
import {
  getSessions,
  addSessions,
  resetSession,
  deleteMessage,
  archiveMessage,
  updateSessions,
} from 'layout/services/ai-chat';

interface Session {
  key: string;
  label: string;
  clientId: string;
  name: string;
  numOfCtxMsg: number;
  temperature: number;
  topic: string;
  isArchived: boolean;
}

const Sidebar = ({
  onChange,
  resetMessage,
}: {
  onChange: (current: string) => void;
  resetMessage: (id: string) => void;
}) => {
  const [form] = Form.useForm();
  const { id: userId, nick: name, phone, email } = userStore.getState((s) => s.loginUser);
  const [items, setItems] = useState<Session[]>([]);
  const [current, setCurrent] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [editData, setEditData] = useState<Session>({} as Session);

  const newChat = async () => {
    const params = form.getFieldsValue();
    const url = editData.key ? updateSessions : addSessions;
    const res = await url({
      userId,
      userName: name,
      phone,
      email,
      id: editData.key,
      clientId: editData.clientId,
      ...params,
    });

    if (res.success) {
      message.success(
        i18n.t('{action} successfully', { action: editData.key ? i18n.t('default:Edit') : i18n.t('dop:Add') }),
      );
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
      setItems(res.data?.list?.map((item) => ({ key: item.id, label: item.name, ...item })));
      const first = res.data.list.filter((item) => !item.isArchived)?.[0] || {};
      first && setCurrent(first.id);
    }
  };

  const reset = async (id: string) => {
    if (!id) {
      return;
    }
    const res = await resetSession({ userId, name, phone, email, id });

    if (res.success) {
      resetMessage(id);
      message.success(i18n.t('{action} successfully', { action: i18n.t('reset') }));
    }
  };

  const deleteItem = async (id: string) => {
    if (!id) {
      return;
    }
    const res = await deleteMessage({ userId, name, phone, email, id });

    if (res.success) {
      loadSessions();
      message.success(i18n.t('{action} successfully', { action: i18n.t('default:Delete') }));
    }
  };

  const archive = async (id: string) => {
    if (!id) {
      return;
    }
    const res = await archiveMessage({ userId, name, phone, email, id });

    if (res.success) {
      loadSessions();
      message.success(i18n.t('{action} successfully', { action: i18n.t('default:Archive') }));
    }
  };

  const edit = (item: Session) => {
    const { name, numOfCtxMsg, temperature, topic } = item;
    setVisible(true);
    setEditData(item);
    form.setFieldsValue({ name, numOfCtxMsg, temperature, topic });
  };

  const renderMenuItem = (item: Session) => {
    return (
      <Menu.Item key={item.key} className="group pl-4">
        <Popover
          content={
            <div>
              <Menu>
                {!item.isArchived && (
                  <Menu.Item
                    onClick={() => {
                      Modal.confirm({
                        title: i18n.t('dop:confirm to archive?'),
                        onOk() {
                          archive(item.key);
                        },
                        onCancel() {
                          console.log('Cancel');
                        },
                        zIndex: 1040,
                      });
                    }}
                  >
                    {i18n.t('default:Archive')}
                  </Menu.Item>
                )}

                <Menu.Item
                  onClick={() => {
                    Modal.confirm({
                      title: i18n.t('cmp:are you sure you want to reset?'),
                      onOk() {
                        reset(item.key);
                      },
                      onCancel() {
                        console.log('Cancel');
                      },
                      zIndex: 1040,
                    });
                  }}
                >
                  {i18n.t('default:reset')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={() => {
                    Modal.confirm({
                      title: i18n.t('dop:confirm to delete?'),
                      onOk() {
                        deleteItem(item.key);
                      },
                      onCancel() {
                        console.log('Cancel');
                      },
                      zIndex: 1040,
                    });
                  }}
                >
                  {i18n.t('default:Delete')}
                </Menu.Item>
              </Menu>
            </div>
          }
          trigger="contextMenu"
          placement="bottomRight"
          overlayClassName="no-border-right-menu"
        >
          <div className="flex items-center">
            <span className="flex-1">{item.label}</span>
            <span className="flex-none hidden group-hover:inline h-[20px] leading-[20px] flex items-center">
              <Tooltip title={i18n.t('default:Edit')}>
                <ErdaIcon
                  type="edit-unselected"
                  className="text-xl cursor-pointer mr-1 text-purple hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    edit(item);
                  }}
                />
              </Tooltip>
            </span>
          </div>
        </Popover>
      </Menu.Item>
    );
  };

  return (
    <div className="ai-chat-sidebar w-[256px] h-full flex-none flex flex-col border-right p-2">
      <div className="flex items-center mb-2 pl-2">
        <div className="flex-1 font-medium">{i18n.t('dop:session list')}</div>
        <Button size="small" className="flex items-center" type="primary" onClick={() => setVisible(true)}>
          <ErdaIcon type="add-one" className="mr-1" />
          {i18n.t('dop:Add')}
        </Button>
      </div>
      <Menu
        selectedKeys={(current && [`${current}`]) || []}
        mode="inline"
        className="flex-1 bg-white"
        onSelect={({ key }) => {
          setCurrent(key);
        }}
        defaultOpenKeys={['session', 'archived']}
      >
        <Menu.SubMenu
          key="session"
          title={
            <div className="flex items-center">
              <ErdaIcon type="session" className="mr-1" />
              {i18n.t('dop:session')}
            </div>
          }
        >
          {items.filter((item) => !item.isArchived).map((item) => renderMenuItem(item))}
        </Menu.SubMenu>
        <Menu.SubMenu
          key="archived"
          title={
            <div className="flex items-center">
              <ErdaIcon type="archived" className="mr-1" />
              {i18n.t('default:Archived')}
            </div>
          }
        >
          {items.filter((item) => item.isArchived).map((item) => renderMenuItem(item))}
        </Menu.SubMenu>
      </Menu>
      <Modal
        title={`${editData.key ? i18n.t('default:Edit') : i18n.t('dop:Add')}${i18n.t('dop:session')}`}
        visible={visible}
        onCancel={() => {
          form.resetFields();
          setEditData({} as Session);
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
            name="numOfCtxMsg"
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
