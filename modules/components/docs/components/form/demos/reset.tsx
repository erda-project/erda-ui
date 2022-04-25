import React from 'react';
import { Input, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, createFields } = Form;

const form = createForm();

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: Input,
      title: '姓名',
      name: 'username',
      customProps: {
        placeholder: '请输入姓名',
      },
    },
  ]);

  const getValue = () => {
    const state = form.getState();
    setData(JSON.stringify(state.values, null, 2));
  };

  const resetForm = () => {
    form.reset();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#eee',
        padding: '40px 0',
      }}
    >
      <Form style={{ width: '50%' }} form={form} fieldsConfig={fieldsConfig} />
      <div>
        <Button style={{ marginRight: '12px' }} type="primary" onClick={() => getValue()}>
          提交
        </Button>
        <Button onClick={() => resetForm()}>重置</Button>
      </div>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
