import React from 'react';
import { Pagination } from '@erda-ui/components';

export default () => {
  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const onChange = (pageNo: number, size: number) => {
    setCurrent(pageNo);
    setPageSize(size);
  };

  return <Pagination total={99} pageSize={pageSize} onChange={onChange} current={current} />;
};
