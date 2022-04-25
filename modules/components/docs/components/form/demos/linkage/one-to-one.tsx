import React from 'react';
import { InputNumber, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, onFieldValueChange, createFields } = Form;

const form = createForm({
  effects: () => {
    onFieldValueChange('age', (field) => {
      if (field.value >= 100) {
        form.setFieldState('nextAge', (state) => {
          state.display = 'none';
        });
      } else {
        form.setFieldState('nextAge', (state) => {
          state.value = +field.value + 1;
          state.display = 'visible';
        });
      }
    });
  },
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: InputNumber,
      title: '年龄',
      name: 'age',
      customProps: {
        placeholder: '请输入年龄',
        min: 0,
      },
      wrapperProps: {
        tooltip: <div>输入100，下面的字段隐藏</div>,
      },
    },
    {
      component: InputNumber,
      title: '明年年龄',
      name: 'nextAge',
      customProps: {
        placeholder: '请输入年龄',
        min: 0,
      },
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
