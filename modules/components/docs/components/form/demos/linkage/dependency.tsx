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
import { InputNumber, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, onFieldValueChange, createFields } = Form;

const form = createForm({
  effects: () => {
    onFieldValueChange('price', (field) => {
      const price = field.value;
      const count = field.query('count').value();
      form.setFieldState('sum', (state) => {
        state.value = price * count;
      });
    });
    onFieldValueChange('count', (field) => {
      const count = field.value;
      const price = field.query('price').value();
      form.setFieldState('sum', (state) => {
        state.value = price * count;
      });
    });
  },
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: InputNumber,
      title: '单价',
      name: 'price',
      customProps: {
        placeholder: '请输入单价',
        min: 0,
      },
    },
    {
      component: InputNumber,
      title: '数量',
      name: 'count',
      customProps: {
        placeholder: '请输入数量',
        min: 0,
      },
    },
    {
      component: InputNumber,
      title: '总价',
      name: 'sum',
      customProps: {
        disabled: true,
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
