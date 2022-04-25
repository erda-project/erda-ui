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
    {
      component: Input,
      title: '昵称',
      name: 'nickName',
    },
    {
      component: Input,
      title: '年龄',
      name: 'age',
    },
    {
      component: Input,
      title: '性别',
      name: 'gender',
    },
  ]);

  const getValue = () => {
    const state = form.getState();
    setData(JSON.stringify(state.values, null, 2));
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
      <Form style={{ width: '70%' }} form={form} fieldsConfig={fieldsConfig} gridConfig={{ maxColumns: 2 }} />
      <Button type="primary" onClick={() => getValue()}>
        提交
      </Button>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
