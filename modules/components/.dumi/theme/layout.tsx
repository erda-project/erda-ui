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
import Layout from 'dumi-theme-default/es/layout';
import ConfigProvider from '../../src/context-provider';
import { ConfigProvider as AntConfigProvider } from 'antd';
import zhCN from '../../src/locale/zh_CN';
// import enUS from '../../src/locale/en_US';
import antZhCN from 'antd/es/locale/zh_CN';

export default ({ children, ...props }) => {
  return (
    <Layout {...props}>
      <AntConfigProvider locale={antZhCN}>
        <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
      </AntConfigProvider>
    </Layout>
  );
};
