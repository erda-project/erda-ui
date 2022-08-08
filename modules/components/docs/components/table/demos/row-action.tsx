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

import React, { useState } from 'react';
import { Table } from '@erda-ui/components';
import { Radio } from 'antd';
import { TableRowActions } from 'src/table/interface';

export default () => {
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

  const normalActions = {
    render: (record: unknown) => {
      return [
        {
          title: '管理',
          onClick: () => {
            console.log(record);
          },
          disabled: true,
          disabledTip: 'disable reason',
        },
        {
          title: '编辑',
          onClick: () => {
            console.log(record);
          },
        },
      ];
    },
  };

  const oneAction = {
    render: (record: unknown) => {
      return [
        {
          title: '编辑',
          onClick: () => {
            console.log(record);
          },
        },
      ];
    },
  };

  const twoExposeAction = {
    exposeCount: 2,
    render: (record: unknown) => {
      return [
        {
          title: '管理',
          onClick: () => {
            console.log(record);
          },
          disabled: true,
          disabledTip: 'disable reason',
        },
        {
          title: '编辑',
          onClick: () => {
            console.log(record);
          },
        },
      ];
    },
  };
  const actionsMap: Record<string, TableRowActions<Obj<any>>> = {
    normal: normalActions,
    one: oneAction,
    twoExposeAction: twoExposeAction,
  };
  const [actionsType, setActionsType] = useState('normal');

  return (
    <>
      <Radio.Group value={actionsType} onChange={(ev) => setActionsType(ev.target.value)} size="large">
        <Radio.Button value="normal">actions 2</Radio.Button>
        <Radio.Button value="one">actions 1</Radio.Button>
        <Radio.Button value="twoExposeAction">expose 2 actions</Radio.Button>
      </Radio.Group>
      <Table rowKey="name" columns={columns} dataSource={dataSource} actions={actionsMap[actionsType]} />
    </>
  );
};
