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
import { Table, Form as NForm } from 'app/nusi';
import { getLabel } from 'app/configForm/nusi-form/form-items/common';

const FormItem = NForm.Item;

export default () =>
  React.memo(({ fieldConfig }: any) => {
    const { visible, value, valid, required, wrapperProps, label, labelTip } = fieldConfig;
    const columns = [
      {
        title: i18n.t('key'),
        dataIndex: 'key',
      },
      {
        title: i18n.t('value'),
        dataIndex: 'value',
      },
      {
        title: i18n.t('org:alias'),
        dataIndex: 'name',
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
        <Table bordered rowKey="uniId" dataSource={value} columns={columns} scroll={{ x: '100%' }} />
      </FormItem>
    );
  });
