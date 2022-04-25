import React from 'react';
import { Select, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, takeAsyncDataSource, createFields } = Form;

const form = createForm({
  effects: () => {
    takeAsyncDataSource('province', async (field) => {
      const country = field.query('country').value();
      if (!country) return [];
      const promise = new Promise<Array<{ value: string; label: string }>>((resolve) => {
        setTimeout(() => {
          let options = [];
          if (country === 'usa') {
            options = [
              { value: 'ma', label: '马萨诸塞' },
              { value: 'ny', label: '纽约' },
            ];
          } else {
            options = [
              { value: 'zj', label: '浙江' },
              { value: 'tw', label: '台湾' },
            ];
          }
          resolve(options);
        }, 1000);
      });
      promise.then((list) => {
        if (list?.length) {
          field.setValue(list[0].value);
        }
      });
      return promise;
    });
  },
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: Select,
      title: '国家',
      name: 'country',
      customProps: {
        options: [
          { value: 'china', label: '中国' },
          { value: 'usa', label: '美国' },
        ],
      },
    },
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
