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

import moment from 'moment';
import React from 'react';
import i18n from 'i18n';
import MoreOperation from './more-operation';
import { ColumnProps } from 'interface/common';
import { UserInfo } from 'common';

export const commonColumns: Array<ColumnProps<TEST_CASE.CaseTableRecord>> = [
  {
    title: '',
    dataIndex: 'checkbox',
    key: 'checkbox',
    width: 40,
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70,
    sorter: true,
  },
  {
    title: i18n.t('project:use case title'),
    dataIndex: 'name',
    key: 'name',
    width: 250,
  },
  {
    title: i18n.t('project:priority'),
    dataIndex: 'priority',
    key: 'priority',
    width: 85,
    sorter: true,
  },
  {
    title: i18n.t('project:updater'),
    dataIndex: 'updaterID',
    key: 'updaterID',
    width: 85,
    tip: true,
    sorter: true,
    render: (updatedID: any) => updatedID && <UserInfo id={updatedID} render={data => data.nick || data.name} />,
  },
  {
    title: i18n.t('project:updated'),
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 190,
    sorter: true,
    render: (updatedAt: any) => updatedAt && moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
  },
];

export const columns: Array<ColumnProps<TEST_CASE.CaseTableRecord>> = [
  ...commonColumns,
  {
    title: i18n.t('project:operation'),
    dataIndex: 'operation',
    key: 'operation',
    className: 'operation',
    width: 140,
    fixed: 'right',
    render: (_text: any, record: TEST_CASE.CaseTableRecord) => record.id && <MoreOperation record={record} />,
  },
];
