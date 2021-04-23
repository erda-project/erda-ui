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

import diceEnv from 'dice-env';
import * as React from 'react';
import ReactDOM from 'react-dom';

import { getResourcePermissions } from 'user/services/user';
import { getOrgByDomain } from 'layout/services';
import { setLS, pages, notify } from 'common/utils';
import { registChartControl } from 'charts/utils/regist';
import userStore from './user/stores';
import permStore from './user/stores/permission';
import { map, intersection, get, isEmpty } from 'lodash';
import { orgPerm } from 'user/stores/_perm-org';
import { startApp, registerModule } from 'core/main';
import layoutStore from 'layout/stores/layout';
import modules from './modules';
import { setConfig } from 'core/config';
import { setGlobal } from 'app/global-space';
import { getCurrentLocale } from 'core/i18n';
import { EmptyListHolder } from 'common';
import * as nusi from 'app/nusi';
import {getSubSiderInfoMap, appCenterAppList} from './menus';
import './styles/antd-extension.scss';
import './styles/app.scss';
import '@icon-park/react/styles/index.css';
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/react';

setConfig('onAPISuccess', nusi.message.success);
setConfig('onAPIFail', notify);

const { Modal, NusiConfigProvider, AntdConfigProvider} = nusi;

const hold = nusi;
const start = (userData, permObjArr = [], isErdaHome = false) => {
  setLS('diceLoginState', true);

const IconConfig = {
  ...DEFAULT_ICON_CONFIGS, 
  prefix: 'erda',
  size: 16
};

const appMap = {} as {
  [k: string]: LAYOUT.IApp
};
permObjArr.map((permObj) => {
  permStore.reducers.updatePerm(permObj.scope, permObj);
});

const menusMap = getSubSiderInfoMap();
appCenterAppList.forEach((a) => { appMap[a.key] = a; });
layoutStore.reducers.initLayout({
  appList:appCenterAppList, 
  currentApp: appMap.workBench,
  menusMap,
  key: 'workBench',
});

  startApp().then((App) => {
    [
      import('layout/entry'),
      import('workBench/entry'),
      import('runtime/entry'),
      import('publisher/entry'),
      import('project/entry'),
      import('apiManagePlatform/entry'),
      import('microService/entry'),
      import('app/modules/edge/entry'),
      import('application/entry'),
      import('dataCenter/entry'),
      import('user/entry'),
      import('dcos/entry'),
      import('org/entry'),
      import('addonPlatform/entry'),
      ...Object.values(modules),
    ].forEach(p => p.then(m => m.default(registerModule)));
    layoutStore.reducers.setIsErdaHome(isErdaHome);
    userStore.reducers.setLoginUser(userData); // 需要在app start之前初始化用户信息
    
    const Wrap = () => {
      const currentLocale = getCurrentLocale();
      return (
        <AntdConfigProvider renderEmpty={EmptyListHolder} locale={currentLocale.antd}>
          <NusiConfigProvider locale={currentLocale.nusi}>
            <IconProvider value={IconConfig}>
              <App />
            </IconProvider>
          </NusiConfigProvider>
        </AntdConfigProvider>
      );
    };

    ReactDOM.render(<Wrap />, document.getElementById('dice-content'));
    delete window._userData;
    registChartControl();
  });
};


// if (module.hot) {
//   module.hot.accept('./router.jsx', () => {
//     ReactDOM.render(<App />, document.getElementById('dice-content'));
//   });
// }

const { pathname, search } = window.location;
// /r开头为统一外部跳转路径
if (pathname.startsWith('/r/')) {
  const [to, ...rest] = pathname.slice(3).split('/');
  let newPath = [];
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
const oldPipelineReg = /\/workBench\/projects\/\d+\/apps\/\d+\/pipeline\/\d+$/;
if (oldPipelineReg.test(pathname)) {
  const [pPath, pId] = pathname.split('pipeline/');
  window.history.replaceState({}, document.title, `${pPath}pipeline?pipelineID=${pId}`);
}


const setLocationByAuth = (userAuth) => {
  const curPathname = location.pathname;
  if (userAuth.sys) {
    const isAdminPage = curPathname.startsWith('/sysAdmin');
    // 系统管理员打开的不是系统管理员页面，跳转到系统管理员页
    userAuth.sys.hasAuth && !isAdminPage && window.history.replaceState({}, document.title, '/sysAdmin/orgs');
    // 非系统管理员打开的是系统管理员页面，跳转到首页
    !userAuth.sys.hasAuth && isAdminPage && window.history.replaceState({}, document.title, '/');
  }
  if (diceEnv.ONLY_FDP) {
    if (!['fdp', 'dataCenter', 'orgCenter'].includes(pathname.split('/')[1])) {
      window.history.replaceState({}, document.title, pages.fdpIndex);
      return;
    }
  }
  if (userAuth.org) {
    const { roles, hasAuth } = userAuth.org;
    const checkMap = {
      freshMan: {
        isCurPage: curPathname.startsWith('/freshMan'),
        authRole: [],
      },
      inviteToOrg: {
        isCurPage: curPathname.startsWith('/inviteToOrg'),
        authRole: [],
      },
      fdp: {
        isCurPage: curPathname.startsWith('/fdp'),
        authRole: intersection(orgPerm.entryFastData.role, roles),
      },
      orgCenter: {
        isCurPage: curPathname.startsWith('/orgCenter'),
        authRole: intersection(orgPerm.entryOrgCenter.role, roles),
      },
      microService: {
        isCurPage: curPathname.startsWith('/microService'),
        authRole: intersection(orgPerm.entryMicroService.role, roles),
      },
      edge: {
        isCurPage: curPathname.startsWith('/edge'),
        authRole: intersection(orgPerm.edge.view.role, roles),
      },
      dataCenter: {
        isCurPage: curPathname.startsWith('/dataCenter'),
        authRole: intersection(orgPerm.dataCenter.showApp.role, roles),
      },
      workBench: {
        isCurPage: curPathname.startsWith('/workBench'),
        authRole: intersection(orgPerm.entryWorkBench.role, roles),
      },
      // apiManage: {
      //   isCurPage: curPathname.startsWith('/apiManage'),
      //   authRole: intersection(orgPerm.entryApiManage.role, roles),
      // },
    };
    if (hasAuth) {
      map(checkMap, item => {
        // 当前页，但是无权限，则重置
        if (item.isCurPage && isEmpty(item.authRole)) {
          let resetPath = '/';
          if (roles.toString() === 'DataEngineer') {
            // 数据工程师只有fdp界面权限
            resetPath = pages.fdpIndex;
          } else if (roles.toString() === 'Ops') {
            // 企业运维只有云管的权限
            resetPath = '/dataCenter/overview';
          }
          window.history.replaceState({}, document.title, resetPath);
        }
      });
    } else {
      if (curPathname.startsWith('/inviteToOrg')) return;
      window.history.replaceState({}, document.title, pages.orgHome);
    }
  }
};

const init = (userData) => {
  const lastPath = window.localStorage.getItem('lastPath');
  if (lastPath) {
    window.localStorage.removeItem('lastPath');
    window.location.href = lastPath;
    return;
  }

  const sysPermQuery = { scope: 'sys', scopeID: '0' };

  // TODO: 调用层次太深需要优化
  // 先检查是否系统管理员，是进入系统后台，否则根据当前域名查找orgId，用orgId去查企业权限
  getResourcePermissions(sysPermQuery).then((result) => {
    if (result.success) {
      // 验证系统管理员相关
      setLocationByAuth({
        sys: {
          hasAuth: !!result.data.access,
        },
      });
      let domain = window.location.hostname;
      if (domain.startsWith('local')) {
        domain = domain.split('.').slice(1).join('.');
      }
      getOrgByDomain(domain).then((res2) => {
        if (res2.success) {
          const isErdaHome = !res2.data; // data为null的时候，当前在公共域名下
          if (result.data.access) { // 平台管理员
            setGlobal('erdaInfo.isSysAdmin', true);
            if (!isErdaHome) { // 平台管理员，非公共域名，直接跳转公共域名
              window.location.href = '/erda-platform-home';
              return;
            }
            
            start({ ...userData, isSysAdmin: true }, [{ ...sysPermQuery, ...result.data }], isErdaHome);
          } else if (!isErdaHome) { // 非平台管理员
            const orgPermQuery = { scope: 'org', scopeID: res2.data.id };
            const { publisherId } = res2.data;

            getResourcePermissions(orgPermQuery).then((orgPermRes) => {
              const orgAccess = orgPermRes.success && orgPermRes.data.access;
              // 私有组织，Guest用户（无权限），重定向到公共域名
              if (!orgAccess && !get(res2, 'data.isPublic')) {
                const locale = window.localStorage.getItem('locale') || 'zh';
                const tipText = locale === 'zh' ? '当前为私有组织且您无该组织权限，即将为您跳转到组织列表' : 'You are currently a private organization and you do not have permission to the organization, you will be redirected to the organization list soon';

                Modal.info({
                  content: (
                    <div>
                      {tipText}
                    </div>
                  ),
                  onOk() {
                    window.location.href = '/erda-platform-home';
                  },
                });
                return;
              }

              setLocationByAuth({
                org: {
                  roles: get(orgPermRes, 'data.roles'),
                  hasAuth: orgAccess,
                },
              });
              if (orgAccess) {
                const permObjArr = [{ ...orgPermQuery, ...orgPermRes.data }];
               
                setGlobal('erdaInfo.currentOrgId', true);
            
                start(
                  { ...userData, orgId: res2.data.id, orgName: res2.data.name, orgDisplayName: res2.data.displayName, orgPublisherId: publisherId, orgPublisherAuth: !!publisherId },
                  permObjArr,
                );
              } else {
                const joinOrgTip = map(orgPermRes.userInfo, u => u.nick).join(', ');
                userStore.reducers.setJoinOrgTip(joinOrgTip);
                start({ ...userData, orgId: null, orgName: '' });
              }
            });
          } else { // 此时当中间页，不需要展示菜单
            start({ ...userData }, [], isErdaHome);
            window.history.replaceState({}, document.title, pages.orgHome);
          }
        }
      });
    }
  });
};


if (window._userData) {
  init(window._userData);
} else {
  window.userCb = init;
}
