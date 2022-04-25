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
import { Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, createFields, takeAsyncDataSource, SelectTable } = Form;

const form = createForm();
const form2 = createForm({
  effects: () => {
    takeAsyncDataSource<Array<{ name: string }>>(
      'username',
      () =>
        new Promise<Array<{ name: string }>>((resolve) => {
          resolve([
            {
              name: '张三',
            },
            {
              name: '李四',
            },
          ]);
        }),
    );
  },
});

const dataSource = [{ name: 'Jim' }, { name: 'Mike' }];

let counter = 1;

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: SelectTable,
      name: 'username',
      customProps: {
        valueType: 'all',
        columns: [
          {
            dataIndex: 'name',
            title: '全选',
          },
        ],
        dataSource,
        primaryKey: 'name',
      },
    },
  ]);

  const onRefresh = async () => {
    setTimeout(() => {
      form2.setFieldState('username', (state) => {
        state.componentProps = {
          ...state.componentProps,
          dataSource: [...dataSource, { name: `John-${counter++}` }],
        };
      });
    }, 1000);
  };

  const fieldsConfig2 = createFields([
    {
      component: SelectTable,
      name: 'username',
      customProps: {
        valueType: 'all',
        columns: [
          {
            dataIndex: 'name',
            title: '全选',
          },
        ],
        primaryKey: 'name',
        showSearch: true,
        searchConfig: {
          placeholder: '搜索',
          slotNode: (
            <Button type="ghost" onClick={onRefresh}>
              刷新
            </Button>
          ),
        },
      },
    },
  ]);

  const getValue = (isTwo?: boolean) => {
    const state = (isTwo ? form2 : form).getState();
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
      <div>异步数据源</div>
      <Form style={{ width: '50%' }} form={form2} fieldsConfig={fieldsConfig2} />

      <Button type="primary" onClick={() => getValue(true)}>
        提交
      </Button>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
