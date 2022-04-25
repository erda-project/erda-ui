import React from 'react';
import { Select, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, takeAsyncDataSource, createFields } = Form;

const form = createForm({
  effects: () => {
    takeAsyncDataSource<Array<{ label: string; value: string }>>(
      'province',
      () =>
        new Promise<Array<{ value: string; label: string }>>((resolve) => {
          resolve([
            {
              value: 'zhejiang',
              label: '浙江',
            },
            {
              value: 'taiwan',
              label: '台湾',
            },
          ]);
        }),
      'options',
    );
  },
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: Select,
      title: '省份',
      name: 'province',
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
      <Form style={{ width: '50%' }} form={form} fieldsConfig={fieldsConfig} />
      <Button type="primary" onClick={() => getValue()}>
        提交
      </Button>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
