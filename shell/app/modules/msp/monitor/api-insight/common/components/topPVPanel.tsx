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
import { Tooltip } from 'antd';
import { get } from 'lodash';
import { Copy } from 'common';
import ErdaTable from 'common/components/table';

export const topPVPanel = ({ data, reload }: { data: object; reload: Function }) => {
  const list = get(data, 'list');
  const columns = [
    {
      title: 'API Path',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => (
        <Tooltip title={value}>
          <Copy copyText={value}>{value}</Copy>
        </Tooltip>
      ),
    },
    {
      title: 'PV',
      dataIndex: 'pv',
      width: 180,
    },
  ];
  // only show 10 pieces of data，not need pagination
  return <ErdaTable columns={columns} dataSource={list} pagination={false} onReload={reload} />;
};
