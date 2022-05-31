import React from 'react';
import { Modal } from 'antd';
import { Form, Input } from 'antd';
import FixedWidget from './fixed-widget';
import { ErdaIcon } from 'common';
import store, { I18nData } from '../store';
import { setTrans2LocalStorage, getEditCount } from '../utils';
import { getCurrentLocale } from 'core/i18n';

const App: React.FC = () => {
  let editCount = getEditCount();

  // form
  const [form] = Form.useForm();
  const { ns, key, en, zh, isVisible, setTextCb } = store.useStore((s) => s);
  const prevEn = en;
  const prevZh = zh;
  const handleOk = () => {
    form.validateFields().then(({ ns, key, en, zh }: I18nData) => {
      // 翻译修改后，才会保存
      if (prevEn !== en || prevZh !== zh) {
        setTrans2LocalStorage(ns, key, en, 'en');
        setTrans2LocalStorage(ns, key, zh, 'zh');
        store.reducers.initState(ns, key, en, zh);
        setTextCb(getCurrentLocale().key === 'en' ? en : zh);
        editCount = getEditCount();
      }
      store.reducers.closeModel();
    });
  };
  const handleCancel = () => {
    store.reducers.closeModel();
  };
  React.useEffect(() => {
    // 打开 model，重新赋值
    if (isVisible) {
      form.setFieldsValue({ ns, key, en, zh });
    }
  }, [isVisible]);

  const editTitle = (
    <div className="i18n-model flex flex-row justify-start items-center">
      <ErdaIcon type="edit" size="16" />
      <span className="pl-1">Edit i18n translation</span>
    </div>
  );
  return (
    <>
      <Modal
        className="i18n-modal"
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
      <FixedWidget editCount={editCount} />
    </>
  );
};

export default App;
