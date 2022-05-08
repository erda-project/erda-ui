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
import { Table } from '@erda-ui/components';

const dataSource = [
  {
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
  },
];

export default () => {
  const [data, setData] = React.useState(dataSource);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
  ];

  const reload = (_pageNo: number) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const newData = data.map((item) => ({ ...item, name: item.name + 1 }));
    setData(newData);
  };

  return (
    <Table
      rowKey="name"
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 10, total: 99, showSizeChanger: false }}
      extraConfig={{ tableKey: 'basic', whiteHeader: true, onReload: reload }}
    />
  );
};
