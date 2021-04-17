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
import { Table } from 'app/nusi';
import { get } from 'lodash';
import { ColumnProps } from 'core/common/interface';
import moment from 'moment';
import i18n from 'i18n';

interface IData{
  [pro: string]: any;
  name: string;
  time?: string;
  max?: string;
  min?: string;
}

const SlowTrackPanel = ({ data }: {data: object}) => {
  const list = get(data, 'list') || [];
  const columns: Array<ColumnProps<IData>> = [
    {
      title: i18n.t('microService:domain name'),
      dataIndex: 'name',
      key: 'name',
      width: 320,
    },
    {
      title: i18n.t('microService:time'),
      dataIndex: 'time',
      key: 'time',
      width: 280,
      render: (value: string) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: `${i18n.t('microService:maximum time consuming')}(ms)`,
      dataIndex: 'max',
      key: 'max',
      width: 140,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: `${i18n.t('microService:minimum time consuming')}(ms)`,
      dataIndex: 'min',
      key: 'min',
      width: 140,
      render: (value: number) => value.toFixed(2),
    },
  ];
  return <Table rowKey={(record: IData, i) => (i + record.name)} columns={columns} dataSource={list} />;
};

export default SlowTrackPanel;
