import React from 'react';
import { Input, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, createFields, createTabsField } = Form;

const form = createForm();

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: Input,
      title: '基本信息',
      name: 'info',
      customProps: {
        placeholder: '请输入基本信息',
      },
    },
    createTabsField({
      name: 'tabsField',
      customProps: {
        tabPosition: 'left',
      },
      tabs: [
        {
          tab: 'Tab1',
          fields: createFields([
            {
              component: Input,
              title: '姓名',
              name: 'name',
              customProps: {
                placeholder: '请输入姓名',
              },
            },
            {
              component: Input,
              title: '年龄',
              name: 'age',
              customProps: {
                placeholder: '请输入年龄',
              },
            },
          ]),
        },
        {
          tab: 'Tab2',
          fields: createFields([
            {
              component: Input,
              title: '性别',
              name: 'sex',
            },
            {
              component: Input,
              title: '学历',
              name: 'education',
            },
          ]),
        },
      ],
    }),
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
