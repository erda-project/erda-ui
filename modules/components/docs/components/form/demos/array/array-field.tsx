import React from 'react';
import { Input, Space, Button } from 'antd';
import { Form, ArrayFieldType } from '@erda-ui/components';

const { createForm, observer, Field, useField, createFields } = Form;

const form = createForm();

const ArrayComponent = observer(() => {
  const field = useField<ArrayFieldType>();
  return (
    <>
      <div>
        {field.value?.map((_item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} style={{ display: 'flex-block', marginBottom: 10 }}>
            <Space>
              <Field name={index} component={[Input]} />
              <Button
                onClick={() => {
                  field.remove(index);
                }}
              >
                Remove
              </Button>
              <Button
                onClick={() => {
                  field.moveUp(index);
                }}
              >
                Move Up
              </Button>
              <Button
                onClick={() => {
                  field.moveDown(index);
                }}
              >
                Move Down
              </Button>
            </Space>
          </div>
        ))}
      </div>
      <Button
        onClick={() => {
          field.push('');
        }}
      >
        Add
      </Button>
    </>
  );
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      type: 'array',
      component: ArrayComponent,
      name: 'arrayField',
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
      <Form style={{ width: '80%' }} form={form} fieldsConfig={fieldsConfig} />
      <Button type="primary" onClick={() => getValue()}>
        提交
      </Button>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
