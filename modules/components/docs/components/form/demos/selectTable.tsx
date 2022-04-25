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
