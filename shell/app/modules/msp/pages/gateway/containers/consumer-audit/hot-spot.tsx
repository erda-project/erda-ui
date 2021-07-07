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
import { Table, Tooltip } from 'app/nusi';
import { get } from 'lodash';
import { Copy } from 'common';
import i18n from 'i18n';

export const HotSpotPanel = ({ data }: { data: object }) => {
  const list = get(data, 'results');
  const columns = [
    {
      title: 'API',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => (
        <Tooltip title={value}>
          <Copy copyText={value}>{value}</Copy>
        </Tooltip>
      ),
    },
    {
      title: i18n.t('msp:successful call amount'),
      dataIndex: 'data',
    },
  ];

  return <Table columns={columns} dataSource={list} scroll={{ x: '100%' }} />;
};
