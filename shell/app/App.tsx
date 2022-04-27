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

// external modules
import React from 'react';
import ReactDOM from 'react-dom';
import { get } from 'lodash';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { message, ConfigProvider as AntConfigProvider } from 'antd';
import { ConfigProvider } from '@erda-ui/components';
import antd_zhCN from 'antd/es/locale-provider/zh_CN';
import antd_enUS from 'antd/es/locale-provider/en_US';
import zhCN from '@erda-ui/components/es/locale/zh_CN';
import permStore from 'user/stores/permission';
import enUS from '@erda-ui/components/es/locale/en_US';
// core modules
import { isZh } from 'core/i18n';
import { startApp, registerModule } from 'core/index';
import { setConfig, getConfig } from 'core/config';
// common modules
import { registChartControl } from 'charts/utils/regist';
import { getGlobal, setGlobal } from 'core/global-space';
import { erdaEnv } from 'common/constants';
import { EmptyListHolder } from 'common';
import { setLS, notify, insertWhen } from 'common/utils';
import { initAxios } from 'common/utils/axios-config';
import userStore from './user/stores';
import announcementStore from 'org/stores/announcement';
import layoutStore from 'layout/stores/layout';
import orgStore from 'app/org-home/stores/org';
import setAntdDefault from './antd-default-props';
import './styles/antd-extension.scss';
import './styles/app.scss';
import '@erda-ui/dashboard-configurator/dist/index.css';
import 'tailwindcss/tailwind.css';

setConfig('onAPISuccess', message.success);
setConfig('onAPIFail', notify);

const history = getConfig('history');

setAntdDefault();

const dynamicModules =
  process.env.FOR_COMMUNITY && process.env.FOR_COMMUNITY !== 'false'
    ? []
    : [
        {
          name: 'fdp',
          routePrefix: '/fdp',
        },
        {
          name: 'admin',
          routePrefix: '/sysAdmin',
        },
      ];

const start = (userData: ILoginUser, orgs: ORG.IOrg[], curOrg: ORG.IOrg, orgAccess: IPermResponseData) => {
  setLS('diceLoginState', true);

  const locale = window.localStorage.getItem('locale') || 'zh';
  const momentLangMap = {
    en: 'en',
    zh: 'zh-cn',
  };
  moment.locale(momentLangMap[locale]);
  orgStore.reducers.updateJoinedOrg(orgs);
  if (curOrg) {
    orgStore.reducers.updateCurrentOrg(curOrg);
    if (orgAccess && curOrg) {
      permStore.reducers.updatePerm('org', orgAccess);
      if (orgAccess.access) {
        announcementStore.effects.getAllNoticeListByStatus('published').then((list) => {
          layoutStore.reducers.setAnnouncementList(list);
        });
      }
    }
  }
  initAxios();
  startApp().then(async (App) => {
    // get the organization info first, or will get org is undefined when need org info (like issueStore)
    const orgName = get(location.pathname.split('/'), '[1]');
    if (orgName) {
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
      ...insertWhen(erdaEnv.ENABLE_EDGE === 'true', [import('app/modules/ecp/entry')]),
      import('application/entry'),
      import('cmp/entry'),
      import('user/entry'),
      import('dcos/entry'),
      import('addonPlatform/entry'),
      import('./modules/extra/entry'),
    ].forEach((p) => p.then((m) => m.default(registerModule)));

    userStore.reducers.setLoginUser(userData); // 需要在app start之前初始化用户信息

    const Wrap = () => {
      return (
        <AntConfigProvider
          autoInsertSpaceInButton={false}
          renderEmpty={EmptyListHolder}
          locale={isZh() ? antd_zhCN : antd_enUS}
        >
          <ConfigProvider locale={isZh() ? zhCN : enUS}>
            <App dynamicModules={dynamicModules} />
          </ConfigProvider>
        </AntConfigProvider>
      );
    };

    ReactDOM.render(<Wrap />, document.getElementById('erda-content'));
    // delete window._userData;
    registChartControl();
  });
};

setGlobal('initData', window.initData);
window.initData = undefined;
const { user, orgs, currentOrg, orgAccess } = getGlobal('initData') || {};

if (user) {
  window.localStorage.removeItem(`lastPath`); // clear old lastPath
  const lastPath = window.localStorage.getItem(`${user.id}-lastPath`);
  if (lastPath) {
    window.localStorage.removeItem(`${user.id}-lastPath`);
    history.replace(lastPath);
  }
  start(user, orgs, currentOrg, orgAccess);
}
