// .dumi/theme/layout.tsx(本地主题) 或 src/layout.tsx(主题包)
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
