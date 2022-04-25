import React from 'react';
import { Table } from '@erda-ui/components';

interface Data {
  name: string;
  age: number;
}

export default () => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a: Data, b: Data) => (a.name > b.name ? 1 : -1),
    },
    {
      title: 'Age',
      dataIndex: 'age',
      sorter: (a: Data, b: Data) => (a.age > b.age ? 1 : -1),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      sorter: true,
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

  const [sortedDataSource, setSortedDataSource] = React.useState(dataSource);

  const onChange = (
    _pagination: unknown,
    _: unknown,
    sorter: { order?: string | null | undefined; columnKey: 'address' | 'name' | 'age' },
  ) => {
    const { order, columnKey } = sorter;
    if (order) {
      setSortedDataSource(
        [...dataSource].sort((a, b) => {
          if (order === 'ascend') {
            return a[columnKey] > b[columnKey] ? 1 : -1;
          }
          return a[columnKey] < b[columnKey] ? 1 : -1;
        }),
      );
    } else {
      setSortedDataSource(dataSource);
    }
  };

  // @ts-ignore no fix
  return <Table rowKey="name" columns={columns} dataSource={sortedDataSource} onChange={onChange} />;
};
