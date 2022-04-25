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
      extraConfig={{ tableKey: 'basic', whiteHeader: true, onReload: reload }}
    />
  );
};
