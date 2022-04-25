// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

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
