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

import * as React from 'react';
import ReactDOM from 'react-dom';
import { getResourcePermissions } from 'user/services/user';
import { setLS, notify, goTo } from 'common/utils';
import { registChartControl } from 'charts/utils/regist';
import userStore from './user/stores';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { startApp, registerModule } from 'core/main';
import modules from './modules';
import { setConfig } from 'core/config';
import { setGlobal } from 'app/global-space';
import { get } from 'lodash';
import { getCurrentLocale } from 'core/i18n';
import { EmptyListHolder } from 'common';
import orgStore from 'app/org-home/stores/org';
import * as nusi from 'app/nusi';
import './styles/antd-extension.scss';
import './styles/app.scss';
import '@icon-park/react/styles/index.css';
import '@erda-ui/dashboard-configurator/dist/index.css';
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/react';
import { initAxios } from 'app/common/utils/axios-config';
import 'tailwindcss/tailwind.css';

setConfig('onAPISuccess', nusi.message.success);
setConfig('onAPIFail', notify);

const { NusiConfigProvider, AntdConfigProvider, Antd4ConfigProvider } = nusi;
const momentLangMap = {
  en: 'en',
  zh: 'zh-cn',
};

const hold = nusi;
const start = (userData: ILoginUser) => {
  setLS('diceLoginState', true);

  const IconConfig = {
    ...DEFAULT_ICON_CONFIGS,
    prefix: 'erda',
  };

  const locale = window.localStorage.getItem('locale') || 'zh';
  moment.locale(momentLangMap[locale]);

  initAxios();
  startApp().then(async (App) => {
    // get the organization info first, or will get org is undefined when need org info (like issueStore)
    if (!userData.isSysAdmin) {
      const orgName = get(location.pathname.split('/'), '[1]');
      await orgStore.effects.getOrgByDomain({ orgName });
    }
    [
      import('layout/entry'),
      import('org/entry'),
      import('app/org-home/entry'),
      import('dop/entry'),
      import('runtime/entry'),
      import('publisher/entry'),
      import('project/entry'),
      import('apiManagePlatform/entry'),
      import('msp/entry'),
      import('app/modules/edge/entry'),
      import('application/entry'),
      import('dataCenter/entry'),
      import('user/entry'),
      import('dcos/entry'),
      import('addonPlatform/entry'),
      ...Object.values(modules),
    ].forEach((p) => p.then((m) => m.default(registerModule)));
    userStore.reducers.setLoginUser(userData); // 需要在app start之前初始化用户信息
    const Wrap = () => {
      const currentLocale = getCurrentLocale();
      return (
        <AntdConfigProvider renderEmpty={EmptyListHolder} locale={currentLocale.antd}>
          <Antd4ConfigProvider renderEmpty={EmptyListHolder} locale={currentLocale.antd4}>
            <NusiConfigProvider locale={currentLocale.nusi}>
              <IconProvider value={IconConfig}>
                <App />
              </IconProvider>
            </NusiConfigProvider>
          </Antd4ConfigProvider>
        </AntdConfigProvider>
      );
    };

    ReactDOM.render(<Wrap />, document.getElementById('erda-content'));
    delete window._userData;
    registChartControl();
  });
};

// if (module.hot) {
//   module.hot.accept('./router.jsx', () => {
//     ReactDOM.render(<App />, document.getElementById('erda-content'));
//   });
// }

const { pathname, search } = window.location;
// /r开头为统一外部跳转路径
if (pathname.startsWith('/r/')) {
  const [to, ...rest] = pathname.slice(3).split('/');
  let newPath = [] as string[];
  switch (to) {
    case 'alarm': // 告警跳到云管
    case 'report': // 运维报告跳到云管
      newPath = ['', 'dataCenter', to, ...rest];
      break;

    default:
      break;
  }
  window.history.replaceState({ a: 1 }, document.title, newPath.join('/') + search);
}

// 3.21版本，应用流水线旧链接兼容
const oldPipelineReg = /\/dop\/projects\/\d+\/apps\/\d+\/pipeline\/\d+$/;
if (oldPipelineReg.test(pathname)) {
  const [pPath, pId] = pathname.split('pipeline/');
  window.history.replaceState({}, document.title, `${pPath}pipeline?pipelineID=${pId}`);
}

const setSysAdminLocationByAuth = (authObj: Obj) => {
  const curPathname = location.pathname;
  const orgName = get(curPathname.split('/'), '[1]');
  const isAdminPage = curPathname.startsWith(`/${orgName}/sysAdmin`);
  // 系统管理员打开的不是系统管理员页面，跳转到系统管理员页
  authObj.hasAuth && !isAdminPage && goTo(goTo.pages.sysAdminOrgs, { orgName: '-', replace: true });
  // 非系统管理员打开的是系统管理员页面，跳转到首页
  !authObj.hasAuth && isAdminPage && goTo(goTo.pages.orgRoot, { orgName, replace: true });
};

const init = (userData: ILoginUser) => {
  if (location.pathname === '/') {
    window.location.href = '/-';
    return;
  }
  const sysPermQuery = { scope: 'sys', scopeID: '0' };
  // TODO: 调用层次太深需要优化
  // 先检查是否系统管理员，是进入系统后台，否则根据当前域名查找orgId，用orgId去查企业权限

  getResourcePermissions(sysPermQuery).then((result: Obj) => {
    if (result.success) {
      if (!result.data.access) {
        const lastPath = window.localStorage.getItem('lastPath');
        if (lastPath) {
          window.localStorage.removeItem('lastPath');
          window.location.href = lastPath;
          return;
        }
        start({ ...userData });
      } else {
        // 验证系统管理员相关路由
        setSysAdminLocationByAuth({
          hasAuth: !!result.data.access,
        });
        setGlobal('erdaInfo.isSysAdmin', true);
        start({ ...userData, isSysAdmin: true });
      }
    }
  });
};

if (window._userData) {
  init(window._userData);
} else {
  window.userCb = init;
}
