import React from 'react';
import { Button, Space, Input } from 'antd';
import { Form, Schema, ArrayFieldType } from '@erda-ui/components';

const { createForm, observer, RecursionField, useFieldSchema, useField, createFields } = Form;

const form = createForm();

interface DataType {
  name: string;
  age: string;
}

const ArrayItems = observer((props: { value: DataType[] }) => {
  const schema = useFieldSchema();
  const field = useField<ArrayFieldType>();
  return (
    <div>
      {props.value?.map((_item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} style={{ marginBottom: 10 }}>
          <Space>
            <RecursionField schema={schema.items as Schema} name={index} />
            <Button
              onClick={() => {
                field.remove(index);
              }}
              style={{ marginBottom: '22px' }}
            >
              Remove
            </Button>
            <Button
              onClick={() => {
                field.moveUp(index);
              }}
              style={{ marginBottom: '22px' }}
            >
              Up
            </Button>
            <Button
              onClick={() => {
                field.moveDown(index);
              }}
              style={{ marginBottom: '22px' }}
            >
              Down
            </Button>
          </Space>
        </div>
      ))}
      <Button
        onClick={() => {
          field.push({});
        }}
      >
        Add
      </Button>
    </div>
  );
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      type: 'array',
      component: ArrayItems,
      name: 'arrayField',
      layoutConfig: { layout: 'inline' },
      gridConfig: { minColumns: 2 },
      items: [
        {
          component: Input,
          name: 'name',
          required: true,
        },
        {
          component: Input,
          name: 'age',
        },
      ],
    },
  ]);

  const getValue = async () => {
    const state = form.getState();
    await form.validate();
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
