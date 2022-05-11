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
import { Select, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, onFieldValueChange, createFields, isField, isObjectField, isArrayField } = Form;

const form = createForm({
  effects: () => {
    onFieldValueChange('country', (field) => {
      field.loading = true;
      setTimeout(() => {
        field.loading = false;
        const provinceField = form.query('province').take();
        let options = [];
        if (field.value === 'usa') {
          options = [
            { value: 'ma', label: '马萨诸塞' },
            { value: 'Ny', label: '纽约' },
          ];
        } else {
          options = [
            { value: 'zj', label: '浙江' },
            { value: 'tw', label: '台湾' },
          ];
        }
        provinceField.setComponentProps({ options });
        if (isField(provinceField) && !isArrayField(provinceField) && !isObjectField(provinceField)) {
          provinceField.setValue(options[0].value);
        }
      }, 1000);
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
