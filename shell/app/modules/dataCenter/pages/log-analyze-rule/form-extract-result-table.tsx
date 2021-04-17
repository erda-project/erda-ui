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

import * as React from 'react';
import i18n from 'i18n';
import { map } from 'lodash';
import { Table, Form as NForm, Input, Select } from 'app/nusi';
import { getLabel, noop } from 'app/configForm/nusi-form/form-items/common';

const FormItem = NForm.Item;

const TYPES = ['string', 'number'];

export default () => React.memo(({ fieldConfig }: any) => {
  const {
    value,
    visible,
    valid,
    componentProps,
    required,
    wrapperProps,
    label,
    labelTip,
  } = fieldConfig;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: i18n.t('key'),
      dataIndex: 'key',
      render: (val: string, { uniId }: any) => (
        <Input
          defaultValue={val}
          maxLength={50}
          onBlur={(e: any) => (componentProps.onChange || noop)(value, uniId, { key: 'key', value: e.target.value })}
        />
      ),
    },
    {
      title: i18n.t('type'),
      dataIndex: 'type',
      render: (val: string, { uniId }: any) => (
        <Select
          defaultValue={val}
          onSelect={(v: any) => (componentProps.onChange || noop)(value, uniId, { key: 'type', value: v })}
        >
          {map(TYPES, type => <Select.Option key={type} value={type}>{type}</Select.Option>)}
        </Select>
      ),
    },
    {
      title: i18n.t('org:alias'),
      dataIndex: 'name',
      render: (val: string, { uniId }: any) => (
        <Input
          defaultValue={val}
          maxLength={50}
          onBlur={(e: any) => (componentProps.onChange || noop)(value, uniId, { key: 'name', value: e.target.value })}
        />
      ),
    },
  ];

  return (
    <FormItem
      colon
      label={getLabel(label, labelTip)}
      className={visible ? '' : 'hide'}
      validateStatus={valid[0]}
      help={valid[1]}
      required={required}
      {...wrapperProps}
    >
      <Table
        bordered
        rowKey="uniId"
        dataSource={value}
        columns={columns}
      />
    </FormItem>
  );
});
