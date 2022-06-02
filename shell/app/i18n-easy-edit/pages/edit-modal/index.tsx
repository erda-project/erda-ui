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
import { Modal } from 'antd';
import { Form, Input } from 'antd';
import { ErdaIcon } from 'common';
import store from '../../store';
import { setTrans2LocalStorage, getEditCount } from '../../utils';
import { getCurrentLocale } from 'core/i18n';

interface IProps {
  setEditCount: (value: number) => void;
}

const editTitle = (
  <div className="i18n-model flex flex-row justify-start items-center">
    <ErdaIcon type="edit" size="16" />
    <span className="pl-1">Edit i18n translation</span>
  </div>
);

const EditModal = (props: IProps) => {
  // form
  const [form] = Form.useForm();
  const { ns, key, en, zh, isVisible, setTextCb } = store.useStore((s) => s);
  const prevEn = en;
  const prevZh = zh;
  const handleOk = () => {
    form.validateFields().then(({ ns, key, en, zh }) => {
      // only changed the translation can save
      if (prevEn !== en || prevZh !== zh) {
        setTrans2LocalStorage(ns, key, en, 'en');
        setTrans2LocalStorage(ns, key, zh, 'zh');
        store.reducers.resetState(ns, key, en, zh);
        setTextCb && setTextCb(getCurrentLocale().key === 'en' ? en : zh);
        props.setEditCount(getEditCount());
      }
      store.reducers.closeModal();
    });
  };
  const handleCancel = () => {
    store.reducers.closeModal();
  };
  React.useEffect(() => {
    // open model, reset the field value
    if (isVisible) {
      form.setFieldsValue({ ns, key, en, zh });
    }
  }, [isVisible]);

  return (
    <>
      <Modal
        title={editTitle}
        visible={isVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
      >
        <div className="i18n-form">
          <Form labelCol={{ span: 2 }} form={form} name="control-hooks">
            <div className="flex flex-row justify-start">
              <span className="flex-1">
                <Form.Item label="ns" name="ns" labelCol={{ span: 6 }}>
                  <span>{ns}</span>
                </Form.Item>
              </span>
              <span className="flex-2">
                <Form.Item label="key" name="key" labelCol={{ span: 6 }}>
                  <span>{key}</span>
                </Form.Item>
              </span>
            </div>
            <Form.Item name="en" label="en" validateTrigger={'onBlur'} rules={[{ required: true }]}>
              <Input.TextArea autoSize />
            </Form.Item>
            <Form.Item name="zh" label="zh" validateTrigger={'onBlur'} rules={[{ required: true }]}>
              <Input.TextArea autoSize />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}></Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default EditModal;
