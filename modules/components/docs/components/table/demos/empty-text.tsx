import React from 'react';
import { Table } from '@erda-ui/components';

export default () => {
  const [dataSource, setDataSource] = React.useState<Array<{ name: string; age: number; address: string }>>([]);
  const [current, setCurrent] = React.useState(2);

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

  const onTableChange = (pagination: { current: number }) => {
    const { current: cPageNo } = pagination;
    setCurrent(cPageNo);
    if (cPageNo === 1) {
      setDataSource([
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
      ]);
    }
  };

  return (
    <Table
      rowKey="name"
      columns={columns}
      dataSource={dataSource}
      extraConfig={{ whiteHeader: true }}
      pagination={{ current, total: 2 }}
      onChange={onTableChange}
    />
  );
};
