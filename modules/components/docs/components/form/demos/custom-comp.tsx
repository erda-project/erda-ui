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
import { Input, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, createFields } = Form;

const form = createForm();

const CustomComp = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    console.log('onMount Custom Component');
  }, []);

  React.useEffect(() => {
    setCount(value?.length);
  }, [value]);

  return (
    <div style={{ display: 'flex', paddingLeft: '16px' }}>
      <div>{count}</div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      title: 'Input',
      component: Input,
      name: 'input',
    },
    {
      title: '自定义组件',
      component: CustomComp,
      name: 'customValue',
    },
    {
      title: '自定义组件2',
      component: CustomComp,
      name: 'customValue2',
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
      <Form style={{ width: '70%' }} form={form} fieldsConfig={fieldsConfig} />
      <Button type="primary" onClick={() => getValue()}>
        提交
      </Button>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
