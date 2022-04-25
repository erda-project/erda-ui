import React from 'react';
import { Input, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, onFieldValueChange, createFields } = Form;

const form = createForm({
  effects: () => {
    onFieldValueChange('color', (field) => {
      field.setComponentProps({
        style: {
          backgroundColor: field.value,
        },
      });
    });
  },
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: Input,
      title: '颜色',
      defaultValue: '#6a549e',
      name: 'color',
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
