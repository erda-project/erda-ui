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
