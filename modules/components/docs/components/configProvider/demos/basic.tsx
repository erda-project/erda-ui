/* eslint-disable no-template-curly-in-string */
import React from 'react';
import { Pagination, ConfigProvider } from '@erda-ui/components';
// @ts-ignore no fix
import zhCN from '@erda-ui/components/es/locale/zh_CN';

export default () => {
  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const onChange = (pageNo: number, size: number) => {
    setCurrent(pageNo);
    setPageSize(size);
  };

  return (
    <>
      <div>以下为英文环境</div>
      <ConfigProvider>
        <Pagination total={99} pageSize={pageSize} onChange={onChange} current={current} />
      </ConfigProvider>
      <div>以下为中文环境</div>
      <ConfigProvider locale={zhCN}>
        <Pagination total={99} pageSize={pageSize} onChange={onChange} current={current} />
      </ConfigProvider>
      <div>以下为中文环境自定义文案</div>
      <ConfigProvider locale={{ ...zhCN, Pagination: { ...zhCN.Pagination, totalText: '我这里有${total}个东西' } }}>
        <Pagination total={99} pageSize={pageSize} onChange={onChange} current={current} />
      </ConfigProvider>
    </>
  );
};
